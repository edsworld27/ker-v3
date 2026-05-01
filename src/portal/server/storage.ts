// Server-side state for the portal. Backed by a swappable Backend
// (file / memory / kv) chosen at boot via the PORTAL_BACKEND env var:
//
//   PORTAL_BACKEND=file       (default — JSON at .data/portal-state.json)
//   PORTAL_BACKEND=memory     (no persistence — fine for tests + ephemeral hosts)
//   PORTAL_BACKEND=kv         (Upstash Redis REST — not yet wired, see below)
//
// The public surface (getState, mutate, reset, isPersistent, getBackendInfo)
// stays sync — readers expect a synchronous PortalState. File and memory
// backends honour that natively. KV would need an async hydration step,
// which we don't yet do; it's slotted but throws at boot rather than
// silently behaving wrong.
//
// Writes are debounced 250ms so a burst of heartbeats doesn't churn the
// underlying store. Reads are always served from the in-memory cache.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";
import type {
  Heartbeat, SiteTrackingConfig, SiteContentState,
  SiteManifestSchema, Embed,
} from "./types";

interface PortalState {
  heartbeats: Record<string, Heartbeat>;
  configs: Record<string, SiteTrackingConfig>;
  content: Record<string, SiteContentState>;
  schemas: Record<string, SiteManifestSchema>;     // D-1 manifest store
  embeds: Record<string, Embed[]>;                 // D-5 embed registry
}

const empty = (): PortalState => ({
  heartbeats: {}, configs: {}, content: {},
  schemas: {}, embeds: {},
});

// ─── Backend interface ─────────────────────────────────────────────────────

export type BackendKind = "file" | "memory" | "kv" | "postgres";

interface Backend {
  kind: BackendKind;
  // True when writes survive process restart.
  persistent: boolean;
  // Description shown in /admin/portal-settings.
  description: string;
  // Sync read on first load. Returns the raw blob (string), null if empty,
  // or throws if the backend can't be read synchronously (KV / Postgres).
  loadBlob(): string | null;
  // Sync write on flush. May silently no-op or set `writable = false`
  // if the backend isn't actually writable (read-only FS, etc.).
  saveBlob(content: string): void;
}

// ─── File backend (default) ────────────────────────────────────────────────

const DATA_FILE = resolve(process.cwd(), ".data", "portal-state.json");

const fileBackend: Backend = {
  kind: "file",
  persistent: true,
  description: `JSON file at ${DATA_FILE} (filesystem-bound)`,
  loadBlob() {
    if (!existsSync(DATA_FILE)) return null;
    try { return readFileSync(DATA_FILE, "utf-8"); }
    catch { return null; }
  },
  saveBlob(content) {
    try {
      const dir = dirname(DATA_FILE);
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
      writeFileSync(DATA_FILE, content, "utf-8");
    } catch {
      // Read-only FS (Vercel etc.). The PortalStorage wrapper sees the
      // throw via writable = false on the next flush attempt.
      throw new Error("file-backend-not-writable");
    }
  },
};

// ─── Memory backend ────────────────────────────────────────────────────────

let memoryBlob: string | null = null;
const memoryBackend: Backend = {
  kind: "memory",
  persistent: false,
  description: "In-memory only. State is lost when the server process exits.",
  loadBlob() { return memoryBlob; },
  saveBlob(content) { memoryBlob = content; },
};

// ─── KV backend (slot) ─────────────────────────────────────────────────────
//
// Real implementation wants async I/O for both load and save. The current
// public API is sync (getState returns PortalState, not Promise<PortalState>),
// so we'd either need to:
//   (a) refactor every call site to await; or
//   (b) hydrate on a top-level await at module load.
// Both are reasonable; both are bigger than D-4's "make the selector
// real" scope. For now selecting "kv" throws at boot with a clear hint.

function makeKvBackend(): Backend {
  const url = process.env.PORTAL_KV_URL;
  const token = process.env.PORTAL_KV_TOKEN;
  return {
    kind: "kv",
    persistent: !!(url && token),
    description: url
      ? `Upstash KV at ${url} — not yet implemented (${token ? "token configured" : "PORTAL_KV_TOKEN missing"})`
      : "KV backend selected but PORTAL_KV_URL is unset",
    loadBlob() {
      throw new Error(
        "PORTAL_BACKEND=kv: KV is not yet implemented. Use PORTAL_BACKEND=file or PORTAL_BACKEND=memory.",
      );
    },
    saveBlob() {
      throw new Error("PORTAL_BACKEND=kv: KV save not yet implemented.");
    },
  };
}

const postgresBackend: Backend = {
  kind: "postgres",
  persistent: false,
  description: "Postgres backend slotted but not yet implemented.",
  loadBlob() {
    throw new Error("PORTAL_BACKEND=postgres: not yet implemented.");
  },
  saveBlob() {
    throw new Error("PORTAL_BACKEND=postgres: save not yet implemented.");
  },
};

// ─── Selector ──────────────────────────────────────────────────────────────

function pickBackend(): Backend {
  const want = (process.env.PORTAL_BACKEND ?? "file").toLowerCase();
  switch (want) {
    case "file":     return fileBackend;
    case "memory":   return memoryBackend;
    case "kv":       return makeKvBackend();
    case "postgres": return postgresBackend;
    default:
      // Unknown value — fall back to file with a console warning rather
      // than crashing on import.
      if (process.env.NODE_ENV !== "test") {
        console.warn(`[portal] Unknown PORTAL_BACKEND="${want}", falling back to file.`);
      }
      return fileBackend;
  }
}

const backend = pickBackend();

// ─── In-memory cache + debounced flush ─────────────────────────────────────

let cache: PortalState | null = null;
let writable = backend.persistent;
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function load(): PortalState {
  if (cache) return cache;
  let raw: string | null = null;
  try { raw = backend.loadBlob(); }
  catch (e) {
    // KV / Postgres throw here (sync API, async backend). Surface a clear
    // error so the admin sees what's wrong instead of a blank state.
    if (process.env.NODE_ENV !== "test") {
      console.warn(`[portal] storage backend "${backend.kind}" failed to load:`,
        e instanceof Error ? e.message : e);
    }
    cache = empty();
    return cache;
  }
  if (!raw) {
    cache = empty();
    return cache;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<PortalState>;
    cache = {
      heartbeats: parsed.heartbeats ?? {},
      configs: parsed.configs ?? {},
      content: migrateContent(parsed.content),
      schemas: parsed.schemas ?? {},
      embeds: parsed.embeds ?? {},
    };
  } catch {
    cache = empty();
  }
  return cache;
}

// Phase C wrote a single `overrides` map per site. D-2 splits that into
// `draft` and `published`. Promote any legacy field into both buckets so
// existing state files keep working without manual intervention.
function migrateContent(raw: Record<string, SiteContentState> | undefined):
  Record<string, SiteContentState> {
  if (!raw) return {};
  const out: Record<string, SiteContentState> = {};
  for (const [siteId, s] of Object.entries(raw)) {
    if (!s) continue;
    const legacy = s.overrides;
    out[siteId] = {
      siteId: s.siteId ?? siteId,
      draft: s.draft ?? legacy ?? {},
      published: s.published ?? legacy ?? {},
      history: Array.isArray(s.history) ? s.history : [],
      discovered: s.discovered ?? {},
      updatedAt: s.updatedAt ?? 0,
    };
  }
  return out;
}

function flush(): void {
  if (!cache || !writable) return;
  try {
    backend.saveBlob(JSON.stringify(cache));
  } catch {
    writable = false;
  }
}

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    flush();
  }, 250);
}

export function getState(): PortalState {
  return load();
}

export function mutate(fn: (state: PortalState) => void): void {
  const state = load();
  fn(state);
  scheduleFlush();
}

// Test/maintenance hook — wipes state and forces re-load.
export function reset(): void {
  cache = empty();
  flush();
}

export function isPersistent(): boolean {
  return writable;
}

// ─── Backend introspection (D-4) ───────────────────────────────────────────
//
// Surfaced via /api/portal/storage-info so the admin's portal-settings page
// can show which backend is actually live, regardless of what the admin
// has typed into the form (the env vars own the choice today).

export interface BackendInfo {
  kind: BackendKind;
  persistent: boolean;
  description: string;
  envVar: string;
  // True when the runtime can actually save successfully (file backend
  // sometimes flips this false on read-only filesystems).
  writable: boolean;
}

export function getBackendInfo(): BackendInfo {
  return {
    kind: backend.kind,
    persistent: backend.persistent,
    description: backend.description,
    envVar: "PORTAL_BACKEND",
    writable,
  };
}

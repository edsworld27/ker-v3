// Server-side state for the portal — cloud-architected.
//
// State is persisted in a swappable Backend chosen at boot via env vars:
//
//   PORTAL_BACKEND=file       (dev / single-VM — JSON at .data/portal-state.json)
//   PORTAL_BACKEND=memory     (ephemeral — tests, demos, read-only hosts w/o KV)
//   PORTAL_BACKEND=kv         (Upstash Redis REST — production cloud, default
//                              when PORTAL_KV_URL + PORTAL_KV_TOKEN are set)
//
// The selector auto-promotes to "kv" if PORTAL_KV_URL and PORTAL_KV_TOKEN are
// present and PORTAL_BACKEND isn't explicitly pinned to something else, so
// production deploys "just work" once the env vars exist.
//
// Reads (getState) stay sync — every existing caller calls them as if sync,
// and we don't want to refactor every route. Instead, the FIRST request after
// a cold start awaits ensureHydrated() at the route boundary; once that
// resolves, the in-memory cache is populated and subsequent sync reads work.
// Writes are debounced 250ms and flushed asynchronously through the backend.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";
import type {
  Heartbeat, SiteTrackingConfig, SiteContentState,
  SiteManifestSchema, Embed, PortalSettings,
} from "./types";

interface PortalState {
  heartbeats: Record<string, Heartbeat>;
  configs: Record<string, SiteTrackingConfig>;
  content: Record<string, SiteContentState>;
  schemas: Record<string, SiteManifestSchema>;
  embeds: Record<string, Embed[]>;
  settings: PortalSettings | null;     // null = "no settings saved yet" (use defaults)
}

const empty = (): PortalState => ({
  heartbeats: {}, configs: {}, content: {},
  schemas: {}, embeds: {}, settings: null,
});

// ─── Backend interface (async) ─────────────────────────────────────────────

export type BackendKind = "file" | "memory" | "kv" | "postgres";

interface Backend {
  kind: BackendKind;
  persistent: boolean;
  description: string;
  loadBlob(): Promise<string | null>;
  saveBlob(content: string): Promise<void>;
}

// ─── File backend ──────────────────────────────────────────────────────────

const DATA_FILE = resolve(process.cwd(), ".data", "portal-state.json");

const fileBackend: Backend = {
  kind: "file",
  persistent: true,
  description: `JSON file at ${DATA_FILE} (filesystem-bound)`,
  async loadBlob() {
    if (!existsSync(DATA_FILE)) return null;
    try { return readFileSync(DATA_FILE, "utf-8"); }
    catch { return null; }
  },
  async saveBlob(content) {
    try {
      const dir = dirname(DATA_FILE);
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
      writeFileSync(DATA_FILE, content, "utf-8");
    } catch (e) {
      throw new Error(`file backend not writable: ${e instanceof Error ? e.message : String(e)}`);
    }
  },
};

// ─── Memory backend ────────────────────────────────────────────────────────

let memoryBlob: string | null = null;
const memoryBackend: Backend = {
  kind: "memory",
  persistent: false,
  description: "In-memory only. State is lost when the server process exits.",
  async loadBlob() { return memoryBlob; },
  async saveBlob(content) { memoryBlob = content; },
};

// ─── KV backend (Upstash Redis REST) ───────────────────────────────────────
//
// Upstash exposes a REST API at https://<id>.upstash.io. We use it as a
// straight key/value store keyed by `KV_KEY` — one big JSON blob per portal
// instance. For larger deployments this can be sharded by site, but the
// blob stays well under 1MB even with hundreds of sites + history, so the
// simpler shape keeps wins on consistency.
//
// Auth header: `Authorization: Bearer <PORTAL_KV_TOKEN>`. Both the URL and
// the token are required env vars when this backend is in use.

const KV_KEY = "portal:state:v1";

function makeKvBackend(): Backend {
  const url = (process.env.PORTAL_KV_URL ?? "").replace(/\/$/, "");
  const token = process.env.PORTAL_KV_TOKEN ?? "";
  const configured = !!(url && token);

  return {
    kind: "kv",
    persistent: configured,
    description: configured
      ? `Upstash KV at ${url} (key=${KV_KEY})`
      : "KV backend selected but PORTAL_KV_URL / PORTAL_KV_TOKEN are missing",
    async loadBlob() {
      if (!configured) {
        throw new Error("PORTAL_BACKEND=kv requires PORTAL_KV_URL and PORTAL_KV_TOKEN");
      }
      // Upstash GET response: { result: "<value or null>" }
      const res = await fetch(`${url}/get/${encodeURIComponent(KV_KEY)}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (!res.ok) {
        // 404 from Upstash means key not set; treat as empty.
        if (res.status === 404) return null;
        throw new Error(`KV load failed: ${res.status} ${await safeText(res)}`);
      }
      const json = await res.json() as { result: string | null };
      return typeof json.result === "string" ? json.result : null;
    },
    async saveBlob(content) {
      if (!configured) {
        throw new Error("PORTAL_BACKEND=kv requires PORTAL_KV_URL and PORTAL_KV_TOKEN");
      }
      // Upstash SET via POST with the value in the request body.
      const res = await fetch(`${url}/set/${encodeURIComponent(KV_KEY)}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "text/plain" },
        body: content,
      });
      if (!res.ok) {
        throw new Error(`KV save failed: ${res.status} ${await safeText(res)}`);
      }
    },
  };
}

async function safeText(res: Response): Promise<string> {
  try { return (await res.text()).slice(0, 200); }
  catch { return ""; }
}

// ─── Postgres slot ─────────────────────────────────────────────────────────

const postgresBackend: Backend = {
  kind: "postgres",
  persistent: false,
  description: "Postgres backend slotted but not yet wired.",
  async loadBlob() { throw new Error("PORTAL_BACKEND=postgres: not yet implemented."); },
  async saveBlob() { throw new Error("PORTAL_BACKEND=postgres: not yet implemented."); },
};

// ─── Selector ──────────────────────────────────────────────────────────────

function pickBackend(): Backend {
  const explicit = (process.env.PORTAL_BACKEND ?? "").toLowerCase();
  if (!explicit) {
    // Auto-promote to KV when its env vars are present — typical
    // production deploy pattern. Otherwise fall back to file.
    if (process.env.PORTAL_KV_URL && process.env.PORTAL_KV_TOKEN) return makeKvBackend();
    return fileBackend;
  }
  switch (explicit) {
    case "file":     return fileBackend;
    case "memory":   return memoryBackend;
    case "kv":       return makeKvBackend();
    case "postgres": return postgresBackend;
    default:
      if (process.env.NODE_ENV !== "test") {
        console.warn(`[portal] Unknown PORTAL_BACKEND="${explicit}", falling back to file.`);
      }
      return fileBackend;
  }
}

const backend = pickBackend();

// ─── In-memory cache + async hydration + debounced flush ───────────────────

let cache: PortalState | null = null;
let writable = backend.persistent;
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let flushInFlight: Promise<void> | null = null;

let hydrated = false;
let hydratePromise: Promise<void> | null = null;

/**
 * Awaits the first cloud-side load on cold start. Idempotent — safe to call
 * before every getState/mutate. Subsequent calls return immediately.
 *
 * Route handlers should `await ensureHydrated()` once at the top before
 * touching getState() / mutate().
 */
export async function ensureHydrated(): Promise<void> {
  if (hydrated) return;
  if (!hydratePromise) {
    hydratePromise = (async () => {
      try {
        const raw = await backend.loadBlob();
        cache = raw ? parseBlob(raw) : empty();
      } catch (e) {
        if (process.env.NODE_ENV !== "test") {
          console.warn(`[portal] backend "${backend.kind}" failed to load:`,
            e instanceof Error ? e.message : e);
        }
        cache = empty();
      } finally {
        hydrated = true;
      }
    })();
  }
  await hydratePromise;
}

function parseBlob(raw: string): PortalState {
  try {
    const parsed = JSON.parse(raw) as Partial<PortalState>;
    return {
      heartbeats: parsed.heartbeats ?? {},
      configs: parsed.configs ?? {},
      content: migrateContent(parsed.content),
      schemas: parsed.schemas ?? {},
      embeds: parsed.embeds ?? {},
      settings: parsed.settings ?? null,
    };
  } catch {
    return empty();
  }
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

async function flush(): Promise<void> {
  if (!cache || !writable) return;
  if (flushInFlight) {
    // Coalesce: pending write + queued mutation will be picked up by the
    // tail of the in-flight promise's callback chain. The simpler shape is
    // "wait, then write the latest"; we just chain.
    await flushInFlight;
  }
  flushInFlight = (async () => {
    try {
      await backend.saveBlob(JSON.stringify(cache));
    } catch (e) {
      writable = false;
      if (process.env.NODE_ENV !== "test") {
        console.warn(`[portal] backend "${backend.kind}" save failed:`,
          e instanceof Error ? e.message : e);
      }
    } finally {
      flushInFlight = null;
    }
  })();
  await flushInFlight;
}

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    void flush();
  }, 250);
}

/**
 * Sync read of the in-memory portal state. Callers MUST have awaited
 * ensureHydrated() at least once on this request (route handlers should
 * do this before reaching here). On the very first call without
 * hydration we return an empty state — better than throwing, since the
 * tag.js loader hits us before any await is feasible. The next call
 * after hydration sees the real data.
 */
export function getState(): PortalState {
  return cache ?? empty();
}

export function mutate(fn: (state: PortalState) => void): void {
  if (!cache) cache = empty();
  fn(cache);
  scheduleFlush();
}

// Test/maintenance hook — wipes state and forces re-load on next access.
export async function reset(): Promise<void> {
  cache = empty();
  hydrated = true;
  await flush();
}

export function isPersistent(): boolean {
  return writable;
}

// ─── Backend introspection ─────────────────────────────────────────────────

export interface BackendInfo {
  kind: BackendKind;
  persistent: boolean;
  description: string;
  envVar: string;
  writable: boolean;
  hydrated: boolean;
}

export function getBackendInfo(): BackendInfo {
  return {
    kind: backend.kind,
    persistent: backend.persistent,
    description: backend.description,
    envVar: "PORTAL_BACKEND",
    writable,
    hydrated,
  };
}

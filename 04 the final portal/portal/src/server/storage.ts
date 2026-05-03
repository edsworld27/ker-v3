import "server-only";
// Server-side state for the portal — multi-backend persistence.
//
// Pattern lifted from `02 felicias aqua portal work/src/portal/server/storage.ts`:
// sync reads from in-memory cache, async debounced writes to the backend.
// Foundation ships only the file backend; KV / Postgres slots are stubbed
// so the contract is identical and future migrations are a single-file change.
//
// Reads (`getState`) stay sync — every domain module calls them as if free.
// Cold start: the first `ensureHydrated()` populates the cache from disk;
// route handlers `await ensureHydrated()` once at the top before reading.
// Writes are debounced 250 ms and flushed asynchronously.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";
import type { PortalState } from "./types";

const empty = (): PortalState => ({
  agencies: {},
  clients: {},
  endCustomers: {},
  users: {},
  pluginInstalls: {},
  pluginData: {},
  phases: {},
  activity: [],
});

// ─── Backend interface ────────────────────────────────────────────────────

export type BackendKind = "file" | "memory" | "kv" | "postgres";

interface Backend {
  kind: BackendKind;
  persistent: boolean;
  description: string;
  loadBlob(): Promise<string | null>;
  saveBlob(content: string): Promise<void>;
}

// ─── File backend (dev default) ───────────────────────────────────────────

const DATA_FILE = resolve(process.cwd(), ".data", "portal-state.json");

const fileBackend: Backend = {
  kind: "file",
  persistent: true,
  description: `JSON file at ${DATA_FILE}`,
  async loadBlob() {
    if (!existsSync(DATA_FILE)) return null;
    try { return readFileSync(DATA_FILE, "utf-8"); }
    catch { return null; }
  },
  async saveBlob(content) {
    const dir = dirname(DATA_FILE);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(DATA_FILE, content, "utf-8");
  },
};

// ─── Memory backend (tests / read-only hosts) ─────────────────────────────

let memoryBlob: string | null = null;
const memoryBackend: Backend = {
  kind: "memory",
  persistent: false,
  description: "In-memory only — state evaporates when the process exits.",
  async loadBlob() { return memoryBlob; },
  async saveBlob(content) { memoryBlob = content; },
};

// ─── Stubs (KV + Postgres land in later rounds) ───────────────────────────

const kvStub: Backend = {
  kind: "kv",
  persistent: false,
  description: "KV backend slot — not yet wired in foundation.",
  async loadBlob() { throw new Error("PORTAL_BACKEND=kv: not yet wired."); },
  async saveBlob() { throw new Error("PORTAL_BACKEND=kv: not yet wired."); },
};

const postgresStub: Backend = {
  kind: "postgres",
  persistent: false,
  description: "Postgres backend slot — not yet wired in foundation.",
  async loadBlob() { throw new Error("PORTAL_BACKEND=postgres: not yet wired."); },
  async saveBlob() { throw new Error("PORTAL_BACKEND=postgres: not yet wired."); },
};

function pickBackend(): Backend {
  const explicit = (process.env.PORTAL_BACKEND ?? "").toLowerCase();
  switch (explicit) {
    case "memory":   return memoryBackend;
    case "kv":       return kvStub;
    case "postgres": return postgresStub;
    case "file":
    case "":
    default:         return fileBackend;
  }
}

const backend = pickBackend();

// ─── Cache + hydration + flush ────────────────────────────────────────────

let cache: PortalState | null = null;
let writable = backend.persistent;
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let flushInFlight: Promise<void> | null = null;

let hydrated = false;
let hydratePromise: Promise<void> | null = null;

export async function ensureHydrated(): Promise<void> {
  if (hydrated) return;
  if (!hydratePromise) {
    hydratePromise = (async () => {
      try {
        const raw = await backend.loadBlob();
        cache = raw ? parseBlob(raw) : empty();
      } catch (e) {
        if (process.env.NODE_ENV !== "test") {
          console.warn(
            `[portal] backend "${backend.kind}" failed to load:`,
            e instanceof Error ? e.message : e,
          );
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
      agencies: parsed.agencies ?? {},
      clients: parsed.clients ?? {},
      endCustomers: parsed.endCustomers ?? {},
      users: parsed.users ?? {},
      pluginInstalls: parsed.pluginInstalls ?? {},
      pluginData: parsed.pluginData ?? {},
      phases: parsed.phases ?? {},
      activity: Array.isArray(parsed.activity) ? parsed.activity : [],
    };
  } catch {
    return empty();
  }
}

async function flush(): Promise<void> {
  if (!cache || !writable) return;
  if (flushInFlight) await flushInFlight;
  flushInFlight = (async () => {
    try {
      await backend.saveBlob(JSON.stringify(cache));
    } catch (e) {
      writable = false;
      if (process.env.NODE_ENV !== "test") {
        console.warn(
          `[portal] backend "${backend.kind}" save failed:`,
          e instanceof Error ? e.message : e,
        );
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

export function getState(): PortalState {
  return cache ?? empty();
}

export function mutate(fn: (state: PortalState) => void): void {
  if (!cache) cache = empty();
  fn(cache);
  scheduleFlush();
}

export async function reset(): Promise<void> {
  cache = empty();
  hydrated = true;
  await flush();
}

export function isPersistent(): boolean {
  return writable;
}

export interface BackendInfo {
  kind: BackendKind;
  persistent: boolean;
  description: string;
  hydrated: boolean;
  writable: boolean;
}

export function getBackendInfo(): BackendInfo {
  return {
    kind: backend.kind,
    persistent: backend.persistent,
    description: backend.description,
    hydrated,
    writable,
  };
}

// Server-side state for the portal: tracking configs (durable) and
// heartbeats (best-effort durable). Backed by a JSON file at
// .data/portal-state.json so dev-server restarts don't wipe trackers; if
// the filesystem isn't writable (e.g. read-only serverless), we fall back
// to in-memory and surface that via the persistence flag.
//
// Phase B+1 will swap this for KV / Postgres without changing the public
// API exported below.
//
// Writes are debounced 250ms so a burst of heartbeats doesn't churn the
// file system. Reads are always served from the in-memory cache.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";
import type {
  Heartbeat, SiteTrackingConfig, SiteContentState,
  SiteManifestSchema, Embed,
} from "./types";

const DATA_FILE = resolve(process.cwd(), ".data", "portal-state.json");

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

let cache: PortalState | null = null;
let writable = true;          // flips false on first write failure
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function load(): PortalState {
  if (cache) return cache;
  try {
    if (existsSync(DATA_FILE)) {
      const raw = readFileSync(DATA_FILE, "utf-8");
      const parsed = JSON.parse(raw) as Partial<PortalState>;
      cache = {
        heartbeats: parsed.heartbeats ?? {},
        configs: parsed.configs ?? {},
        content: parsed.content ?? {},
        schemas: parsed.schemas ?? {},
        embeds: parsed.embeds ?? {},
      };
    } else {
      cache = empty();
    }
  } catch {
    cache = empty();
  }
  return cache;
}

function flush(): void {
  if (!cache || !writable) return;
  try {
    const dir = dirname(DATA_FILE);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(DATA_FILE, JSON.stringify(cache), "utf-8");
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

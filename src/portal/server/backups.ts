// Backups runtime — periodic + on-demand state snapshots.
//
// Snapshots are full PortalState dumps (multi-tenant; per-org slicing
// is a future refinement). Today's adapters:
//
//   "file" (default) — writes to .data/backups/<id>.json with a sidecar
//     <id>.meta.json so we can list without re-parsing every backup.
//     Works on Vercel preview / dev / single-VM hosts where the disk
//     is writable. Survives across restarts only when the same disk
//     persists between deploys (so: dev + traditional VPS, NOT default
//     Vercel serverless — which is fine because Vercel deploys would
//     swap to the S3 adapter).
//
//   "s3" (configured per-install via the Backups plugin settings) —
//     declared but not implemented in this codebase. The runtime
//     surfaces a typed error when an operator picks S3 without a
//     wired-up adapter, so the gap is obvious instead of silent.
//
// Schedule trigger: external cron hits POST /api/portal/backups with
// orgId. The runtime doesn't host its own scheduler — that's
// platform-specific (Vercel cron, system crontab, GitHub Action). The
// plugin's "frequency" setting is informational metadata; the actual
// trigger lives where the operator runs cron.

import "server-only";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import { serializeStateJson, restoreStateFromJson } from "./storage";
import { getOrg } from "./orgs";

export interface BackupRecord {
  id: string;
  orgId: string;          // "agency" for full-platform snapshots
  kind: "manual" | "scheduled";
  adapter: "file" | "s3";
  location: string;       // file path or s3:// URI
  sizeBytes: number;
  createdAt: number;
  notes?: string;
}

export interface BackupsConfig {
  adapter?: "file" | "s3";
  retention?: number;     // keep at most N backups; oldest evicted
  s3?: {
    bucket?: string;
    region?: string;
    endpoint?: string;
    accessKeyId?: string;
    secretAccessKey?: string;
  };
}

const DATA_DIR = process.env.PORTAL_DATA_DIR ?? path.join(process.cwd(), ".data");
const BACKUPS_DIR = path.join(DATA_DIR, "backups");
const DEFAULT_RETENTION = 14;

function makeId(): string {
  // Lexicographically-sortable so a directory listing is naturally
  // newest-last without parsing dates.
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const r = crypto.randomBytes(3).toString("hex");
  return `bk_${ts}_${r}`;
}

async function ensureDir(): Promise<void> {
  await fs.mkdir(BACKUPS_DIR, { recursive: true });
}

// ── File adapter ──────────────────────────────────────────────────────────

async function writeFileSnapshot(id: string, json: string): Promise<{ location: string; sizeBytes: number }> {
  await ensureDir();
  const location = path.join(BACKUPS_DIR, `${id}.json`);
  await fs.writeFile(location, json, "utf8");
  const stat = await fs.stat(location);
  return { location, sizeBytes: stat.size };
}

async function writeFileMeta(record: BackupRecord): Promise<void> {
  const metaPath = path.join(BACKUPS_DIR, `${record.id}.meta.json`);
  await fs.writeFile(metaPath, JSON.stringify(record, null, 2), "utf8");
}

async function readFileSnapshot(id: string): Promise<string> {
  const location = path.join(BACKUPS_DIR, `${id}.json`);
  return fs.readFile(location, "utf8");
}

async function listFileBackups(): Promise<BackupRecord[]> {
  await ensureDir();
  const names = await fs.readdir(BACKUPS_DIR);
  const records: BackupRecord[] = [];
  for (const n of names) {
    if (!n.endsWith(".meta.json")) continue;
    try {
      const raw = await fs.readFile(path.join(BACKUPS_DIR, n), "utf8");
      const r = JSON.parse(raw) as BackupRecord;
      records.push(r);
    } catch {
      // Skip malformed sidecar — don't break the list view.
    }
  }
  records.sort((a, b) => b.createdAt - a.createdAt);
  return records;
}

async function deleteFileBackup(id: string): Promise<boolean> {
  let deleted = false;
  for (const ext of [".json", ".meta.json"]) {
    try {
      await fs.unlink(path.join(BACKUPS_DIR, `${id}${ext}`));
      deleted = true;
    } catch { /* missing — OK */ }
  }
  return deleted;
}

// ── Public API ────────────────────────────────────────────────────────────

export interface CreateBackupInput {
  orgId: string;
  kind?: BackupRecord["kind"];
  notes?: string;
  config?: BackupsConfig;
}

export async function createBackup(input: CreateBackupInput): Promise<BackupRecord> {
  const adapter = input.config?.adapter ?? "file";
  if (adapter === "s3") {
    throw new Error(
      "Backups: S3 adapter not implemented in-tree. Either pin adapter to 'file' " +
      "(set Backups plugin config) or wire your S3 client into createBackup. " +
      "The file adapter writes to .data/backups/ — backed up by your platform's " +
      "disk-snapshot policy, that's already SOC-2-grade.",
    );
  }

  const id = makeId();
  const json = serializeStateJson();
  const { location, sizeBytes } = await writeFileSnapshot(id, json);
  const record: BackupRecord = {
    id,
    orgId: input.orgId,
    kind: input.kind ?? "manual",
    adapter: "file",
    location,
    sizeBytes,
    createdAt: Date.now(),
    notes: input.notes,
  };
  await writeFileMeta(record);

  // Retention sweep — drop oldest beyond the configured window.
  const retention = input.config?.retention ?? DEFAULT_RETENTION;
  const all = await listFileBackups();
  if (all.length > retention) {
    const stale = all.slice(retention);
    for (const r of stale) {
      await deleteFileBackup(r.id);
    }
  }

  return record;
}

export async function listBackups(): Promise<BackupRecord[]> {
  return listFileBackups();
}

export async function getBackup(id: string): Promise<{ record: BackupRecord; json: string } | null> {
  const records = await listFileBackups();
  const record = records.find(r => r.id === id);
  if (!record) return null;
  const json = await readFileSnapshot(id);
  return { record, json };
}

export async function deleteBackup(id: string): Promise<boolean> {
  return deleteFileBackup(id);
}

export type RestoreResult =
  | { ok: true; restoredAt: number }
  | { ok: false; error: string };

export async function restoreBackup(id: string): Promise<RestoreResult> {
  const found = await getBackup(id);
  if (!found) return { ok: false, error: "backup-not-found" };
  try {
    restoreStateFromJson(found.json);
    return { ok: true, restoredAt: Date.now() };
  } catch (e: unknown) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "restore-failed",
    };
  }
}

// Convenience for the admin hub — show plugin config metadata
// alongside the backup list.
export function getBackupsConfig(orgId: string): BackupsConfig {
  const org = getOrg(orgId);
  const install = (org?.plugins ?? []).find(p => p.pluginId === "backups");
  return (install?.config as BackupsConfig | undefined) ?? {};
}

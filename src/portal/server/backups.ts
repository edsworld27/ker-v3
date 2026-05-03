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
import { s3Put, s3Get, s3Delete, s3List, type S3Config } from "@/lib/s3/server";

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

// ── S3 adapter ─────────────────────────────────────────────────────────────
//
// Mirrors the file adapter's <id>.json + <id>.meta.json layout, just
// addressed via S3 keys under a "backups/" prefix. Works against any
// S3-compatible endpoint (R2, Spaces, MinIO etc.) — set config.endpoint
// to the provider's URL.

const S3_PREFIX = "backups/";

function s3ConfigOrThrow(config: BackupsConfig): S3Config {
  const c = config.s3;
  if (!c?.bucket || !c?.region || !c?.accessKeyId || !c?.secretAccessKey) {
    throw new Error(
      "Backups: S3 adapter selected but plugin config is incomplete. " +
      "Set bucket / region / accessKeyId / secretAccessKey on the Backups plugin.",
    );
  }
  return {
    bucket: c.bucket,
    region: c.region,
    accessKeyId: c.accessKeyId,
    secretAccessKey: c.secretAccessKey,
    endpoint: c.endpoint,
  };
}

async function writeS3Snapshot(s3: S3Config, id: string, json: string): Promise<{ location: string; sizeBytes: number }> {
  const key = `${S3_PREFIX}${id}.json`;
  await s3Put(s3, key, json, "application/json");
  return {
    location: `s3://${s3.bucket}/${key}`,
    sizeBytes: Buffer.byteLength(json, "utf8"),
  };
}

async function writeS3Meta(s3: S3Config, record: BackupRecord): Promise<void> {
  const key = `${S3_PREFIX}${record.id}.meta.json`;
  await s3Put(s3, key, JSON.stringify(record, null, 2), "application/json");
}

async function readS3Snapshot(s3: S3Config, id: string): Promise<string> {
  return s3Get(s3, `${S3_PREFIX}${id}.json`);
}

async function listS3Backups(s3: S3Config): Promise<BackupRecord[]> {
  const entries = await s3List(s3, S3_PREFIX);
  const records: BackupRecord[] = [];
  for (const e of entries) {
    if (!e.key.endsWith(".meta.json")) continue;
    try {
      const raw = await s3Get(s3, e.key);
      records.push(JSON.parse(raw) as BackupRecord);
    } catch {
      // Skip malformed sidecar — list view shouldn't break.
    }
  }
  records.sort((a, b) => b.createdAt - a.createdAt);
  return records;
}

async function deleteS3Backup(s3: S3Config, id: string): Promise<boolean> {
  let deleted = false;
  for (const ext of [".json", ".meta.json"]) {
    try {
      await s3Delete(s3, `${S3_PREFIX}${id}${ext}`);
      deleted = true;
    } catch { /* swallow — best-effort */ }
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
  const id = makeId();
  const json = serializeStateJson();

  let location: string;
  let sizeBytes: number;

  if (adapter === "s3") {
    const s3 = s3ConfigOrThrow(input.config ?? {});
    ({ location, sizeBytes } = await writeS3Snapshot(s3, id, json));
    const record: BackupRecord = {
      id, orgId: input.orgId, kind: input.kind ?? "manual",
      adapter: "s3", location, sizeBytes,
      createdAt: Date.now(), notes: input.notes,
    };
    await writeS3Meta(s3, record);
    await sweepRetention("s3", input.config);
    return record;
  }

  ({ location, sizeBytes } = await writeFileSnapshot(id, json));
  const record: BackupRecord = {
    id, orgId: input.orgId, kind: input.kind ?? "manual",
    adapter: "file", location, sizeBytes,
    createdAt: Date.now(), notes: input.notes,
  };
  await writeFileMeta(record);
  await sweepRetention("file", input.config);
  return record;
}

async function sweepRetention(adapter: "file" | "s3", config: BackupsConfig | undefined): Promise<void> {
  const retention = config?.retention ?? DEFAULT_RETENTION;
  const all = adapter === "s3"
    ? await listS3Backups(s3ConfigOrThrow(config ?? {}))
    : await listFileBackups();
  if (all.length <= retention) return;
  const stale = all.slice(retention);
  for (const r of stale) {
    if (adapter === "s3") {
      await deleteS3Backup(s3ConfigOrThrow(config ?? {}), r.id);
    } else {
      await deleteFileBackup(r.id);
    }
  }
}

export async function listBackups(config?: BackupsConfig): Promise<BackupRecord[]> {
  const adapter = config?.adapter ?? "file";
  if (adapter === "s3") {
    return listS3Backups(s3ConfigOrThrow(config ?? {}));
  }
  return listFileBackups();
}

export async function getBackup(id: string, config?: BackupsConfig): Promise<{ record: BackupRecord; json: string } | null> {
  const adapter = config?.adapter ?? "file";
  if (adapter === "s3") {
    const s3 = s3ConfigOrThrow(config ?? {});
    const records = await listS3Backups(s3);
    const record = records.find(r => r.id === id);
    if (!record) return null;
    const json = await readS3Snapshot(s3, id);
    return { record, json };
  }
  const records = await listFileBackups();
  const record = records.find(r => r.id === id);
  if (!record) return null;
  const json = await readFileSnapshot(id);
  return { record, json };
}

export async function deleteBackup(id: string, config?: BackupsConfig): Promise<boolean> {
  const adapter = config?.adapter ?? "file";
  if (adapter === "s3") {
    return deleteS3Backup(s3ConfigOrThrow(config ?? {}), id);
  }
  return deleteFileBackup(id);
}

export type RestoreResult =
  | { ok: true; restoredAt: number }
  | { ok: false; error: string };

export async function restoreBackup(id: string, config?: BackupsConfig): Promise<RestoreResult> {
  const found = await getBackup(id, config);
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

// Server-side asset library (P-2). Images uploaded via /api/portal/assets
// land here as base64 data URIs. Capped per-asset + per-library so a
// runaway uploader can't eat the cloud state. The dataUrl is what the
// editor consumes — no second round-trip needed when rendering.

import crypto from "crypto";
import { getState, mutate } from "./storage";
import type { PortalAsset } from "./types";

// Per-asset: 4 MB after base64 inflation (≈ 3 MB of raw image)
export const MAX_ASSET_BYTES = 4 * 1024 * 1024;
// Library: 200 MB total. Hit it and the next upload falls back to URL-only.
export const MAX_LIBRARY_BYTES = 200 * 1024 * 1024;

function makeId(): string {
  return `ast_${crypto.randomBytes(7).toString("hex")}`;
}

export interface CreateAssetInput {
  filename: string;
  contentType: string;
  dataUrl: string;
  uploadedBy?: string;
  width?: number;
  height?: number;
  alt?: string;
}

export function listAssets(): PortalAsset[] {
  return Object.values(getState().assets).sort((a, b) => b.uploadedAt - a.uploadedAt);
}

export function getAsset(id: string): PortalAsset | undefined {
  return getState().assets[id];
}

export function totalAssetBytes(): number {
  return Object.values(getState().assets).reduce((acc, a) => acc + a.size, 0);
}

export function createAsset(input: CreateAssetInput): { ok: true; asset: PortalAsset } | { ok: false; error: string } {
  if (!input.dataUrl.startsWith("data:")) return { ok: false, error: "expected data URL" };
  // Approximate raw size from base64 length.
  const b64 = input.dataUrl.split(",")[1] ?? "";
  const size = Math.floor(b64.length * 0.75);
  if (size > MAX_ASSET_BYTES) return { ok: false, error: `file too large (${(size / 1024 / 1024).toFixed(1)} MB > ${MAX_ASSET_BYTES / 1024 / 1024} MB)` };
  if (totalAssetBytes() + size > MAX_LIBRARY_BYTES) return { ok: false, error: "asset library full — delete something or wire a real CDN" };

  const asset: PortalAsset = {
    id: makeId(),
    filename: input.filename || "upload",
    contentType: input.contentType || "application/octet-stream",
    size,
    dataUrl: input.dataUrl,
    uploadedAt: Date.now(),
    uploadedBy: input.uploadedBy,
    width: input.width,
    height: input.height,
    alt: input.alt,
  };
  mutate(state => { state.assets[asset.id] = asset; });
  return { ok: true, asset };
}

export function patchAsset(id: string, patch: Partial<Pick<PortalAsset, "alt" | "filename">>): PortalAsset | null {
  let result: PortalAsset | null = null;
  mutate(state => {
    const existing = state.assets[id];
    if (!existing) return;
    state.assets[id] = { ...existing, ...patch };
    result = state.assets[id];
  });
  return result;
}

export function deleteAsset(id: string): boolean {
  let removed = false;
  mutate(state => {
    if (state.assets[id]) {
      delete state.assets[id];
      removed = true;
    }
  });
  return removed;
}

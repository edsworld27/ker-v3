"use client";

import type { PortalAsset } from "@/portal/server/types";

interface AssetsResponse { ok: boolean; assets: PortalAsset[]; usedBytes: number; capBytes: number; }

let cache: AssetsResponse | null = null;
let inflight: Promise<AssetsResponse> | null = null;
const EVENT = "lk-assets-change";

export async function loadAssets(force = false): Promise<AssetsResponse> {
  if (!force && cache) return cache;
  if (inflight) return inflight;
  inflight = fetch("/api/portal/assets", { cache: "no-store" })
    .then(r => r.json() as Promise<AssetsResponse>)
    .then(data => { cache = data; inflight = null; return data; })
    .catch(() => { inflight = null; return { ok: false, assets: [], usedBytes: 0, capBytes: 0 }; });
  return inflight;
}

export function listAssets(): PortalAsset[] {
  return cache?.assets ?? [];
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function imageDimensions(dataUrl: string): Promise<{ width: number; height: number } | null> {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve(null);
    img.src = dataUrl;
  });
}

export async function uploadAsset(file: File, opts?: { alt?: string; uploadedBy?: string }): Promise<PortalAsset | { error: string }> {
  const dataUrl = await readFileAsDataUrl(file);
  const dims = file.type.startsWith("image/") ? await imageDimensions(dataUrl) : null;
  const res = await fetch("/api/portal/assets", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type,
      dataUrl,
      alt: opts?.alt,
      width: dims?.width,
      height: dims?.height,
      uploadedBy: opts?.uploadedBy,
    }),
  });
  const data = await res.json();
  if (!res.ok || !data.ok) return { error: data.error ?? "upload failed" };
  cache = null;
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENT));
  return data.asset as PortalAsset;
}

export async function deleteAsset(id: string): Promise<boolean> {
  const res = await fetch(`/api/portal/assets/${encodeURIComponent(id)}`, { method: "DELETE" });
  if (res.ok) {
    cache = null;
    if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENT));
  }
  return res.ok;
}

export async function patchAsset(id: string, patch: { alt?: string; filename?: string }): Promise<PortalAsset | null> {
  const res = await fetch(`/api/portal/assets/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) return null;
  const data = await res.json();
  cache = null;
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENT));
  return data.asset as PortalAsset;
}

export function onAssetsChange(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

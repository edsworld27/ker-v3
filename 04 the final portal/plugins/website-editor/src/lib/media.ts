// Asset/media client-side helpers. Round-1 stub — Round-2 wires the
// real upload + browse against T1's storage adapter.

const BASE = "/api/portal/website-editor/assets";

export interface MediaAsset {
  id: string;
  url: string;
  kind: "image" | "video" | "other";
  size?: number;
  filename?: string;
}

export async function listAssets(): Promise<MediaAsset[]> {
  const res = await fetch(BASE, { credentials: "include" });
  const json = (await res.json()) as { ok: boolean; assets?: MediaAsset[] };
  return json.assets ?? [];
}

export async function uploadAsset(_file: File): Promise<MediaAsset | null> {
  // Round-1 stub.
  return null;
}

export async function deleteAsset(id: string): Promise<boolean> {
  const res = await fetch(BASE, {
    method: "DELETE",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id }),
    credentials: "include",
  });
  const json = (await res.json()) as { ok: boolean; deleted?: boolean };
  return Boolean(json.deleted);
}

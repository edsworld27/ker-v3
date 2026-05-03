import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { listAssets, createAsset, totalAssetBytes, MAX_LIBRARY_BYTES } from "@/portal/server/assets";

// GET  /api/portal/assets    — list all assets (newest first) + library stats
// POST /api/portal/assets    — { filename, contentType, dataUrl, alt?, width?, height? } → uploaded asset

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureHydrated();
  return NextResponse.json({
    ok: true,
    assets: listAssets(),
    usedBytes: totalAssetBytes(),
    capBytes: MAX_LIBRARY_BYTES,
  });
}

export async function POST(req: NextRequest) {
  await ensureHydrated();
  let body: { filename?: string; contentType?: string; dataUrl?: string; alt?: string; width?: number; height?: number; uploadedBy?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }

  if (!body.dataUrl) return NextResponse.json({ ok: false, error: "missing dataUrl" }, { status: 400 });

  const result = createAsset({
    filename: body.filename ?? "upload",
    contentType: body.contentType ?? "application/octet-stream",
    dataUrl: body.dataUrl,
    alt: body.alt,
    width: body.width,
    height: body.height,
    uploadedBy: body.uploadedBy,
  });

  if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true, asset: result.asset });
}

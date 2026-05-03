// GET /api/portal/search?orgId=...&q=...&type=...
import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { search, type SearchDocument } from "@/portal/server/searchIndex";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  await ensureHydrated();
  const orgId = req.nextUrl.searchParams.get("orgId") ?? "agency";
  const query = req.nextUrl.searchParams.get("q") ?? "";
  const type = req.nextUrl.searchParams.get("type") as SearchDocument["type"] | null;
  const limit = Math.max(1, Math.min(100, Number(req.nextUrl.searchParams.get("limit") ?? 20)));

  if (query.length < 2) {
    return NextResponse.json({ ok: true, hits: [] });
  }

  const hits = search({
    orgId, query,
    type: type ?? undefined,
    limit,
    fuzzy: true,
  });
  return NextResponse.json({ ok: true, hits });
}

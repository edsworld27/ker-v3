import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { requireAdmin } from "@/lib/server/auth";
import {
  appendActivity, listActivity, getActivityStats, clearActivity,
  type ActivityCategory,
} from "@/portal/server/activity";

// GET    /api/portal/activity                  list entries + stats
//   ?limit=200&category=orders&actor=foo@x.com&search=…&since=<ts>
// POST   /api/portal/activity                  append an entry
//   Body: { actorEmail, actorName, category, action, resourceId?, ... }
// DELETE /api/portal/activity                  clear (admin only — destructive)
//
// Same-origin only. Append is open to any signed-in admin (no further
// auth check today; admin-layout dev-bypass owns that). Retention purge
// runs automatically on every append so the stored blob is bounded.

export const dynamic = "force-dynamic";

const VALID_CATEGORIES: ReadonlyArray<ActivityCategory> = [
  "orders", "products", "customers", "marketing", "content",
  "theme", "settings", "features", "shipping", "support", "auth",
];

export async function GET(req: NextRequest) {
  await ensureHydrated();
  const url = new URL(req.url);
  const limit = parseIntSafe(url.searchParams.get("limit"), 500) ?? 500;
  const since = parseIntSafe(url.searchParams.get("since"));
  const cat = url.searchParams.get("category") as ActivityCategory | null;
  const actor = url.searchParams.get("actor") ?? undefined;
  const search = url.searchParams.get("search") ?? undefined;
  const entries = listActivity({
    limit,
    since: since ?? undefined,
    category: cat && VALID_CATEGORIES.includes(cat) ? cat : undefined,
    actorEmail: actor,
    search,
  });
  return NextResponse.json({
    ok: true,
    entries,
    stats: getActivityStats(),
  });
}

export async function POST(req: NextRequest) {
  await ensureHydrated();
  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }

  const e = body as Partial<{
    id: string; ts: number;
    actorEmail: string; actorName: string;
    category: string; action: string;
    resourceId: string; resourceLink: string;
    diff: Record<string, { from: unknown; to: unknown }>;
  }>;

  if (!e.action || typeof e.action !== "string") {
    return NextResponse.json({ ok: false, error: "missing-action" }, { status: 400 });
  }
  if (!e.category || !VALID_CATEGORIES.includes(e.category as ActivityCategory)) {
    return NextResponse.json({ ok: false, error: "invalid-category" }, { status: 400 });
  }

  const saved = appendActivity({
    id: typeof e.id === "string" ? e.id : undefined,
    ts: typeof e.ts === "number" ? e.ts : undefined,
    actorEmail: typeof e.actorEmail === "string" ? e.actorEmail : "anonymous",
    actorName: typeof e.actorName === "string" ? e.actorName : "Anonymous",
    category: e.category as ActivityCategory,
    action: e.action,
    resourceId: typeof e.resourceId === "string" ? e.resourceId : undefined,
    resourceLink: typeof e.resourceLink === "string" ? e.resourceLink : undefined,
    diff: e.diff,
  });
  return NextResponse.json({ ok: true, entry: saved });
}

export async function DELETE() {
  // Destructive — clears the entire audit log. Admin only.
  try { await requireAdmin(); } catch (e) { if (e instanceof Response) return e; throw e; }
  await ensureHydrated();
  clearActivity();
  return NextResponse.json({ ok: true });
}

function parseIntSafe(v: string | null, fallback?: number): number | null {
  if (v == null) return fallback ?? null;
  const n = parseInt(v, 10);
  if (Number.isFinite(n) && n >= 0) return n;
  return fallback ?? null;
}

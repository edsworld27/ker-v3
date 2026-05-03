import { NextRequest, NextResponse } from "next/server";
import { record } from "@/portal/server/heartbeats";
import { recordDiscovered, type IncomingDiscovery } from "@/portal/server/content";
import { runDiscovery } from "@/portal/server/discovery";
import { ensureHydrated } from "@/portal/server/storage";
import type { OverrideType } from "@/portal/server/types";

// POST /api/portal/heartbeat
// Ingests a heartbeat from an external site running /portal/tag.js. Open to
// any origin — the body carries no secrets, only the site ID the admin
// minted and the page they're on.

export const dynamic = "force-dynamic";

// Stability limits (T1 #9):
//   - 8KB body cap so a malformed / abusive client can't bloat state
//   - 60 beats/min/siteId rate cap (in-memory, best-effort)
//   - 100 discoveredKeys per beat (anything beyond is silently dropped)
const MAX_BODY_BYTES = 8 * 1024;
const RATE_LIMIT_PER_MIN = 60;
const RATE_WINDOW_MS = 60 * 1000;
const MAX_DISCOVERED_KEYS = 100;

// Per-siteId beat counter. Cleared on cold start; that's fine — the cap
// is best-effort, not a security boundary.
type RateBucket = { count: number; windowStart: number };
const rateBuckets = new Map<string, RateBucket>();

function rateLimited(siteId: string): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(siteId);
  if (!bucket || now - bucket.windowStart >= RATE_WINDOW_MS) {
    rateBuckets.set(siteId, { count: 1, windowStart: now });
    return false;
  }
  bucket.count++;
  return bucket.count > RATE_LIMIT_PER_MIN;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  await ensureHydrated();
  // sendBeacon posts as text/plain (we choose that to avoid a preflight) so
  // we always read the body as text and JSON.parse it ourselves.
  let body: unknown;
  let text: string;
  try {
    text = await req.text();
  } catch {
    return NextResponse.json({ ok: false, error: "bad-body" }, { status: 400, headers: corsHeaders });
  }
  // Body-size cap. discoveredKeys is the most likely vector for bloat.
  if (text.length > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: "body-too-large" }, { status: 413, headers: corsHeaders });
  }
  try {
    body = JSON.parse(text);
  } catch {
    return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400, headers: corsHeaders });
  }

  const beat = body as Partial<{
    siteId: string; event: string; url: string; title: string; referrer: string;
    discoveredKeys: Array<{ key: string; type?: OverrideType }>;
    path: string;
  }>;

  if (!beat.siteId || typeof beat.siteId !== "string") {
    return NextResponse.json({ ok: false, error: "missing-siteId" }, { status: 400, headers: corsHeaders });
  }

  // Per-siteId rate cap. Over the limit we still 200 (so the client
  // doesn't retry or bump its failure backoff) but skip the record() and
  // any side-effects.
  if (rateLimited(beat.siteId)) {
    return NextResponse.json(
      { ok: true, throttled: true },
      { headers: corsHeaders },
    );
  }

  const recorded = record({
    siteId: beat.siteId,
    event: typeof beat.event === "string" ? beat.event : undefined,
    url: typeof beat.url === "string" ? beat.url : undefined,
    title: typeof beat.title === "string" ? beat.title : undefined,
    referrer: typeof beat.referrer === "string" ? beat.referrer : undefined,
    userAgent: req.headers.get("user-agent") ?? undefined,
  });

  // Capture any keys the tag scanned out of the page DOM. The heartbeat is
  // already a per-pageload event so this gives us a free auto-discovery
  // pass without a second request. Cap to MAX_DISCOVERED_KEYS so a buggy
  // host page can't keep growing the discovery index.
  if (Array.isArray(beat.discoveredKeys) && beat.discoveredKeys.length) {
    const path = typeof beat.path === "string" && beat.path
      ? beat.path
      : safePath(beat.url);
    const keys: IncomingDiscovery[] = beat.discoveredKeys
      .slice(0, MAX_DISCOVERED_KEYS)
      .filter(k => k && typeof k.key === "string")
      .map(k => ({ key: k.key, type: typeof k.type === "string" ? k.type : undefined }));
    if (keys.length) recordDiscovered(beat.siteId, path, keys);
  }

  // Site auto-discovery (E-2): on first heartbeat from a new host,
  // probe Vercel for the project + linked repo and stash a Discovery
  // record the admin can confirm. Fire-and-forget so a slow Vercel API
  // never delays the heartbeat response.
  const host = safeHost(beat.url);
  if (host) void runDiscovery(host).catch(() => { /* swallowed */ });

  return NextResponse.json(
    { ok: true, lastSeenAt: recorded.lastSeenAt, beats: recorded.beats },
    { headers: corsHeaders },
  );
}

function safePath(url: string | undefined): string {
  if (!url) return "/";
  try { return new URL(url).pathname || "/"; }
  catch { return "/"; }
}

function safeHost(url: string | undefined): string | null {
  if (!url) return null;
  try { return new URL(url).host; }
  catch { return null; }
}

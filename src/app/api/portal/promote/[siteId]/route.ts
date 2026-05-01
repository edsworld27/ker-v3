import { NextRequest, NextResponse } from "next/server";
import { promoteSiteToRepo } from "@/portal/server/promote";

// POST /api/portal/promote/[siteId]
// Body: {
//   repoUrl: string,
//   baseBranch?: string,
//   pat: string,
//   filePath?: string,
//   message?: string,
//   prefix?: string,
// }
//
// Same-origin only — the request carries a GitHub PAT in the body so we
// must not enable CORS. The admin UI reads the PAT from
// /admin/portal-settings (localStorage) and sends it along with each
// promote request. Production deploys should swap to a server-stored
// GitHub App credential; PAT-in-body is the dev-mode shortcut.

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, ctx: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await ctx.params;
  let body: {
    repoUrl?: string;
    baseBranch?: string;
    pat?: string;
    filePath?: string;
    message?: string;
    prefix?: string;
  };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }

  if (!body.repoUrl || typeof body.repoUrl !== "string") {
    return NextResponse.json({ ok: false, error: "Missing repoUrl" }, { status: 400 });
  }
  if (!body.pat || typeof body.pat !== "string") {
    return NextResponse.json({ ok: false, error: "Missing GitHub PAT" }, { status: 400 });
  }

  const result = await promoteSiteToRepo({
    siteId,
    repoUrl: body.repoUrl,
    baseBranch: typeof body.baseBranch === "string" ? body.baseBranch : undefined,
    pat: body.pat,
    filePath: typeof body.filePath === "string" ? body.filePath : undefined,
    message: typeof body.message === "string" ? body.message : undefined,
    prefix: typeof body.prefix === "string" ? body.prefix : undefined,
  });

  // Don't leak the PAT back to the client — defence in depth, even though
  // the body is theirs to begin with.
  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}

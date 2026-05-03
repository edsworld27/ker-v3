import { NextRequest, NextResponse } from "next/server";
import { promoteSiteToRepo } from "@/portal/server/promote";
import { ensureHydrated } from "@/portal/server/storage";
import { getSettings } from "@/portal/server/settings";

// POST /api/portal/promote/[siteId]
// Body (all optional): {
//   message?, filePath?, prefix?,
//   customHead?, customBody?, siteName?,    — forwarded from the admin client
//   includePages?, includeContent?, includeSite?,
// }
//
// GitHub credentials + target repo come from the server-side settings
// store (saved via /api/portal/settings, NOT from the request body).
// Per-site head/body code lives in admin localStorage on the Site record,
// so the client passes it in.

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, ctx: { params: Promise<{ siteId: string }> }) {
  await ensureHydrated();
  const { siteId } = await ctx.params;

  let body: {
    message?: string;
    filePath?: string;
    prefix?: string;
    customHead?: string;
    customBody?: string;
    siteName?: string;
    includePages?: boolean;
    includeContent?: boolean;
    includeSite?: boolean;
  } = {};
  try { body = await req.json(); }
  catch { /* empty body is fine */ }

  const settings = getSettings();
  const repoUrl = settings.github.repoUrl;
  const pat = settings.github.pat;
  if (!repoUrl) {
    return NextResponse.json(
      { ok: false, error: "GitHub repo URL not configured. Visit /admin/portal-settings to set it." },
      { status: 412 },
    );
  }
  if (!pat) {
    return NextResponse.json(
      { ok: false, error: "GitHub Personal Access Token not configured. Visit /admin/portal-settings to set it." },
      { status: 412 },
    );
  }

  const result = await promoteSiteToRepo({
    siteId,
    repoUrl,
    baseBranch: settings.github.defaultBranch || "main",
    pat,
    filePath: typeof body.filePath === "string" ? body.filePath : undefined,
    message: typeof body.message === "string" ? body.message : undefined,
    prefix: typeof body.prefix === "string" ? body.prefix : undefined,
    customHead: typeof body.customHead === "string" ? body.customHead : undefined,
    customBody: typeof body.customBody === "string" ? body.customBody : undefined,
    siteName: typeof body.siteName === "string" ? body.siteName : undefined,
    includePages: body.includePages,
    includeContent: body.includeContent,
    includeSite: body.includeSite,
  });

  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}

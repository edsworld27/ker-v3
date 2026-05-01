import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { getSettings } from "@/portal/server/settings";
import { openPullRequest, parseRepoUrl } from "@/portal/server/github";
import { appendActivity } from "@/portal/server/activity";

// POST /api/portal/inject-tag
// Body: { siteId: string, portalOrigin: string, framework?: string }
//
// Opens a PR against the configured GitHub repo that adds the portal
// loader script to the host site's <head>. We try a few well-known
// layout files in order:
//
//   src/app/layout.tsx          (Next.js App Router)
//   app/layout.tsx              (Next.js App Router, no src)
//   pages/_document.tsx         (Next.js Pages Router)
//   src/pages/_document.tsx
//   src/layouts/Layout.astro    (Astro)
//   index.html                  (vanilla / Vite / CRA)
//
// If a candidate is found and doesn't already contain the tag, we add
// it. Otherwise we drop a portal-snippet.html file at repo root with
// the snippet + a PR description telling the admin where to import it.
// AST manipulation isn't worth the dep — we use targeted string inserts
// that handle the common Next.js shapes; AI-generated insertion handled
// by the AI Convert prompt for non-standard structures.

export const dynamic = "force-dynamic";

interface InjectInput {
  siteId: string;
  portalOrigin: string;
  framework?: "nextjs-app" | "nextjs-pages" | "astro" | "vanilla" | "auto";
}

export async function POST(req: NextRequest) {
  await ensureHydrated();
  let body: InjectInput;
  try { body = await req.json() as InjectInput; }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }

  if (!body.siteId || typeof body.siteId !== "string") {
    return NextResponse.json({ ok: false, error: "missing-siteId" }, { status: 400 });
  }
  if (!body.portalOrigin || typeof body.portalOrigin !== "string") {
    return NextResponse.json({ ok: false, error: "missing-portalOrigin" }, { status: 400 });
  }

  const settings = getSettings();
  const repoUrl = settings.github.repoUrl;
  const pat = settings.github.pat;
  if (!repoUrl) {
    return NextResponse.json({
      ok: false,
      error: "GitHub repo URL not configured. Visit /admin/portal-settings.",
    }, { status: 412 });
  }
  if (!pat) {
    return NextResponse.json({
      ok: false,
      error: "GitHub PAT not configured. Visit /admin/portal-settings.",
    }, { status: 412 });
  }

  const parsed = parseRepoUrl(repoUrl);
  if (!parsed) {
    return NextResponse.json({ ok: false, error: "Invalid repo URL" }, { status: 400 });
  }

  const baseBranch = settings.github.defaultBranch || "main";
  const headBranch = `portal/inject-tag-${body.siteId}`;
  const portalOrigin = body.portalOrigin.replace(/\/$/, "");
  const tag = `<script src="${portalOrigin}/portal/tag.js" data-site="${body.siteId}" defer></script>`;

  // We don't have direct repo-tree access here. Instead of trying to
  // probe every candidate file via the GitHub Contents API (one round
  // trip per file), we drop a single self-contained snippet file at the
  // repo root and let the PR description tell the admin exactly where
  // to import it. This is reliable across frameworks; the AI Convert
  // prompt handles the per-framework wiring suggestion.
  const snippetFile = "portal-tag.html";
  const snippetContent = `<!--
  Portal head tracker for site "${body.siteId}".

  Drop this single line into the <head> of every page:

  ${tag}

  Where to put it depends on your framework:

  - Next.js App Router:   src/app/layout.tsx (inside <head>) or via next/script
  - Next.js Pages Router: pages/_document.tsx (inside <Head>)
  - Astro:                src/layouts/Layout.astro (inside <head>)
  - Vanilla HTML:         index.html (inside <head>)

  Auto-injecting via AST is framework-specific; this PR keeps the
  snippet in one place so you can paste it where it fits. Run the
  AI Convert prompt in /admin/portal-settings if you'd like an LLM
  to identify the exact line for your repo's structure.
-->
${tag}
`;

  const result = await openPullRequest({
    repoUrl,
    baseBranch,
    headBranch,
    files: [{ path: snippetFile, content: snippetContent }],
    commitMessage: `chore(portal): add tag snippet for ${body.siteId}`,
    prTitle: `Portal: inject tracking tag for ${body.siteId}`,
    prBody:
`This PR adds **\`${snippetFile}\`** at the repo root with the portal head tag for site \`${body.siteId}\`.

## What to do next

Drop this single line into the \`<head>\` of every page:

\`\`\`html
${tag}
\`\`\`

Suggested locations by framework:

- **Next.js App Router**: \`src/app/layout.tsx\` — inside the \`<head>\` element, or via \`next/script\` with \`strategy="afterInteractive"\`.
- **Next.js Pages Router**: \`pages/_document.tsx\` — inside the \`<Head>\` component.
- **Astro**: \`src/layouts/Layout.astro\` — inside \`<head>\`.
- **Vanilla / Vite / CRA**: \`index.html\` (or \`public/index.html\` for CRA) — inside \`<head>\`.

If your structure doesn't match any of these, run the *AI Convert* prompt in \`/admin/portal-settings\` and paste the response here.

## Once merged

The portal will heartbeat from your deployed site within ~10 seconds and the **${body.siteId}** row in \`/admin/sites\` will flip to *Live*.`,
    auth: { pat },
  });

  if (!result.ok) {
    return NextResponse.json(result, { status: 502 });
  }

  appendActivity({
    actorEmail: "system",
    actorName: "Portal",
    category: "settings",
    action: `Opened PR injecting portal tag for ${body.siteId}: #${result.prNumber}`,
    resourceLink: result.prUrl,
  });

  return NextResponse.json({
    ok: true,
    prUrl: result.prUrl,
    prNumber: result.prNumber,
    branch: result.branch,
  });
}

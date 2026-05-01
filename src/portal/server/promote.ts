// Promote-to-repo orchestrator (D-3 + W-1 expanded).
//
// Bundles every piece of portal-managed state for a site into a single
// PR against the configured repo:
//
//   portal.overrides.json   — published content overrides (D-3)
//   portal.pages.json       — visual editor pages (W-1)
//   portal.site.json        — per-site head/body code, identity (W-1)
//
// Vercel (or any host) builds from the merged PR, so the live site
// reflects the portal state without runtime API calls. Runtime fetches
// still work as a fast-iterate path; the committed JSON is the durable,
// SEO-friendly source of truth.

import { getContentState } from "./content";
import { listPages } from "./pages";
import { openPullRequest, parseRepoUrl, type OpenPullRequestResult } from "./github";
import type { EditorPage } from "./types";

export interface PromoteInput {
  siteId: string;
  repoUrl: string;
  baseBranch?: string;             // default "main"
  pat: string;                     // GitHub Personal Access Token
  filePath?: string;               // override portal.overrides.json path
  message?: string;                // optional admin-written commit msg
  prefix?: string;                 // branch prefix; default "portal/sync"
  // W-1: per-site custom code injected into <head> + before </body>.
  // Lives on the Site record (admin localStorage) — passed in by the
  // route handler so this module stays free of admin-store imports.
  customHead?: string;
  customBody?: string;
  siteName?: string;
  // W-1: opt-out flags for partial promotes. Defaults to "include all".
  includePages?: boolean;          // default true
  includeContent?: boolean;        // default true
  includeSite?: boolean;           // default true (head/body/identity)
}

export interface PromoteResult extends OpenPullRequestResult {
  filePath?: string;
  fileContent?: string;            // back-compat — first file's content
  files?: Array<{ path: string; content: string }>;
}

export async function promoteSiteToRepo(input: PromoteInput): Promise<PromoteResult> {
  const repo = parseRepoUrl(input.repoUrl);
  if (!repo) return { ok: false, error: "Invalid GitHub repo URL" };
  if (!input.pat) return { ok: false, error: "Missing GitHub PAT" };

  const includeContent = input.includeContent !== false;
  const includePages = input.includePages !== false;
  const includeSite = input.includeSite !== false;

  const filePath = input.filePath ?? "portal.overrides.json";
  const baseBranch = input.baseBranch ?? "main";
  const prefix = (input.prefix ?? "portal/sync").replace(/\/$/, "");
  // Stable branch name per site so repeated promotes update the same PR
  // rather than spawning a new branch on every push.
  const stamp = new Date().toISOString().slice(0, 10);
  const headBranch = `${prefix}/${input.siteId}-${stamp}`;

  const files: Array<{ path: string; content: string }> = [];
  let summaryParts: string[] = [];

  if (includeContent) {
    const state = getContentState(input.siteId);
    if (Object.keys(state.published).length > 0) {
      const fileContent = serialisePublishedState(input.siteId, state.published, state.history[0]?.publishedAt);
      files.push({ path: filePath, content: fileContent });
      summaryParts.push(`${Object.keys(state.published).length} keys`);
    }
  }

  if (includePages) {
    const pages = listPages(input.siteId);
    if (pages.length > 0) {
      files.push({ path: "portal.pages.json", content: serialisePages(input.siteId, pages) });
      summaryParts.push(`${pages.length} pages`);
    }
  }

  if (includeSite) {
    const hasSiteCode = (input.customHead?.trim() || "") || (input.customBody?.trim() || "") || input.siteName;
    if (hasSiteCode) {
      files.push({ path: "portal.site.json", content: serialiseSite(input.siteId, {
        name: input.siteName,
        customHead: input.customHead,
        customBody: input.customBody,
      }) });
      summaryParts.push("site config");
    }
  }

  if (files.length === 0) {
    return { ok: false, error: "Nothing to promote — publish content/pages first or set per-site custom code." };
  }

  const summary = summaryParts.join(", ");
  const commitMessage = input.message
    ? `chore(portal): sync ${input.siteId} (${summary})\n\n${input.message}`
    : `chore(portal): sync ${input.siteId} (${summary})`;
  const prTitle = `Portal: sync ${input.siteId} (${summary})`;
  const prBody = renderPrBody(input.siteId, files, getContentState(input.siteId).history[0]?.message);

  const pr = await openPullRequest({
    repoUrl: input.repoUrl,
    baseBranch,
    headBranch,
    files,
    commitMessage,
    prTitle,
    prBody,
    auth: { pat: input.pat },
  });

  return { ...pr, filePath, fileContent: files[0]?.content, files };
}

// Serialise the published overrides into the canonical portal.overrides.json
// shape. Keys are sorted alphabetically so the diff is stable across runs.
function serialisePublishedState(
  siteId: string,
  published: Record<string, { value: string; type: string; updatedAt: number }>,
  publishedAt?: number,
): string {
  const sortedKeys = Object.keys(published).sort();
  const overrides: Record<string, { value: string; type: string }> = {};
  for (const k of sortedKeys) {
    const o = published[k];
    overrides[k] = { value: o.value, type: o.type };
  }
  const doc = {
    $schema: "https://schemas.portal.dev/portal-overrides.v1.json",
    siteId,
    publishedAt: publishedAt ?? Date.now(),
    overrides,
  };
  return JSON.stringify(doc, null, 2) + "\n";
}

function serialisePages(siteId: string, pages: EditorPage[]): string {
  // Snapshot the published blocks (or draft if no publish exists yet) so
  // the host build can render the visual-editor tree at SSR time.
  const out = pages.map(p => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    description: p.description,
    blocks: p.publishedBlocks ?? p.blocks,
    customHead: p.customHead,
    customFoot: p.customFoot,
    publishedAt: p.publishedAt,
    updatedAt: p.updatedAt,
  }));
  const doc = {
    $schema: "https://schemas.portal.dev/portal-pages.v1.json",
    siteId,
    syncedAt: Date.now(),
    pages: out,
  };
  return JSON.stringify(doc, null, 2) + "\n";
}

function serialiseSite(siteId: string, site: { name?: string; customHead?: string; customBody?: string }): string {
  const doc = {
    $schema: "https://schemas.portal.dev/portal-site.v1.json",
    siteId,
    syncedAt: Date.now(),
    name: site.name,
    customHead: site.customHead ?? "",
    customBody: site.customBody ?? "",
  };
  return JSON.stringify(doc, null, 2) + "\n";
}

function renderPrBody(siteId: string, files: Array<{ path: string; content: string }>, lastNote?: string): string {
  const lines: string[] = [];
  lines.push(`Site: \`${siteId}\``);
  lines.push("");
  lines.push("Auto-generated by the portal admin. Merging this PR commits the");
  lines.push("currently-published portal state into the repo so the next");
  lines.push("build (Vercel et al.) picks it up at SSR/build time.");
  lines.push("");
  if (lastNote) {
    lines.push(`> ${lastNote.replace(/\n/g, "\n> ")}`);
    lines.push("");
  }
  lines.push("**Files included:**");
  for (const f of files) {
    lines.push(`- \`${f.path}\` (${f.content.length} bytes)`);
  }
  lines.push("");
  lines.push("---");
  lines.push("Read these files at build time from the host site:");
  lines.push("- `portal.overrides.json` → `src/portal/client/index.ts`");
  lines.push("- `portal.pages.json` → render via `<PortalPageRenderer slug=\"…\" />`");
  lines.push("- `portal.site.json` → inject head/body code in your root layout");
  return lines.join("\n");
}

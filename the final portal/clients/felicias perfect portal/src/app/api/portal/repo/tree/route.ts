import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { getSettings } from "@/portal/server/settings";
import { parseRepoUrl } from "@/portal/server/github";

// GET /api/portal/repo/tree?ref=main&path=
// Lists files + folders at the given path inside the configured repo.
// Uses GitHub's contents API + the configured PAT.

export const dynamic = "force-dynamic";

interface GhEntry {
  type: "file" | "dir";
  name: string;
  path: string;
  sha: string;
  size?: number;
}

export async function GET(req: NextRequest) {
  await ensureHydrated();
  const settings = getSettings();
  const repoUrl = settings.github.repoUrl;
  const pat = settings.github.pat;
  if (!repoUrl || !pat) return NextResponse.json({ ok: false, error: "GitHub not configured" }, { status: 412 });
  const repo = parseRepoUrl(repoUrl);
  if (!repo) return NextResponse.json({ ok: false, error: "bad repo url" }, { status: 412 });

  const ref = req.nextUrl.searchParams.get("ref") || settings.github.defaultBranch || "main";
  const path = (req.nextUrl.searchParams.get("path") || "").replace(/^\/+/, "");

  const url = `https://api.github.com/repos/${repo.owner}/${repo.repo}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(ref)}`;
  const res = await fetch(url, {
    headers: {
      authorization: `Bearer ${pat}`,
      accept: "application/vnd.github+json",
      "x-github-api-version": "2022-11-28",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const friendly =
      res.status === 401 ? "GitHub rejected the credentials. Re-issue the PAT in /admin/portal-settings."
      : res.status === 403 ? "GitHub denied access. Check the PAT scopes (needs at least `repo` for private repos)."
      : res.status === 404 ? "Repo or path not found. Verify the repo URL + branch in /admin/portal-settings."
      : `GitHub ${res.status}`;
    return NextResponse.json({ ok: false, error: friendly }, { status: res.status });
  }
  const data = await res.json() as GhEntry[] | GhEntry;
  const items = Array.isArray(data) ? data : [data];
  return NextResponse.json({
    ok: true,
    ref,
    path,
    items: items
      .map(i => ({ type: i.type, name: i.name, path: i.path, sha: i.sha, size: i.size }))
      .sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === "dir" ? -1 : 1)),
  });
}

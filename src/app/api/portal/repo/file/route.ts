import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { getSettings } from "@/portal/server/settings";
import { parseRepoUrl } from "@/portal/server/github";

// GET    /api/portal/repo/file?path=src/foo.tsx&ref=main
// PUT    /api/portal/repo/file  body: { path, content, message?, branch? }
//
// Reads or commits a single file in the configured GitHub repo. The PUT
// path uses the GitHub contents API; we resolve the existing sha (if
// any) automatically so admins can edit + save without first GET-ing
// the metadata.

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  await ensureHydrated();
  const settings = getSettings();
  const repoUrl = settings.github.repoUrl;
  const pat = settings.github.pat;
  if (!repoUrl || !pat) return NextResponse.json({ ok: false, error: "GitHub not configured" }, { status: 412 });
  const repo = parseRepoUrl(repoUrl);
  if (!repo) return NextResponse.json({ ok: false, error: "bad repo url" }, { status: 412 });

  const path = (req.nextUrl.searchParams.get("path") || "").replace(/^\/+/, "");
  const ref = req.nextUrl.searchParams.get("ref") || settings.github.defaultBranch || "main";
  if (!path) return NextResponse.json({ ok: false, error: "missing path" }, { status: 400 });

  const url = `https://api.github.com/repos/${repo.owner}/${repo.repo}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(ref)}`;
  const res = await fetch(url, {
    headers: {
      authorization: `Bearer ${pat}`,
      accept: "application/vnd.github+json",
      "x-github-api-version": "2022-11-28",
    },
    cache: "no-store",
  });
  if (!res.ok) return NextResponse.json({ ok: false, error: `github ${res.status}` }, { status: res.status });
  const data = await res.json() as { content?: string; sha?: string; encoding?: string; size?: number; type?: string };
  if (data.type !== "file") return NextResponse.json({ ok: false, error: "not a file" }, { status: 400 });
  const content = data.content && data.encoding === "base64"
    ? Buffer.from(data.content, "base64").toString("utf-8")
    : "";
  return NextResponse.json({ ok: true, path, ref, sha: data.sha, size: data.size, content });
}

export async function PUT(req: NextRequest) {
  await ensureHydrated();
  const settings = getSettings();
  const repoUrl = settings.github.repoUrl;
  const pat = settings.github.pat;
  if (!repoUrl || !pat) return NextResponse.json({ ok: false, error: "GitHub not configured" }, { status: 412 });
  const repo = parseRepoUrl(repoUrl);
  if (!repo) return NextResponse.json({ ok: false, error: "bad repo url" }, { status: 412 });

  let body: { path?: string; content?: string; message?: string; branch?: string; sha?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }
  if (!body.path || typeof body.content !== "string") return NextResponse.json({ ok: false, error: "missing path/content" }, { status: 400 });

  const branch = body.branch || settings.github.defaultBranch || "main";
  const path = body.path.replace(/^\/+/, "");

  // Resolve existing sha if not supplied (so the same path can be re-committed).
  let sha = body.sha;
  if (!sha) {
    const probe = await fetch(`https://api.github.com/repos/${repo.owner}/${repo.repo}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(branch)}`, {
      headers: { authorization: `Bearer ${pat}`, accept: "application/vnd.github+json" },
      cache: "no-store",
    });
    if (probe.ok) {
      const data = await probe.json() as { sha?: string };
      sha = data.sha;
    }
  }

  const message = body.message ?? `chore(portal): edit ${path}`;
  const res = await fetch(`https://api.github.com/repos/${repo.owner}/${repo.repo}/contents/${encodeURIComponent(path)}`, {
    method: "PUT",
    headers: {
      authorization: `Bearer ${pat}`,
      accept: "application/vnd.github+json",
      "x-github-api-version": "2022-11-28",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      message,
      content: Buffer.from(body.content, "utf-8").toString("base64"),
      branch,
      sha,
    }),
  });
  if (!res.ok) return NextResponse.json({ ok: false, error: `github ${res.status}: ${await res.text()}` }, { status: res.status });
  const data = await res.json() as { content?: { sha?: string; html_url?: string }; commit?: { sha?: string; html_url?: string } };
  return NextResponse.json({
    ok: true,
    path,
    branch,
    sha: data.content?.sha,
    fileUrl: data.content?.html_url,
    commitUrl: data.commit?.html_url,
    commitSha: data.commit?.sha,
  });
}

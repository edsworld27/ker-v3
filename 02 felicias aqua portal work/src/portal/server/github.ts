// GitHub PR helper — server-only. Talks to the GitHub REST API directly
// over fetch so we don't pull in @octokit (and 100kb of deps) for what
// amounts to four endpoints.
//
// Authentication today: Personal Access Token (PAT) only. App-based
// auth (private-key JWT, then installation token) is a richer flow that
// requires signing — defer to a follow-up. The shape of OpenPullRequestInput
// already accepts appId/installationId so callers don't have to change.
//
// All public functions return discriminated results rather than throwing,
// so the admin UI can render concrete error messages without wrapping
// every call in try/catch.

const GITHUB_API = "https://api.github.com";

export interface OpenPullRequestInput {
  repoUrl: string;
  baseBranch: string;
  headBranch: string;
  files: Array<{ path: string; content: string }>;
  commitMessage: string;
  prTitle: string;
  prBody?: string;
  auth: { appId?: string; installationId?: string; pat?: string };
}

export interface OpenPullRequestResult {
  ok: boolean;
  prUrl?: string;
  prNumber?: number;
  branch?: string;
  error?: string;
}

/**
 * Open a pull request against a GitHub repo. Steps:
 *  1. Resolve owner/repo from the URL.
 *  2. Create or update each file on `headBranch` (creating the branch if
 *     missing, branched from `baseBranch`).
 *  3. Open a PR from `headBranch` → `baseBranch`.
 *
 * Returns { ok: false, error } with a human-readable reason on any
 * failure, never throws.
 */
export async function openPullRequest(input: OpenPullRequestInput): Promise<OpenPullRequestResult> {
  const repo = parseRepoUrl(input.repoUrl);
  if (!repo) return { ok: false, error: "Invalid GitHub repo URL" };
  const token = input.auth.pat;
  if (!token) {
    return { ok: false, error: "Missing GitHub Personal Access Token. Configure it in /admin/portal-settings." };
  }

  const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    Authorization: `Bearer ${token}`,
  };

  // 1. Get the SHA of the base branch tip so we can branch from it.
  const baseRef = await ghFetch<RefResponse>(
    `${GITHUB_API}/repos/${repo.owner}/${repo.repo}/git/ref/heads/${encodeURIComponent(input.baseBranch)}`,
    { headers },
  );
  if (!baseRef.ok) return { ok: false, error: `Base branch "${input.baseBranch}" not found: ${baseRef.error}` };
  const baseSha = baseRef.data.object.sha;

  // 2. Create the head branch if it doesn't exist; otherwise update it later.
  const headRef = await ghFetch<RefResponse>(
    `${GITHUB_API}/repos/${repo.owner}/${repo.repo}/git/ref/heads/${encodeURIComponent(input.headBranch)}`,
    { headers },
  );
  let headExists = headRef.ok;
  if (!headExists) {
    const created = await ghFetch<RefResponse>(
      `${GITHUB_API}/repos/${repo.owner}/${repo.repo}/git/refs`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ ref: `refs/heads/${input.headBranch}`, sha: baseSha }),
      },
    );
    if (!created.ok) return { ok: false, error: `Failed to create branch: ${created.error}` };
    headExists = true;
  }

  // 3. Put each file on the head branch. PUT /contents handles both create
  //    and update — it just needs the existing SHA when overwriting.
  for (const f of input.files) {
    const existing = await ghFetch<ContentResponse>(
      `${GITHUB_API}/repos/${repo.owner}/${repo.repo}/contents/${encodeURI(f.path)}?ref=${encodeURIComponent(input.headBranch)}`,
      { headers },
    );
    const sha = existing.ok ? existing.data.sha : undefined;

    const put = await ghFetch(
      `${GITHUB_API}/repos/${repo.owner}/${repo.repo}/contents/${encodeURI(f.path)}`,
      {
        method: "PUT",
        headers,
        body: JSON.stringify({
          message: input.commitMessage,
          content: Buffer.from(f.content, "utf-8").toString("base64"),
          branch: input.headBranch,
          ...(sha ? { sha } : {}),
        }),
      },
    );
    if (!put.ok) return { ok: false, error: `Failed to write ${f.path}: ${put.error}` };
  }

  // 4. Open the PR. If a PR for the same head→base already exists, return
  //    that one rather than failing.
  const pr = await ghFetch<PullResponse>(
    `${GITHUB_API}/repos/${repo.owner}/${repo.repo}/pulls`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        title: input.prTitle,
        head: input.headBranch,
        base: input.baseBranch,
        body: input.prBody ?? "",
        draft: false,
        maintainer_can_modify: true,
      }),
    },
  );
  if (pr.ok) {
    return { ok: true, prUrl: pr.data.html_url, prNumber: pr.data.number, branch: input.headBranch };
  }
  // GitHub returns 422 with "A pull request already exists" when one's open.
  if (/already exists/i.test(pr.error)) {
    const existing = await ghFetch<PullResponse[]>(
      `${GITHUB_API}/repos/${repo.owner}/${repo.repo}/pulls?head=${encodeURIComponent(`${repo.owner}:${input.headBranch}`)}&state=open`,
      { headers },
    );
    if (existing.ok && existing.data.length > 0) {
      const found = existing.data[0];
      return { ok: true, prUrl: found.html_url, prNumber: found.number, branch: input.headBranch };
    }
  }
  return { ok: false, error: `Failed to open PR: ${pr.error}` };
}

// ─── Internal: typed fetch wrapper ─────────────────────────────────────────

interface RefResponse { object: { sha: string } }
interface ContentResponse { sha: string; content?: string; encoding?: string }
interface PullResponse { html_url: string; number: number }

type GhResult<T> = { ok: true; data: T } | { ok: false; error: string; status: number };

async function ghFetch<T>(url: string, init: RequestInit): Promise<GhResult<T>> {
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch (e) {
    return { ok: false, error: `Network error: ${e instanceof Error ? e.message : String(e)}`, status: 0 };
  }
  if (res.status === 404) return { ok: false, error: "Not found", status: 404 };
  if (!res.ok) {
    let body = "";
    try { body = await res.text(); } catch {}
    let message = body;
    try { message = (JSON.parse(body) as { message?: string }).message ?? body; } catch {}
    return { ok: false, error: `${res.status} ${message.slice(0, 160)}`, status: res.status };
  }
  let data: T;
  try { data = await res.json() as T; }
  catch { return { ok: false, error: "Invalid JSON in response", status: res.status }; }
  return { ok: true, data };
}

// ─── URL parsing (unchanged from D-4-prep stub) ────────────────────────────

/**
 * Parse a GitHub repo URL into its `{ owner, repo }` parts.
 *
 * Accepts:
 *   https://github.com/owner/repo
 *   https://github.com/owner/repo.git
 *   https://github.com/owner/repo/             (trailing slash ok)
 *   git@github.com:owner/repo.git              (SSH form)
 *   github.com/owner/repo                      (no scheme)
 *
 * Returns null on bad input — empty string, missing owner or repo, hosts
 * other than github.com.
 */
export function parseRepoUrl(url: string): { owner: string; repo: string } | null {
  if (typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // SSH form: git@github.com:owner/repo(.git)
  const sshMatch = trimmed.match(/^git@github\.com:([^/]+)\/([^/]+?)(?:\.git)?\/?$/);
  if (sshMatch) {
    return normalisePair(sshMatch[1], sshMatch[2]);
  }

  // HTTPS / scheme-less form.
  let path = trimmed
    .replace(/^https?:\/\//i, "")
    .replace(/^git:\/\//i, "")
    .replace(/^www\./i, "");
  if (!path.startsWith("github.com/")) {
    if (path.includes("/")) {
      if (/^[^/]+\./.test(path)) return null;
    } else {
      return null;
    }
  } else {
    path = path.slice("github.com/".length);
  }

  const parts = path.replace(/\.git$/, "").split("/").filter(Boolean);
  if (parts.length < 2) return null;
  return normalisePair(parts[0], parts[1]);
}

function normalisePair(owner: string, repo: string): { owner: string; repo: string } | null {
  const o = owner.trim();
  const r = repo.replace(/\.git$/, "").trim();
  if (!o || !r) return null;
  if (/[\s@/\\]/.test(o) || /[\s@/\\]/.test(r)) return null;
  return { owner: o, repo: r };
}

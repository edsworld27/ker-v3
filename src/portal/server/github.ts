// GitHub PR helper — server-only.
//
// D-3 will fill in the real implementation (Octokit, GitHub App auth,
// branch + tree + commit + PR creation). For now this exposes the stable
// interface so the admin UI and any callers can already wire to it.
//
// Two pieces ship today:
//   • openPullRequest(input)  — returns { ok: false, error: "not-implemented" }
//   • parseRepoUrl(url)       — pure, useful for client-side validation too

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
  error?: string;
}

/**
 * Open a pull request against a GitHub repo.
 *
 * Stub — D-3 will implement this. Today it always returns
 * { ok: false, error: "not-implemented (D-3)" } so callers can build the
 * full flow (UI, error handling, success states) before the wire is live.
 */
export async function openPullRequest(_input: OpenPullRequestInput): Promise<OpenPullRequestResult> {
  return { ok: false, error: "not-implemented (D-3)" };
}

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

  // HTTPS / scheme-less form. Strip a leading scheme + host so we just have
  // "owner/repo[.git][/]".
  let path = trimmed
    .replace(/^https?:\/\//i, "")
    .replace(/^git:\/\//i, "")
    .replace(/^www\./i, "");
  if (!path.startsWith("github.com/")) {
    // Either a non-GitHub host or just a partial path — only accept the
    // partial-path form if it looks like "owner/repo".
    if (path.includes("/")) {
      // path could be "github.example.com/owner/repo" — reject hosts that
      // aren't exactly github.com.
      if (/^[^/]+\./.test(path)) return null;
    } else {
      return null;
    }
  } else {
    path = path.slice("github.com/".length);
  }

  // Now `path` should be "owner/repo[.git][/extra]".
  const parts = path.replace(/\.git$/, "").split("/").filter(Boolean);
  if (parts.length < 2) return null;
  return normalisePair(parts[0], parts[1]);
}

function normalisePair(owner: string, repo: string): { owner: string; repo: string } | null {
  const o = owner.trim();
  const r = repo.replace(/\.git$/, "").trim();
  if (!o || !r) return null;
  // GitHub usernames + repo names are limited to a small alphanumeric set;
  // anything with a slash, space, or "@" is bogus.
  if (/[\s@/\\]/.test(o) || /[\s@/\\]/.test(r)) return null;
  return { owner: o, repo: r };
}

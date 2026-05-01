// Auto-discovery (E-2). When a heartbeat arrives from a host the
// portal hasn't seen before, we ping the Vercel API to find which
// project owns the domain, lift the linked GitHub repo from the
// project's metadata, and stash the result as a "Discovery" the admin
// can confirm with one click. Net effect: a new repo gets the tag
// pasted in, deploys, and within ~10 seconds a new site is suggested
// in the admin with the repo URL pre-filled.
//
// Auth: a Vercel token in portal-settings.integrations.vercelToken.
// We only attempt discovery when the token is set + the autoDiscover
// flag isn't explicitly false. No-op otherwise (admin still has to
// add sites manually).

import { getState, mutate } from "./storage";
import { getSettings } from "./settings";
import type { Discovery } from "./types";

const VERCEL_API = "https://api.vercel.com";

export function getDiscoveries(): Discovery[] {
  return Object.values(getState().discoveries).sort((a, b) => b.lastSeenAt - a.lastSeenAt);
}

export function getDiscovery(host: string): Discovery | undefined {
  return getState().discoveries[host];
}

export function dismissDiscovery(host: string): Discovery | null {
  let saved: Discovery | null = null;
  mutate(state => {
    const d = state.discoveries[host];
    if (!d) return;
    saved = { ...d, status: "dismissed" };
    state.discoveries[host] = saved;
  });
  return saved;
}

export function confirmDiscovery(host: string): Discovery | null {
  let saved: Discovery | null = null;
  mutate(state => {
    const d = state.discoveries[host];
    if (!d) return;
    saved = { ...d, status: "confirmed" };
    state.discoveries[host] = saved;
  });
  return saved;
}

// Trigger a discovery probe for the given host. Idempotent — once a
// host has been seen and either confirmed or dismissed we don't re-probe.
// Designed to be called fire-and-forget from the heartbeat handler:
//   void runDiscovery(host)
// so a slow Vercel API doesn't delay the heartbeat response.
export async function runDiscovery(host: string): Promise<Discovery | null> {
  if (!host) return null;
  const cleaned = normaliseHost(host);
  if (!cleaned) return null;

  // Don't re-probe — once a discovery exists in any status we leave it
  // alone unless the admin manually re-runs.
  const existing = getState().discoveries[cleaned];
  const now = Date.now();
  if (existing) {
    // Touch lastSeenAt so the inbox sorts freshness correctly.
    mutate(state => {
      const cur = state.discoveries[cleaned];
      if (cur) state.discoveries[cleaned] = { ...cur, lastSeenAt: now };
    });
    return existing;
  }

  const settings = getSettings();
  const integ = settings.integrations;
  if (!integ?.vercelToken || integ.autoDiscover === false) {
    // Record the host so the admin sees that something showed up, but
    // without enrichment.
    const stub: Discovery = { host: cleaned, firstSeenAt: now, lastSeenAt: now, status: "pending", detectError: "Auto-discover disabled (no Vercel token)" };
    mutate(state => { state.discoveries[cleaned] = stub; });
    return stub;
  }

  let result: Discovery = {
    host: cleaned,
    firstSeenAt: now,
    lastSeenAt: now,
    status: "pending",
  };

  try {
    const project = await findVercelProjectByDomain(cleaned, integ.vercelToken);
    if (project) {
      result.vercelProjectId = project.id;
      result.vercelProjectName = project.name;
      // project.link can be a github / gitlab / bitbucket reference. We
      // surface a github URL when possible, since D-3 promote needs that
      // anyway.
      if (project.link?.type === "github" && project.link.org && project.link.repo) {
        result.repoUrl = `https://github.com/${project.link.org}/${project.link.repo}`;
        if (project.link.productionBranch) {
          result.defaultBranch = project.link.productionBranch;
        }
        // Optional GitHub enrichment — confirms the repo exists and
        // grabs the true default branch (in case productionBranch
        // wasn't set on the Vercel project). Uses the configured PAT
        // when present; falls back to the unauthenticated GitHub API
        // for public repos. Best-effort: a GitHub failure here doesn't
        // wipe out the Vercel-derived data we already have.
        try {
          const enrichment = await enrichFromGitHub(
            project.link.org,
            project.link.repo,
            settings.github.pat,
          );
          if (enrichment.defaultBranch) result.defaultBranch = enrichment.defaultBranch;
          if (enrichment.notFound) {
            result.detectError = "Vercel mentions a GitHub repo but it's not reachable (private without the configured PAT, or deleted).";
          }
        } catch { /* non-fatal — keep the Vercel-only result */ }
      }
    } else {
      result.detectError = "No Vercel project owns this domain";
    }
  } catch (e) {
    result.detectError = `Vercel API error: ${e instanceof Error ? e.message : String(e)}`;
  }

  // Persist the result. We don't auto-confirm — the admin reviews and
  // confirms in the inbox so unwanted hosts don't silently become Sites.
  mutate(state => { state.discoveries[cleaned] = result; });
  return result;
}

// ─── Vercel API ────────────────────────────────────────────────────────────

interface VercelProject {
  id: string;
  name: string;
  alias?: Array<{ domain: string }>;
  link?: {
    type: "github" | "gitlab" | "bitbucket";
    org?: string;       // GitHub org/owner
    repo?: string;
    productionBranch?: string;
  };
}

interface VercelListResponse {
  projects: VercelProject[];
  pagination?: { next?: number | null };
}

// Lists projects + scans alias[] for a domain match. Pages until either
// a match is found or the listing runs out. Capped at 5 pages to bound
// latency on portfolios with hundreds of projects.
async function findVercelProjectByDomain(domain: string, token: string): Promise<VercelProject | null> {
  let until: number | null = null;
  for (let page = 0; page < 5; page++) {
    const params = new URLSearchParams({ limit: "100" });
    if (until !== null) params.set("until", String(until));
    const res = await fetch(`${VERCEL_API}/v9/projects?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${(await res.text()).slice(0, 120)}`);
    }
    const data = await res.json() as VercelListResponse;
    for (const p of data.projects ?? []) {
      const aliases = p.alias ?? [];
      if (aliases.some(a => normaliseHost(a.domain) === domain)) return p;
      // Project name itself sometimes matches the production domain
      // for default *.vercel.app hosts.
      if (`${p.name}.vercel.app` === domain) return p;
    }
    if (data.pagination?.next) until = data.pagination.next;
    else break;
  }
  return null;
}

function normaliseHost(host: string): string {
  return host.trim().toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "")
    .split("/")[0]                  // strip path if present
    .split(":")[0];                 // strip port
}

// ─── GitHub API enrichment ─────────────────────────────────────────────────

interface GitHubRepoResponse {
  name: string;
  full_name: string;
  default_branch: string;
  private: boolean;
}

async function enrichFromGitHub(
  owner: string,
  repo: string,
  pat: string | undefined,
): Promise<{ defaultBranch?: string; isPrivate?: boolean; notFound?: boolean }> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (pat) headers.Authorization = `Bearer ${pat}`;

  const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
  const res = await fetch(url, { headers, cache: "no-store" });
  if (res.status === 404) return { notFound: true };
  if (!res.ok) {
    // 401/403 on a private repo with no/insufficient PAT scope. Treat as
    // "not found" so the admin gets a clear "configure your PAT" hint
    // rather than a cryptic API error.
    if (res.status === 401 || res.status === 403) return { notFound: true };
    throw new Error(`GitHub API error: ${res.status}`);
  }
  const data = await res.json() as GitHubRepoResponse;
  return {
    defaultBranch: data.default_branch,
    isPrivate: data.private,
  };
}

"use client";

// One-shot promote-to-GitHub from the admin client. Bundles the per-site
// custom head/body code (stored in localStorage on the Site record) into
// the request so the server can write it into portal.site.json.

import { getSite } from "./sites";

export interface PromoteResult {
  ok: boolean;
  prUrl?: string;
  prNumber?: number;
  error?: string;
  files?: Array<{ path: string; content: string }>;
}

export interface PromoteOptions {
  message?: string;
  includePages?: boolean;
  includeContent?: boolean;
  includeSite?: boolean;
}

export async function promoteSiteToGitHub(siteId: string, opts: PromoteOptions = {}): Promise<PromoteResult> {
  const site = getSite(siteId);
  const res = await fetch(`/api/portal/promote/${encodeURIComponent(siteId)}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      message: opts.message,
      siteName: site?.name,
      customHead: site?.customHead,
      customBody: site?.customBody,
      includePages: opts.includePages,
      includeContent: opts.includeContent,
      includeSite: opts.includeSite,
    }),
  });
  return res.json() as Promise<PromoteResult>;
}

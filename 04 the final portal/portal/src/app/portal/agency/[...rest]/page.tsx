// Agency-scope plugin route catch-all.
//
// Matches every URL under `/portal/agency/<rest>` that isn't claimed by a
// more specific page (Next gives literal routes priority over catch-all).
// Resolves the URL → plugin manifest + install + page component, then
// renders the plugin's component inside the agency chrome that the
// parent layout already painted.

import { notFound } from "next/navigation";
import { ensureHydrated } from "@/server/storage";
import { requireRole } from "@/lib/server/auth";
import { AGENCY_ROLES } from "@/server/types";
import { resolveAgencyPluginPage } from "@/plugins/_routeResolver";
import { FOUNDATION_SERVICES } from "@/plugins/foundation-adapters";
import { pluginPageAllowedRoles } from "@/plugins/_types";
import type { PluginPageProps } from "@/plugins/_types";
import { makePluginStorage } from "@/lib/server/pluginStorage";

interface RouteProps {
  params: Promise<{ rest: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AgencyPluginCatchAll({ params, searchParams }: RouteProps) {
  await ensureHydrated();
  const session = await requireRole([...AGENCY_ROLES]);

  const { rest } = await params;
  const sp = await searchParams;

  const resolved = resolveAgencyPluginPage({ agencyId: session.agencyId, rest });
  if (!resolved) notFound();
  const { page, install, segments } = resolved;

  const allowed = pluginPageAllowedRoles(page);
  if (allowed && !allowed.includes(session.role)) notFound();

  const mod = await page.component();
  const Component = mod.default;
  const props: PluginPageProps = {
    agencyId: session.agencyId,
    install,
    segments,
    searchParams: sp,
    actor: session.userId,
    services: FOUNDATION_SERVICES,
    storage: makePluginStorage(install.id),
  };
  return <Component {...props} />;
}

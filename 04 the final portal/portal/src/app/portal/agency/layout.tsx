// Agency-scoped layout — chrome painted with the agency's brand kit.
// Sidebar built from agency-scoped plugin installs.

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import type { ReactNode } from "react";
import { ensureHydrated } from "@/server/storage";
import { requireRole } from "@/lib/server/auth";
import { AGENCY_ROLES } from "@/server/types";
import { getAgency } from "@/server/tenants";
import { listInstalledFor } from "@/server/pluginInstalls";
import { buildSidebar } from "@/lib/chrome/sidebarLayout";
import { ThemeInjector } from "@/components/chrome/ThemeInjector";
import { Sidebar } from "@/components/chrome/Sidebar";
import { Topbar } from "@/components/chrome/Topbar";

export default async function AgencyLayout({ children }: { children: ReactNode }) {
  await ensureHydrated();
  let session;
  try {
    session = await requireRole([...AGENCY_ROLES]);
  } catch {
    redirect("/portal");
  }

  const agency = getAgency(session.agencyId);
  if (!agency) redirect("/login");

  const installs = listInstalledFor({ agencyId: agency.id });
  const panels = buildSidebar({
    role: session.role,
    scope: "agency",
    installedPlugins: installs,
  });

  // Best-effort current path for "active" highlighting. Falls back to ""
  // when the header isn't present (some preview environments).
  const h = await headers();
  const currentPath = h.get("x-invoke-path") ?? h.get("x-pathname") ?? "/portal/agency";

  return (
    <>
      <ThemeInjector brand={agency.brand} scope="agency" />
      <div className="flex min-h-screen">
        <Sidebar panels={panels} tenantLabel={agency.name} currentPath={currentPath} />
        <div className="flex flex-1 flex-col">
          <Topbar
            title={agency.name}
            subtitle="Agency workspace"
            role={session.role}
            email={session.email}
          />
          <main className="flex-1 px-8 py-6">{children}</main>
        </div>
      </div>
    </>
  );
}

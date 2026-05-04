// Per-client layout. The chrome's brand kit comes from the client (not
// the agency), so a client-side admin sees the portal painted as their
// own; an agency-side admin previewing the same path sees the same paint
// (which is the point — the portal looks like Felicia's, regardless of
// who's signed in).

import { redirect, notFound } from "next/navigation";
import { headers } from "next/headers";
import type { ReactNode } from "react";
import { ensureHydrated } from "@/server/storage";
import { requireRoleForClient } from "@/lib/server/auth";
import { ALL_ROLES } from "@/server/types";
import { getClientForAgency } from "@/server/tenants";
import { listInstalledFor } from "@/server/pluginInstalls";
import { buildSidebar } from "@/lib/chrome/sidebarLayout";
import { ThemeInjector } from "@/components/chrome/ThemeInjector";
import { Sidebar } from "@/components/chrome/Sidebar";
import { Topbar } from "@/components/chrome/Topbar";

export default async function ClientLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ clientId: string }>;
}) {
  await ensureHydrated();
  const { clientId } = await params;

  // All roles (except end-customer's own scope) can hit this layout, but
  // requireRoleForClient enforces tenant-scope match for client-* roles.
  let session;
  try {
    session = await requireRoleForClient([...ALL_ROLES], clientId);
  } catch {
    redirect("/portal");
  }

  const client = getClientForAgency(session.agencyId, clientId);
  if (!client) notFound();

  const installs = listInstalledFor({ agencyId: client.agencyId, clientId: client.id });
  const panels = buildSidebar({
    role: session.role,
    scope: "client",
    currentClient: client,
    installedPlugins: installs,
  });

  const h = await headers();
  const currentPath = h.get("x-invoke-path") ?? h.get("x-pathname") ?? `/portal/clients/${client.id}`;

  return (
    <>
      <ThemeInjector brand={client.brand} scope="client" />
      <div className="flex min-h-screen">
        <Sidebar panels={panels} tenantLabel={client.name} currentPath={currentPath} />
        <div className="flex flex-1 flex-col">
          <Topbar
            title={client.name}
            subtitle={`Stage · ${client.stage}`}
            role={session.role}
            email={session.email}
          />
          <main className="flex-1 px-8 py-6">{children}</main>
        </div>
      </div>
    </>
  );
}

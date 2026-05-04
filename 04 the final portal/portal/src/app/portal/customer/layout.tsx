import { redirect, notFound } from "next/navigation";
import { headers } from "next/headers";
import type { ReactNode } from "react";
import { ensureHydrated } from "@/server/storage";
import { requireRole } from "@/lib/server/auth";
import { getClientForAgency } from "@/server/tenants";
import { listInstalledFor } from "@/server/pluginInstalls";
import { buildSidebar } from "@/lib/chrome/sidebarLayout";
import { ThemeInjector } from "@/components/chrome/ThemeInjector";
import { Sidebar } from "@/components/chrome/Sidebar";
import { Topbar } from "@/components/chrome/Topbar";

// End-customer layout — Felicia's shoppers / members / affiliates.
// Branded as the parent client (not the agency).

export default async function CustomerLayout({ children }: { children: ReactNode }) {
  await ensureHydrated();
  let session;
  try {
    session = await requireRole("end-customer");
  } catch {
    redirect("/portal");
  }

  // End-customer must be tied to a client.
  if (!session.clientId) redirect("/login");
  const client = getClientForAgency(session.agencyId, session.clientId);
  if (!client) notFound();

  const installs = listInstalledFor({ agencyId: session.agencyId, clientId: client.id });
  const panels = buildSidebar({
    role: session.role,
    scope: "customer",
    currentClient: client,
    installedPlugins: installs,
  });
  const h = await headers();
  const currentPath = h.get("x-invoke-path") ?? h.get("x-pathname") ?? "/portal/customer";

  return (
    <>
      <ThemeInjector brand={client.brand} scope="customer" />
      <div className="flex min-h-screen">
        <Sidebar panels={panels} tenantLabel={client.name} currentPath={currentPath} />
        <div className="flex flex-1 flex-col">
          <Topbar
            title="My account"
            subtitle={client.name}
            role={session.role}
            email={session.email}
          />
          <main className="flex-1 px-8 py-6">{children}</main>
        </div>
      </div>
    </>
  );
}

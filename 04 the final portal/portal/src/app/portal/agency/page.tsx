import Link from "next/link";
import { ensureHydrated } from "@/server/storage";
import { requireRole } from "@/lib/server/auth";
import { AGENCY_ROLES } from "@/server/types";
import { getAgency, listClients } from "@/server/tenants";
import { listInstalledFor, listInstalledForAgencyOnly } from "@/server/pluginInstalls";

export default async function AgencyHome() {
  await ensureHydrated();
  const session = await requireRole([...AGENCY_ROLES]);
  const agency = getAgency(session.agencyId)!;
  const clients = listClients(agency.id);
  const agencyInstalls = listInstalledForAgencyOnly(agency.id);
  const allInstalls = listInstalledFor({ agencyId: agency.id });

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight text-black/90">
          Welcome, {session.email.split("@")[0]}.
        </h1>
        <p className="mt-1 text-sm text-black/60">
          You&apos;re signed in as {session.role.replace("-", " ")} of {agency.name}.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-black/60">
          Clients
        </h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {clients.length === 0 && (
            <div className="rounded-lg border border-dashed border-black/15 p-6 text-sm text-black/60">
              No clients yet. The fulfillment plugin (T2) ships the &ldquo;Create client&rdquo; form.
              For now, you can <code className="rounded bg-black/5 px-1">curl -X POST /api/tenants/seed</code> to seed Felicia.
            </div>
          )}
          {clients.map(client => (
            <Link
              key={client.id}
              href={`/portal/clients/${client.id}`}
              className="rounded-lg border border-black/10 bg-white p-4 transition hover:shadow"
            >
              <div className="flex items-center justify-between">
                <div className="text-base font-medium text-black/90">{client.name}</div>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide text-white"
                  style={{ backgroundColor: client.brand.primaryColor }}
                >
                  {client.stage}
                </span>
              </div>
              {client.websiteUrl && (
                <div className="mt-1 text-xs text-black/50">{client.websiteUrl}</div>
              )}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-black/60">
          Plugins
        </h2>
        <div className="rounded-lg border border-black/10 bg-white p-4 text-sm">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-black/70">
              {allInstalls.length} install{allInstalls.length === 1 ? "" : "s"} across this agency
              ({agencyInstalls.length} agency-wide,
              {" "}{allInstalls.length - agencyInstalls.length} client-scoped).
            </span>
            <span className="text-xs text-black/50">
              T2 → fulfillment · T3 → website-editor
            </span>
          </div>
          <div className="text-xs text-black/50">
            Plugin marketplace and install UI ships with T2&apos;s fulfillment plugin.
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-dashed border-black/15 bg-white/60 p-4 text-xs text-black/60">
        <strong className="font-medium text-black/80">Foundation note.</strong>{" "}
        This page is a stub. T2&apos;s fulfillment plugin will contribute the agency-side
        workspace (HR / finance / phase board / client list with assignments).
        T3&apos;s website-editor will contribute the per-client editor surface.
      </section>
    </div>
  );
}

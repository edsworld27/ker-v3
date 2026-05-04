import { ensureHydrated } from "@/server/storage";
import { requireRoleForClient } from "@/lib/server/auth";
import { ALL_ROLES } from "@/server/types";
import { getClientForAgency } from "@/server/tenants";
import { listInstalledFor } from "@/server/pluginInstalls";
import { phaseLabel } from "@/server/phases";
import { notFound } from "next/navigation";

export default async function ClientHome({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  await ensureHydrated();
  const { clientId } = await params;
  const session = await requireRoleForClient([...ALL_ROLES], clientId);
  const client = getClientForAgency(session.agencyId, clientId);
  if (!client) notFound();
  const installs = listInstalledFor({ agencyId: client.agencyId, clientId: client.id });

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight text-black/90">
          {client.name}
        </h1>
        <p className="mt-1 text-sm text-black/60">
          Phase: <span className="font-medium text-black/80">{phaseLabel(client.stage)}</span>.
          Website: {client.websiteUrl ? (
            <a href={client.websiteUrl} target="_blank" rel="noreferrer" className="text-[var(--brand-primary)] hover:underline">{client.websiteUrl}</a>
          ) : "—"}.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-black/60">
          Installed plugins
        </h2>
        <div className="rounded-lg border border-black/10 bg-white p-4 text-sm">
          {installs.length === 0 && (
            <div className="text-black/60">
              No plugins installed yet. T2&apos;s fulfillment plugin will install the Discovery
              phase&apos;s starter pack on client creation.
            </div>
          )}
          <ul className="grid gap-2">
            {installs.map(install => (
              <li
                key={install.id}
                className="flex items-center justify-between rounded-md border border-black/10 px-3 py-2"
              >
                <div>
                  <div className="font-medium text-black/90">{install.pluginId}</div>
                  <div className="text-xs text-black/50">
                    Scope: {install.clientId ? "client" : "agency"} ·
                    {" "}{Object.keys(install.features).filter(k => install.features[k]).length} features on
                  </div>
                </div>
                <span className={["rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide", install.enabled ? "bg-emerald-100 text-emerald-800" : "bg-black/10 text-black/60"].join(" ")}>
                  {install.enabled ? "enabled" : "disabled"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="rounded-lg border border-dashed border-black/15 bg-white/60 p-4 text-xs text-black/60">
        <strong className="font-medium text-black/80">Foundation note.</strong>{" "}
        This page is a stub. Plugin-contributed routes (e.g. <code>/products</code> from
        E-commerce, <code>/pages</code> from Website-editor) will appear under
        <code className="mx-1 rounded bg-black/5 px-1">/portal/clients/{client.id}/&lt;plugin&gt;</code> as plugins
        land in rounds 1 + 2.
      </section>
    </div>
  );
}

import React from 'react';
import {
  Search,
  Building2,
  User2,
  Mail,
  Layout,
  Filter,
  Settings,
  ShieldCheck,
  Database,
  History,
  ArrowRight,
} from 'lucide-react';
import {
  Page,
  PageHeader,
  Card,
  KpiCard,
  Button,
  SearchInput,
  Badge,
} from '@aqua/bridge/ui/kit';
import { useClientAgencyClientsLogic } from './logic/ClientuseAgencyClientsLogic';

export const ClientAgencyClientsView: React.FC = () => {
  const { filteredClients, handleImpersonate, searchQuery, setSearchQuery } =
    useClientAgencyClientsLogic();

  return (
    <Page>
      <PageHeader
        eyebrow="Agency"
        title="Clients"
        subtitle="Roster of every active client workspace and the apps deployed in each."
        actions={
          <>
            <SearchInput
              icon={Search}
              placeholder="Search clients, industries, tags..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-72 hidden md:block"
            />
            <Button variant="ghost" icon={Filter} aria-label="Filter" />
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Total clients" value={filteredClients.length} icon={Building2} />
        <KpiCard label="Active sessions" value={12} icon={ShieldCheck} />
        <KpiCard label="Modules deployed" value={48} icon={Database} />
        <KpiCard label="Activity score" value="98%" icon={History} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filteredClients.map(client => (
          <Card key={client.id} padding="md">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-indigo-300" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-white truncate">{client.name}</h3>
                  <Badge tone="success">Online</Badge>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <User2 className="w-3 h-3" />
                  <span className="truncate">{client.contact}</span>
                </div>
              </div>
            </div>

            <ul className="space-y-2 py-3 border-y border-white/5 mb-3">
              <li className="flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1.5 text-slate-500">
                  <Mail className="w-3 h-3" /> Cloud instance
                </span>
                <span className="text-slate-300">Standard cluster</span>
              </li>
              <li className="flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1.5 text-slate-500">
                  <Layout className="w-3 h-3" /> Modules
                </span>
                <span className="text-slate-300">12 active</span>
              </li>
              <li className="flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1.5 text-indigo-300">
                  <ShieldCheck className="w-3 h-3" /> Security
                </span>
                <span className="text-indigo-300 font-medium">Authorized</span>
              </li>
            </ul>

            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                iconRight={ArrowRight}
                onClick={() => handleImpersonate(client)}
                className="flex-1"
              >
                View workspace
              </Button>
              <Button variant="ghost" size="sm" icon={Settings} aria-label="Settings" />
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-10 pt-6 border-t border-white/5 flex flex-wrap items-center justify-center gap-6 text-[11px] text-slate-500">
        <span className="inline-flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 opacity-60" /> Biometric protection active</span>
        <span className="inline-flex items-center gap-1.5"><Database className="w-3.5 h-3.5 opacity-60" /> Encrypted DB link</span>
      </div>
    </Page>
  );
};

export default ClientAgencyClientsView;

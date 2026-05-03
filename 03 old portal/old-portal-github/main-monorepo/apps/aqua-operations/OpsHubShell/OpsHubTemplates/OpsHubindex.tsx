import React from 'react';
import { BridgeRegistry } from '@aqua/bridge/registry';
import { Workflow, ArrowUpRight, LineChart, Users, TrendingUp, Briefcase } from 'lucide-react';
import { Page, PageHeader, Section, Card } from '@aqua/bridge/ui/kit';

const NAV_CARDS = [
  { id: 'crm-pipeline',       title: 'Sales Pipeline', description: 'Open deals, weighted forecast, and stage breakdown.', icon: TrendingUp },
  { id: 'finance-dashboard',  title: 'Finance Hub',    description: 'Revenue, settlements, and partner payouts.',           icon: LineChart  },
  { id: 'people-hr',          title: 'People Hub',     description: 'HR records, payroll readiness, and team operations.', icon: Users      },
  { id: 'sales-hub-overview', title: 'Revenue Suite',  description: 'Sales + marketing widgets, KPIs, and channel mix.',   icon: Briefcase  },
];

const navTo = (viewId: string) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('aqua:nav', { detail: { viewId } }));
  }
};

const OperationsOverview: React.FC = () => (
  <Page>
    <PageHeader
      eyebrow="Operations"
      title="Operations"
      subtitle="A cross-cutting view of agency operations. Jump into any hub below."
    />
    <Section title="Hubs" description="Each hub manages a domain of the agency.">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {NAV_CARDS.map(card => (
          <Card key={card.id} padding="md" onClick={() => navTo(card.id)}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                <card.icon className="w-4 h-4 text-indigo-300" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <h3 className="text-sm font-semibold text-white truncate">{card.title}</h3>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{card.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  </Page>
);

export const OpsHubSuiteRegistry = {
  id: 'operations-suite',
  section: 'Operations',
  label: 'Operations',
  icon: Workflow,
  description: 'Cross-cutting operations command center — links into Finance, People, Revenue, and CRM.',
  category: 'Operations' as const,
  pricing: 'free' as const,
  defaultView: 'operations-overview',
  subItems: [
    {
      id: 'operations-overview',
      label: 'Overview',
      icon: Workflow,
      view: 'operations-overview',
    },
  ],
};

export async function registerOpsHubApp() {
  console.log('[AQUA Operations] Registering Operations Hub...');
  BridgeRegistry.registerSuite(OpsHubSuiteRegistry);
  BridgeRegistry.registerAll({
    'operations-overview': OperationsOverview,
    'operations-suite': OperationsOverview,
  });
}

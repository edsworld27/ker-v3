import React, { useMemo } from 'react';
import { Calendar, User } from 'lucide-react';
import { Page, PageHeader, Card } from '@aqua/bridge/ui/kit';
import {
  PROPOSALS_HEADING,
  PROPOSALS_SUBHEAD,
  PROPOSAL_COLUMNS,
  formatProposalCurrency,
  type Proposal,
  type ProposalStatus,
} from './ProposalsWidget.ui';

const PROPOSALS: Proposal[] = [
  { id: 'p1',  client: 'Northwind Logistics',     title: 'Brand Refresh — Phase 1',         value: 84200,  sentDate: '2026-04-30', status: 'Accepted', owner: 'Marcus Hale' },
  { id: 'p2',  client: 'Helios Manufacturing',    title: 'Website Build + Hosting',         value: 112500, sentDate: '2026-04-28', status: 'Sent',     owner: 'Priya Banerjee' },
  { id: 'p3',  client: 'BrightWater Studios',     title: 'Content Production Retainer (12mo)', value: 96000, sentDate: '2026-04-27', status: 'Drafted', owner: 'Jordan Iverson' },
  { id: 'p4',  client: 'Granite Peak Capital',    title: 'Investor Deck + Pitch Coaching',  value: 24000,  sentDate: '2026-04-26', status: 'Sent',     owner: 'Marcus Hale' },
  { id: 'p5',  client: 'Cobalt Software Group',   title: 'SEO Sprint — 90 Days',            value: 32400,  sentDate: '2026-04-25', status: 'Accepted', owner: 'Sasha Owens' },
  { id: 'p6',  client: 'Lumen Health Partners',   title: 'Q3 Launch Campaign',              value: 64750,  sentDate: '2026-04-24', status: 'Accepted', owner: 'Jordan Iverson' },
  { id: 'p7',  client: 'Riverline Media',         title: 'Brand Audit + Roadmap',           value: 29400,  sentDate: '2026-04-23', status: 'Sent',     owner: 'Sasha Owens' },
  { id: 'p8',  client: 'Atlas Architecture',      title: 'Quarterly Marketing Retainer',    value: 96000,  sentDate: '2026-04-22', status: 'Drafted',  owner: 'Marcus Hale' },
  { id: 'p9',  client: 'Vertex Aerospace',        title: 'Strategy Sprint — Enterprise',    value: 156800, sentDate: '2026-04-20', status: 'Sent',     owner: 'Priya Banerjee' },
  { id: 'p10', client: 'Sapphire Boutique Hotels', title: 'Guest Experience Site',          value: 72500,  sentDate: '2026-04-19', status: 'Drafted',  owner: 'Jordan Iverson' },
  { id: 'p11', client: 'Halcyon Wellness',        title: 'Membership Site + Community',     value: 48000,  sentDate: '2026-04-17', status: 'Sent',     owner: 'Priya Banerjee' },
  { id: 'p12', client: 'Pinecrest Outdoors',      title: 'Ecommerce Build',                 value: 72500,  sentDate: '2026-04-16', status: 'Drafted',  owner: 'Sasha Owens' },
];

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

interface ColumnSummary {
  count: number;
  total: number;
}

export const ProposalsWidget: React.FC = () => {
  const grouped = useMemo(() => {
    const map = new Map<ProposalStatus, Proposal[]>();
    PROPOSAL_COLUMNS.forEach(c => map.set(c.id, []));
    PROPOSALS.forEach(p => map.get(p.status)?.push(p));
    return map;
  }, []);

  const summary = useMemo(() => {
    const map = new Map<ProposalStatus, ColumnSummary>();
    PROPOSAL_COLUMNS.forEach(c => {
      const list = grouped.get(c.id) ?? [];
      const total = list.reduce((sum, p) => sum + p.value, 0);
      map.set(c.id, { count: list.length, total });
    });
    return map;
  }, [grouped]);

  return (
    <Page>
      <PageHeader
        eyebrow="Sales"
        title={PROPOSALS_HEADING}
        subtitle={PROPOSALS_SUBHEAD}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {PROPOSAL_COLUMNS.map(col => {
          const ColIcon = col.icon;
          const list = grouped.get(col.id) ?? [];
          const sum = summary.get(col.id) ?? { count: 0, total: 0 };
          return (
            <div key={col.id} className="flex flex-col bg-white/[0.02] border border-white/5 rounded-xl">
              <div className="px-3 pt-3 pb-2 border-b border-white/5">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <ColIcon className="w-3 h-3 text-slate-500" />
                    <span className="text-xs font-semibold text-white">{col.label}</span>
                  </div>
                  <span className="text-[10px] tabular-nums text-slate-500 bg-white/5 px-1.5 h-4 rounded inline-flex items-center">
                    {sum.count}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 tabular-nums">
                  {formatProposalCurrency(sum.total)}
                </div>
              </div>

              <div className="flex flex-col gap-2 p-2 min-h-[300px]">
                {list.map(proposal => (
                  <Card key={proposal.id} padding="sm" interactive>
                    <div className="mb-2">
                      <div className="text-sm font-medium text-white truncate">{proposal.client}</div>
                      <div className="text-[11px] text-slate-500 truncate">{proposal.title}</div>
                    </div>
                    <div className="text-base font-semibold text-emerald-300 tabular-nums mb-2.5">
                      {formatProposalCurrency(proposal.value)}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(proposal.sentDate)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {proposal.owner.split(' ')[0]}
                      </span>
                    </div>
                  </Card>
                ))}
                {list.length === 0 ? (
                  <div className="text-center text-[11px] text-slate-600 italic py-8">No proposals</div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </Page>
  );
};

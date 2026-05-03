import React, { useMemo } from 'react';
import { Clock, Percent } from 'lucide-react';
import { Page, PageHeader, Card, Badge, Avatar } from '@aqua/bridge/ui/kit';
import {
  PIPELINE_HEADING,
  PIPELINE_SUBHEAD,
  SALES_STAGES,
  formatCurrency,
  type PipelineDeal,
  type SalesStageId,
} from './SalesPipelineView.ui';

const DEALS: PipelineDeal[] = [
  { id: 'd1',  company: 'Northwind Logistics',  title: 'Q3 Brand Refresh',          value: 84200,  probability: 90, ownerName: 'Marcus Hale',    ownerInitials: 'MH', ownerColor: 'bg-sky-500',     daysInStage: 2,  stage: 'closed-won',   tag: 'Renewal' },
  { id: 'd2',  company: 'Helios Manufacturing', title: 'Website Build + Hosting',   value: 112500, probability: 65, ownerName: 'Priya Banerjee', ownerInitials: 'PB', ownerColor: 'bg-violet-500',  daysInStage: 5,  stage: 'proposal' },
  { id: 'd3',  company: 'BrightWater Studios',  title: 'Content Production Retainer', value: 38000, probability: 30, ownerName: 'Jordan Iverson', ownerInitials: 'JI', ownerColor: 'bg-amber-500',  daysInStage: 1,  stage: 'qualified' },
  { id: 'd4',  company: 'Granite Peak Capital', title: 'Investor Deck + Pitch',     value: 24000,  probability: 50, ownerName: 'Marcus Hale',    ownerInitials: 'MH', ownerColor: 'bg-sky-500',     daysInStage: 3,  stage: 'negotiation' },
  { id: 'd5',  company: 'Cobalt Software Group', title: 'SEO Sprint',               value: 18500,  probability: 20, ownerName: 'Sasha Owens',    ownerInitials: 'SO', ownerColor: 'bg-emerald-500', daysInStage: 7,  stage: 'lead' },
  { id: 'd6',  company: 'Acme Beverages',       title: 'Packaging System',          value: 48000,  probability: 10, ownerName: 'Priya Banerjee', ownerInitials: 'PB', ownerColor: 'bg-violet-500',  daysInStage: 18, stage: 'closed-lost' },
  { id: 'd7',  company: 'Lumen Health Partners', title: 'Product Launch Campaign',  value: 64750,  probability: 95, ownerName: 'Jordan Iverson', ownerInitials: 'JI', ownerColor: 'bg-amber-500',  daysInStage: 1,  stage: 'closed-won' },
  { id: 'd8',  company: 'Riverline Media',      title: 'Brand Audit + Roadmap',     value: 29400,  probability: 70, ownerName: 'Sasha Owens',    ownerInitials: 'SO', ownerColor: 'bg-emerald-500', daysInStage: 4,  stage: 'proposal' },
  { id: 'd9',  company: 'Atlas Architecture',   title: 'Quarterly Retainer',        value: 96000,  probability: 60, ownerName: 'Marcus Hale',    ownerInitials: 'MH', ownerColor: 'bg-sky-500',     daysInStage: 6,  stage: 'qualified' },
  { id: 'd10', company: 'Vertex Aerospace',     title: 'Enterprise Strategy Sprint', value: 156800, probability: 80, ownerName: 'Priya Banerjee', ownerInitials: 'PB', ownerColor: 'bg-violet-500',  daysInStage: 2, stage: 'negotiation' },
  { id: 'd11', company: 'Sapphire Boutique Hotels', title: 'Guest Experience Site', value: 72500,  probability: 25, ownerName: 'Jordan Iverson', ownerInitials: 'JI', ownerColor: 'bg-amber-500',  daysInStage: 9,  stage: 'lead' },
  { id: 'd12', company: 'Ironbark Construction', title: 'Marketing Refresh',        value: 41250,  probability: 55, ownerName: 'Sasha Owens',    ownerInitials: 'SO', ownerColor: 'bg-emerald-500', daysInStage: 4, stage: 'qualified' },
];

interface ColumnSummary {
  count: number;
  total: number;
}

export const SalesPipelineView: React.FC = () => {
  const dealsByStage = useMemo(() => {
    const map = new Map<SalesStageId, PipelineDeal[]>();
    SALES_STAGES.forEach(s => map.set(s.id, []));
    DEALS.forEach(d => map.get(d.stage)?.push(d));
    return map;
  }, []);

  const summaryByStage = useMemo(() => {
    const map = new Map<SalesStageId, ColumnSummary>();
    SALES_STAGES.forEach(s => {
      const list = dealsByStage.get(s.id) ?? [];
      map.set(s.id, { count: list.length, total: list.reduce((sum, d) => sum + d.value, 0) });
    });
    return map;
  }, [dealsByStage]);

  return (
    <Page>
      <PageHeader
        eyebrow="Sales"
        title={PIPELINE_HEADING}
        subtitle={PIPELINE_SUBHEAD}
      />

      <div className="overflow-x-auto -mx-2 px-2">
        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${SALES_STAGES.length}, minmax(240px, 1fr))` }}>
          {SALES_STAGES.map(stage => {
            const StageIcon = stage.icon;
            const list = dealsByStage.get(stage.id) ?? [];
            const summary = summaryByStage.get(stage.id) ?? { count: 0, total: 0 };
            return (
              <div key={stage.id} className="flex flex-col bg-white/[0.02] border border-white/5 rounded-xl">
                <div className="px-3 pt-3 pb-2 border-b border-white/5">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <StageIcon className="w-3 h-3 text-slate-500" />
                      <span className="text-xs font-semibold text-white">{stage.label}</span>
                    </div>
                    <span className="text-[10px] tabular-nums text-slate-500 bg-white/5 px-1.5 h-4 rounded inline-flex items-center">
                      {summary.count}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 tabular-nums">
                    {formatCurrency(summary.total)}
                  </div>
                </div>

                <div className="flex flex-col gap-2 p-2 min-h-[300px]">
                  {list.map(deal => (
                    <Card key={deal.id} padding="sm" interactive>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-white truncate">{deal.company}</div>
                          <div className="text-[11px] text-slate-500 truncate">{deal.title}</div>
                        </div>
                        {deal.tag ? <Badge tone="indigo">{deal.tag}</Badge> : null}
                      </div>

                      <div className="text-base font-semibold text-emerald-300 tabular-nums mb-2.5">
                        {formatCurrency(deal.value)}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Avatar name={deal.ownerName} size="sm" />
                          <span className="inline-flex items-center gap-0.5 tabular-nums">
                            <Percent className="w-3 h-3" />
                            {deal.probability}
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-0.5 tabular-nums">
                          <Clock className="w-3 h-3" />
                          {deal.daysInStage}d
                        </span>
                      </div>
                    </Card>
                  ))}
                  {list.length === 0 ? (
                    <div className="text-center text-[11px] text-slate-600 italic py-8">No deals</div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Page>
  );
};

'use client';

import React, { useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { Page, PageHeader, Card } from '@aqua/bridge/ui/kit';

interface FunnelStage {
  id: string;
  label: string;
  count: number;
}

const STAGES: readonly FunnelStage[] = [
  { id: 'visitors',   label: 'Visitors',      count: 142_400 },
  { id: 'leads',      label: 'Leads',         count: 18_320 },
  { id: 'mqls',       label: 'MQLs',          count: 6_180 },
  { id: 'sqls',       label: 'SQLs',          count: 2_104 },
  { id: 'opps',       label: 'Opportunities', count: 612 },
  { id: 'customers',  label: 'Customers',     count: 184 },
];

const STAGE_COLORS = ['#818cf8', '#60a5fa', '#34d399', '#fbbf24', '#f472b6', '#a78bfa'];

const formatNumber = (n: number): string => new Intl.NumberFormat('en-US').format(n);

export const LeadFunnel: React.FC = () => {
  const maxCount = STAGES[0].count;

  const conversionRates = useMemo(() => {
    return STAGES.slice(0, -1).map((s, idx) => {
      const next = STAGES[idx + 1];
      return { id: `${s.id}-${next.id}`, label: `${s.label} → ${next.label}`, rate: (next.count / s.count) * 100 };
    });
  }, []);

  const endToEnd = (STAGES[STAGES.length - 1].count / STAGES[0].count) * 100;

  return (
    <Page>
      <PageHeader
        eyebrow="Marketing"
        title="Lead funnel"
        subtitle="Conversion through the full marketing-to-customer journey."
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-3">
        <Card padding="md">
          <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500 font-medium mb-4">
            Funnel stages — last 30 days
          </div>
          <div className="flex flex-col items-center gap-1">
            {STAGES.map((stage, idx) => {
              const widthPct = Math.max(28, (stage.count / maxCount) * 100);
              const color = STAGE_COLORS[idx % STAGE_COLORS.length];
              return (
                <React.Fragment key={stage.id}>
                  <div
                    className="flex items-center justify-between px-4 py-3 rounded-lg transition-colors"
                    style={{
                      width: `${widthPct}%`,
                      backgroundColor: `${color}26`,
                      borderLeft: `3px solid ${color}`,
                    }}
                  >
                    <span className="text-sm font-medium text-white">{stage.label}</span>
                    <span className="text-sm tabular-nums text-slate-200">{formatNumber(stage.count)}</span>
                  </div>
                  {idx < STAGES.length - 1 ? (
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 py-1">
                      <ChevronDown className="w-3 h-3" />
                      <span>{((STAGES[idx + 1].count / stage.count) * 100).toFixed(1)}% convert</span>
                    </div>
                  ) : null}
                </React.Fragment>
              );
            })}
          </div>
        </Card>

        <Card padding="md">
          <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500 font-medium mb-3">
            Stage-to-stage conversion
          </div>
          <ul className="space-y-1.5 mb-4">
            {conversionRates.map(r => (
              <li key={r.id} className="flex items-center justify-between text-xs">
                <span className="text-slate-400 truncate pr-2">{r.label}</span>
                <span className="text-slate-200 font-medium tabular-nums">{r.rate.toFixed(1)}%</span>
              </li>
            ))}
          </ul>
          <div className="p-3 rounded-xl border border-indigo-500/25 bg-indigo-500/[0.06]">
            <div className="text-[10px] uppercase tracking-[0.18em] font-medium text-indigo-300">End-to-end</div>
            <div className="text-2xl font-semibold text-white mt-1 tabular-nums">{endToEnd.toFixed(2)}%</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Visitor → customer</div>
          </div>
        </Card>
      </div>
    </Page>
  );
};

'use client';

import React from 'react';
import { ArrowDownRight, ArrowUpRight, Eye, Heart, Megaphone, Target, TrendingUp } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Page, PageHeader, Card, Badge } from '@aqua/bridge/ui/kit';

interface KpiMetric {
  id: string;
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ComponentType<{ className?: string }>;
}

const KPI_METRICS: readonly KpiMetric[] = [
  { id: 'reach',      label: 'Total reach',     value: '1.42M', change: '+18.2%', trend: 'up',   icon: Eye },
  { id: 'engagement', label: 'Engagement rate', value: '4.86%', change: '+0.7pt', trend: 'up',   icon: Heart },
  { id: 'mqls',       label: 'MQLs this month', value: '2,184', change: '+11.4%', trend: 'up',   icon: Target },
  { id: 'roas',       label: 'ROAS',            value: '4.3x',  change: '-0.2x',  trend: 'down', icon: TrendingUp },
];

const WEEKLY_TRAFFIC = [
  { week: 'W1', sessions: 24800 },
  { week: 'W2', sessions: 27200 },
  { week: 'W3', sessions: 25400 },
  { week: 'W4', sessions: 30100 },
  { week: 'W5', sessions: 33500 },
  { week: 'W6', sessions: 31800 },
  { week: 'W7', sessions: 36400 },
  { week: 'W8', sessions: 39200 },
];

export const MarketingOverview: React.FC = () => (
  <Page>
    <PageHeader
      eyebrow="Marketing"
      title="Overview"
      subtitle="Top-line marketing performance across every channel."
      actions={
        <Badge tone="indigo">
          <Megaphone className="w-3 h-3 mr-1" />
          Last 30 days
        </Badge>
      }
    />

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {KPI_METRICS.map(m => {
        const Icon = m.icon;
        const TrendIcon = m.trend === 'up' ? ArrowUpRight : ArrowDownRight;
        const trendColor = m.trend === 'up' ? 'text-emerald-400' : 'text-rose-400';
        return (
          <Card key={m.id} padding="md">
            <div className="flex items-start justify-between mb-4">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Icon className="w-4 h-4 text-indigo-300" />
              </div>
              <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${trendColor}`}>
                {m.change}
                <TrendIcon className="w-3 h-3" />
              </span>
            </div>
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1.5">{m.label}</div>
            <div className="text-2xl font-semibold text-white tabular-nums">{m.value}</div>
          </Card>
        );
      })}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
      <Card padding="md">
        <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500 font-medium mb-2">Top performing channel</div>
        <div className="text-lg font-semibold text-white mb-3">Organic Search</div>
        <ul className="space-y-1.5 text-sm text-slate-300">
          <li className="flex justify-between">
            <span className="text-slate-400">Share of MQLs</span>
            <span className="font-medium text-white">38.2%</span>
          </li>
          <li className="flex justify-between">
            <span className="text-slate-400">Conversions</span>
            <span className="font-medium text-white tabular-nums">832</span>
          </li>
        </ul>
      </Card>

      <Card padding="md" className="lg:col-span-2">
        <div className="mb-3">
          <h3 className="text-base font-semibold text-white">Weekly traffic</h3>
          <p className="text-xs text-slate-400 mt-0.5">Sessions across all properties — last 8 weeks.</p>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={WEEKLY_TRAFFIC} margin={{ top: 6, right: 6, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="marketingOverviewArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="week" stroke="rgba(255,255,255,0.45)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.45)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(14,14,16,0.95)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  borderRadius: 8,
                  fontSize: 12,
                  color: 'white',
                }}
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
              />
              <Area
                type="monotone"
                dataKey="sessions"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#marketingOverviewArea)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  </Page>
);

import React from 'react';
import { ArrowUpRight, ArrowDownRight, Search, Download, Zap, Layers } from 'lucide-react';
import {
  Page,
  PageHeader,
  Card,
  Button,
  SearchInput,
} from '@aqua/bridge/ui/kit';
import { useRevenueAnalyticsLogic } from './logic/useRevenueAnalyticsLogic';

const TIMEFRAMES = ['1W', '1M', '1Y', 'ALL'] as const;
const DEFAULT_TIMEFRAME: typeof TIMEFRAMES[number] = '1M';

export const RevenueAnalyticsView: React.FC = () => {
  const { metrics, revenueData, searchQuery, setSearchQuery } = useRevenueAnalyticsLogic();

  return (
    <Page>
      <PageHeader
        eyebrow="Revenue"
        title="Analytics"
        subtitle="Predictive fiscal intelligence and growth orchestration."
        actions={
          <>
            <SearchInput
              icon={Search}
              placeholder="Search fiscal data..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-72 hidden md:block"
            />
            <Button variant="outline" icon={Download}>Export</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {metrics.map((m, i) => {
          const TrendIcon = m.trend === 'up' ? ArrowUpRight : ArrowDownRight;
          const trendColor = m.trend === 'up' ? 'text-emerald-400' : 'text-rose-400';
          return (
            <Card key={i} padding="md">
              <div className="flex items-start justify-between mb-4">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <m.icon className="w-4 h-4 text-indigo-300" />
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card padding="md" className="lg:col-span-2">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="text-base font-semibold text-white">Growth trajectory</h2>
              <p className="text-xs text-slate-400 mt-0.5">Aggregated revenue performance across nodes.</p>
            </div>
            <div className="inline-flex items-center bg-white/[0.03] border border-white/10 rounded-lg p-0.5">
              {TIMEFRAMES.map(t => (
                <button
                  key={t}
                  className={`h-7 px-2.5 rounded-md text-xs font-medium transition-colors ${
                    t === DEFAULT_TIMEFRAME ? 'bg-white/[0.08] text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 w-full flex items-end gap-2 px-1">
            {revenueData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <div
                  className="w-full bg-indigo-500/15 hover:bg-indigo-500/30 rounded-t-md transition-colors"
                  style={{ height: `${d.value}%` }}
                />
                <span className="text-[10px] uppercase tracking-wider text-slate-500">{d.label}</span>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-3">
          <Card padding="md" className="bg-indigo-500/[0.08] border-indigo-500/25">
            <Zap className="w-6 h-6 text-indigo-300 mb-3" />
            <h3 className="text-base font-semibold text-white mb-1.5">Predictive forecast</h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              AI models suggest 14% growth in Q4 based on current partnership velocity.
            </p>
            <Button variant="primary" size="sm" className="w-full">Model Q4</Button>
          </Card>

          <Card padding="md">
            <h3 className="text-sm font-semibold text-white inline-flex items-center gap-2 mb-4">
              <Layers className="w-4 h-4 text-indigo-300" />
              Silo performance
            </h3>
            <div className="space-y-3">
              {[
                { name: 'Partner Hub', value: '78%', color: 'bg-emerald-500' },
                { name: 'Core SaaS',   value: '42%', color: 'bg-sky-500' },
                { name: 'Enterprise',  value: '91%', color: 'bg-indigo-500' },
              ].map((s, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-200 font-medium">{s.name}</span>
                    <span className="text-slate-400 tabular-nums">{s.value}</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full ${s.color}`} style={{ width: s.value }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </Page>
  );
};

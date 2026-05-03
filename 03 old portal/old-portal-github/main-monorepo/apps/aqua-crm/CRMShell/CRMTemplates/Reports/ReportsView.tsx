import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  DollarSign,
  Percent,
  TrendingUp,
} from 'lucide-react';
import { Page, PageHeader, Card } from '@aqua/bridge/ui/kit';
import { useReportsLogic } from './logic/useReportsLogic';
import type { KPI } from './logic/mockData';

const KPI_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'kpi-pipeline': DollarSign,
  'kpi-closed': TrendingUp,
  'kpi-winrate': Percent,
  'kpi-avg': BarChart3,
};

const formatThousands = (value: number): string =>
  value >= 1_000_000
    ? `$${(value / 1_000_000).toFixed(2)}M`
    : value >= 1_000
      ? `$${(value / 1_000).toFixed(0)}k`
      : `$${value}`;

const ReportKpiCard: React.FC<{ kpi: KPI }> = ({ kpi }) => {
  const Icon = KPI_ICONS[kpi.id] ?? BarChart3;
  const trendColor = kpi.positive ? 'text-emerald-400' : 'text-rose-400';
  const TrendIcon = kpi.positive ? ArrowUpRight : ArrowDownRight;
  return (
    <Card padding="md">
      <div className="flex items-start justify-between mb-4">
        <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
          <Icon className="w-4 h-4 text-indigo-300" />
        </div>
        <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${trendColor}`}>
          <TrendIcon className="w-3 h-3" />
          {kpi.delta}
        </span>
      </div>
      <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1.5">{kpi.label}</div>
      <div className="text-2xl font-semibold text-white tabular-nums">{kpi.value}</div>
    </Card>
  );
};

const tooltipStyle = {
  background: 'rgba(14,14,16,0.95)',
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: 8,
  fontSize: 12,
  color: 'white',
} as const;

const ChartCard: React.FC<{ title: string; subtitle: string; children: React.ReactNode }> = ({ title, subtitle, children }) => (
  <Card padding="md">
    <div className="mb-4">
      <h2 className="text-base font-semibold text-white">{title}</h2>
      <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
    </div>
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        {children as React.ReactElement}
      </ResponsiveContainer>
    </div>
  </Card>
);

export const ReportsView: React.FC = () => {
  const { kpis, stageBuckets, forecast } = useReportsLogic();

  return (
    <Page>
      <PageHeader
        eyebrow="CRM"
        title="Reports"
        subtitle="Snapshot of pipeline health, win rate, and forward-looking forecast."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {kpis.map(kpi => (
          <ReportKpiCard key={kpi.id} kpi={kpi} />
        ))}
      </div>

      <div className="space-y-6">
        <ChartCard title="Deals by Stage" subtitle="Total pipeline value broken down by stage">
          <BarChart data={stageBuckets} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis
              dataKey="stage"
              stroke="rgba(255,255,255,0.45)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="rgba(255,255,255,0.45)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatThousands}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              cursor={{ fill: 'rgba(255,255,255,0.04)' }}
              formatter={(value: number) => formatThousands(value)}
            />
            <Bar dataKey="value" name="Value" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartCard>

        <ChartCard title="Revenue Forecast" subtitle="Next 6 months — forecast vs. conservative estimate">
          <LineChart data={forecast} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis
              dataKey="month"
              stroke="rgba(255,255,255,0.45)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="rgba(255,255,255,0.45)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatThousands}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value: number) => formatThousands(value)}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}
              iconType="circle"
            />
            <Line
              type="monotone"
              dataKey="forecast"
              name="Forecast"
              stroke="#6366f1"
              strokeWidth={2}
              dot={{ r: 4, fill: '#6366f1' }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="conservative"
              name="Conservative"
              stroke="#38bdf8"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={{ r: 3, fill: '#38bdf8' }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ChartCard>
      </div>
    </Page>
  );
};

export default ReportsView;

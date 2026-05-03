import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Page, PageHeader, Card } from '@aqua/bridge/ui/kit';
import {
  SALES_OVERVIEW_HEADING,
  SALES_OVERVIEW_SUBHEAD,
  SALES_RECENT_ACTIVITY_HEADING,
  SALES_RECENT_ACTIVITY_SUBHEAD,
  SALES_KPI_ICONS,
  SALES_ACTIVITY_ICONS,
  SALES_KPI_ACCENT,
  type SalesKpi,
  type SalesActivityEvent,
} from './SalesHubOverview.ui';

const KPI_DATA: SalesKpi[] = [
  {
    id: 'revenue-quarter',
    label: 'Revenue This Quarter',
    value: '$1.42M',
    delta: '+18.4%',
    deltaTrend: 'up',
    icon: SALES_KPI_ICONS.revenue,
    accent: SALES_KPI_ACCENT.emerald,
    spark: [
      { day: 'W1', value: 92 },  { day: 'W2', value: 110 }, { day: 'W3', value: 128 },
      { day: 'W4', value: 142 }, { day: 'W5', value: 168 }, { day: 'W6', value: 195 },
      { day: 'W7', value: 221 }, { day: 'W8', value: 248 },
    ],
  },
  {
    id: 'pipeline-value',
    label: 'Pipeline Value',
    value: '$4.86M',
    delta: '+9.2%',
    deltaTrend: 'up',
    icon: SALES_KPI_ICONS.pipeline,
    accent: SALES_KPI_ACCENT.sky,
    spark: [
      { day: 'W1', value: 380 }, { day: 'W2', value: 412 }, { day: 'W3', value: 401 },
      { day: 'W4', value: 446 }, { day: 'W5', value: 462 }, { day: 'W6', value: 470 },
      { day: 'W7', value: 478 }, { day: 'W8', value: 486 },
    ],
  },
  {
    id: 'deals-closed',
    label: 'Deals Closed',
    value: '37',
    delta: '+6',
    deltaTrend: 'up',
    icon: SALES_KPI_ICONS.closed,
    accent: SALES_KPI_ACCENT.amber,
    spark: [
      { day: 'W1', value: 4 }, { day: 'W2', value: 5 }, { day: 'W3', value: 3 },
      { day: 'W4', value: 6 }, { day: 'W5', value: 5 }, { day: 'W6', value: 4 },
      { day: 'W7', value: 5 }, { day: 'W8', value: 5 },
    ],
  },
  {
    id: 'win-rate',
    label: 'Win Rate',
    value: '42.7%',
    delta: '-1.3%',
    deltaTrend: 'down',
    icon: SALES_KPI_ICONS.winRate,
    accent: SALES_KPI_ACCENT.violet,
    spark: [
      { day: 'W1', value: 45 }, { day: 'W2', value: 47 }, { day: 'W3', value: 44 },
      { day: 'W4', value: 46 }, { day: 'W5', value: 43 }, { day: 'W6', value: 41 },
      { day: 'W7', value: 42 }, { day: 'W8', value: 42 },
    ],
  },
];

const ACTIVITY_DATA: SalesActivityEvent[] = [
  { id: 'a1',  actor: 'Marcus Hale',     verb: 'closed deal with',           target: 'Northwind Logistics',  amount: '$84,200',  timestamp: '12 minutes ago', icon: SALES_ACTIVITY_ICONS.closed,   tone: 'positive' },
  { id: 'a2',  actor: 'Priya Banerjee',  verb: 'sent proposal to',           target: 'Helios Manufacturing', amount: '$112,500', timestamp: '38 minutes ago', icon: SALES_ACTIVITY_ICONS.proposal, tone: 'neutral'  },
  { id: 'a3',  actor: 'Jordan Iverson',  verb: 'logged a discovery call with', target: 'BrightWater Studios',                  timestamp: '1 hour ago',     icon: SALES_ACTIVITY_ICONS.call,     tone: 'neutral'  },
  { id: 'a4',  actor: 'Marcus Hale',     verb: 'booked a demo with',         target: 'Granite Peak Capital',                   timestamp: '2 hours ago',    icon: SALES_ACTIVITY_ICONS.meeting,  tone: 'neutral'  },
  { id: 'a5',  actor: 'Sasha Owens',     verb: 'replied to inbound from',    target: 'Cobalt Software Group',                  timestamp: '3 hours ago',    icon: SALES_ACTIVITY_ICONS.email,    tone: 'neutral'  },
  { id: 'a6',  actor: 'Priya Banerjee',  verb: 'flagged stalled deal',       target: 'Acme Beverages',       amount: '$48,000', timestamp: '5 hours ago',    icon: SALES_ACTIVITY_ICONS.alert,    tone: 'negative' },
  { id: 'a7',  actor: 'Jordan Iverson',  verb: 'closed deal with',           target: 'Lumen Health Partners', amount: '$64,750', timestamp: '7 hours ago',   icon: SALES_ACTIVITY_ICONS.closed,   tone: 'positive' },
  { id: 'a8',  actor: 'Sasha Owens',     verb: 'sent contract to',           target: 'Riverline Media',      amount: '$29,400', timestamp: '9 hours ago',    icon: SALES_ACTIVITY_ICONS.proposal, tone: 'neutral'  },
  { id: 'a9',  actor: 'Marcus Hale',     verb: 'completed pricing call with', target: 'Atlas Architecture',                    timestamp: 'Yesterday',      icon: SALES_ACTIVITY_ICONS.call,     tone: 'neutral'  },
  { id: 'a10', actor: 'Priya Banerjee',  verb: 'closed deal with',           target: 'Vertex Aerospace',     amount: '$156,800', timestamp: 'Yesterday',     icon: SALES_ACTIVITY_ICONS.closed,   tone: 'positive' },
];

const TONE_CLASSES: Record<SalesActivityEvent['tone'], string> = {
  positive: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20',
  neutral:  'text-sky-300 bg-sky-500/10 border-sky-500/20',
  negative: 'text-rose-300 bg-rose-500/10 border-rose-500/20',
};

export const SalesHubOverview: React.FC = () => (
  <Page>
    <PageHeader
      eyebrow="Sales"
      title={SALES_OVERVIEW_HEADING}
      subtitle={SALES_OVERVIEW_SUBHEAD}
    />

    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
      {KPI_DATA.map(kpi => {
        const Icon = kpi.icon;
        const TrendIcon = kpi.deltaTrend === 'up' ? ArrowUpRight : ArrowDownRight;
        const trendColor = kpi.deltaTrend === 'up' ? 'text-emerald-400' : 'text-rose-400';
        return (
          <Card key={kpi.id} padding="md">
            <div className="flex items-start justify-between mb-4">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Icon className="w-4 h-4 text-indigo-300" />
              </div>
              <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${trendColor}`}>
                {kpi.delta}
                <TrendIcon className="w-3 h-3" />
              </span>
            </div>
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1.5">{kpi.label}</div>
            <div className="text-2xl font-semibold text-white tabular-nums mb-3">{kpi.value}</div>
            <div className="h-10">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={kpi.spark}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={kpi.deltaTrend === 'up' ? '#10b981' : '#f43f5e'}
                    strokeWidth={1.75}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        );
      })}
    </div>

    <Card padding="md">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-white">{SALES_RECENT_ACTIVITY_HEADING}</h2>
        <p className="text-xs text-slate-400 mt-0.5">{SALES_RECENT_ACTIVITY_SUBHEAD}</p>
      </div>
      <ul className="space-y-2">
        {ACTIVITY_DATA.map(event => {
          const Icon = event.icon;
          return (
            <li
              key={event.id}
              className="flex items-start gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
            >
              <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${TONE_CLASSES[event.tone]}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-200">
                  <span className="font-semibold text-white">{event.actor}</span>{' '}
                  <span className="text-slate-400">{event.verb}</span>{' '}
                  <span className="font-medium text-white">{event.target}</span>
                  {event.amount ? (
                    <span className="ml-2 text-emerald-300 font-semibold tabular-nums">{event.amount}</span>
                  ) : null}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">{event.timestamp}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  </Page>
);

'use client';

import React, { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Page, PageHeader, Card } from '@aqua/bridge/ui/kit';

type MetricKey = 'sessions' | 'conversions' | 'cpc';

interface ChannelRow {
  name: string;
  sessions: number;
  conversions: number;
  cpc: number;
}

const CHANNELS: readonly ChannelRow[] = [
  { name: 'Organic',     sessions: 142_300, conversions: 1_804, cpc: 0    },
  { name: 'Paid Search', sessions:  86_120, conversions: 1_252, cpc: 18.4 },
  { name: 'Paid Social', sessions:  63_450, conversions:   978, cpc: 22.1 },
  { name: 'Email',       sessions:  41_700, conversions: 1_104, cpc: 3.7  },
  { name: 'Direct',      sessions:  38_980, conversions:   612, cpc: 0    },
  { name: 'Referral',    sessions:  21_540, conversions:   432, cpc: 5.6  },
];

const METRIC_LABEL: Record<MetricKey, string> = {
  sessions: 'Sessions',
  conversions: 'Conversions',
  cpc: 'Cost / conversion',
};

const METRIC_FORMAT: Record<MetricKey, (n: number) => string> = {
  sessions: n => new Intl.NumberFormat('en-US').format(n),
  conversions: n => new Intl.NumberFormat('en-US').format(n),
  cpc: n => (n === 0 ? 'Free' : `$${n.toFixed(2)}`),
};

export const ChannelPerformance: React.FC = () => {
  const [metric, setMetric] = useState<MetricKey>('sessions');

  const data = useMemo(() => CHANNELS.map(c => ({ name: c.name, value: c[metric] })), [metric]);

  return (
    <Page>
      <PageHeader
        eyebrow="Marketing"
        title="Channel performance"
        subtitle="Compare sessions, conversions, and cost across acquisition channels."
        actions={
          <div className="inline-flex items-center bg-white/[0.03] border border-white/10 rounded-lg p-0.5">
            {(Object.keys(METRIC_LABEL) as MetricKey[]).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setMetric(m)}
                className={`h-7 px-2.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                  metric === m ? 'bg-white/[0.08] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {METRIC_LABEL[m]}
              </button>
            ))}
          </div>
        }
      />

      <Card padding="md">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.45)" fontSize={11} tickLine={false} axisLine={false} />
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
                formatter={(value: number) => [METRIC_FORMAT[metric](value), METRIC_LABEL[metric]]}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {data.map((entry, idx) => (
                  <Cell key={`bar-${entry.name}`} fill="#6366f1" fillOpacity={0.55 + (idx % 3) * 0.15} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {CHANNELS.map(c => (
            <div key={c.name} className="px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="text-[11px] text-slate-500 font-medium">{c.name}</div>
              <div className="text-sm text-white tabular-nums mt-0.5">{METRIC_FORMAT[metric](c[metric])}</div>
            </div>
          ))}
        </div>
      </Card>
    </Page>
  );
};

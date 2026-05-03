'use client';

import React from 'react';
import { ArrowDownRight, ArrowUpRight, Mail, MailOpen, MousePointerClick, UserPlus, UserX } from 'lucide-react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Page, PageHeader, Card, Badge } from '@aqua/bridge/ui/kit';

interface EmailKpi {
  id: string;
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ComponentType<{ className?: string }>;
}

const KPIS: readonly EmailKpi[] = [
  { id: 'open',   label: 'Open rate',         value: '38.6%', change: '+1.4pt',  trend: 'up', icon: MailOpen },
  { id: 'click',  label: 'Click rate',        value: '6.2%',  change: '+0.3pt',  trend: 'up', icon: MousePointerClick },
  { id: 'unsub',  label: 'Unsubscribe rate',  value: '0.18%', change: '-0.05pt', trend: 'up', icon: UserX },
  { id: 'growth', label: 'List growth',       value: '+3.1%', change: '+0.4pt',  trend: 'up', icon: UserPlus },
];

const TREND = [
  { month: 'Dec', open: 34.1, click: 5.6, unsub: 0.27 },
  { month: 'Jan', open: 35.2, click: 5.4, unsub: 0.25 },
  { month: 'Feb', open: 36.0, click: 5.9, unsub: 0.22 },
  { month: 'Mar', open: 36.8, click: 5.8, unsub: 0.21 },
  { month: 'Apr', open: 37.4, click: 6.0, unsub: 0.19 },
  { month: 'May', open: 38.6, click: 6.2, unsub: 0.18 },
];

const RECENT = [
  { id: 'e1', name: 'May Launch — Retarget Sequence',    sent: '2 days ago',  open: 41.2, click: 7.8  },
  { id: 'e2', name: 'Founder Letter #18',                 sent: '5 days ago',  open: 52.4, click: 8.1  },
  { id: 'e3', name: 'Webinar Reminder — 24h',             sent: '1 week ago',  open: 48.6, click: 12.3 },
  { id: 'e4', name: 'Q2 Pricing Guide — Drip 1/3',        sent: '2 weeks ago', open: 36.7, click: 5.4  },
  { id: 'e5', name: 'Spring Onboarding Series',           sent: '3 weeks ago', open: 33.9, click: 4.6  },
];

export const EmailMetrics: React.FC = () => (
  <Page>
    <PageHeader
      eyebrow="Marketing"
      title="Email metrics"
      subtitle="Open, click, unsubscribe, and list health across all sends."
      actions={
        <Badge tone="indigo">
          <Mail className="w-3 h-3 mr-1" />
          Last 6 months
        </Badge>
      }
    />

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {KPIS.map(k => {
        const Icon = k.icon;
        const TrendIcon = k.trend === 'up' ? ArrowUpRight : ArrowDownRight;
        const trendColor = k.trend === 'up' ? 'text-emerald-400' : 'text-rose-400';
        return (
          <Card key={k.id} padding="md">
            <div className="flex items-start justify-between mb-4">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Icon className="w-4 h-4 text-indigo-300" />
              </div>
              <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${trendColor}`}>
                {k.change}
                <TrendIcon className="w-3 h-3" />
              </span>
            </div>
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1.5">{k.label}</div>
            <div className="text-2xl font-semibold text-white tabular-nums">{k.value}</div>
          </Card>
        );
      })}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-3">
      <Card padding="md">
        <div className="mb-3">
          <h3 className="text-base font-semibold text-white">6-month trend</h3>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={TREND} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.45)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.45)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(14,14,16,0.95)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  borderRadius: 8,
                  fontSize: 12,
                  color: 'white',
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }} iconType="circle" />
              <Line type="monotone" dataKey="open"  stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} name="Open %"  />
              <Line type="monotone" dataKey="click" stroke="#38bdf8" strokeWidth={2} dot={{ r: 3 }} name="Click %" />
              <Line type="monotone" dataKey="unsub" stroke="#f43f5e" strokeWidth={2} dot={{ r: 3 }} name="Unsub %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card padding="none">
        <div className="px-4 py-3 border-b border-white/5">
          <h3 className="text-sm font-semibold text-white">Recent campaigns</h3>
        </div>
        <ul className="divide-y divide-white/5">
          {RECENT.map(r => (
            <li key={r.id} className="px-4 py-3 hover:bg-white/[0.02] transition-colors">
              <div className="text-sm font-medium text-white truncate">{r.name}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Sent {r.sent}</div>
              <div className="flex items-center gap-1.5 mt-2">
                <Badge tone="indigo">Open {r.open.toFixed(1)}%</Badge>
                <Badge tone="info">Click {r.click.toFixed(1)}%</Badge>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  </Page>
);

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Zap, Users, BarChart3, Briefcase, ChevronRight,
  Globe, ArrowRight, Play, Square
} from 'lucide-react';

// ── Mock Data ─────────────────────────────────────────────────────────────────

const CLIENT_DATA = {
  projects: [
    { id: 1, name: 'Brand Refresh 2025', client: 'Meridian Co.', status: 'In Progress', progress: 68, due: 'May 12', phase: 'Design', priority: 'High' },
    { id: 2, name: 'Website Redesign', client: 'Apex Labs', status: 'Review', progress: 91, due: 'Apr 28', phase: 'QA', priority: 'Critical' },
    { id: 3, name: 'SEO Campaign Q2', client: 'Vantage Group', status: 'On Track', progress: 42, due: 'Jun 30', phase: 'Execution', priority: 'Medium' },
    { id: 4, name: 'Social Media Launch', client: 'BluSky Retail', status: 'Planning', progress: 15, due: 'Jul 15', phase: 'Strategy', priority: 'Low' },
  ],
  tasks: [
    { id: 1, title: 'Deliver homepage mockup', project: 'Website Redesign', assignee: 'Sara K.', due: 'Today', status: 'urgent' },
    { id: 2, title: 'Review brand guidelines', project: 'Brand Refresh', assignee: 'Tom R.', due: 'Tomorrow', status: 'pending' },
    { id: 3, title: 'Client feedback call', project: 'SEO Campaign', assignee: 'You', due: 'Apr 26', status: 'pending' },
    { id: 4, title: 'Export final assets', project: 'Brand Refresh', assignee: 'Sara K.', due: 'Apr 27', status: 'done' },
    { id: 5, title: 'Keyword research report', project: 'SEO Campaign', assignee: 'Mike J.', due: 'Apr 29', status: 'pending' },
  ],
  metrics: [
    { label: 'Active Projects', value: '12', delta: '+3', up: true },
    { label: 'Tasks Due Today', value: '7', delta: '-2', up: false },
    { label: 'Client Health', value: '94%', delta: '+2%', up: true },
    { label: 'Deliverables', value: '38', delta: '+11', up: true },
  ]
};

const CRM_DATA = {
  pipeline: [
    { stage: 'Prospect', count: 14, value: '$124k', color: '#6366f1' },
    { stage: 'Qualified', count: 9, value: '$310k', color: '#8b5cf6' },
    { stage: 'Proposal', count: 6, value: '$280k', color: '#a855f7' },
    { stage: 'Negotiation', count: 3, value: '$195k', color: '#ec4899' },
    { stage: 'Closed Won', count: 2, value: '$88k', color: '#10b981' },
  ],
  leads: [
    { id: 1, name: 'Jackson Harlow', company: 'Vertex Media', value: '$48k', stage: 'Proposal', score: 87, avatar: 'JH' },
    { id: 2, name: 'Priya Nair', company: 'Solaris Brands', value: '$120k', stage: 'Negotiation', score: 94, avatar: 'PN' },
    { id: 3, name: 'Carlos Ruiz', company: 'Oakfield Inc.', value: '$35k', stage: 'Qualified', score: 72, avatar: 'CR' },
    { id: 4, name: 'Emma Thornton', company: 'Lighthouse Co.', value: '$67k', stage: 'Prospect', score: 61, avatar: 'ET' },
  ],
  metrics: [
    { label: 'Pipeline Value', value: '$997k', delta: '+18%', up: true },
    { label: 'New Leads', value: '23', delta: '+7', up: true },
    { label: 'Win Rate', value: '34%', delta: '+4%', up: true },
    { label: 'Avg. Deal Size', value: '$44k', delta: '-$2k', up: false },
  ]
};

const OPS_DATA = {
  metrics: [
    { label: 'Monthly Revenue', value: '$284k', delta: '+12%', up: true },
    { label: 'Team Utilisation', value: '78%', delta: '+5%', up: true },
    { label: 'Open Invoices', value: '11', delta: '-3', up: false },
    { label: 'Runway', value: '14 mo', delta: '+2mo', up: true },
  ],
  team: [
    { name: 'Sara Kim', role: 'Lead Designer', utilisation: 92, projects: 4, status: 'active' },
    { name: 'Tom Rivera', role: 'Strategist', utilisation: 74, projects: 3, status: 'active' },
    { name: 'Mike Johnson', role: 'Dev Lead', utilisation: 85, projects: 5, status: 'active' },
    { name: 'Aisha Patel', role: 'Account Mgr', utilisation: 61, projects: 6, status: 'away' },
  ],
  invoices: [
    { id: 'INV-0041', client: 'Meridian Co.', amount: '$18,400', due: 'Apr 30', status: 'overdue' },
    { id: 'INV-0042', client: 'Apex Labs', amount: '$32,000', due: 'May 8', status: 'pending' },
    { id: 'INV-0043', client: 'Vantage Group', amount: '$9,750', due: 'May 14', status: 'pending' },
    { id: 'INV-0044', client: 'BluSky Retail', amount: '$24,500', due: 'May 22', status: 'draft' },
  ]
};

// ── Sub-components ─────────────────────────────────────────────────────────────

function MetricCard({ label, value, delta, up }: { label: string; value: string; delta: string; up: boolean }) {
  return (
    <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">{label}</p>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className={`text-[11px] font-semibold ${up ? 'text-emerald-400' : 'text-red-400'}`}>{delta} vs last month</p>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    'In Progress': 'bg-blue-500/20 text-blue-300',
    'Review': 'bg-purple-500/20 text-purple-300',
    'On Track': 'bg-emerald-500/20 text-emerald-300',
    'Planning': 'bg-amber-500/20 text-amber-300',
    'overdue': 'bg-red-500/20 text-red-300',
    'pending': 'bg-amber-500/20 text-amber-300',
    'draft': 'bg-white/10 text-white/40',
    'urgent': 'bg-red-500/20 text-red-300',
    'done': 'bg-emerald-500/20 text-emerald-300',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${map[status] || 'bg-white/10 text-white/50'}`}>
      {status}
    </span>
  );
}

// ── App Views ─────────────────────────────────────────────────────────────────

function ClientView() {
  const [tab, setTab] = useState<'projects' | 'tasks'>('projects');
  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {CLIENT_DATA.metrics.map(m => <MetricCard key={m.label} {...m} />)}
      </div>

      <div className="bg-white/3 border border-white/5 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-1 p-4 border-b border-white/5">
          {(['projects', 'tasks'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${tab === t ? 'bg-indigo-500/20 text-indigo-300' : 'text-white/30 hover:text-white/60'}`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'projects' && (
          <div className="divide-y divide-white/5">
            {CLIENT_DATA.projects.map(p => (
              <div key={p.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/3 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{p.name}</p>
                  <p className="text-[11px] text-white/40 mt-0.5">{p.client} · {p.phase}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-28">
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${p.progress}%` }} />
                    </div>
                    <p className="text-[10px] text-white/30 mt-1 text-right">{p.progress}%</p>
                  </div>
                  <StatusPill status={p.status} />
                  <span className="text-[11px] text-white/30 w-16 text-right">Due {p.due}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'tasks' && (
          <div className="divide-y divide-white/5">
            {CLIENT_DATA.tasks.map(t => (
              <div key={t.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/3 transition-colors">
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${t.status === 'done' ? 'bg-emerald-400' : t.status === 'urgent' ? 'bg-red-400' : 'bg-amber-400'}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${t.status === 'done' ? 'line-through text-white/30' : 'text-white'}`}>{t.title}</p>
                  <p className="text-[11px] text-white/30 mt-0.5">{t.project}</p>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-white/40">
                  <span>{t.assignee}</span>
                  <span>{t.due}</span>
                  <StatusPill status={t.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CRMView() {
  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {CRM_DATA.metrics.map(m => <MetricCard key={m.label} {...m} />)}
      </div>

      <div className="grid grid-cols-5 gap-3">
        {CRM_DATA.pipeline.map(stage => (
          <div key={stage.stage} className="bg-white/3 border border-white/5 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }} />
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">{stage.stage}</p>
            </div>
            <p className="text-xl font-bold text-white">{stage.count}</p>
            <p className="text-xs font-semibold mt-1" style={{ color: stage.color }}>{stage.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white/3 border border-white/5 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <p className="text-xs font-bold uppercase tracking-widest text-white/40">Hot Leads</p>
        </div>
        <div className="divide-y divide-white/5">
          {CRM_DATA.leads.map(lead => (
            <div key={lead.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/3 transition-colors">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-[10px] font-bold text-indigo-300 shrink-0">
                {lead.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{lead.name}</p>
                <p className="text-[11px] text-white/40">{lead.company}</p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="font-bold text-emerald-400">{lead.value}</span>
                <StatusPill status={lead.stage} />
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-16 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${lead.score}%` }} />
                  </div>
                  <span className="text-[11px] text-white/40">{lead.score}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function OpsView() {
  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {OPS_DATA.metrics.map(m => <MetricCard key={m.label} {...m} />)}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Team */}
        <div className="bg-white/3 border border-white/5 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <p className="text-xs font-bold uppercase tracking-widest text-white/40">Team Utilisation</p>
          </div>
          <div className="divide-y divide-white/5">
            {OPS_DATA.team.map(member => (
              <div key={member.name} className="flex items-center gap-3 px-5 py-3.5">
                <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-[9px] font-bold text-amber-300 shrink-0">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white">{member.name}</p>
                  <p className="text-[10px] text-white/30">{member.role}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${member.utilisation > 85 ? 'bg-red-400' : member.utilisation > 70 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                      style={{ width: `${member.utilisation}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-white/40 w-8 text-right">{member.utilisation}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Invoices */}
        <div className="bg-white/3 border border-white/5 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <p className="text-xs font-bold uppercase tracking-widest text-white/40">Outstanding Invoices</p>
          </div>
          <div className="divide-y divide-white/5">
            {OPS_DATA.invoices.map(inv => (
              <div key={inv.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white">{inv.client}</p>
                  <p className="text-[10px] text-white/30 font-mono">{inv.id}</p>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-bold text-white">{inv.amount}</span>
                  <StatusPill status={inv.status} />
                  <span className="text-[11px] text-white/30">Due {inv.due}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── App config ────────────────────────────────────────────────────────────────

const APPS = [
  {
    id: 'app-client',
    label: 'AQUA Client',
    description: 'Client portal, phases, fulfilment & delivery',
    icon: Users,
    color: '#6366f1',
    accent: 'from-indigo-500/20 to-indigo-500/5',
    border: 'border-indigo-500/30',
    View: ClientView,
  },
  {
    id: 'app-crm',
    label: 'AQUA CRM',
    description: 'Lead pipeline, acquisition & communications',
    icon: BarChart3,
    color: '#10b981',
    accent: 'from-emerald-500/20 to-emerald-500/5',
    border: 'border-emerald-500/30',
    View: CRMView,
  },
  {
    id: 'app-operations',
    label: 'AQUA Operations',
    description: 'Internal OS — finance, people, revenue & control',
    icon: Briefcase,
    color: '#f59e0b',
    accent: 'from-amber-500/20 to-amber-500/5',
    border: 'border-amber-500/30',
    View: OpsView,
  },
];

// ── HostDemoShell ─────────────────────────────────────────────────────────────

export const HostDemoShell: React.FC = () => {
  const [bridgeOn, setBridgeOn] = useState(false);
  const [activeApp, setActiveApp] = useState<typeof APPS[0] | null>(null);

  const handleSelectApp = (app: typeof APPS[0]) => setActiveApp(app);

  return (
    <div className="flex w-full h-screen bg-[#08090a] text-white overflow-hidden">

      {/* ── Sidebar ── */}
      <aside className="w-64 shrink-0 flex flex-col border-r border-white/5 bg-black/40 backdrop-blur-xl">

        <div className="h-14 flex items-center px-5 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
              <Globe className="w-4 h-4 text-indigo-400" />
            </div>
            <span className="text-sm font-bold tracking-wide text-white/80">AQUA Portal</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-indigo-500/20 text-indigo-400 rounded border border-indigo-500/30">
              DEMO
            </span>
          </div>
        </div>

        {/* Bridge Toggle */}
        <div className="p-3">
          <button
            onClick={() => { setBridgeOn(v => !v); if (bridgeOn) setActiveApp(null); }}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group
              ${bridgeOn ? 'bg-indigo-500/15 border border-indigo-500/30' : 'bg-white/5 border border-white/5 hover:bg-white/8 hover:border-white/10'}`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${bridgeOn ? 'bg-indigo-500/30' : 'bg-white/5 group-hover:bg-white/10'}`}>
              <Zap className={`w-4 h-4 ${bridgeOn ? 'text-indigo-400' : 'text-white/40'}`} />
            </div>
            <div className="flex-1 text-left">
              <div className={`text-xs font-bold uppercase tracking-widest ${bridgeOn ? 'text-indigo-300' : 'text-white/40'}`}>Bridge</div>
              <div className="text-[10px] text-white/25 mt-0.5">{bridgeOn ? 'Apps connected' : 'Off by default'}</div>
            </div>
            <div className={`w-9 h-5 rounded-full relative transition-all duration-300 border ${bridgeOn ? 'bg-indigo-500 border-indigo-400' : 'bg-white/10 border-white/10'}`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${bridgeOn ? 'left-4' : 'left-0.5'}`} />
            </div>
          </button>
        </div>

        {/* App list */}
        <AnimatePresence>
          {bridgeOn && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden px-3 flex flex-col gap-1"
            >
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/20 px-1 pt-2 pb-1">Connected Apps</div>
              {APPS.map(app => {
                const Icon = app.icon;
                const isActive = activeApp?.id === app.id;
                return (
                  <button
                    key={app.id}
                    onClick={() => handleSelectApp(app)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left
                      ${isActive ? 'bg-white/10 border border-white/10' : 'hover:bg-white/5 border border-transparent'}`}
                  >
                    <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                         style={{ backgroundColor: `${app.color}20`, border: `1px solid ${app.color}40` }}>
                      <Icon className="w-3.5 h-3.5" style={{ color: app.color }} />
                    </div>
                    <span className={`text-xs font-medium flex-1 ${isActive ? 'text-white' : 'text-white/50'}`}>{app.label}</span>
                    {isActive && <ChevronRight className="w-3 h-3 text-white/30" />}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1" />
        <div className="p-4 border-t border-white/5">
          <p className="text-[10px] text-white/20 leading-relaxed">Demo mode — all data is synthetic. Toggle Bridge to explore connected apps.</p>
        </div>
      </aside>

      {/* ── Main area ── */}
      <main className="flex-1 overflow-hidden flex flex-col">
        <AnimatePresence mode="wait">

          {/* Landing */}
          {!activeApp && (
            <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center p-12">
              <div className="max-w-lg text-center">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-6">
                  <Globe className="w-8 h-8 text-indigo-400" />
                </div>
                <h1 className="text-2xl font-bold text-white/80 mb-3">AQUA Portal</h1>
                <p className="text-sm text-white/40 leading-relaxed mb-8">
                  Three interconnected apps — one bridge. Toggle the Bridge in the sidebar to explore
                  Client, CRM, and Operations with live demo data.
                </p>
                {!bridgeOn && (
                  <button onClick={() => setBridgeOn(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-sm font-semibold rounded-xl hover:bg-indigo-500/30 transition-all">
                    <Play className="w-4 h-4" />
                    Enable Bridge to explore
                  </button>
                )}
                {bridgeOn && (
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    {APPS.map(app => {
                      const Icon = app.icon;
                      return (
                        <button key={app.id} onClick={() => handleSelectApp(app)}
                          className={`flex flex-col items-start p-4 rounded-xl border bg-gradient-to-b ${app.accent} ${app.border} hover:scale-[1.02] transition-all text-left group`}>
                          <Icon className="w-5 h-5 mb-3" style={{ color: app.color }} />
                          <div className="text-xs font-bold text-white/80 mb-1">{app.label}</div>
                          <div className="text-[10px] text-white/40 leading-relaxed">{app.description}</div>
                          <div className="flex items-center gap-1 mt-3 text-[10px] font-bold uppercase tracking-widest" style={{ color: app.color }}>
                            Explore <ArrowRight className="w-3 h-3" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* App view */}
          {activeApp && (
            <motion.div key={activeApp.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col overflow-hidden">

              {/* Topbar */}
              <div className="h-12 shrink-0 flex items-center gap-3 px-5 border-b border-white/5 bg-black/20">
                <div className="w-5 h-5 rounded flex items-center justify-center" style={{ backgroundColor: `${activeApp.color}20` }}>
                  <activeApp.icon className="w-3 h-3" style={{ color: activeApp.color }} />
                </div>
                <span className="text-xs font-bold text-white/60 uppercase tracking-widest">{activeApp.label}</span>
                <span className="text-[10px] text-white/20">— demo data</span>
                <div className="flex-1" />
                <button onClick={() => setActiveApp(null)}
                  className="flex items-center gap-1.5 text-[10px] text-white/30 hover:text-white/60 transition-colors">
                  <Square className="w-3 h-3" /> Close
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                <activeApp.View />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

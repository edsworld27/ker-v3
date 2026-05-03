/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Users, Ticket, Activity, Settings } from 'lucide-react';

export const agencyHubViewUI = {
  page: {
    motionKey: 'agency-hub',
    animation: {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
    },
    layout: 'p-4 md:p-6 lg:p-10 max-w-6xl mx-auto w-full',
  },
  header: {
    layout: 'flex items-center justify-between mb-8 md:mb-10',
    title: 'Agency Operations Hub',
    titleStyle: 'text-2xl md:text-3xl font-semibold',
    subtitle: 'Manage internal team performance, support tickets, and AI interactions.',
    subtitleStyle: 'text-sm md:text-base text-slate-500',
    configuratorBtn: {
      layout: 'px-4 py-2 bg-[var(--color-primary)] hover:brightness-110 text-white rounded-xl transition-all flex items-center gap-2 text-sm font-semibold shadow-lg shadow-[var(--color-primary)]/20',
      icon: Settings,
      iconSize: 'w-4 h-4',
      label: 'Open Configurator',
      targetView: 'agency-configurator',
    },
  },
  widgets: {
    grid: 'grid grid-cols-1 md:grid-cols-3 gap-6 mb-10',
    items: [
      { id: 'w1', icon: Users, label: 'Active Team', valueKey: 'users.length', color: 'primary', value: undefined as string | undefined, trend: undefined as string | undefined },
      { id: 'w2', icon: Ticket, label: 'Open Tickets', valueKey: 'openTickets.length', color: 'emerald', value: undefined as string | undefined, trend: undefined as string | undefined },
      { id: 'w3', icon: Activity, label: 'AI Sessions', valueKey: 'aiSessions.length', color: 'amber', value: undefined as string | undefined, trend: undefined as string | undefined },
    ],
  },
  mainGrid: 'grid grid-cols-1 lg:grid-cols-2 gap-8',
  teamModule: {
    container: 'glass-card p-6 rounded-3xl border border-white/5',
    header: {
      layout: 'flex items-center justify-between mb-6',
      title: 'Team Availability',
      titleStyle: 'text-lg font-medium',
      viewAllLabel: 'Manage Team',
      viewAllBtn: 'text-xs text-[var(--color-primary)] hover:text-[var(--color-primary)] font-bold uppercase tracking-widest transition-colors',
    },
    list: 'space-y-4',
    item: {
      layout: 'flex items-center justify-between p-4 bg-white/5 rounded-2xl',
      userGroup: 'flex items-center gap-4',
      avatar: 'w-10 h-10 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center text-[var(--color-primary)] font-bold',
      name: 'text-sm font-medium',
      status: 'px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded-full uppercase tracking-widest',
      statusLabel: 'Available',
    },
  },
  aiModule: {
    container: 'glass-card p-6 rounded-3xl border border-white/5',
    header: {
      layout: 'flex items-center justify-between mb-6',
      title: 'Recent AI Sessions',
      titleStyle: 'text-lg font-medium',
      auditorLabel: 'AI Auditor',
      auditorBtn: 'text-xs text-amber-400 hover:text-amber-300 font-bold uppercase tracking-widest transition-colors',
      auditorTargetView: 'ai-auditor',
    },
    list: 'space-y-4',
    item: {
      layout: 'p-4 bg-white/5 rounded-2xl space-y-2',
      header: 'flex justify-between text-[10px] text-slate-500 uppercase tracking-widest font-bold',
      userName: 'text-[var(--color-primary)]',
      time: '2 mins ago',
      prompt: 'text-sm text-slate-300 italic line-clamp-2',
    },
  },
};

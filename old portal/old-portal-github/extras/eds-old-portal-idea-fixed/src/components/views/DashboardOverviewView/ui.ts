/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Users, Globe, Zap } from 'lucide-react';

export const dashboardOverviewViewUI = {
  page: {
    motionKey: 'dashboard-overview',
    animation: {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -10 },
    },
    layout: 'p-4 md:p-6 lg:p-10 max-w-6xl mx-auto w-full',
  },
  header: {
    layout: 'flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-10',
    title: {
      base: 'text-2xl md:text-3xl font-semibold mb-2',
      text: 'Dashboard Overview',
    },
    subtitle: {
      base: 'text-sm md:text-base text-slate-500',
    },
    actions: {
      layout: 'flex items-center gap-3',
      manageTeamBtn: {
        layout: 'flex-1 md:flex-none px-4 md:px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-xs md:text-sm shadow-lg',
        icon: Users,
        label: 'Manage Team',
      },
      liveTraffic: {
        layout: 'px-4 py-2.5 glass-card rounded-xl flex items-center gap-2 border border-white/5',
        dot: 'w-2 h-2 rounded-full bg-emerald-500 animate-pulse',
        label: 'Live Traffic',
        labelStyle: 'text-[10px] md:text-xs font-medium',
      },
    },
  },
  stats: {
    grid: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10',
    card: {
      base: 'glass-card p-5 md:p-6 rounded-2xl md:rounded-3xl border border-white/5 hover:border-white/10 transition-all group',
      header: 'flex items-center justify-between mb-4',
      iconWrapper: 'p-2 rounded-lg group-hover:scale-110 transition-transform',
      trend: 'text-xs font-medium',
      value: 'text-xl md:text-2xl font-bold mb-1',
      label: 'text-[10px] md:text-xs text-slate-500 uppercase tracking-widest font-bold',
    },
    items: [
      { id: 'users', icon: Users, label: 'Total Users', value: '2,845', trend: '+12%', color: 'primary' },
      { id: 'views', icon: Globe, label: 'Page Views', value: '45.2k', trend: '+5.2%', color: 'cyan' },
      { id: 'load', icon: Zap, label: 'Avg. Load Time', value: '1.2s', trend: '-2%', color: 'purple' },
    ],
  },
  charts: {
    container: 'glass-card p-5 md:p-8 rounded-2xl md:rounded-[2.5rem] mb-8 md:mb-10 border border-white/5',
    header: {
      layout: 'flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8',
      title: 'text-lg font-medium',
      select: 'bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs outline-none self-start sm:self-auto focus:border-[var(--color-primary)] transition-colors',
    },
    wrapper: 'h-[200px] sm:h-[250px] md:h-[300px] w-full',
  },
};

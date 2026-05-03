// Aggregated UI configs for widgets that import './ui'.
// Re-exports the canonical clientManagementViewUI from views,
// and provides minimal stubs for project widgets whose ui configs
// were not present in the original repo. Stubs use Tailwind classes
// so widgets render in a usable (if unstyled-final) state.

import { Briefcase, Calendar, CheckCircle2, Users } from 'lucide-react';

export { clientManagementViewUI } from '../views/ClientManagementView/ui';

export const projectListWidgetUI = {
  grid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
  card: {
    base: 'glass-card p-6 rounded-3xl border border-white/5 hover:bg-white/5 transition-all',
    title: 'text-lg font-medium mb-2',
    description: 'text-sm text-slate-400 leading-relaxed mb-4',
    header: {
      layout: 'flex items-start justify-between gap-3 mb-3',
      iconWrapper: 'w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center',
      icon: Briefcase,
      iconSize: 'w-5 h-5 text-[var(--color-primary)]',
      statusBadge: {
        base: 'px-2 py-1 text-[10px] uppercase tracking-widest font-bold rounded-full',
        active: 'bg-emerald-500/15 text-emerald-300',
        planning: 'bg-amber-500/15 text-amber-300',
      },
    },
    details: {
      container: 'mt-4 space-y-3',
      clientRow: {
        layout: 'flex items-center justify-between text-xs',
        label: 'Client',
        labelStyle: 'text-slate-500',
        valueStyle: 'text-slate-200 font-medium',
      },
      progress: {
        container: 'mt-2',
        header: 'flex items-center justify-between text-[11px] mb-1',
        label: 'Progress',
        track: 'w-full h-1.5 rounded-full bg-white/5 overflow-hidden',
        fillBase: 'h-full bg-[var(--color-primary)] rounded-full transition-all',
      },
    },
  },
};

export const projectsStatsWidgetUI = {
  container: 'w-full',
  grid: 'grid grid-cols-2 md:grid-cols-4 gap-4',
  card: 'glass-card p-5 rounded-2xl border border-white/5 flex items-center gap-4',
  cardIconWrapper: 'w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center',
  cardIcon: 'w-6 h-6 text-[var(--color-primary)]',
  cardContent: 'flex flex-col',
  statValue: 'text-2xl font-semibold tracking-tight',
  statLabel: 'text-xs text-slate-500',
  icons: {
    briefcase: Briefcase,
    calendar: Calendar,
    checkCircle: CheckCircle2,
    users: Users,
  },
};

import { Plus, FolderOpen } from 'lucide-react';

export const projectHubViewUI = {
  page: {
    motionKey: 'project-hub',
    animation: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
    },
    layout: 'w-full',
    padding: 'p-4 md:p-8',
  },
  header: {
    layout: 'flex items-center justify-between mb-8',
    titleStyle: 'text-2xl font-bold tracking-tight',
    title: 'Project Hub',
    subtitleStyle: 'text-slate-400 text-sm mt-1',
    subtitle: 'Manage and track all active client projects.',
    newProjectBtn: {
      layout: 'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all shadow-lg hover:opacity-90',
      icon: Plus,
      iconSize: 'w-4 h-4',
      label: 'New Project',
    },
  },
  grid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
  card: {
    base: 'glass-card rounded-2xl border border-white/5 p-6 cursor-pointer hover:border-white/20 hover:bg-white/5 transition-all group',
    header: {
      layout: 'flex items-center justify-between mb-4',
      iconWrapper: 'w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center',
      icon: FolderOpen,
      iconSize: 'w-5 h-5',
      statusBadge: {
        base: 'text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full',
        active: 'bg-emerald-500/20 text-emerald-300',
        planning: 'bg-amber-500/20 text-amber-300',
      },
    },
    title: 'text-base font-semibold text-slate-100 mb-1 group-hover:text-white transition-colors',
    description: 'text-sm text-slate-400 mb-4 line-clamp-2',
    details: {
      container: 'space-y-3',
      clientRow: {
        layout: 'flex items-center justify-between text-sm',
        labelStyle: 'text-slate-500',
        label: 'Client',
        valueStyle: 'text-slate-300 font-medium',
      },
      progress: {
        container: '',
        header: 'flex items-center justify-between text-xs text-slate-500 mb-1.5',
        label: 'Progress',
        track: 'h-1.5 w-full bg-white/5 rounded-full overflow-hidden',
        fillBase: 'h-full rounded-full bg-[var(--color-primary)]',
      },
    },
  },
};

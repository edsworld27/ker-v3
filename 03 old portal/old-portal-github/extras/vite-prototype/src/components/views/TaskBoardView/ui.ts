import { Plus, ArrowLeft, CheckSquare, Paperclip, Calendar } from 'lucide-react';

export const taskBoardViewUI = {
  page: {
    motionKey: 'task-board',
    animation: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
    },
    layout: 'w-full',
    padding: 'p-4 md:p-8',
  },
  header: {
    layout: 'flex items-center justify-between mb-8',
    leftGroup: {
      titleContainer: 'flex items-center gap-3',
      backBtn: 'p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all',
      backIcon: ArrowLeft,
      backIconSize: 'w-4 h-4',
      titleStyle: 'text-2xl font-bold tracking-tight',
      title: 'Task Board',
      subtitleStyle: 'text-slate-400 text-sm mt-1',
      subtitle: 'Drag and manage tasks across stages.',
    },
    createTaskBtn: {
      layout: 'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all shadow-lg hover:opacity-90',
      icon: Plus,
      iconSize: 'w-4 h-4',
      label: 'New Task',
    },
  },
  board: {
    layout: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4',
    column: {
      layout: 'flex flex-col gap-3',
      header: {
        layout: 'flex items-center justify-between px-1 mb-2',
        titleGroup: 'flex items-center gap-2',
        indicator: 'w-2.5 h-2.5 rounded-full',
        colors: {
          Backlog: 'bg-slate-500',
          'In Progress': 'bg-blue-500',
          Review: 'bg-amber-500',
          Done: 'bg-emerald-500',
        },
        title: 'text-sm font-semibold text-slate-300',
        countBadge: 'text-xs font-bold text-slate-500 bg-white/5 px-2 py-0.5 rounded-full',
      },
      list: 'flex flex-col gap-2 min-h-[120px]',
    },
  },
  taskCard: {
    base: 'glass-card rounded-xl border border-white/5 p-4 cursor-pointer hover:border-white/20 hover:bg-white/5 transition-all',
    header: {
      layout: 'flex items-center justify-between mb-3',
      priorityBadge: {
        base: 'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full',
        High: 'bg-red-500/20 text-red-300',
        Medium: 'bg-amber-500/20 text-amber-300',
        Low: 'bg-slate-500/20 text-slate-400',
        Critical: 'bg-rose-500/20 text-rose-300',
      },
      assigneeGroup: 'flex items-center gap-1',
      assigneeAvatar: 'w-6 h-6 rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary)] text-xs flex items-center justify-center font-medium',
    },
    title: 'text-sm font-medium text-slate-200 mb-3',
    footer: {
      layout: 'flex items-center gap-3 text-xs text-slate-500',
      itemGroup: 'flex items-center gap-1',
      stepsIcon: CheckSquare,
      attachmentsIcon: Paperclip,
      dateGroup: 'flex items-center gap-1 ml-auto',
      dateIcon: Calendar,
      iconSize: 'w-3 h-3',
    },
  },
};

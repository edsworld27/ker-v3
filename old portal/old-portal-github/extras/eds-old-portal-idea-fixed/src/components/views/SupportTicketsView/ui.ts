import { Plus } from 'lucide-react';

export const supportTicketsViewUI = {
  page: {
    motionKey: 'support-tickets',
    animation: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
    },
    layout: 'p-4 md:p-8 max-w-7xl mx-auto w-full',
  },
  header: {
    layout: 'flex items-center justify-between mb-8',
    titleStyle: 'text-2xl font-bold tracking-tight',
    title: 'Support Tickets',
    subtitleStyle: 'text-slate-400 text-sm mt-1',
    subtitle: 'Manage all client and internal support requests.',
    newTicketBtn: {
      layout: 'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all shadow-lg hover:opacity-90',
      icon: Plus,
      iconSize: 'w-4 h-4',
      label: 'New Ticket',
    },
  },
  table: {
    container: 'glass-card rounded-2xl border border-white/5 overflow-hidden',
    wrapper: 'overflow-x-auto',
    layout: 'w-full text-sm',
    header: {
      row: 'border-b border-white/10',
      cells: {
        id: 'px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-widest w-24',
        details: 'px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-widest',
        type: 'px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-widest w-24',
        status: 'px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-widest w-24',
        creator: 'px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-widest w-40',
      },
      labels: {
        id: 'ID',
        details: 'Details',
        type: 'Type',
        status: 'Status',
        creator: 'Created By',
      },
    },
    body: {
      layout: 'divide-y divide-white/5',
      row: 'hover:bg-white/5 transition-colors',
      cells: {
        id: 'px-6 py-4 text-xs font-mono text-slate-500',
        details: 'px-6 py-4',
        type: 'px-6 py-4',
        status: 'px-6 py-4',
        creator: 'px-6 py-4',
      },
      details: {
        title: 'text-sm font-medium text-slate-200 mb-1',
        priorityBase: 'text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full inline-block',
        priorityColors: {
          High: 'bg-red-500/20 text-red-300',
          Medium: 'bg-amber-500/20 text-amber-300',
          Low: 'bg-slate-500/20 text-slate-400',
        },
        prioritySuffix: ' Priority',
      },
      type: {
        base: 'px-2.5 py-1 rounded-full text-xs font-medium',
        client: 'bg-purple-500/20 text-purple-300',
        internal: 'bg-slate-500/20 text-slate-400',
      },
      status: {
        base: 'px-2.5 py-1 rounded-full text-xs font-medium',
        open: 'bg-emerald-500/20 text-emerald-300',
        closed: 'bg-slate-500/20 text-slate-400',
      },
      creator: {
        name: 'text-sm text-slate-300',
        date: 'text-xs text-slate-500 mt-0.5',
      },
    },
  },
};

import { X, Plus } from 'lucide-react';

export const supportTicketsModalUI = {
  motion: {
    backdrop: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
    modal: { initial: { opacity: 0, scale: 0.95, y: 20 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.95, y: 20 } },
  },
  overlay: 'fixed inset-0 z-50 flex items-center justify-center p-4',
  backdrop: 'absolute inset-0 bg-black/60 backdrop-blur-sm',
  modal: 'relative w-full max-w-5xl bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden',
  header: {
    base: 'flex items-center justify-between px-8 py-6 border-b border-white/10',
    title: 'text-xl font-semibold',
    closeButton: 'p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors',
    closeIcon: X,
    closeIconSize: 'w-5 h-5',
  },
  body: 'p-8 md:p-10 overflow-y-auto max-h-[80vh] custom-scrollbar',
  toolbar: 'flex justify-end mb-8',
  newTicketButton: {
    base: 'px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all flex items-center gap-2',
    icon: Plus,
    iconSize: 'w-4 h-4',
  },
  table: {
    wrapper: 'glass-card rounded-3xl overflow-hidden border border-white/5',
    scrollWrapper: 'overflow-x-auto custom-scrollbar',
    base: 'w-full text-left',
    thead: 'text-slate-500 text-xs uppercase tracking-widest border-b border-white/5 bg-white/[0.02]',
    th: 'px-8 py-4 font-semibold',
    thRight: 'px-8 py-4 font-semibold text-right',
    tbody: 'divide-y divide-white/5',
    tr: 'hover:bg-white/5 transition-colors group',
    tdId: 'px-8 py-4 font-medium text-indigo-400 text-sm',
    tdDetails: 'px-8 py-4',
    tdTitle: 'font-medium group-hover:text-indigo-300 transition-colors',
    tdType: 'px-8 py-4',
    tdStatus: 'px-8 py-4',
    tdCreator: 'px-8 py-4 text-right text-slate-400 text-sm',
    priority: {
      base: 'text-[10px] font-bold uppercase tracking-widest mt-1',
      high: 'text-red-400',
      medium: 'text-amber-400',
      low: 'text-indigo-400',
    },
    typeBadge: {
      base: 'px-3 py-1 text-[9px] font-bold rounded-full uppercase tracking-widest border',
      client: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      internal: 'bg-slate-500/10 text-slate-400 border-white/5',
    },
    statusBadge: {
      base: 'px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-widest',
      open: 'bg-emerald-500/10 text-emerald-400',
      closed: 'bg-slate-500/10 text-slate-400',
    },
  },
  text: {
    title: 'Support Tickets',
    newTicket: 'New Ticket',
    tableHeaders: ['ID', 'Ticket Details', 'Type', 'Status', 'Created By'],
    prioritySuffix: 'Priority',
  },
};

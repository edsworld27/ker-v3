export const logsViewUI = {
  page: {
    motionKey: 'logs',
    animation: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
    },
    layout: 'p-4 md:p-8 max-w-7xl mx-auto w-full',
  },
  header: {
    layout: 'flex items-center justify-between mb-8',
    titleStyle: 'text-2xl font-bold tracking-tight',
    title: 'Activity Logs',
    subtitleStyle: 'text-slate-400 text-sm mt-1',
    subtitle: 'A full audit trail of all actions taken in the portal.',
    actions: {
      layout: 'flex items-center gap-3',
      select: 'bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none',
      options: [
        { value: 'all', label: 'All Types' },
        { value: 'auth', label: 'Auth' },
        { value: 'action', label: 'Actions' },
        { value: 'system', label: 'System' },
      ],
      exportButton: 'flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-slate-300 hover:bg-white/10 transition-all',
      exportLabel: 'Export CSV',
    },
  },
  tableContainer: 'glass-card rounded-2xl border border-white/5 overflow-hidden',
  table: {
    wrapper: 'overflow-x-auto',
    table: 'w-full text-sm',
    header: {
      row: 'border-b border-white/10',
      columns: ['Timestamp', 'User', 'Action', 'Details', 'Type'],
      cell: 'px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-widest',
    },
    body: {
      row: 'hover:bg-white/5 transition-colors',
      cell: 'px-6 py-4 text-slate-300',
      timestampStyle: 'text-slate-500 text-xs font-mono',
      userContainer: 'flex items-center gap-3',
      userAvatar: 'w-7 h-7 rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary)] text-xs flex items-center justify-center font-bold',
      userName: 'font-medium text-slate-200',
      actionStyle: 'font-medium',
      detailsStyle: 'text-slate-400 text-xs max-w-xs truncate',
      typeBadge: {
        base: 'px-2 py-0.5 rounded-full text-xs font-medium',
        auth: 'bg-blue-500/20 text-blue-300',
        impersonation: 'bg-amber-500/20 text-amber-300',
        action: 'bg-emerald-500/20 text-emerald-300',
        system: 'bg-slate-500/20 text-slate-300',
      },
    },
  },
};


/**
 * ChannelPerformance.ui — UI variable declarations for the channel breakdown.
 */
export const channelPerformanceUI = {
  page: {
    container: 'p-8 min-h-full bg-[var(--revenue-bg-color)]',
    header: 'flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6',
    title: 'text-4xl font-black text-[var(--revenue-widget-text)] tracking-tight italic uppercase',
    subtitle: 'text-[var(--revenue-widget-text-muted)] text-sm font-medium mt-2',
  },
  toolbar: {
    wrap: 'flex flex-wrap items-center gap-2 mb-4 p-1 bg-[var(--revenue-widget-surface-color-1-glass)] rounded-xl border border-[var(--revenue-widget-border)] inline-flex',
    button: 'px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all',
    buttonActive: 'bg-[var(--revenue-widget-primary-color-1)] text-white shadow',
    buttonInactive: 'text-[var(--revenue-widget-text-muted)] hover:text-[var(--revenue-widget-text)]',
  },
  chartCard: 'p-6',
  legendBar: 'mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs',
  legendItem: 'flex items-center justify-between p-2 rounded-lg bg-[var(--revenue-widget-surface-color-1-glass)] border border-[var(--revenue-widget-border)]',
  legendName: 'font-semibold text-[var(--revenue-widget-text)]',
  legendValue: 'text-[var(--revenue-widget-text-muted)] tabular-nums',
} as const;

export const CHANNEL_COLOR = '#4f46e5';

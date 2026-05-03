/**
 * LeadFunnel.ui — UI variable declarations for the marketing → sales funnel.
 */
export const leadFunnelUI = {
  page: {
    container: 'p-8 min-h-full bg-[var(--revenue-bg-color)]',
    header: 'flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6',
    title: 'text-4xl font-black text-[var(--revenue-widget-text)] tracking-tight italic uppercase',
    subtitle: 'text-[var(--revenue-widget-text-muted)] text-sm font-medium mt-2',
  },
  layout: 'grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2',
  funnel: {
    wrap: 'lg:col-span-2 p-6',
    title: 'text-base font-bold text-[var(--revenue-widget-text)] mb-3',
    row: 'flex flex-col gap-1.5',
    bar: 'h-12 rounded-xl flex items-center justify-between px-5 text-white shadow-lg transition-all',
    label: 'text-sm font-bold uppercase tracking-widest',
    count: 'text-base font-black tabular-nums',
    arrow: 'flex items-center gap-2 text-xs text-[var(--revenue-widget-text-muted)] pl-2 py-1',
  },
  rates: {
    wrap: 'lg:col-span-1 p-6 flex flex-col gap-3',
    heading: 'text-base font-bold text-[var(--revenue-widget-text)] mb-2',
    row: 'flex items-center justify-between p-3 rounded-xl border border-[var(--revenue-widget-border)]',
    rowLabel: 'text-xs uppercase tracking-widest text-[var(--revenue-widget-text-muted)] font-bold',
    rowValue: 'text-base font-black text-[var(--revenue-widget-text)]',
  },
} as const;

export const STAGE_COLORS = ['#4f46e5', '#6366f1', '#8b5cf6', '#a855f7', '#10b981', '#059669'] as const;

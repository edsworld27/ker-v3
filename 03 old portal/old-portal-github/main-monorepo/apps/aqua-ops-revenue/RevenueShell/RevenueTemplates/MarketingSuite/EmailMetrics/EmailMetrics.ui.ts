/**
 * EmailMetrics.ui — UI variable declarations for the email performance dashboard.
 */
export const emailMetricsUI = {
  page: {
    container: 'p-8 min-h-full bg-[var(--revenue-bg-color)]',
    header: 'flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6',
    title: 'text-4xl font-black text-[var(--revenue-widget-text)] tracking-tight italic uppercase',
    subtitle: 'text-[var(--revenue-widget-text-muted)] text-sm font-medium mt-2',
  },
  kpiGrid: 'grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6',
  kpi: {
    iconWrap: 'p-2.5 rounded-xl bg-[var(--revenue-widget-primary-color-1-glow)] inline-flex',
    label: 'text-[10px] uppercase tracking-[0.25em] font-bold text-[var(--revenue-widget-text-muted)] mt-5',
    value: 'text-3xl font-black text-[var(--revenue-widget-text)] tracking-tight mt-1',
    delta: {
      up: 'inline-flex items-center gap-1 text-xs font-bold text-[var(--revenue-widget-success)]',
      down: 'inline-flex items-center gap-1 text-xs font-bold text-[var(--revenue-widget-error)]',
    },
  },
  layout: 'grid grid-cols-1 lg:grid-cols-3 gap-6',
  trend: {
    wrap: 'lg:col-span-2 p-6',
    title: 'text-base font-bold text-[var(--revenue-widget-text)] mb-4',
  },
  recent: {
    wrap: 'lg:col-span-1 p-6',
    title: 'text-base font-bold text-[var(--revenue-widget-text)] mb-3',
    item: 'flex flex-col gap-1 py-3 border-b border-[var(--revenue-widget-border)] last:border-0',
    name: 'text-sm font-semibold text-[var(--revenue-widget-text)]',
    meta: 'text-[10px] uppercase tracking-widest text-[var(--revenue-widget-text-muted)] font-bold',
    rates: 'flex items-center gap-3 mt-1.5 text-xs text-[var(--revenue-widget-text-muted)]',
    rateBadge: 'inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--revenue-widget-surface-color-1-glass)] border border-[var(--revenue-widget-border)] font-mono',
  },
} as const;

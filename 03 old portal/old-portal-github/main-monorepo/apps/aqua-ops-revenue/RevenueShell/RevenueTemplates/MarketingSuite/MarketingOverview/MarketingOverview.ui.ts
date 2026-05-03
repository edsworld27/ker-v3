/**
 * MarketingOverview.ui — UI variable declarations.
 * Centralizes layout/colors/labels for MarketingOverview.
 */
export const marketingOverviewUI = {
  page: {
    container: 'p-8 min-h-full bg-[var(--revenue-bg-color)]',
    header: 'flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8',
    title: 'text-4xl font-black text-[var(--revenue-widget-text)] tracking-tight italic uppercase',
    subtitle: 'text-[var(--revenue-widget-text-muted)] text-sm font-medium mt-2',
  },
  kpiGrid: {
    layout: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8',
    iconWrap: 'p-3 rounded-2xl bg-[var(--revenue-widget-primary-color-1-glow)] inline-flex',
    label: 'text-[10px] uppercase tracking-[0.25em] font-bold text-[var(--revenue-widget-text-muted)] mt-6',
    value: 'text-3xl font-black text-[var(--revenue-widget-text)] tracking-tight mt-1',
    delta: {
      up: 'inline-flex items-center gap-1 text-xs font-bold text-[var(--revenue-widget-success)]',
      down: 'inline-flex items-center gap-1 text-xs font-bold text-[var(--revenue-widget-error)]',
    },
  },
  callout: {
    grid: 'grid grid-cols-1 lg:grid-cols-3 gap-5',
    channelCard: 'lg:col-span-1 p-7 bg-gradient-to-br from-[var(--revenue-widget-primary-color-1)] to-[var(--revenue-secondary-color)] text-white rounded-[var(--radius-card)]',
    channelLabel: 'text-[11px] font-bold uppercase tracking-[0.2em] text-white/70',
    channelName: 'text-3xl font-black mt-2 italic',
    channelStat: 'text-sm text-white/80 mt-3',
    sparklineCard: 'lg:col-span-2 p-7',
    sparklineHeader: 'flex items-center justify-between mb-4',
    sparklineTitle: 'text-base font-bold text-[var(--revenue-widget-text)]',
    sparklineHelp: 'text-xs text-[var(--revenue-widget-text-muted)]',
  },
  chartColors: {
    line: 'var(--revenue-widget-primary-color-1)',
    fill: 'var(--revenue-widget-primary-color-1-glow)',
  },
} as const;

/**
 * ContentCalendar.ui — UI variable declarations for the marketing content calendar.
 */
export const contentCalendarUI = {
  page: {
    container: 'p-8 min-h-full bg-[var(--revenue-bg-color)]',
    header: 'flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6',
    title: 'text-4xl font-black text-[var(--revenue-widget-text)] tracking-tight italic uppercase',
    subtitle: 'text-[var(--revenue-widget-text-muted)] text-sm font-medium mt-2',
  },
  calendar: {
    grid: 'grid grid-cols-7 gap-2',
    weekday: 'text-[10px] uppercase tracking-[0.2em] font-bold text-[var(--revenue-widget-text-muted)] text-center pb-2',
    cell: 'aspect-square p-2 rounded-xl bg-[var(--revenue-widget-surface-color-1-glass)] border border-[var(--revenue-widget-border)] flex flex-col gap-1.5 cursor-pointer transition-all hover:border-[var(--revenue-widget-primary-color-1)]',
    cellToday: 'ring-1 ring-[var(--revenue-widget-primary-color-1)]',
    cellMuted: 'opacity-40',
    cellSelected: 'border-[var(--revenue-widget-primary-color-1)] bg-[var(--revenue-widget-primary-color-1-glow)]',
    dayNum: 'text-xs font-bold text-[var(--revenue-widget-text)]',
    dot: 'w-2 h-2 rounded-full',
  },
  legend: {
    wrap: 'flex flex-wrap gap-3 mb-4',
    item: 'inline-flex items-center gap-2 text-xs font-medium text-[var(--revenue-widget-text-muted)]',
    dot: 'w-2.5 h-2.5 rounded-full',
  },
  detail: {
    panel: 'mt-6 p-6 rounded-[var(--radius-card)] border border-[var(--revenue-widget-border)] bg-[var(--revenue-widget-surface-color-1-glass)]',
    heading: 'text-lg font-bold text-[var(--revenue-widget-text)] mb-3',
    empty: 'text-sm text-[var(--revenue-widget-text-muted)] italic',
    item: 'flex items-center gap-3 py-2 border-b border-[var(--revenue-widget-border)] last:border-0',
    itemLabel: 'text-sm text-[var(--revenue-widget-text)] font-medium',
    itemMeta: 'text-xs text-[var(--revenue-widget-text-muted)] ml-auto',
  },
} as const;

export const CONTENT_TYPE_COLORS: Record<string, string> = {
  Blog: '#4f46e5',
  Social: '#10b981',
  Email: '#f59e0b',
  Video: '#ef4444',
};

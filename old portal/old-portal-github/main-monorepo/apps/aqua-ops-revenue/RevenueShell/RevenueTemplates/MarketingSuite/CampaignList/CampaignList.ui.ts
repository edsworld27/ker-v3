/**
 * CampaignList.ui — UI variable declarations for the marketing campaigns table.
 */
export const campaignListUI = {
  page: {
    container: 'p-8 min-h-full bg-[var(--revenue-bg-color)]',
    header: 'flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6',
    title: 'text-4xl font-black text-[var(--revenue-widget-text)] tracking-tight italic uppercase',
    subtitle: 'text-[var(--revenue-widget-text-muted)] text-sm font-medium mt-2',
  },
  toolbar: 'flex items-center justify-between gap-4 mb-4',
  table: {
    wrap: 'overflow-x-auto rounded-[var(--radius-card)] border border-[var(--revenue-widget-border)]',
    table: 'w-full text-sm text-left',
    thead: 'bg-[var(--revenue-widget-surface-color-1-glass)] text-[10px] uppercase tracking-[0.2em] text-[var(--revenue-widget-text-muted)]',
    th: 'px-4 py-3 font-bold cursor-pointer select-none whitespace-nowrap hover:text-[var(--revenue-widget-text)]',
    thActive: 'text-[var(--revenue-widget-primary-color-1)]',
    tr: 'border-t border-[var(--revenue-widget-border)] hover:bg-[var(--revenue-widget-surface-color-1-hover)] transition-colors',
    td: 'px-4 py-3 text-[var(--revenue-widget-text)]',
    tdMuted: 'px-4 py-3 text-[var(--revenue-widget-text-muted)]',
  },
  pill: {
    base: 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest',
    active: 'bg-[var(--revenue-widget-success)]/15 text-[var(--revenue-widget-success)] border border-[var(--revenue-widget-success)]/30',
    paused: 'bg-[var(--revenue-widget-warning,#f59e0b)]/15 text-[#f59e0b] border border-[#f59e0b]/30',
    completed: 'bg-[var(--revenue-widget-text-muted)]/15 text-[var(--revenue-widget-text-muted)] border border-[var(--revenue-widget-border)]',
  },
} as const;

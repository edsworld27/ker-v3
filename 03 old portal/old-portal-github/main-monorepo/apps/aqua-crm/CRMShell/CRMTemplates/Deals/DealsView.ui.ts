/**
 * DealsView UI bundle — sortable table + side detail panel.
 */
export const dealsUI = {
  page: 'p-8 min-h-screen bg-[var(--crm-widget-surface-1)]',
  header: {
    wrap: 'flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6',
    title:
      'text-4xl font-black text-[var(--crm-widget-text)] tracking-tighter italic uppercase',
    subtitle:
      'text-[var(--crm-widget-text-muted)] text-base font-medium',
  },
  filters: {
    wrap: 'flex items-center gap-2 flex-wrap mb-6',
    pill:
      'px-4 py-1.5 rounded-full border border-[var(--crm-widget-border)] text-xs font-bold uppercase tracking-widest transition-all',
    pillActive:
      'bg-[var(--people-widget-primary-color-1)] text-white border-transparent',
    pillInactive:
      'bg-[var(--crm-widget-surface-1)] text-[var(--crm-widget-text-muted)] hover:bg-[var(--crm-widget-surface-1-hover)]',
    count: 'ml-2 text-[10px] opacity-70',
  },
  layout: 'grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-6',
  tableWrap:
    'rounded-[var(--radius-lg)] border border-[var(--crm-widget-border)] bg-[var(--crm-widget-surface-1)] overflow-hidden',
  tableScroll: 'overflow-x-auto',
  table: 'w-full text-left text-sm',
  tableHead:
    'bg-[var(--crm-widget-surface-1-hover)] border-b border-[var(--crm-widget-border)]',
  th: 'px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[var(--crm-widget-text-muted)] cursor-pointer select-none',
  thInner: 'inline-flex items-center gap-1',
  row: 'border-b border-[var(--crm-widget-border)]/60 hover:bg-[var(--crm-widget-surface-1-hover)] cursor-pointer transition-colors',
  rowSelected:
    'bg-[var(--people-widget-primary-color-1)]/10 border-l-2 border-l-[var(--people-widget-primary-color-1)]',
  td: 'px-4 py-3 text-[var(--crm-widget-text)] tabular-nums',
  stageBadge:
    'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest',
  stageColors: {
    Lead: 'bg-slate-500/15 text-slate-300',
    Qualified: 'bg-sky-500/15 text-sky-300',
    Proposal: 'bg-amber-500/15 text-amber-300',
    Negotiation: 'bg-violet-500/15 text-violet-300',
    'Closed Won': 'bg-emerald-500/15 text-emerald-300',
    'Closed Lost': 'bg-rose-500/15 text-rose-300',
  } as const,
  detail: {
    wrap:
      'rounded-[var(--radius-lg)] border border-[var(--crm-widget-border)] bg-[var(--crm-widget-surface-1)] p-5 sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto flex flex-col gap-5',
    empty:
      'rounded-[var(--radius-lg)] border border-dashed border-[var(--crm-widget-border)] p-10 text-center text-sm text-[var(--crm-widget-text-muted)] sticky top-6',
    title:
      'text-lg font-bold text-[var(--crm-widget-text)] leading-snug',
    section:
      'flex flex-col gap-2 pt-4 border-t border-[var(--crm-widget-border)]/60 first:border-0 first:pt-0',
    sectionLabel:
      'text-[10px] font-bold uppercase tracking-widest text-[var(--crm-widget-text-muted)]',
    metaGrid: 'grid grid-cols-2 gap-3',
    metaCell:
      'rounded-[var(--radius-md)] bg-[var(--crm-widget-surface-1-hover)] p-3 flex flex-col gap-1',
    metaLabel:
      'text-[10px] font-bold uppercase tracking-widest text-[var(--crm-widget-text-muted)]',
    metaValue:
      'text-sm font-bold text-[var(--crm-widget-text)] tabular-nums',
    notes:
      'text-sm leading-relaxed text-[var(--crm-widget-text)]',
    activityItem:
      'flex gap-3 py-2 border-b border-[var(--crm-widget-border)]/40 last:border-0',
    activityIcon:
      'w-8 h-8 rounded-full bg-[var(--crm-widget-surface-1-hover)] flex items-center justify-center shrink-0',
    activityBody: 'flex-1 min-w-0',
    activityActor:
      'text-xs font-bold text-[var(--crm-widget-text)]',
    activitySummary:
      'text-xs text-[var(--crm-widget-text-muted)] leading-snug',
    activityTime:
      'text-[10px] uppercase tracking-widest text-[var(--crm-widget-text-muted)]/70 mt-1',
    contactRow:
      'flex items-center gap-2 text-xs text-[var(--crm-widget-text)]',
    closeBtn:
      'absolute top-3 right-3 w-7 h-7 rounded-full bg-[var(--crm-widget-surface-1-hover)] flex items-center justify-center text-[var(--crm-widget-text-muted)] hover:text-[var(--crm-widget-text)]',
  },
};

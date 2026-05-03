/**
 * PipelineView UI — Tailwind class bundles centralised here.
 * Mixes CRM widget CSS variables with Tailwind utilities for the kanban grid.
 */
export const pipelineUI = {
  page: 'p-8 min-h-screen bg-[var(--crm-widget-surface-1)]',
  header: {
    wrap: 'flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8',
    titleBlock: 'flex flex-col gap-1',
    title:
      'text-4xl font-black text-[var(--crm-widget-text)] tracking-tighter italic uppercase',
    subtitle:
      'text-[var(--crm-widget-text-muted)] text-base font-medium',
    actions: 'flex items-center gap-3',
    searchWrap: 'relative',
    searchIcon:
      'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--crm-widget-text-muted)]',
    searchInput:
      'bg-[var(--crm-widget-surface-1-hover)] border border-[var(--crm-widget-border)] rounded-[var(--radius-md)] pl-10 pr-4 py-2.5 text-sm text-[var(--crm-widget-text)] focus:outline-none focus:ring-2 focus:ring-[var(--people-widget-primary-color-1)]/40 transition-all w-72',
  },
  summaryGrid: 'grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8',
  summaryCard:
    'rounded-[var(--radius-lg)] border border-[var(--crm-widget-border)] bg-[var(--crm-widget-surface-1)] p-5 flex items-center gap-4',
  summaryIconBox:
    'w-12 h-12 rounded-[var(--radius-md)] bg-[var(--crm-widget-surface-1-hover)] flex items-center justify-center',
  summaryLabel:
    'text-[10px] font-bold uppercase tracking-widest text-[var(--crm-widget-text-muted)]',
  summaryValue:
    'text-2xl font-black text-[var(--crm-widget-text)] tracking-tight',
  board: {
    wrap: 'overflow-x-auto pb-4',
    grid: 'flex gap-4 min-w-max',
    column:
      'w-72 shrink-0 rounded-[var(--radius-lg)] border border-[var(--crm-widget-border)] bg-[var(--crm-widget-surface-1)]/60 p-3 flex flex-col gap-3',
    columnDropTarget: 'ring-2 ring-[var(--people-widget-primary-color-1)]/40',
    columnHeader:
      'flex items-center justify-between px-2 pt-1',
    columnTitle:
      'text-sm font-bold uppercase tracking-wider text-[var(--crm-widget-text)] flex items-center gap-2',
    columnCount:
      'text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--crm-widget-surface-1-hover)] text-[var(--crm-widget-text-muted)] uppercase tracking-widest',
    columnTotals:
      'text-[11px] text-[var(--crm-widget-text-muted)] px-2 mb-1 flex justify-between',
    cardList: 'flex flex-col gap-3 min-h-[40px]',
  },
  card: {
    wrap:
      'cursor-grab active:cursor-grabbing rounded-[var(--radius-md)] border border-[var(--crm-widget-border)] bg-[var(--crm-widget-surface-1)] p-3 flex flex-col gap-3 hover:border-[var(--people-widget-primary-color-1)]/60 transition-all',
    name:
      'text-sm font-semibold text-[var(--crm-widget-text)] leading-snug',
    company:
      'text-xs text-[var(--crm-widget-text-muted)]',
    metaRow: 'flex items-center justify-between',
    value:
      'text-sm font-bold text-[var(--crm-widget-text)] tabular-nums',
    probability:
      'text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--crm-widget-surface-1-hover)] text-[var(--crm-widget-text-muted)] uppercase tracking-widest',
    footerRow:
      'flex items-center justify-between pt-2 border-t border-[var(--crm-widget-border)]/60',
    avatar:
      'w-7 h-7 rounded-full bg-gradient-to-br flex items-center justify-center text-[10px] font-black text-white',
    closeDate:
      'text-[10px] text-[var(--crm-widget-text-muted)] uppercase tracking-widest',
    tagRow: 'flex flex-wrap gap-1',
    tag: 'text-[10px] px-2 py-0.5 rounded-full bg-[var(--crm-widget-surface-1-hover)] text-[var(--crm-widget-text-muted)]',
  },
  emptyColumn:
    'text-[11px] italic text-[var(--crm-widget-text-muted)] text-center px-2 py-6 border border-dashed border-[var(--crm-widget-border)] rounded-[var(--radius-md)]',
};

/**
 * ActivitiesView UI bundle — vertical timeline of CRM events.
 */
export const activitiesUI = {
  page: 'p-8 min-h-screen bg-[var(--crm-widget-surface-1)]',
  header: {
    wrap: 'flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6',
    title:
      'text-4xl font-black text-[var(--crm-widget-text)] tracking-tighter italic uppercase',
    subtitle:
      'text-[var(--crm-widget-text-muted)] text-base font-medium',
    filterWrap: 'min-w-[180px]',
  },
  countBar:
    'text-[10px] font-bold uppercase tracking-widest text-[var(--crm-widget-text-muted)] mb-4',
  feed: {
    wrap:
      'rounded-[var(--radius-lg)] border border-[var(--crm-widget-border)] bg-[var(--crm-widget-surface-1)] p-6 max-w-3xl',
    list: 'relative flex flex-col gap-2 ml-4',
    rail:
      'absolute top-2 bottom-2 left-[15px] w-px bg-[var(--crm-widget-border)]',
    item: 'relative flex gap-4 py-3',
    iconRing:
      'relative z-10 w-8 h-8 rounded-full bg-[var(--crm-widget-surface-1-hover)] border border-[var(--crm-widget-border)] flex items-center justify-center shrink-0',
    iconColors: {
      call: 'text-emerald-400',
      email: 'text-sky-400',
      meeting: 'text-violet-400',
      note: 'text-amber-400',
    } as const,
    body: 'flex-1 min-w-0 flex flex-col gap-1',
    headerRow: 'flex items-baseline justify-between gap-3 flex-wrap',
    line:
      'text-sm text-[var(--crm-widget-text)] leading-snug',
    actor: 'font-bold',
    verb: 'text-[var(--crm-widget-text-muted)]',
    target: 'font-semibold',
    timestamp:
      'text-[10px] uppercase tracking-widest text-[var(--crm-widget-text-muted)] shrink-0',
    note:
      'text-xs text-[var(--crm-widget-text-muted)] leading-relaxed bg-[var(--crm-widget-surface-1-hover)] rounded-[var(--radius-md)] px-3 py-2 mt-1',
    avatar:
      'w-6 h-6 rounded-full bg-gradient-to-br flex items-center justify-center text-[9px] font-black text-white inline-flex mr-1.5 align-middle',
  },
  empty:
    'rounded-[var(--radius-lg)] border border-dashed border-[var(--crm-widget-border)] p-10 text-center text-sm text-[var(--crm-widget-text-muted)] max-w-3xl',
};

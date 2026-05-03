/**
 * ReportsView UI bundle — KPI grid + recharts shells.
 */
export const reportsUI = {
  page: 'p-8 min-h-screen bg-[var(--crm-widget-surface-1)]',
  header: {
    wrap: 'flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6',
    title:
      'text-4xl font-black text-[var(--crm-widget-text)] tracking-tighter italic uppercase',
    subtitle:
      'text-[var(--crm-widget-text-muted)] text-base font-medium',
  },
  kpiGrid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6',
  kpiCard:
    'rounded-[var(--radius-lg)] border border-[var(--crm-widget-border)] bg-[var(--crm-widget-surface-1)] p-5 flex flex-col gap-3',
  kpiHeader: 'flex items-center justify-between',
  kpiIconBox:
    'w-10 h-10 rounded-[var(--radius-md)] bg-[var(--crm-widget-surface-1-hover)] flex items-center justify-center',
  kpiDeltaUp:
    'inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-emerald-400',
  kpiDeltaDown:
    'inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-rose-400',
  kpiLabel:
    'text-[10px] font-bold uppercase tracking-widest text-[var(--crm-widget-text-muted)]',
  kpiValue:
    'text-3xl font-black text-[var(--crm-widget-text)] tracking-tight tabular-nums',
  chartCard:
    'rounded-[var(--radius-lg)] border border-[var(--crm-widget-border)] bg-[var(--crm-widget-surface-1)] p-6 mb-6',
  chartHeader: 'flex items-center justify-between mb-4',
  chartTitle:
    'text-lg font-bold text-[var(--crm-widget-text)] tracking-tight',
  chartSubtitle:
    'text-xs text-[var(--crm-widget-text-muted)]',
  chartHeight: 'w-full h-72',
};

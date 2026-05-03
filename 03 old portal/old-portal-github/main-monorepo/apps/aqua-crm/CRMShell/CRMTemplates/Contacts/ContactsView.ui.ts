/**
 * ContactsView UI bundle — searchable grid of contact cards + side panel.
 */
export const contactsUI = {
  page: 'p-8 min-h-screen bg-[var(--crm-widget-surface-1)]',
  header: {
    wrap: 'flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6',
    title:
      'text-4xl font-black text-[var(--crm-widget-text)] tracking-tighter italic uppercase',
    subtitle:
      'text-[var(--crm-widget-text-muted)] text-base font-medium',
    searchWrap: 'relative w-full md:w-80',
    searchIcon:
      'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--crm-widget-text-muted)]',
    searchInput:
      'w-full bg-[var(--crm-widget-surface-1-hover)] border border-[var(--crm-widget-border)] rounded-[var(--radius-md)] pl-10 pr-4 py-2.5 text-sm text-[var(--crm-widget-text)] focus:outline-none focus:ring-2 focus:ring-[var(--people-widget-primary-color-1)]/40 transition-all',
  },
  countBar:
    'text-[10px] font-bold uppercase tracking-widest text-[var(--crm-widget-text-muted)] mb-4',
  layout: 'grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-6',
  grid:
    'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
  card: {
    wrap:
      'rounded-[var(--radius-lg)] border border-[var(--crm-widget-border)] bg-[var(--crm-widget-surface-1)] p-4 flex flex-col gap-3 cursor-pointer transition-all hover:border-[var(--people-widget-primary-color-1)]/60 hover:bg-[var(--crm-widget-surface-1-hover)]',
    selected:
      'border-[var(--people-widget-primary-color-1)] ring-2 ring-[var(--people-widget-primary-color-1)]/30',
    head: 'flex items-center gap-3',
    avatar:
      'w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center text-sm font-black text-white shrink-0',
    head_text: 'flex flex-col min-w-0',
    name:
      'text-sm font-bold text-[var(--crm-widget-text)] truncate',
    title:
      'text-xs text-[var(--crm-widget-text-muted)] truncate',
    company:
      'text-xs text-[var(--crm-widget-text-muted)] flex items-center gap-1.5',
    contactRow:
      'text-xs text-[var(--crm-widget-text)] flex items-center gap-1.5 truncate',
    tagRow: 'flex flex-wrap gap-1 pt-1',
    tag: 'text-[10px] px-2 py-0.5 rounded-full bg-[var(--crm-widget-surface-1-hover)] text-[var(--crm-widget-text-muted)]',
  },
  empty:
    'col-span-full rounded-[var(--radius-lg)] border border-dashed border-[var(--crm-widget-border)] p-10 text-center text-sm text-[var(--crm-widget-text-muted)]',
  panel: {
    wrap:
      'rounded-[var(--radius-lg)] border border-[var(--crm-widget-border)] bg-[var(--crm-widget-surface-1)] p-5 sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto flex flex-col gap-5 relative',
    empty:
      'rounded-[var(--radius-lg)] border border-dashed border-[var(--crm-widget-border)] p-10 text-center text-sm text-[var(--crm-widget-text-muted)] sticky top-6',
    closeBtn:
      'absolute top-3 right-3 w-7 h-7 rounded-full bg-[var(--crm-widget-surface-1-hover)] flex items-center justify-center text-[var(--crm-widget-text-muted)] hover:text-[var(--crm-widget-text)]',
    profileHead: 'flex flex-col items-center gap-3 pt-2',
    profileAvatar:
      'w-20 h-20 rounded-full bg-gradient-to-br flex items-center justify-center text-xl font-black text-white',
    profileName:
      'text-lg font-bold text-[var(--crm-widget-text)] text-center',
    profileTitle:
      'text-sm text-[var(--crm-widget-text-muted)] text-center',
    section:
      'flex flex-col gap-2 pt-4 border-t border-[var(--crm-widget-border)]/60',
    sectionLabel:
      'text-[10px] font-bold uppercase tracking-widest text-[var(--crm-widget-text-muted)]',
    contactRow:
      'flex items-center gap-2 text-xs text-[var(--crm-widget-text)]',
    notes: 'text-sm leading-relaxed text-[var(--crm-widget-text)]',
    dealRow:
      'flex items-center justify-between rounded-[var(--radius-md)] bg-[var(--crm-widget-surface-1-hover)] px-3 py-2',
    dealName:
      'text-xs font-semibold text-[var(--crm-widget-text)] truncate',
    dealMeta:
      'text-[10px] text-[var(--crm-widget-text-muted)] uppercase tracking-widest',
  },
};

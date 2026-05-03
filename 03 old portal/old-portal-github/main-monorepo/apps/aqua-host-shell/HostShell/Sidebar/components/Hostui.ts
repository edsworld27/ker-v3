export const sidebarItemUI = {
  wrapper: {
    base: 'w-full flex items-center justify-between p-3 rounded-[var(--radius-button)] transition-all duration-300 group relative',
    active: 'bg-[var(--host-widget-primary-color-1)]/10 text-[var(--host-widget-primary-color-1)]',
    inactive: 'text-[var(--host-text-color-muted)] hover:bg-[var(--host-surface-color-glass)] hover:text-[var(--host-text-color)]',
    collapsed: 'justify-center'
  },
  leftGroup: {
    layout: 'flex items-center gap-3 min-w-0',
  },
  icon: {
    size: 'w-5 h-5 shrink-0',
    active: 'text-[var(--host-widget-primary-color-1)]',
    inactive: 'text-[var(--host-text-color-muted)] group-hover:text-[var(--host-text-color)] transition-colors',
  },
  label: {
    base: 'font-medium truncate',
    active: 'text-[var(--host-widget-primary-color-1)]',
    inactive: 'text-[var(--host-text-color)]',
  },
  badge: {
    base: 'px-2 py-0.5 text-[10px] font-bold rounded-full ml-2 shrink-0',
    active: 'bg-[var(--host-widget-primary-color-1)]/20 text-[var(--host-widget-primary-color-1)]',
    inactive: 'bg-white/10 text-[var(--host-text-color)]',
  },
  tooltip: {
    layout: 'absolute left-full ml-4 px-2 py-1 bg-[var(--host-surface-color)] text-[var(--host-text-color)] text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 pointer-events-none',
  }
};
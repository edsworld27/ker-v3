export const sidebarItemUI = {
  wrapper: {
    base: 'w-full flex items-center justify-between p-3 rounded-xl transition-all duration-300 group relative',
    active: 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]',
    inactive: 'text-slate-400 hover:bg-white/5 hover:text-white',
    collapsed: 'justify-center'
  },
  leftGroup: {
    layout: 'flex items-center gap-3 min-w-0',
  },
  icon: {
    size: 'w-5 h-5 shrink-0',
    active: 'text-[var(--color-primary)]',
    inactive: 'text-slate-500 group-hover:text-slate-300 transition-colors',
  },
  label: {
    base: 'font-medium truncate',
    active: 'text-[var(--color-primary)]',
    inactive: 'text-slate-300',
  },
  badge: {
    base: 'px-2 py-0.5 text-[10px] font-bold rounded-full ml-2 shrink-0',
    active: 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]',
    inactive: 'bg-white/10 text-slate-300',
  },
  tooltip: {
    layout: 'absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 pointer-events-none',
  }
};
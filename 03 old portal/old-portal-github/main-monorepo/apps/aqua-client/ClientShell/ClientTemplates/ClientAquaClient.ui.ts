export const aquaClientUI = {
  layout: 'flex flex-col h-full bg-[var(--client-widget-bg-color-1)] text-[var(--client-widget-text)]',
  header: {
    container: 'flex items-center justify-between p-6 border-b border-[var(--client-widget-border)]',
    title: 'text-xl font-black tracking-tight',
    subtitle: 'text-xs text-[var(--client-widget-text-muted)] mt-1 uppercase tracking-widest',
  },
  nav: {
    tabs: 'flex gap-1 p-2 bg-[var(--client-widget-surface-1-glass)] border-b border-[var(--client-widget-border)]',
    tab: {
      base: 'px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all',
      active: 'bg-[var(--client-widget-primary-color-1)] text-white shadow-lg',
      inactive: 'text-[var(--client-widget-text-muted)] hover:text-[var(--client-widget-text)] hover:bg-white/5',
    },
  },
  content: 'flex-1 overflow-y-auto p-6',
} as const;

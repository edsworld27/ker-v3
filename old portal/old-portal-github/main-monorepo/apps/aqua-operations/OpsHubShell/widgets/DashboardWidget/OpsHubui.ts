// ============================================================
// DashboardWidget — UI Variables
// Every visual value for this component lives here.
// Later this file will receive its values from the folder
// ui.config.ts → and ultimately from uiMaster.ts
// ============================================================

export const dashboardWidgetUI = {

  // --- Layout ---
  wrapper: {
    padding: 'p-4 md:p-6',
    radius: 'rounded-[var(--radius-button)] md:rounded-[var(--radius-card)]',
    border: 'border border-[var(--opshub-widget-border)]',
    borderHover: 'hover:border-[var(--opshub-widget-border)]',
    transition: 'transition-all',
    group: 'group',
  },

  // --- Header row (icon + trend badge) ---
  header: {
    gap: 'mb-3 md:mb-4',
    layout: 'flex items-center justify-between',
  },

  // --- Icon container ---
  icon: {
    padding: 'p-2 md:p-3',
    radius: 'rounded-[var(--radius-button)] md:rounded-[var(--radius-button)]',
    hoverScale: 'group-hover:scale-110',
    transition: 'transition-transform',
    size: 'w-5 h-5 md:w-6 md:h-6',
    // bg + text colour are driven by the `color` prop (e.g. amber, indigo, emerald)
    colorBg: (color: string) => `bg-${color}-500/10`,
    colorText: (color: string) => `text-${color}-400`,
  },

  // --- Trend badge ---
  trend: {
    fontSize: 'text-[9px] md:text-[10px]',
    fontWeight: 'font-bold',
    paddingX: 'px-1.5 md:px-2',
    paddingY: 'py-0.5 md:py-1',
    radius: 'rounded-lg',
    // positive trend (starts with '+')
    positiveBg: 'bg-[color-mix(in_srgb,var(--opshub-widget-success)_10%,transparent)]',
    positiveText: 'text-[var(--opshub-widget-success)]',
    // neutral / negative trend
    neutralBg: 'bg-slate-500/10',
    neutralText: 'text-[var(--opshub-widget-text-muted)]',
  },

  // --- Value (the big number) ---
  value: {
    fontSize: 'text-xl md:text-2xl',
    fontWeight: 'font-bold',
    color: 'text-[var(--opshub-widget-text)]',
    gap: 'mb-0.5 md:mb-1',
  },

  // --- Label (below the value) ---
  label: {
    fontSize: 'text-[10px] md:text-xs',
    color: 'text-[var(--opshub-widget-text-muted)]',
    transform: 'uppercase',
    tracking: 'tracking-widest',
    fontWeight: 'font-bold',
  },

};

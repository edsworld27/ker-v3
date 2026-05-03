// ============================================================
// StageDropdown — UI Variables
// Every visual value for this component lives here.
// Feeds up to: shared/ui.config.ts → uiMaster.ts
// ============================================================

export const stageDropdownUI = {

  // --- Select element ---
  select: {
    bg: 'bg-[var(--client-widget-surface-1-glass)]',
    border: 'border border-[var(--client-widget-border)]',
    radius: 'rounded-lg',
    paddingX: 'px-2',
    paddingY: 'py-1',
    fontSize: 'text-[9px] md:text-xs',
    textColor: 'text-[var(--client-widget-text)]',
    transform: 'uppercase',
    tracking: 'tracking-widest',
    fontWeight: 'font-bold',
    focus: 'focus:outline-none focus:border-[var(--client-widget-primary-color-1)]/50',
    transition: 'transition-colors',
  },

  // --- Option elements ---
  option: {
    bg: 'bg-[var(--client-widget-bg-color-1)]',
    textColor: 'text-[var(--client-widget-text)]',
  },

  // --- Stage labels (text shown in UI) ---
  stageLabels: {
    discovery: 'Discovery',
    design: 'Design',
    development: 'Development',
    live: 'Live',
  },

};

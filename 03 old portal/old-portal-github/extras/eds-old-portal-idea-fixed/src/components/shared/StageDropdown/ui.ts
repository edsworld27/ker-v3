// ============================================================
// StageDropdown — UI Variables
// Every visual value for this component lives here.
// Feeds up to: shared/ui.config.ts → uiMaster.ts
// ============================================================

export const stageDropdownUI = {

  // --- Select element ---
  select: {
    bg: 'bg-white/5',
    border: 'border border-white/10',
    radius: 'rounded-lg',
    paddingX: 'px-2',
    paddingY: 'py-1',
    fontSize: 'text-[9px] md:text-xs',
    textColor: 'text-slate-300',
    transform: 'uppercase',
    tracking: 'tracking-widest',
    fontWeight: 'font-bold',
    focus: 'focus:outline-none focus:border-[var(--color-primary)]/50',
    transition: 'transition-colors',
  },

  // --- Option elements ---
  option: {
    bg: 'bg-slate-900',
    textColor: 'text-white',
  },

  // --- Stage labels (text shown in UI) ---
  stageLabels: {
    discovery: 'Discovery',
    design: 'Design',
    development: 'Development',
    live: 'Live',
  },

};

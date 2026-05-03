// ============================================================
// SyncCard — UI Variables
// Feeds up to: collaboration/ui.config.ts → uiMaster.ts
// ============================================================

export const syncCardUI = {

  // --- Wrapper ---
  wrapper: {
    padding: 'p-6 md:p-8',
    radius: 'rounded-2xl md:rounded-3xl',
    bg: 'bg-indigo-600/10',
    border: 'border border-indigo-500/20',
  },

  // --- Title ---
  title: {
    fontWeight: 'font-semibold',
    gap: 'mb-2',
    fontSize: 'text-sm md:text-base',
    label: 'Need a quick sync?',
  },

  // --- Body text ---
  body: {
    fontSize: 'text-xs md:text-sm',
    textColor: 'text-slate-400',
    gap: 'mb-4',
    label: 'Schedule a 15-min call with your project manager.',
  },

  // --- CTA button ---
  button: {
    width: 'w-full',
    paddingY: 'py-2.5 md:py-3',
    bg: 'bg-indigo-600',
    bgHover: 'hover:bg-indigo-700',
    radius: 'rounded-xl md:rounded-2xl',
    fontSize: 'text-xs md:text-sm',
    fontWeight: 'font-bold',
    transition: 'transition-all',
    label: 'Book Call',
  },

};

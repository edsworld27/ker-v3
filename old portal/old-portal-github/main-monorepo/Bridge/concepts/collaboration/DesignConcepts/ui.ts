// ============================================================
// DesignConcepts — UI Variables
// Feeds up to: collaboration/ui.config.ts → uiMaster.ts
// ============================================================

export const designConceptsUI = {

  // --- Section wrapper ---
  wrapper: {
    padding: 'p-5 md:p-8',
    radius: 'rounded-2xl md:rounded-3xl',
  },

  // --- Header row ---
  header: {
    layout: 'flex items-center justify-between',
    gap: 'mb-5 md:mb-6',
    titleSize: 'text-lg md:text-xl',
    titleWeight: 'font-medium',
  },

  // --- Status badge ---
  badge: {
    padding: 'px-2.5 py-1',
    bg: 'bg-indigo-500/20',
    textColor: 'text-indigo-400',
    radius: 'rounded-full',
    fontSize: 'text-[9px] md:text-[10px]',
    fontWeight: 'font-bold',
    transform: 'uppercase',
    tracking: 'tracking-widest',
    label: 'In Review',
  },

  // --- Preview area ---
  preview: {
    aspect: 'aspect-video',
    bg: 'bg-white/5',
    radius: 'rounded-xl md:rounded-2xl',
    border: 'border border-white/10',
    layout: 'flex items-center justify-center relative overflow-hidden group',
    overlayBg: 'absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end',
    overlayPadding: 'p-4 md:p-6',
    placeholderIconSize: 'w-10 h-10 md:w-12 md:h-12',
    placeholderIconColor: 'text-slate-700',
    placeholderText: 'Homepage Concept v1.2',
    placeholderTextStyle: 'absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-6 md:translate-y-8 text-[10px] md:text-xs text-slate-600',
  },

  // --- Full screen button (overlay) ---
  viewButton: {
    padding: 'px-4 py-2',
    bg: 'bg-indigo-600',
    radius: 'rounded-xl',
    fontSize: 'text-xs md:text-sm',
    fontWeight: 'font-medium',
    label: 'View Full Screen',
  },

  // --- Action buttons row ---
  actions: {
    gap: 'mt-5 md:mt-6 flex flex-col sm:flex-row gap-3 md:gap-4',
  },

  actionSecondary: {
    flex: 'flex-1',
    paddingY: 'py-2.5 md:py-3',
    bg: 'bg-white/5',
    bgHover: 'hover:bg-white/10',
    radius: 'rounded-xl md:rounded-2xl',
    fontSize: 'text-xs md:text-sm',
    fontWeight: 'font-medium',
    transition: 'transition-all',
    label: 'Request Changes',
  },

  actionPrimary: {
    flex: 'flex-1',
    paddingY: 'py-2.5 md:py-3',
    bg: 'bg-indigo-600',
    bgHover: 'hover:bg-indigo-700',
    radius: 'rounded-xl md:rounded-2xl',
    fontSize: 'text-xs md:text-sm',
    fontWeight: 'font-medium',
    transition: 'transition-all',
    label: 'Approve Design',
  },

};

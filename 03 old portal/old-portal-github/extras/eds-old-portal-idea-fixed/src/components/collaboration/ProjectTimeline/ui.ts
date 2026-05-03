// ============================================================
// ProjectTimeline — UI Variables
// Feeds up to: collaboration/ui.config.ts → uiMaster.ts
// ============================================================

export const projectTimelineUI = {

  // --- Section wrapper ---
  wrapper: {
    padding: 'p-5 md:p-8',
    radius: 'rounded-2xl md:rounded-3xl',
  },

  // --- Title ---
  title: {
    fontSize: 'text-lg md:text-xl',
    fontWeight: 'font-medium',
    gap: 'mb-5 md:mb-6',
    label: 'Project Timeline',
  },

  // --- Items list ---
  list: {
    spacing: 'space-y-5 md:space-y-6',
  },

  // --- Individual item row ---
  item: {
    layout: 'flex items-center gap-3 md:gap-4',
  },

  // --- Status dot ---
  dot: {
    size: 'w-7 h-7 md:w-8 md:h-8',
    radius: 'rounded-full',
    layout: 'flex items-center justify-center shrink-0',
    iconSize: 'w-4 h-4 md:w-5 md:h-5',
    // per-status styles
    completed: {
      bg: 'bg-emerald-500/20',
      textColor: 'text-emerald-400',
      border: '',
    },
    current: {
      bg: 'bg-indigo-500/20',
      textColor: 'text-indigo-400',
      border: 'border border-indigo-500/50',
    },
    pending: {
      bg: 'bg-white/5',
      textColor: 'text-slate-600',
      border: '',
    },
  },

  // --- Item label ---
  label: {
    layout: 'flex items-center justify-between',
    fontSize: 'text-xs md:text-sm',
    fontWeight: 'font-medium',
    colorActive: 'text-white',
    colorPending: 'text-slate-600',
    dateFontSize: 'text-[10px] md:text-xs',
    dateColor: 'text-slate-500',
  },

  // --- Progress bar (current item only) ---
  progressBar: {
    wrapper: 'w-full h-1 bg-white/5 rounded-full mt-2 overflow-hidden',
    fill: 'h-full bg-indigo-500 w-2/3',
  },

  // --- Timeline data ---
  stages: [
    { stage: 'Discovery',    status: 'completed', date: 'Mar 10' },
    { stage: 'Wireframing',  status: 'completed', date: 'Mar 15' },
    { stage: 'UI Design',    status: 'current',   date: 'Mar 24' },
    { stage: 'Development',  status: 'pending',   date: 'Apr 05' },
    { stage: 'Launch',       status: 'pending',   date: 'Apr 20' },
  ],

};

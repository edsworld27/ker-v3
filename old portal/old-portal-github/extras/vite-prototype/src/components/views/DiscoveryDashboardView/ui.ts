// ============================================================
// DiscoveryDashboardView — UI Variables
// Every string, colour, size and text label lives here.
// Feeds up to: views/ui.config.ts → uiMaster.ts
// ============================================================

import { Compass, Lightbulb, Target, Clock } from 'lucide-react';

export const discoveryDashboardUI = {

  // --- Page wrapper ---
  page: {
    motionKey: 'discovery-dashboard',
    animation: { initial: { opacity: 0, scale: 0.98 }, animate: { opacity: 1, scale: 1 } },
    padding: 'p-4 md:p-6 lg:p-10',
    maxWidth: 'max-w-6xl mx-auto w-full',
  },

  // --- Header section ---
  header: {
    layout: 'flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6',
    gap: 'mb-8 md:mb-10',
    title: 'Discovery Dashboard',
    titleSize: 'text-2xl md:text-3xl',
    titleWeight: 'font-semibold',
    titleGap: 'mb-1 md:mb-2',
    subtitle: 'Defining the vision and requirements for your project.',
    subtitleSize: 'text-xs md:text-sm lg:text-base',
    subtitleColor: 'text-slate-500',
  },

  // --- Phase badge ---
  phaseBadge: {
    layout: 'flex items-center gap-2',
    textColor: 'text-amber-400',
    fontWeight: 'font-medium',
    bg: 'bg-amber-400/10',
    paddingX: 'px-3 md:px-4',
    paddingY: 'py-1.5 md:py-2',
    radius: 'rounded-xl',
    border: 'border border-amber-400/20',
    alignment: 'self-start md:self-auto',
    fontSize: 'text-xs md:text-sm lg:text-base',
    iconSize: 'w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5',
    icon: Compass,
    label: 'Discovery Phase',
  },

  // --- Widgets row ---
  widgets: {
    grid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6',
    gap: 'mb-8 md:mb-10',
    items: [
      { icon: Lightbulb, label: 'Ideas Captured',   value: '24',     trend: '+8',       color: 'amber'   },
      { icon: Target,    label: 'Goals Defined',    value: '6 Core', trend: 'Aligned',  color: 'primary'  },
      { icon: Clock,     label: 'Phase Completion', value: '80%',    trend: 'Near End', color: 'emerald' },
    ],
  },

  // --- Main content grid ---
  contentGrid: {
    layout: 'grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8',
    mainCol: 'lg:col-span-2 space-y-6 md:space-y-8',
    sideCol: 'space-y-6 md:space-y-8',
  },

  // --- Goals card ---
  goals: {
    padding: 'p-4 md:p-6 lg:p-8',
    radius: 'rounded-2xl md:rounded-3xl',
    title: 'Core Project Goals',
    titleSize: 'text-lg md:text-xl',
    titleWeight: 'font-medium',
    titleGap: 'mb-4 md:mb-6',
    listSpacing: 'space-y-3 md:space-y-4',
    // Each goal item
    item: {
      layout: 'flex items-start gap-3 md:gap-4',
      padding: 'p-3 md:p-4',
      bg: 'bg-white/5',
      radius: 'rounded-xl md:rounded-2xl',
      border: 'border border-white/5',
    },
    // Numbered dot
    dot: {
      margin: 'mt-1',
      size: 'w-4 h-4 md:w-5 md:h-5',
      radius: 'rounded-full',
      bg: 'bg-amber-500/20',
      flex: 'flex-shrink-0 flex items-center justify-center',
      textColor: 'text-amber-400',
      fontSize: 'text-[9px] md:text-[10px] lg:text-xs',
      fontWeight: 'font-bold',
    },
    // Goal text
    text: {
      fontSize: 'text-xs md:text-sm',
      textColor: 'text-slate-200',
      leading: 'leading-relaxed',
    },
    // The actual goal data
    items: [
      'Increase conversion rate by 25% within 6 months',
      'Modernize brand identity for a younger demographic',
      'Implement a seamless multi-channel checkout process',
      'Reduce page load times to under 1.5 seconds',
    ],
  },

  // --- Insights card ---
  insights: {
    padding: 'p-4 md:p-6 lg:p-8',
    radius: 'rounded-2xl md:rounded-3xl',
    title: 'Discovery Insights',
    titleSize: 'text-base md:text-lg',
    titleWeight: 'font-medium',
    titleGap: 'mb-4 md:mb-6',
    listSpacing: 'space-y-3 md:space-y-4',
    // Each insight row
    row: {
      padding: 'p-3 md:p-4',
      bg: 'bg-white/5',
      radius: 'rounded-xl md:rounded-2xl',
      border: 'border border-white/5',
      labelSize: 'text-[8px] md:text-[9px] lg:text-[10px]',
      labelWeight: 'font-bold',
      labelTransform: 'uppercase',
      labelTracking: 'tracking-widest',
      labelGap: 'mb-1.5 md:mb-2',
      valueSize: 'text-xs md:text-sm',
      valueWeight: 'font-medium',
      valueTruncate: 'truncate',
    },
    // The actual insight data
    items: [
      { label: 'Top Competitor',  labelColor: 'text-amber-400',   value: 'Nexus Digital Systems'  },
      { label: 'Target Audience', labelColor: 'text-[var(--color-primary)]',  value: 'Gen Z Tech Enthusiasts' },
      { label: 'Key Value Prop',  labelColor: 'text-emerald-400', value: 'AI-Driven Personalization' },
    ],
  },

};

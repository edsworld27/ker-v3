// ============================================================
// CollaborationView — UI Variables
// Feeds up to: views/ui.config.ts → uiMaster.ts
// ============================================================

import { MessageSquarePlus } from 'lucide-react';

export const collaborationViewUI = {

  // --- Page wrapper ---
  page: {
    motionKey: 'collaboration',
    animation: { initial: { opacity: 0, scale: 0.98 }, animate: { opacity: 1, scale: 1 } },
    padding: 'p-4 md:p-10',
    maxWidth: 'max-w-6xl mx-auto w-full',
  },

  // --- Header ---
  header: {
    layout: 'flex flex-col md:flex-row md:items-center justify-between gap-6',
    gap: 'mb-8 md:mb-10',
    title: 'Collaboration Center',
    titleSize: 'text-2xl md:text-3xl',
    titleWeight: 'font-semibold',
    titleGap: 'mb-2',
    subtitle: 'Review designs, share ideas, and track project progress.',
    subtitleSize: 'text-sm md:text-base',
    subtitleColor: 'text-slate-500',
  },

  // --- Status badge ---
  statusBadge: {
    layout: 'flex items-center gap-2',
    textColor: 'text-[var(--color-primary)]',
    fontWeight: 'font-medium',
    alignment: 'self-start md:self-auto',
    fontSize: 'text-sm md:text-base',
    iconSize: 'w-4 h-4 md:w-5 md:h-5',
    icon: MessageSquarePlus,
    label: 'Active Project',
  },

  // --- Content grid ---
  contentGrid: {
    layout: 'grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8',
    mainCol: 'lg:col-span-2 space-y-6 md:space-y-8',
    sideCol: 'space-y-6 md:space-y-8',
  },

  // --- Component layout (driven by DynamicRenderer) ---
  leftComponents: [
    { component: 'DesignConcepts',  props: {} },
    { component: 'ProjectTimeline', props: {} },
  ],
  rightComponents: [
    { component: 'ProjectChat', props: {} },
    { component: 'SyncCard',    props: {} },
  ],

};

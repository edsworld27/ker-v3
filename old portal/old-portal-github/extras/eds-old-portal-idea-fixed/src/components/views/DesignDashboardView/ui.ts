// ============================================================
// DesignDashboardView — UI Variables
// Every string, colour, size and text label lives here.
// Feeds up to: views/ui.config.ts → uiMaster.ts
// ============================================================

import { Palette } from 'lucide-react';

export const designDashboardUI = {

  // --- Page wrapper ---
  page: {
    motionKey: 'design-dashboard',
    animation: { initial: { opacity: 0, scale: 0.98 }, animate: { opacity: 1, scale: 1 } },
    padding: 'p-4 md:p-6 lg:p-10',
    maxWidth: 'max-w-6xl mx-auto w-full',
  },

  // --- Header ---
  header: {
    layout: 'flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6',
    gap: 'mb-8 md:mb-10',
    title: 'Design Dashboard',
    titleSize: 'text-2xl md:text-3xl',
    titleWeight: 'font-semibold',
    titleGap: 'mb-1 md:mb-2',
    subtitle: "Reviewing and refining your project's visual identity.",
    subtitleSize: 'text-xs md:text-sm lg:text-base',
    subtitleColor: 'text-slate-500',
  },

  // --- Phase badge ---
  phaseBadge: {
    layout: 'flex items-center gap-2',
    textColor: 'text-[var(--color-primary)]',
    fontWeight: 'font-medium',
    bg: 'bg-[var(--color-primary)]/10',
    paddingX: 'px-3 md:px-4',
    paddingY: 'py-1.5 md:py-2',
    radius: 'rounded-xl',
    border: 'border border-[var(--color-primary)]/20',
    alignment: 'self-start md:self-auto',
    fontSize: 'text-xs md:text-sm lg:text-base',
    iconSize: 'w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5',
    icon: Palette,
    label: 'Design Phase',
  },

  // --- Content grid ---
  contentGrid: {
    layout: 'grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8',
    mainCol: 'lg:col-span-2 space-y-6 md:space-y-8',
    sideCol: 'space-y-6 md:space-y-8',
  },

  // --- Design concepts card ---
  concepts: {
    padding: 'p-4 md:p-6 lg:p-8',
    radius: 'rounded-2xl md:rounded-3xl',
    title: 'Latest Design Concepts',
    titleSize: 'text-lg md:text-xl',
    titleWeight: 'font-medium',
    titleGap: 'mb-4 md:mb-6',
    grid: 'grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6',
    // Image card
    card: {
      wrapper: 'group relative overflow-hidden rounded-xl md:rounded-2xl border border-white/10 bg-white/5',
      img: 'w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-500',
      overlay: 'absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 md:p-4 lg:p-6',
      overlayTitle: 'text-white font-medium mb-2 text-xs md:text-sm lg:text-base',
      overlayButtons: 'flex gap-2',
      btnPrimary: 'px-2 md:px-3 py-1 md:py-1.5 bg-[var(--color-primary)] text-white text-[8px] md:text-[9px] lg:text-[10px] font-bold rounded-lg uppercase tracking-widest',
      btnSecondary: 'px-2 md:px-3 py-1 md:py-1.5 bg-white/20 text-white text-[8px] md:text-[9px] lg:text-[10px] font-bold rounded-lg uppercase tracking-widest backdrop-blur-md',
      btnPrimaryLabel: 'View Full',
      btnSecondaryLabel: 'Feedback',
      statusBadge: 'absolute top-2 right-2 md:top-3 md:right-3 lg:top-4 lg:right-4 px-1.5 md:px-2 py-0.5 md:py-1 bg-black/60 backdrop-blur-md rounded-lg text-[8px] md:text-[9px] lg:text-[10px] font-bold uppercase tracking-widest text-[var(--color-primary)] border border-[var(--color-primary)]/30',
    },
    items: [
      { title: 'Homepage Concept A', img: 'https://picsum.photos/seed/design1/800/600', status: 'Reviewing' },
      { title: 'Mobile App Layout',  img: 'https://picsum.photos/seed/design2/800/600', status: 'Approved'  },
    ],
  },

  // --- Feedback loop card ---
  feedback: {
    padding: 'p-4 md:p-6 lg:p-8',
    radius: 'rounded-2xl md:rounded-3xl',
    title: 'Design Feedback Loop',
    titleSize: 'text-lg md:text-xl',
    titleWeight: 'font-medium',
    titleGap: 'mb-4 md:mb-6',
    listSpacing: 'space-y-3 md:space-y-4',
    // Client message
    msgClient: {
      layout: 'flex gap-3 md:gap-4',
      padding: 'p-3 md:p-4',
      bg: 'bg-white/5',
      radius: 'rounded-xl md:rounded-2xl',
      border: 'border border-white/5',
      avatarSize: 'w-8 h-8 md:w-10 md:h-10',
      avatarRadius: 'rounded-full',
      avatarBg: 'bg-[var(--color-primary)]',
      avatarFlex: 'flex-shrink-0 flex items-center justify-center font-bold',
      avatarFontSize: 'text-xs md:text-sm',
      avatarInitials: 'EH',
      nameSize: 'text-xs md:text-sm',
      nameFontWeight: 'font-medium',
      nameTruncate: 'truncate mr-2',
      timeSize: 'text-[8px] md:text-[9px] lg:text-[10px]',
      timeColor: 'text-slate-500',
      timeShrink: 'shrink-0',
      bodySize: 'text-xs md:text-sm',
      bodyColor: 'text-slate-400',
      bodyClamp: 'line-clamp-3',
      senderName: 'Edward Hallam',
      timestamp: '2 hours ago',
      message: "Can we try a more vibrant blue for the primary buttons? I think it would pop more against the dark background.",
    },
    // Agency reply
    msgAgency: {
      layout: 'flex gap-3 md:gap-4',
      padding: 'p-3 md:p-4',
      bg: 'bg-[var(--color-primary)]/5',
      radius: 'rounded-xl md:rounded-2xl',
      border: 'border border-[var(--color-primary)]/20',
      indent: 'ml-4 md:ml-8',
      avatarSize: 'w-8 h-8 md:w-10 md:h-10',
      avatarRadius: 'rounded-full',
      avatarBg: 'bg-slate-800',
      avatarFlex: 'flex-shrink-0 flex items-center justify-center font-bold',
      avatarTextColor: 'text-[var(--color-primary)]',
      avatarFontSize: 'text-xs md:text-sm',
      avatarInitials: 'AA',
      nameSize: 'text-xs md:text-sm',
      nameFontWeight: 'font-medium',
      nameColor: 'text-[var(--color-primary)]',
      nameTruncate: 'truncate mr-2',
      timeSize: 'text-[8px] md:text-[9px] lg:text-[10px]',
      timeColor: 'text-slate-500',
      timeShrink: 'shrink-0',
      bodySize: 'text-xs md:text-sm',
      bodyColor: 'text-slate-400',
      bodyClamp: 'line-clamp-3',
      senderName: 'Aqua Agency (Designer)',
      timestamp: 'Just now',
      message: "Great suggestion! I'll update the style guide and push a new version for you to review shortly.",
    },
    // Comment input
    input: {
      wrapperGap: 'mt-5 md:mt-6 flex gap-2 md:gap-3',
      field: 'flex-1 bg-white/5 border border-white/10 rounded-xl px-3 md:px-4 py-2 md:py-2.5 lg:py-3 text-xs md:text-sm outline-none focus:border-[var(--color-primary)]/50 transition-colors',
      placeholder: 'Add a comment...',
      sendBtn: 'p-2 md:p-2.5 lg:p-3 bg-[var(--color-primary)] hover:brightness-110 rounded-xl transition-colors shrink-0',
      sendIconSize: 'w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5',
    },
  },

  // --- Progress card ---
  progress: {
    padding: 'p-4 md:p-6 lg:p-8',
    radius: 'rounded-2xl md:rounded-3xl',
    title: 'Design Progress',
    titleSize: 'text-base md:text-lg',
    titleWeight: 'font-medium',
    titleGap: 'mb-4 md:mb-6',
    listSpacing: 'space-y-4 md:space-y-6',
    item: {
      spacing: 'space-y-1.5 md:space-y-2',
      labelRow: 'flex justify-between text-[9px] md:text-[10px] lg:text-xs',
      labelColor: 'text-slate-400',
      valueColor: 'text-[var(--color-primary)]',
      valueFontWeight: 'font-medium',
      trackBg: 'w-full h-1 md:h-1.5 bg-white/5 rounded-full overflow-hidden',
      fillBg: 'h-full bg-[var(--color-primary)]',
    },
    items: [
      { label: 'Style Guide',  progress: 100 },
      { label: 'Wireframes',   progress: 100 },
      { label: 'UI Concepts',  progress: 65  },
      { label: 'Prototypes',   progress: 20  },
    ],
  },

  // --- Brand assets card ---
  assets: {
    padding: 'p-4 md:p-6 lg:p-8',
    radius: 'rounded-2xl md:rounded-3xl',
    title: 'Brand Assets',
    titleSize: 'text-base md:text-lg',
    titleWeight: 'font-medium',
    titleGap: 'mb-3 md:mb-5',
    listSpacing: 'space-y-2 md:space-y-3',
    row: {
      layout: 'flex items-center justify-between',
      padding: 'p-2.5 md:p-3',
      bg: 'bg-white/5',
      radius: 'rounded-xl',
      border: 'border border-white/5',
      borderHover: 'hover:border-[var(--color-primary)]/30',
      transition: 'transition-all',
      cursor: 'cursor-pointer',
      group: 'group',
      iconLayout: 'flex items-center gap-2 md:gap-3 min-w-0',
      iconSize: 'w-3.5 h-3.5 md:w-4 md:h-4',
      iconColor: 'text-slate-500 group-hover:text-[var(--color-primary)] transition-colors shrink-0',
      nameSize: 'text-[10px] md:text-[11px] lg:text-xs',
      nameColor: 'text-slate-400 group-hover:text-slate-200 transition-colors truncate',
      downloadIconSize: 'w-2.5 h-2.5 md:w-3 md:h-3',
      downloadColor: 'text-slate-600 group-hover:text-[var(--color-primary)] transition-colors shrink-0',
    },
    files: ['Logo_Final.svg', 'Style_Guide_v1.pdf', 'Typography_Specs.txt'],
  },

};

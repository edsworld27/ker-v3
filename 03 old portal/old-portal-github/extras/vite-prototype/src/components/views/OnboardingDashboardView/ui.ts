// ============================================================
// OnboardingDashboardView — UI Variables
// Every string, colour, size and text label lives here.
// Feeds up to: views/ui.config.ts → uiMaster.ts
// ============================================================

import { CheckCircle2, FileText, Users, Zap } from 'lucide-react';

export const onboardingDashboardUI = {

  // --- Page wrapper ---
  page: {
    motionKey: 'onboarding-dashboard',
    animation: { initial: { opacity: 0, scale: 0.98 }, animate: { opacity: 1, scale: 1 } },
    padding: 'p-4 md:p-6 lg:p-10',
    maxWidth: 'max-w-6xl mx-auto w-full',
  },

  // --- Header ---
  header: {
    layout: 'flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6',
    gap: 'mb-8 md:mb-10',
    title: 'Onboarding Dashboard',
    titleSize: 'text-2xl md:text-3xl',
    titleWeight: 'font-semibold',
    titleGap: 'mb-1 md:mb-2',
    subtitle: "Welcome to the agency! Let's get your project started.",
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
    icon: Zap,
    label: 'Setup Phase',
  },

  // --- Widgets ---
  widgets: {
    grid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6',
    gap: 'mb-8 md:mb-10',
    items: [
      { component: 'DashboardWidget', props: { icon: CheckCircle2, label: 'Setup Progress', value: '45%',       trend: '+15%',      color: 'primary'  } },
      { component: 'DashboardWidget', props: { icon: FileText,     label: 'Docs Signed',   value: '3/4',        trend: 'Pending 1', color: 'emerald' } },
      { component: 'DashboardWidget', props: { icon: Users,        label: 'Team Assigned', value: '5 Members',  trend: 'Active',    color: 'amber'   } },
    ],
  },

  // --- Content grid ---
  contentGrid: {
    layout: 'grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8',
    mainCol: 'lg:col-span-2 space-y-6 md:space-y-8',
    sideCol: 'space-y-6 md:space-y-8',
  },

  // --- Checklist card ---
  checklist: {
    padding: 'p-4 md:p-6 lg:p-8',
    radius: 'rounded-2xl md:rounded-3xl',
    title: 'Onboarding Checklist',
    titleSize: 'text-lg md:text-xl',
    titleWeight: 'font-medium',
    titleGap: 'mb-4 md:mb-6',
    listSpacing: 'space-y-3 md:space-y-4',
    // Row
    row: {
      layout: 'flex items-center justify-between',
      padding: 'p-3 md:p-4',
      bg: 'bg-white/5',
      radius: 'rounded-xl md:rounded-2xl',
      border: 'border border-white/5',
      leftLayout: 'flex items-center gap-3 md:gap-4 min-w-0',
    },
    // Checkbox dot
    dot: {
      size: 'w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5',
      radius: 'rounded-full border-2 flex items-center justify-center flex-shrink-0',
      completedStyle: 'bg-emerald-500 border-emerald-500',
      pendingStyle: 'border-white/20',
      iconSize: 'w-2 md:w-2.5 lg:w-3 md:h-2.5 lg:h-3',
      iconColor: 'text-white',
    },
    // Task label
    taskLabel: {
      fontSize: 'text-xs md:text-sm',
      fontWeight: 'font-medium',
      truncate: 'truncate',
      completedStyle: 'text-slate-400 line-through',
      activeStyle: 'text-slate-200',
    },
    // Status badge
    statusBadge: {
      fontSize: 'text-[8px] md:text-[9px] lg:text-[10px]',
      fontWeight: 'font-bold',
      transform: 'uppercase',
      tracking: 'tracking-widest',
      shrink: 'flex-shrink-0 ml-2',
      completedColor: 'text-emerald-400',
      inProgressColor: 'text-amber-400',
      pendingColor: 'text-slate-500',
    },
    // Task data
    tasks: [
      { task: 'Sign Service Agreement',          status: 'Completed'   },
      { task: 'Complete Discovery Questionnaire', status: 'Completed'   },
      { task: 'Schedule Kickoff Call',            status: 'In Progress' },
      { task: 'Upload Brand Assets',             status: 'Pending'     },
    ],
  },

  // --- Success team card ---
  team: {
    padding: 'p-4 md:p-6 lg:p-8',
    radius: 'rounded-2xl md:rounded-3xl',
    title: 'Your Success Team',
    titleSize: 'text-base md:text-lg',
    titleWeight: 'font-medium',
    titleGap: 'mb-4 md:mb-6',
    listSpacing: 'space-y-4 md:space-y-6',
    // Member card
    card: {
      padding: 'p-3 md:p-4',
      bg: 'bg-white/5',
      radius: 'rounded-xl md:rounded-2xl',
      border: 'border border-white/5',
      avatarRow: 'flex items-center gap-3 mb-3',
      avatarSize: 'w-8 h-8 md:w-10 md:h-10',
      avatarRadius: 'rounded-full',
      avatarBg: 'bg-[var(--color-primary)]/20',
      avatarFlex: 'flex items-center justify-center',
      avatarTextColor: 'text-[var(--color-primary)]',
      avatarFontWeight: 'font-bold',
      avatarFontSize: 'text-xs md:text-sm',
      avatarShrink: 'shrink-0',
      nameSize: 'text-xs md:text-sm',
      nameFontWeight: 'font-medium',
      nameTruncate: 'truncate',
      roleSize: 'text-[9px] md:text-[10px]',
      roleColor: 'text-slate-500',
      roleTruncate: 'truncate',
      contactLink: 'text-[10px] md:text-xs text-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors block text-center py-2 bg-white/5 rounded-lg md:rounded-xl',
      contactPrefix: 'Contact',
    },
    members: [
      { name: 'Sarah Jenkins', role: 'Account Manager', contact: 'sarah@agency.com' },
      { name: 'Michael Chen',  role: 'Project Lead',    contact: 'michael@agency.com' },
    ],
  },

  // --- Help CTA card ---
  help: {
    padding: 'p-5 md:p-8',
    radius: 'rounded-2xl md:rounded-3xl',
    bg: 'bg-[var(--color-primary)]/10',
    border: 'border border-[var(--color-primary)]/20',
    title: 'Need Help?',
    titleWeight: 'font-semibold',
    titleGap: 'mb-2',
    titleSize: 'text-sm md:text-base',
    body: 'Our support team is available 24/7 to assist you with onboarding.',
    bodySize: 'text-xs md:text-sm',
    bodyColor: 'text-slate-400',
    bodyGap: 'mb-4',
    button: {
      width: 'w-full',
      paddingY: 'py-2.5 md:py-3',
      bg: 'bg-[var(--color-primary)]',
      bgHover: 'hover:brightness-110',
      radius: 'rounded-xl md:rounded-2xl',
      fontSize: 'text-xs md:text-sm',
      fontWeight: 'font-bold',
      transition: 'transition-all',
      label: 'Contact Support',
    },
  },

};

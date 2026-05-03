// ============================================================
// DevDashboardView — UI Variables
// Every string, colour, size and text label lives here.
// Feeds up to: views/ui.config.ts → uiMaster.ts
// ============================================================

import { Code2 } from 'lucide-react';

export const devDashboardUI = {

  // --- Page wrapper ---
  page: {
    motionKey: 'dev-dashboard',
    animation: { initial: { opacity: 0, scale: 0.98 }, animate: { opacity: 1, scale: 1 } },
    padding: 'p-4 md:p-6 lg:p-10',
    maxWidth: 'max-w-6xl mx-auto w-full',
  },

  // --- Header ---
  header: {
    layout: 'flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6',
    gap: 'mb-8 md:mb-10',
    title: 'Development Dashboard',
    titleSize: 'text-2xl md:text-3xl',
    titleWeight: 'font-semibold',
    titleGap: 'mb-1 md:mb-2',
    subtitle: 'Tracking the build and implementation of your project.',
    subtitleSize: 'text-xs md:text-sm lg:text-base',
    subtitleColor: 'text-slate-500',
  },

  // --- Phase badge ---
  phaseBadge: {
    layout: 'flex items-center gap-2',
    textColor: 'text-emerald-400',
    fontWeight: 'font-medium',
    bg: 'bg-emerald-400/10',
    paddingX: 'px-3 md:px-4',
    paddingY: 'py-1.5 md:py-2',
    radius: 'rounded-xl',
    border: 'border border-emerald-400/20',
    alignment: 'self-start md:self-auto',
    fontSize: 'text-xs md:text-sm lg:text-base',
    iconSize: 'w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5',
    icon: Code2,
    label: 'Build Phase',
  },

  // --- Content grid ---
  contentGrid: {
    layout: 'grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8',
    mainCol: 'lg:col-span-2 space-y-6 md:space-y-8',
    sideCol: 'space-y-6 md:space-y-8',
  },

  // --- Build progress card ---
  buildProgress: {
    padding: 'p-4 md:p-6 lg:p-8',
    radius: 'rounded-2xl md:rounded-3xl',
    headerLayout: 'flex items-center justify-between',
    headerGap: 'mb-5 md:mb-8',
    title: 'Build Progress',
    titleSize: 'text-lg md:text-xl',
    titleWeight: 'font-medium',
    // Status badge
    statusBadge: {
      padding: 'px-2 md:px-2.5 py-0.5 md:py-1',
      bg: 'bg-emerald-500/20',
      textColor: 'text-emerald-400',
      fontSize: 'text-[8px] md:text-[9px] lg:text-[10px]',
      fontWeight: 'font-bold',
      radius: 'rounded-full',
      transform: 'uppercase',
      tracking: 'tracking-widest',
      label: 'On Track',
    },
    contentSpacing: 'space-y-6 md:space-y-8',
    // Overall progress bar
    overallProgress: {
      wrapper: 'relative pt-1',
      labelRow: 'flex mb-2 items-center justify-between',
      labelBg: 'text-[9px] md:text-[10px] lg:text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-emerald-600 bg-emerald-200',
      labelText: 'Overall Completion',
      valueFontSize: 'text-[9px] md:text-[10px] lg:text-xs',
      valueFontWeight: 'font-semibold',
      valueColor: 'text-emerald-600',
      trackBg: 'overflow-hidden h-1.5 md:h-2 lg:h-3 mb-4 text-xs flex rounded-full bg-emerald-200/20',
      fillBg: 'shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-500 transition-all duration-1000',
      percentage: 75,
    },
    // Task grid
    taskGrid: 'grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4',
    task: {
      layout: 'flex items-center gap-2 md:gap-3',
      padding: 'p-3 md:p-4',
      bg: 'bg-white/5',
      radius: 'rounded-xl md:rounded-2xl',
      border: 'border border-white/5',
      dotSize: 'w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5',
      dotRadius: 'rounded-full',
      dotFlex: 'flex-shrink-0 flex items-center justify-center',
      iconSize: 'w-2 md:w-2.5 lg:w-3 md:h-2.5 lg:h-3',
      labelSize: 'text-[11px] md:text-xs lg:text-sm truncate',
      // Per-status dot styles
      statusDot: {
        completed:   { bg: 'bg-emerald-500', textColor: 'text-white', extra: '' },
        'in-progress': { bg: 'bg-[var(--color-primary)]',  textColor: 'text-white', extra: 'animate-pulse' },
        pending:     { bg: 'bg-slate-800',    textColor: 'text-slate-600', extra: '' },
      },
      statusLabel: {
        pending: 'text-slate-500',
        default: 'text-slate-200',
      },
    },
    tasks: [
      { label: 'Frontend Architecture',    status: 'completed'   },
      { label: 'Backend API Integration',  status: 'completed'   },
      { label: 'Database Schema',          status: 'completed'   },
      { label: 'User Authentication',      status: 'completed'   },
      { label: 'Real-time Sync',           status: 'in-progress' },
      { label: 'Performance Optimization', status: 'pending'     },
      { label: 'Security Audit',           status: 'pending'     },
      { label: 'Final QA Testing',         status: 'pending'     },
    ],
  },

  // --- Staging environment card ---
  staging: {
    padding: 'p-4 md:p-6 lg:p-8',
    radius: 'rounded-2xl md:rounded-3xl',
    title: 'Staging Environment',
    titleSize: 'text-lg md:text-xl',
    titleWeight: 'font-medium',
    titleGap: 'mb-4 md:mb-6',
    box: {
      padding: 'p-4 md:p-6',
      bg: 'bg-[var(--color-primary)]/10',
      radius: 'rounded-xl md:rounded-2xl',
      border: 'border border-[var(--color-primary)]/20',
      layout: 'flex flex-col sm:flex-row sm:items-center justify-between gap-4',
    },
    buildLabel: 'Current Staging Build: v2.4.0-beta',
    buildLabelSize: 'font-medium mb-1 text-sm md:text-base truncate',
    deployedAt: 'Last deployed: Today at 2:45 PM',
    deployedAtStyle: 'text-[9px] md:text-[10px] lg:text-xs text-slate-500',
    openBtn: {
      padding: 'px-4 md:px-6 py-2 md:py-2.5 lg:py-3',
      bg: 'bg-[var(--color-primary)]',
      bgHover: 'hover:brightness-110',
      radius: 'rounded-xl',
      fontSize: 'text-xs md:text-sm',
      fontWeight: 'font-medium',
      transition: 'transition-all',
      layout: 'flex items-center justify-center gap-2 shrink-0',
      iconSize: 'w-3 md:w-3.5 lg:w-4 md:h-3.5 lg:h-4',
      label: 'Open Staging',
    },
  },

  // --- Tech stack card ---
  techStack: {
    padding: 'p-4 md:p-6 lg:p-8',
    radius: 'rounded-2xl md:rounded-3xl',
    title: 'Tech Stack',
    titleSize: 'text-base md:text-lg',
    titleWeight: 'font-medium',
    titleGap: 'mb-4 md:mb-6',
    listSpacing: 'space-y-2 md:space-y-4',
    row: {
      layout: 'flex justify-between items-center',
      padding: 'py-1.5 md:py-2',
      border: 'border-b border-white/5 last:border-0',
      labelSize: 'text-[9px] md:text-[10px] lg:text-xs',
      labelColor: 'text-slate-500',
      valueSize: 'text-[9px] md:text-[10px] lg:text-xs',
      valueWeight: 'font-medium',
      valueColor: 'text-slate-200',
    },
    items: [
      { label: 'Frontend',  value: 'React + Vite'       },
      { label: 'Styling',   value: 'Tailwind CSS'       },
      { label: 'Backend',   value: 'Node.js + Express'  },
      { label: 'Database',  value: 'PostgreSQL'         },
      { label: 'Real-time', value: 'WebSockets'         },
    ],
  },

};

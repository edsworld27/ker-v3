// ============================================================
// DataHubView — UI Variables
// Feeds up to: views/ui.config.ts → uiMaster.ts
// ============================================================

import { Globe, Users, FileText } from 'lucide-react';

export const dataHubViewUI = {

  // --- Page wrapper ---
  page: {
    motionKey: 'data-hub',
    animation: { initial: { opacity: 0, scale: 0.98 }, animate: { opacity: 1, scale: 1 } },
    padding: 'p-4 md:p-6 lg:p-10',
    maxWidth: 'max-w-6xl mx-auto w-full',
  },

  // --- Header ---
  header: {
    layout: 'flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6',
    gap: 'mb-8 md:mb-10',
    title: 'Data Hub',
    titleSize: 'text-2xl md:text-3xl',
    titleWeight: 'font-semibold',
    titleGap: 'mb-1 md:mb-2',
    subtitle: 'All information we know about your company, transparently shared.',
    subtitleSize: 'text-xs md:text-sm lg:text-base',
    subtitleColor: 'text-slate-500',
    backBtn: {
      layout: 'flex items-center gap-2',
      textColor: 'text-slate-500',
      textColorHover: 'hover:text-white',
      transition: 'transition-colors',
      fontSize: 'text-xs md:text-sm',
      alignment: 'self-start md:self-auto',
      iconSize: 'w-3.5 h-3.5 md:w-4 md:h-4',
      label: 'Back',
      target: 'dashboard',
    },
  },

  // --- Content grid ---
  contentGrid: {
    layout: 'grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8',
    mainCol: 'lg:col-span-2 space-y-6 md:space-y-8',
    sideCol: 'space-y-6 md:space-y-8',
  },

  // --- Discovery info card ---
  discovery: {
    padding: 'p-4 md:p-6 lg:p-8',
    radius: 'rounded-2xl md:rounded-3xl',
    titleLayout: 'text-lg md:text-xl font-medium mb-4 md:mb-6 flex items-center gap-3',
    titleIcon: Globe,
    titleIconSize: 'w-4 h-4 md:w-5 md:h-5',
    titleIconColor: 'text-[var(--color-primary)]',
    title: 'Discovery Information',
    grid: 'grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6',
    cell: {
      padding: 'p-3 md:p-4',
      bg: 'bg-white/5',
      radius: 'rounded-xl md:rounded-2xl',
      labelSize: 'text-[8px] md:text-[9px] lg:text-[10px]',
      labelTransform: 'uppercase',
      labelTracking: 'tracking-widest',
      labelWeight: 'font-bold',
      labelColor: 'text-slate-500',
      labelGap: 'mb-1',
      valueSize: 'text-xs md:text-sm',
      valueTruncate: 'truncate',
    },
    fields: [
      { label: 'Origin',       value: 'Referral from Partner Network',         span: false },
      { label: 'Primary Goal', value: 'Digital Transformation & Scalability',  span: false },
    ],
    challenges: {
      label: 'Key Challenges',
      span: 'sm:col-span-2',
      listStyle: 'list-disc list-inside text-xs md:text-sm space-y-1 text-slate-300',
      items: [
        'Legacy systems hindering growth',
        'Inconsistent brand identity across platforms',
        'Lack of centralized data management',
      ],
    },
  },

  // --- Stakeholders card ---
  stakeholders: {
    padding: 'p-4 md:p-6 lg:p-8',
    radius: 'rounded-2xl md:rounded-3xl',
    titleLayout: 'text-lg md:text-xl font-medium mb-4 md:mb-6 flex items-center gap-3',
    titleIcon: Users,
    titleIconSize: 'w-4 h-4 md:w-5 md:h-5',
    titleIconColor: 'text-[var(--color-primary)]',
    title: 'Stakeholder Map',
    listSpacing: 'space-y-3 md:space-y-4',
    row: {
      layout: 'flex flex-col sm:flex-row sm:items-center justify-between',
      padding: 'p-3 md:p-4',
      bg: 'bg-white/5',
      radius: 'rounded-xl md:rounded-2xl',
      border: 'border border-white/5',
      gap: 'gap-3',
      nameSize: 'font-medium text-sm md:text-base truncate',
      roleSize: 'text-[9px] md:text-[10px] lg:text-xs text-slate-500 truncate',
      metricsLayout: 'flex gap-4 text-[9px] md:text-[10px] lg:text-xs shrink-0',
      metricLabel: 'text-slate-500',
      highColor: 'text-emerald-400',
      medColor: 'text-amber-400',
    },
    people: [
      { name: 'Sarah Jenkins',    role: 'CEO',             influence: 'High',   interest: 'High'   },
      { name: 'David Chen',       role: 'CTO',             influence: 'High',   interest: 'Medium' },
      { name: 'Emily Rodriguez',  role: 'Marketing Dir.',  influence: 'Medium', interest: 'High'   },
    ],
  },

  // --- Shared documents card ---
  documents: {
    padding: 'p-4 md:p-6 lg:p-8',
    radius: 'rounded-2xl md:rounded-3xl',
    titleLayout: 'text-base md:text-lg font-medium mb-4 md:mb-6 flex items-center gap-3',
    titleIcon: FileText,
    titleIconSize: 'w-4 h-4 md:w-5 md:h-5',
    titleIconColor: 'text-[var(--color-primary)]',
    title: 'Shared Documents',
    listSpacing: 'space-y-2 md:space-y-3',
    row: {
      layout: 'flex items-center justify-between',
      padding: 'p-2.5 md:p-3',
      bg: 'bg-white/5',
      radius: 'rounded-xl',
      border: 'border border-white/5',
      borderHover: 'hover:border-[var(--color-primary)]/30',
      transition: 'transition-all cursor-pointer group',
      iconLayout: 'flex items-center gap-2 md:gap-3 min-w-0',
      iconSize: 'w-3.5 h-3.5 md:w-4 md:h-4',
      iconColor: 'text-slate-500 group-hover:text-[var(--color-primary)] transition-colors shrink-0',
      nameSize: 'text-[10px] md:text-[11px] lg:text-xs',
      nameColor: 'text-slate-400 group-hover:text-slate-200 transition-colors truncate',
      downloadIconSize: 'w-3 md:w-3.5 lg:w-4 md:h-3.5 lg:h-4',
      downloadColor: 'text-slate-500 group-hover:text-white transition-colors shrink-0',
    },
    files: [
      'Initial_Brief.pdf',
      'Brand_Guidelines_v2.pdf',
      'Q3_Financials_Summary.xlsx',
      'Competitor_Analysis.docx',
    ],
  },

  // --- Transparency CTA card ---
  transparency: {
    padding: 'p-5 md:p-8',
    radius: 'rounded-2xl md:rounded-3xl',
    bg: 'bg-[var(--color-primary)]/10',
    border: 'border border-[var(--color-primary)]/20',
    title: 'Transparency First',
    titleWeight: 'font-semibold',
    titleGap: 'mb-2',
    titleSize: 'text-sm md:text-base',
    body: 'We believe in absolute transparency. All data we collect and documents we share are available here for your review at any time.',
    bodySize: 'text-xs md:text-sm',
    bodyColor: 'text-slate-400',
    bodyLeading: 'leading-relaxed',
  },

};

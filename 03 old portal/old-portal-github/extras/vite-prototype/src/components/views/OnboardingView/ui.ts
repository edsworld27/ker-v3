// ============================================================
// OnboardingView — UI Variables
// Feeds up to: views/ui.config.ts → uiMaster.ts
// ============================================================

import { Compass, Upload } from 'lucide-react';

export const onboardingViewUI = {

  // --- Page wrapper ---
  page: {
    motionKey: 'onboarding',
    animation: { initial: { opacity: 0, scale: 0.98 }, animate: { opacity: 1, scale: 1 } },
    padding: 'p-4 md:p-10',
    maxWidth: 'max-w-4xl mx-auto w-full',
  },

  // --- Header ---
  header: {
    layout: 'flex flex-col md:flex-row md:items-center justify-between gap-6',
    gap: 'mb-8 md:mb-10',
    title: 'Client Discovery',
    titleSize: 'text-2xl md:text-3xl',
    titleWeight: 'font-semibold',
    titleGap: 'mb-2',
    subtitle: 'Tell us more about your project so we can build the perfect solution.',
    subtitleSize: 'text-sm md:text-base',
    subtitleColor: 'text-slate-500',
  },

  // --- Phase badge ---
  phaseBadge: {
    layout: 'flex items-center gap-2',
    textColor: '', // Handled by inline styles now
    fontWeight: 'font-medium',
    alignment: 'self-start md:self-auto',
    fontSize: 'text-sm md:text-base',
    iconSize: 'w-4 h-4 md:w-5 md:h-5',
    icon: Compass,
    label: 'Onboarding Phase',
  },

  // --- Content spacing ---
  content: {
    spacing: 'space-y-6 md:space-y-8',
  },

  // --- Questionnaire card ---
  questionnaire: {
    padding: 'p-5 md:p-8',
    radius: 'rounded-2xl md:rounded-3xl',
    title: 'Discovery Questionnaire',
    titleSize: 'text-lg md:text-xl',
    titleWeight: 'font-medium',
    titleGap: 'mb-5 md:mb-6',
    formSpacing: 'space-y-5 md:space-y-6',
    question: {
      spacing: 'space-y-2',
      labelSize: 'text-xs md:text-sm',
      labelWeight: 'font-medium',
      labelColor: 'text-slate-300',
      textarea: 'w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-3 md:p-4 text-xs md:text-sm outline-none transition-colors min-h-[80px] md:min-h-[100px]',
      placeholder: 'Type your answer here...',
    },
    // The actual questions
    questions: [
      { id: 'q1', q: 'What is the primary goal of your new website?' },
      { id: 'q2', q: 'Who is your target audience?' },
      { id: 'q3', q: 'Are there any specific websites you admire for their design or functionality?' },
      { id: 'q4', q: 'What are the core features you need (e.g., e-commerce, blog, booking)?' },
    ],
    // Save button
    saveButton: {
      wrapperLayout: 'mt-6 md:mt-8 flex justify-end',
      width: 'w-full sm:w-auto',
      paddingX: 'px-8',
      paddingY: 'py-2.5 md:py-3',
      bg: '', // Handled by inline styles now
      bgHover: '', // Handled by inline styles now
      radius: 'rounded-xl md:rounded-2xl',
      fontSize: 'text-sm',
      fontWeight: 'font-semibold',
      transition: 'transition-all',
      shadow: 'shadow-lg',
      label: 'Save Progress',
    },
  },

  // --- Resource upload card ---
  upload: {
    padding: 'p-5 md:p-8',
    radius: 'rounded-2xl md:rounded-3xl',
    titleLayout: 'text-lg md:text-xl font-medium mb-5 md:mb-6 flex items-center gap-3',
    titleIcon: Upload,
    titleIconSize: 'w-5 h-5',
    titleIconColor: '', // Handled by inline styles now
    title: 'Resource Upload',
    subtitle: 'Upload logos, brand guidelines, or any other assets we should use.',
    subtitleSize: 'text-xs md:text-sm',
    subtitleColor: 'text-slate-500',
    subtitleGap: 'mb-5 md:mb-6',
    // Drop zone
    dropZone: {
      border: 'border-2 border-dashed border-white/10',
      radius: 'rounded-2xl md:rounded-3xl',
      padding: 'p-8 md:p-12',
      layout: 'text-center',
      borderHover: '', // Hover handled via css var in component
      transition: 'transition-all',
      cursor: 'cursor-pointer',
      group: 'group',
      iconWrapper: 'w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform',
      iconSize: 'w-6 h-6 md:w-8 md:h-8',
      iconColor: '', // Handled by inline styles now
      label: 'Click or drag to upload',
      labelSize: 'font-medium mb-1 text-sm md:text-base',
      hint: 'Support for PDF, PNG, JPG, SVG (Max 20MB)',
      hintSize: 'text-[10px] md:text-xs',
      hintColor: 'text-slate-500',
    },
    // Uploaded file row
    fileList: {
      spacing: 'mt-6 md:mt-8 space-y-2 md:space-y-3',
      row: {
        layout: 'flex items-center justify-between',
        padding: 'p-3 md:p-4',
        bg: 'bg-white/5',
        radius: 'rounded-xl md:rounded-2xl',
        iconLayout: 'flex items-center gap-3',
        iconSize: 'w-4 h-4',
        iconColor: 'text-slate-400',
        nameSize: 'text-xs md:text-sm truncate max-w-[150px] sm:max-w-none',
        removeBtn: 'text-[10px] md:text-xs text-red-400 hover:text-red-300 transition-colors',
        removeLabel: 'Remove',
      },
    },
  },

};

import { Sparkles } from 'lucide-react';

export const agencySetupViewUI = {
  card: {
    base: 'w-full max-w-4xl glass-card rounded-[2.5rem] p-12 overflow-hidden shadow-2xl border border-white/10 mx-auto mt-10',
    animation: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
    },
  },
  inner: 'flex flex-col h-full',
  header: {
    base: 'flex items-center justify-between mb-12',
    logoRow: 'flex items-center gap-4',
    logoContainer: 'w-12 h-12 rounded-2xl bg-[var(--color-primary)] flex items-center justify-center shadow-lg shadow-[var(--color-primary)]/30',
    logoIcon: Sparkles,
    logoIconSize: 'w-7 h-7 text-white',
    titleStyle: 'text-2xl font-bold tracking-tight',
    stepStyle: 'text-slate-500 text-sm font-medium',
  },
  text: {
    mainTitle: 'Agency Configuration',
    stepOf: (step: number) => `Step ${step} of 3`,
    step1Title: 'Identity & Spirit',
    step1Subtitle: "Let's give your agency a name and a face.",
    agencyNameLabel: 'Agency Name',
    agencyNamePlaceholder: 'e.g. Acme Digital HQ',
    backButton: 'Back',
    continueButton: 'Continue',
    deployButton: 'Deploy Agency Environment',
  },
  scrollArea: 'flex-1 overflow-y-auto pr-4 custom-scrollbar',
  step1: {
    base: 'space-y-8',
    titleStyle: 'text-4xl font-bold mb-3 tracking-tight',
    subtitleStyle: 'text-slate-400 text-lg',
    formGroup: 'space-y-4',
    label: 'text-[10px] uppercase tracking-widest font-bold text-slate-500 ml-1',
    input: 'w-full px-4 py-5 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-[var(--color-primary)] transition-all text-white text-xl font-semibold',
  },
  footer: {
    base: 'mt-12 flex gap-5',
    backButton: 'px-10 py-5 bg-white/5 hover:bg-white/10 rounded-2xl font-bold text-slate-400 transition-all',
    continueButton: 'flex-1 py-5 bg-[var(--color-primary)] hover:brightness-110 text-white font-bold rounded-2xl transition-all',
  },
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const globalSettingsViewUI = {
  page: {
    motionKey: 'global-settings',
    animation: { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 } },
    layout: 'h-full w-full p-4 md:p-6 lg:p-10 overflow-y-auto custom-scrollbar',
    maxWidth: 'max-w-4xl mx-auto w-full',
  },
  header: {
    container: 'mb-8 md:mb-12',
    title: 'Global System Settings',
    titleStyle: 'text-2xl md:text-3xl font-semibold mb-2 tracking-tight',
    subtitle: 'Platform-wide configurations and agency branding.',
    subtitleStyle: 'text-sm md:text-base text-slate-400',
  },
  sections: {
    container: 'space-y-6 md:space-y-8',
    card: 'glass-card p-5 md:p-8 rounded-2xl md:rounded-[32px] space-y-6 border border-white/5 shadow-xl',
    titleStyle: 'text-base md:text-lg font-bold flex items-center gap-2',
    dotBase: 'w-1.5 h-1.5 rounded-full',
    grid: 'grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8',
    field: {
      container: 'space-y-3',
      label: 'text-[10px] uppercase font-bold text-slate-500 tracking-widest ml-1',
      input: 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all font-medium text-sm md:text-base text-white shadow-inner',
    },
    colorPicker: {
      container: 'flex flex-wrap gap-3 md:gap-4',
      swatch: 'w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl cursor-pointer border-2 shadow-lg transition-transform hover:scale-110',
      activeSwatch: 'border-white ring-4 ring-[var(--color-primary)]/20',
      inactiveSwatch: 'border-transparent',
    },
    toggle: {
      container: 'flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white/[0.02] rounded-2xl md:rounded-3xl border border-white/5 gap-4 hover:bg-white/[0.04] transition-colors group',
      disabledContainer: 'flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white/[0.02] rounded-2xl md:rounded-3xl border border-white/5 opacity-50 gap-4 group',
      title: 'font-bold text-sm md:text-base group-hover:text-[var(--color-primary)] transition-colors',
      disabledTitle: 'font-bold text-sm md:text-base',
      subtitle: 'text-[10px] md:text-xs text-slate-500 font-medium',
      switchBase: 'w-12 h-6 md:w-14 md:h-7 rounded-full relative shrink-0 shadow-inner',
      switchOn: 'bg-[var(--color-primary)] cursor-pointer',
      switchOff: 'bg-slate-700 cursor-not-allowed',
      knob: 'absolute top-1 w-4 h-4 md:w-5 md:h-5 bg-white rounded-full shadow-md',
      knobOn: 'right-1',
      knobOff: 'left-1',
    }
  }
};

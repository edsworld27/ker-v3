
export const portalUI = {
  page: {
    padding: 'p-10',
    maxWidth: 'max-w-[1600px] mx-auto',
    motionKey: 'portal-matrix-v10',
    animation: {
      initial: { opacity: 0, scale: 0.99 },
      animate: { opacity: 1, scale: 1 }
    }
  },
  impersonationBanner: {
    layout: 'premium-glass p-8 border-l-4 border-indigo-500 flex items-center justify-between glow-primary bg-gradient-to-r from-indigo-500/10 to-transparent rounded-[2.5rem] mb-12',
    bg: 'bg-indigo-500/10',
    padding: 'p-8',
    radius: 'rounded-[2.5rem]',
    border: 'border-white/5',
    textColor: 'text-white',
    shadow: 'shadow-2xl',
    iconSize: 'w-8 h-8 mr-4',
    button: 'px-10 py-4 rounded-2xl bg-indigo-600 text-white font-black text-[11px] uppercase tracking-[0.2em] italic hover:bg-indigo-500 transition-all shadow-2xl glow-primary border border-indigo-400/30'
  },
  phaseTracker: {
    layout: 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-12',
    item: {
      layout: 'premium-glass p-6 transition-all duration-500 relative group overflow-hidden border border-white/5 rounded-3xl',
      activeBg: 'glow-primary ring-1 ring-indigo-500/30 bg-gradient-to-br from-indigo-500/20 to-transparent',
      inactiveBg: 'bg-white/[0.02] opacity-40 grayscale',
      iconSize: 'w-6 h-6',
      labelSize: 'text-[11px] font-black uppercase tracking-widest text-white italic',
      statusSize: 'text-[9px] font-black text-dim uppercase tracking-[0.2em] mt-2 italic'
    }
  },
  stats: {
    grid: 'grid grid-cols-1 md:grid-cols-3 gap-10 mb-12',
    card: 'premium-card p-10 group relative overflow-hidden border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent hover:border-indigo-500/20 transition-all rounded-[2.5rem]',
    label: 'text-[11px] font-black uppercase tracking-[0.4em] text-dim group-hover:text-indigo-400 transition-colors italic',
    value: 'text-7xl font-black text-white italic tracking-tighter glow-text',
    trend: 'px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black flex items-center gap-3 uppercase tracking-widest italic glow-success'
  },
  onboarding: {
    titleSize: 'text-xl font-black text-white italic tracking-tighter uppercase mb-8',
    list: 'space-y-4',
    row: {
      layout: 'flex items-center justify-between p-6 rounded-[2.5rem] bg-white/[0.03] border border-white/5 hover:bg-white/5 hover:border-indigo-500/20 transition-all cursor-pointer group/row relative overflow-hidden',
      iconSize: 'w-6 h-6 mr-6',
      labelSize: 'font-black text-white text-[13px] uppercase italic tracking-tight group-hover/row:text-indigo-400 transition-colors',
      badge: 'px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] italic border transition-all shadow-sm'
    }
  },
  contact: {
    card: 'premium-glass p-0 border border-white/5 bg-gradient-to-b from-indigo-500/10 to-transparent relative overflow-hidden rounded-[3rem] shadow-2xl group/uplink',
    title: 'text-xl font-black text-white uppercase italic tracking-tighter mb-4',
    button: 'w-full py-5 rounded-2xl bg-indigo-600 text-white font-black text-[11px] uppercase tracking-[0.2em] italic shadow-2xl hover:bg-indigo-500 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 glow-primary border border-indigo-400/30'
  }
};

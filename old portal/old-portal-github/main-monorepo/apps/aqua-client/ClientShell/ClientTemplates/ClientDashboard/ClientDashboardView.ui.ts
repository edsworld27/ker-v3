export const ClientDashboardUI = {
  layout: "p-10 flex flex-col gap-10 w-full max-w-[1700px] mx-auto overflow-hidden animate-in fade-in duration-700",
  header: {
    container: "flex flex-col xl:flex-row xl:items-center justify-between gap-10",
    avatar: "w-20 h-20 rounded-[2.5rem] flex items-center justify-center text-white font-black text-2xl shrink-0 shadow-2xl relative z-10",
    title: "text-5xl font-black tracking-tighter text-white uppercase italic leading-none",
    stagePill: "flex items-center gap-3 bg-indigo-500/10 px-4 py-1.5 rounded-full border border-indigo-500/20",
    subtitle: "text-xs font-black text-dim uppercase tracking-widest italic"
  },
  stats: {
    grid: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8",
    card: "premium-card p-6 flex flex-col group relative overflow-hidden border border-white/5 bg-black/20",
    iconBox: "w-12 h-12 rounded-2xl flex items-center justify-center transition-all bg-white/5 border border-white/5 group-hover:glow-primary",
    value: "text-3xl font-black text-white italic tracking-tighter leading-none mb-2",
    label: "text-[10px] font-black text-dim uppercase tracking-widest italic"
  },
  matrix: {
    wrapper: "premium-card p-10 relative overflow-hidden border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent",
    title: "text-2xl font-black text-white italic tracking-tighter uppercase leading-none",
    track: "relative h-4 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[2px]",
    fill: "h-full rounded-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-emerald-400 relative"
  },
  stream: {
    container: "grid grid-cols-1 lg:grid-cols-3 gap-10",
    mainCol: "lg:col-span-2 flex flex-col gap-10",
    card: "premium-card p-10 border border-white/5 bg-black/20",
    item: "flex items-center justify-between p-6 rounded-2xl bg-white/[0.02] border border-white/5 group hover:border-indigo-500/20 transition-all font-black"
  },
  sidebar: {
    container: "flex flex-col gap-10",
    card: "premium-card p-8 border border-white/5 bg-black/20",
    title: "text-xl font-black text-white italic tracking-tighter uppercase leading-none flex items-center gap-4"
  },
  footer: {
    container: "mt-10 p-10 border-t border-white/5 bg-black/20 backdrop-blur-3xl rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-10",
    tag: "text-[9px] font-black text-white uppercase tracking-widest italic"
  }
};

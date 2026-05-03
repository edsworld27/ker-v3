export const FulfillmentUI = {
  layout: "flex flex-col h-full bg-[var(--client-widget-bg-color-1)] text-[var(--client-widget-text)] p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700",
  header: {
    container: "flex flex-col md:flex-row md:items-center justify-between gap-6",
    iconBox: "w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center border border-white/10 shadow-2xl shadow-amber-500/20 ring-1 ring-white/10",
    title: "text-3xl font-black tracking-tight bg-gradient-to-r from-[var(--client-widget-text)] to-[var(--client-widget-text-muted)] bg-clip-text text-transparent",
    subtitle: "text-[12px] text-[var(--client-widget-text-muted)] uppercase tracking-[0.2em] font-bold mt-1 opacity-70"
  },
  statCard: {
    wrapper: "glass-card p-6 rounded-3xl border border-[var(--client-widget-border)] bg-[var(--client-widget-surface-1-glass)] shadow-xl relative overflow-hidden group hover:border-amber-500/30 transition-all",
    iconBox: "p-2 rounded-xl bg-white/5 border border-white/5",
    status: "text-[9px] font-black uppercase tracking-widest opacity-80 shadow-[0_0_10px_currentColor]/20",
    label: "text-[9px] font-black text-[var(--client-widget-text-muted)] uppercase tracking-widest opacity-40 mb-1",
    value: "text-2xl font-black text-white font-mono tracking-tighter"
  },
  queueCard: {
    wrapper: "lg:col-span-2 p-8 rounded-[var(--radius-card)] border border-[var(--client-widget-border)] bg-[var(--client-widget-surface-1-glass)] backdrop-blur-3xl shadow-2xl relative overflow-hidden group",
    item: "group/item relative p-6 rounded-3xl bg-black/40 border border-white/5 hover:border-amber-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6",
    avatar: "w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center font-black text-[18px] shadow-lg",
    statusBadge: "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border"
  },
  pipelineCard: {
    wrapper: "p-8 rounded-[var(--radius-card)] border border-[var(--client-widget-border)] bg-[var(--client-widget-surface-1-glass)] backdrop-blur-3xl shadow-2xl relative overflow-hidden group hover:border-blue-500/30 transition-all cursor-pointer",
    row: "space-y-6",
    track: "h-1 bg-white/5 rounded-full overflow-hidden"
  }
};

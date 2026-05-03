import { Activity } from 'lucide-react';

export const globalActivityUI = {
  motion: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
  },
  container: "h-full w-full p-4 md:p-6 lg:p-10 overflow-y-auto custom-scrollbar",
  wrapper: "max-w-5xl mx-auto w-full",
  header: {
    container: "mb-8 md:mb-12",
    title: "text-2xl md:text-3xl font-semibold mb-2 tracking-tight",
    subtitle: "text-sm md:text-base text-slate-400",
  },
  card: {
    container: "glass-card rounded-2xl md:rounded-[32px] overflow-hidden border border-white/5 shadow-2xl",
    header: "p-4 md:p-8 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/[0.01]",
    stream: {
      container: "flex items-center gap-3",
      indicator: "w-2 h-2 rounded-full bg-emerald-500 animate-pulse",
      label: "text-sm font-medium",
    },
    liveUpdates: {
      container: "flex gap-2",
      badge: "px-3 py-1 bg-white/5 rounded-full text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest border border-white/5",
    },
  },
  logList: {
    container: "divide-y divide-white/5",
    logItem: {
      container: "p-4 md:p-6 flex items-start md:items-center gap-4 md:gap-6 hover:bg-white/[0.02] transition-all group",
      iconContainer: "w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-inner",
      icon: Activity,
      iconClass: "w-5 h-5 md:w-6 md:h-6",
      content: "flex-1 min-w-0",
      header: "flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5",
      userName: "font-bold text-xs md:text-base truncate group-hover:text-[var(--color-primary)] transition-colors",
      timestamp: "text-[9px] md:text-xs text-slate-500 font-medium",
      details: {
        container: "flex flex-wrap items-center gap-2 md:gap-3",
        action: "text-[11px] md:text-sm text-slate-300 break-words line-clamp-2 md:line-clamp-none flex-1",
        separator: "hidden sm:block w-1 h-1 rounded-full bg-slate-600 shrink-0",
        module: "text-[8px] md:text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-widest bg-[var(--color-primary)]/10 px-2 py-0.5 rounded shrink-0",
      }
    }
  },
  text: {
    title: "Platform Activity Monitor",
    subtitle: "Real-time audit log of all events across the agency.",
    streamLabel: "Global Event Stream",
    liveUpdates: "Live Updates Enabled",
  },
};

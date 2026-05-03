import { Building2 } from 'lucide-react';

export const ui = {
  container: "p-4 md:p-8 min-h-screen",
  header: {
    title: "text-2xl md:text-5xl font-black text-white tracking-tighter mb-2",
    description: "text-slate-500 text-sm md:text-lg max-w-2xl font-medium",
  },
  grid: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-8",
  card: {
    container: "group relative flex flex-col bg-white/5 border border-white/10 rounded-2xl md:rounded-[2.5rem] p-4 md:p-10 transition-all hover:bg-white/10 hover:border-indigo-500/30 overflow-hidden",
    header: "flex items-start gap-4 md:gap-6 mb-6 md:mb-8",
    iconContainer: "w-12 h-12 md:w-20 md:h-20 bg-indigo-500/10 border border-indigo-500/20 rounded-xl md:rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform",
    icon: "w-6 h-6 md:w-10 md:h-10 text-indigo-400",
    title: "text-base md:text-2xl font-bold text-white mb-1 truncate",
  },
  stats: {
    container: "space-y-3 md:space-y-4 mb-6 md:mb-8",
    item: "flex items-center justify-between text-[11px] md:text-sm py-2",
    borderItem: "border-b border-white/5",
    label: "text-slate-500",
    value: "text-slate-300",
  },
  actions: {
    container: "flex flex-col sm:flex-row gap-2 md:gap-3 mt-auto",
    impersonateButton: "flex-1 py-3 md:py-4 bg-white/5 hover:bg-white/10 rounded-xl md:rounded-2xl font-bold transition-all flex items-center justify-center gap-2 text-xs md:text-base",
    impersonateIcon: Building2,
    impersonateIconClass: "w-4 h-4",
  },
  text: {
    title: "Partner Ecosystem",
    description: "Manage and collaborate with your decentralized agency partners.",
    viewWorkspace: "View Partner Workspace",
  },
};

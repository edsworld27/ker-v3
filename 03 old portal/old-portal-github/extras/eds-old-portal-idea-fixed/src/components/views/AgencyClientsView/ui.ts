import { PlusCircle, Building2, Edit2 } from 'lucide-react';

export const agencyClientsViewUI = {
  motion: {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1 },
  },
  container: "h-full w-full p-4 md:p-6 lg:p-10 overflow-y-auto custom-scrollbar",
  header: {
    container: "flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-10",
    textContainer: "",
    title: "text-2xl md:text-3xl font-semibold mb-2",
    description: "text-sm md:text-base text-slate-400",
    button: "w-full md:w-auto flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-4 font-bold rounded-xl md:rounded-2xl transition-all shadow-lg active:scale-[0.98] text-xs md:text-base",
    buttonIcon: PlusCircle,
    buttonIconClass: "w-4 h-4 md:w-5 md:h-5",
  },
  grid: "grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6",
  card: {
    container: "glass-card p-5 md:p-8 rounded-2xl md:rounded-[2.5rem] border border-white/5 hover:border-white/10 transition-all group flex flex-col",
    header: {
      container: "flex items-start justify-between mb-4 md:mb-6",
      info: "flex items-center gap-3 md:gap-4",
      iconContainer: "w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform",
      icon: Building2,
      iconClass: "w-6 h-6 md:w-8 md:h-8",
      textContainer: "min-w-0",
      title: "text-base md:text-xl font-semibold mb-1 truncate transition-colors",
      editButton: "p-2 hover:bg-white/10 rounded-full transition-colors",
      editIcon: Edit2,
      editIconClass: "w-4 h-4 text-slate-500",
    },
    stats: {
      container: "space-y-3 md:space-y-4 mb-6 md:mb-8",
      item: "flex items-center justify-between text-[11px] md:text-sm py-2",
      borderItem: "border-b border-white/5",
      label: "text-slate-500",
      value: "text-slate-300",
      email: "truncate ml-4",
    },
    actions: {
      container: "flex flex-col sm:flex-row gap-2 md:gap-3 mt-auto",
      impersonateButton: "flex-1 py-3 md:py-4 bg-white/5 hover:bg-white/10 rounded-xl md:rounded-2xl font-bold transition-all flex items-center justify-center gap-2 text-xs md:text-base",
      impersonateIcon: Building2,
      impersonateIconClass: "w-4 h-4",
    }
  },
  text: {
    title: "Agency Internal CRM",
    description: "View and impersonate clients to manage their workspaces and logs.",
    addButton: "Onboard Client",
    labelAccess: "Authorized Access",
    labelContact: "Contact",
    labelModules: "Modules",
    viewWorkspace: "View Workspace",
  },
};

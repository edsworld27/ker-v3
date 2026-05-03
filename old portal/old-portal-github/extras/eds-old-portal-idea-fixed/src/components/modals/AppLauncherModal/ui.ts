import { X, Briefcase, Globe, Building2, BookOpen, Database, CreditCard, LayoutGrid } from 'lucide-react';

const apps = [
  { id: 'crm', title: 'CRM Portal', description: 'Manage clients and sales pipeline.', icon: Briefcase, permission: 'workspaces', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { id: 'website', title: 'Website Editor', description: 'Build and maintain your online presence.', icon: Globe, permission: 'workspaces', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { id: 'discover', title: 'Company Discover', description: 'Explore your company structure and goals.', icon: Building2, permission: 'company', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { id: 'resources', title: 'Resources', description: 'Access training materials and brand assets.', icon: BookOpen, permission: 'company', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { id: 'data-hub', title: 'Data Hub', description: 'All information we know about your company.', icon: Database, permission: 'data-hub', color: 'text-rose-400', bg: 'bg-rose-500/10' },
  { id: 'your-plan', title: 'Your Plan', description: 'Manage your subscription and billing.', icon: CreditCard, permission: 'your-plan', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
];

export const appLauncherModalUI = {
  apps,
  overlay: "absolute inset-0 bg-black/60 backdrop-blur-sm",
  container: "fixed inset-0 z-50 flex items-center justify-center p-4",
  modal: {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 20 },
    className: "relative w-full max-w-4xl bg-slate-900 border border-white/10 rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto",
  },
  header: {
    container: "flex items-center justify-between p-4 md:p-6 border-b border-white/10 bg-black/20 sticky top-0 z-10 backdrop-blur-md",
    titleContainer: "flex items-center gap-3",
    iconContainer: "w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0",
    icon: LayoutGrid,
    iconClass: "w-4 h-4 md:w-5 md:h-5 text-indigo-400",
    textContainer: "div",
    title: "text-lg md:text-xl font-semibold text-white",
    subtitle: "text-xs md:text-sm text-slate-400",
    closeButton: {
      className: "p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors",
      icon: X,
      iconClass: "w-5 h-5",
    },
  },
  body: {
    container: "p-4 md:p-8",
    grid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6",
    card: {
      className: "p-4 md:p-6 bg-white/5 rounded-xl md:rounded-2xl border border-white/5 hover:border-indigo-500/50 hover:bg-white/10 transition-all text-left group flex flex-col items-start",
      iconContainer: "w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform shrink-0",
      iconClass: "w-5 h-5 md:w-6 md:h-6",
      title: "text-base md:text-lg font-medium text-white mb-1 md:mb-2",
      description: "text-xs md:text-sm text-slate-400 line-clamp-2",
    },
    empty: {
      container: "text-center py-12",
      icon: LayoutGrid,
      iconClass: "w-12 h-12 text-slate-600 mx-auto mb-4",
      title: "text-lg font-medium text-white mb-2",
      subtitle: "text-slate-400",
    },
  },
  text: {
    title: "App Launcher",
    subtitle: "Access your tools and workspaces",
    emptyTitle: "No Apps Available",
    emptySubtitle: "You don't have permission to access any apps yet.",
  }
};

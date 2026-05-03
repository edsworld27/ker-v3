import { ArrowLeft, Users, ExternalLink } from 'lucide-react';

export const crmViewUI = {
  motion: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  container: "h-full w-full p-6 md:p-10 flex flex-col",
  header: {
    container: "flex items-center justify-between mb-6",
    backButton: {
      className: "flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm",
      icon: ArrowLeft,
      iconClass: "w-4 h-4",
      text: "Back to Workspaces",
    },
  },
  card: {
    container: "flex-1 w-full rounded-3xl glass-card overflow-hidden flex flex-col",
    header: {
      container: "p-6 border-b border-white/5 flex items-center justify-between",
      titleContainer: "flex items-center gap-3",
      icon: Users,
      iconClass: "w-5 h-5 text-[var(--color-primary)]",
      title: "text-lg font-medium",
      status: "text-xs text-slate-500 uppercase tracking-widest",
    },
    body: {
      container: "flex-1 bg-black/40 flex items-center justify-center text-slate-500 italic",
      content: "text-center p-10",
      iconContainer: "relative w-24 h-24 mx-auto mb-8",
      iconBg: "absolute inset-0 bg-[var(--color-primary)]/20 rounded-full blur-2xl animate-pulse",
      icon: Users,
      iconClass: "relative w-full h-full text-[var(--color-primary)]/40",
      title: "text-xl font-medium text-white not-italic mb-2",
      description: "max-w-xs mx-auto mb-8",
      externalButton: {
        className: "px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-white transition-all flex items-center gap-2 mx-auto",
        icon: ExternalLink,
        iconClass: "w-4 h-4",
        text: "Open CRM External",
      },
    },
  },
  text: {
    title: "CRM Portal",
    status: "Secure Connection",
    interfaceTitle: "CRM Interface",
    description: "Your customer relationship management tools are being synchronized with the portal.",
  },
};

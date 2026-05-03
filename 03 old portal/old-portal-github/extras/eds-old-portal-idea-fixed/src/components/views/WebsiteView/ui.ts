import { ArrowLeft, Globe, FileText, BarChart3 } from 'lucide-react';

export const websiteViewUI = {
  motion: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  container: "h-full w-full p-6 md:p-10 overflow-y-auto custom-scrollbar flex flex-col",
  header: {
    container: "flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10",
    titleContainer: "flex items-center gap-4",
    backButton: {
      className: "w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all",
      icon: ArrowLeft,
      iconClass: "w-4 h-4",
    },
    titleIconContainer: "flex items-center gap-3",
    titleIcon: Globe,
    titleIconClass: "w-6 h-6 text-[var(--color-primary)]",
    title: "text-2xl md:text-3xl font-semibold tracking-tight",
    actionsContainer: "flex flex-col sm:flex-row gap-3",
    reportButton: {
      className: "w-full sm:w-auto px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2",
      icon: FileText,
      iconClass: "w-4 h-4",
      text: "Run a report",
    },
    analyticsButton: {
      className: "w-full sm:w-auto px-6 py-2.5 bg-[var(--color-primary)] hover:brightness-110 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2",
      icon: BarChart3,
      iconClass: "w-4 h-4",
      text: "Analytics dashboard",
    },
  },
  card: {
    container: "flex-1 rounded-3xl glass-card overflow-hidden flex flex-col",
    body: "flex-1 bg-black/40 flex items-center justify-center text-slate-500 italic",
    content: "text-center p-10",
    iconContainer: "relative w-24 h-24 mx-auto mb-8",
    iconBg: "absolute inset-0 bg-cyan-500/20 rounded-full blur-2xl animate-pulse",
    icon: Globe,
    iconClass: "relative w-full h-full text-cyan-400/40",
    title: "text-xl font-medium text-white not-italic mb-2",
    description: "max-w-xs mx-auto mb-8",
    buttonsContainer: "flex gap-4 justify-center",
    launchButton: {
      className: "px-6 py-3 bg-[var(--color-primary)] hover:brightness-110 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-[var(--color-primary)]/20",
      text: "Launch Editor",
    },
    backupButton: {
      className: "px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-white transition-all",
      text: "Download Backup",
    },
  },
  text: {
    title: "Website Editor",
    description: "The visual editor is preparing your workspace. This usually takes a few seconds.",
  },
};

import { AlertTriangle, X } from 'lucide-react';

const colors = {
  danger: 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/20',
  warning: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20',
  info: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
};

const iconColors = {
  danger: 'text-red-400 bg-red-400/10',
  warning: 'text-amber-400 bg-amber-400/10',
  info: 'text-indigo-400 bg-indigo-400/10'
};

export const confirmationModalUI = {
  colors,
  iconColors,
  overlay: "absolute inset-0 bg-black/60 backdrop-blur-sm",
  container: "fixed inset-0 z-[200] flex items-center justify-center p-6",
  modal: {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 20 },
    className: "relative w-full max-w-md glass-card rounded-2xl md:rounded-[2rem] p-6 md:p-8 overflow-hidden shadow-2xl border border-white/10",
  },
  header: {
    container: "flex items-start justify-between mb-4 md:mb-6",
    iconContainer: "p-2.5 md:p-3 rounded-xl md:rounded-2xl",
    icon: AlertTriangle,
    iconClass: "w-5 h-5 md:w-6 md:h-6",
    closeButton: {
      className: "p-2 hover:bg-white/5 rounded-xl transition-colors",
      icon: X,
      iconClass: "w-5 h-5 text-slate-500",
    },
  },
  body: {
    title: "text-lg md:text-xl font-semibold mb-2",
    message: "text-slate-400 text-xs md:text-sm leading-relaxed mb-6 md:mb-8",
  },
  footer: {
    container: "flex flex-col sm:flex-row gap-3",
    cancelButton: "w-full sm:flex-1 py-2.5 md:py-3 bg-white/5 hover:bg-white/10 rounded-xl font-medium transition-all text-sm md:text-base",
    confirmButton: "w-full sm:flex-1 py-2.5 md:py-3 rounded-xl font-semibold transition-all shadow-lg active:scale-[0.98] text-sm md:text-base",
  },
};

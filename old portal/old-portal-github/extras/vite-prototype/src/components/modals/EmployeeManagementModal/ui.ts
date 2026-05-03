import { UserPlus, Edit2, Trash2, X } from 'lucide-react';

export const employeeManagementModalUI = {
  overlay: "absolute inset-0 bg-black/60 backdrop-blur-sm",
  container: "fixed inset-0 z-50 flex items-center justify-center p-4",
  modal: {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 20 },
    className: "relative w-full max-w-4xl bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden",
  },
  header: {
    container: "flex items-center justify-between px-8 py-6 border-b border-white/10",
    title: "text-xl font-semibold",
    closeButton: {
      className: "p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors",
      icon: X,
      iconClass: "w-5 h-5",
    },
  },
  body: {
    container: "p-8 md:p-10 overflow-y-auto max-h-[80vh] custom-scrollbar",
    actions: {
        container: "flex justify-end mb-8", // This line was already correct
      addButton: {
          className: "px-6 py-3 bg-[var(--color-primary)] hover:brightness-110 text-white font-semibold rounded-xl transition-all flex items-center gap-2",
        icon: UserPlus,
        iconClass: "w-4 h-4",
      },
    },
    grid: "grid grid-cols-1 gap-4",
    card: {
        className: "glass-card p-6 rounded-2xl flex items-center justify-between gap-4 hover:border-white/10 transition-all", // This line was already correct
        main: "flex items-center gap-4", // This line was already correct
        avatar: "w-12 h-12 rounded-2xl bg-[var(--color-primary)]/20 text-[var(--color-primary)] flex items-center justify-center font-bold text-lg",
      textContainer: "div",
      name: "font-semibold",
      details: "text-xs text-slate-500",
      actions: {
        container: "flex items-center gap-4",
        permissions: {
          container: "text-right mr-4",
          label: "text-[10px] uppercase tracking-widest font-bold text-slate-600 mb-1",
          pills: "flex gap-1 justify-end",
          pill: "px-2 py-0.5 bg-white/5 border border-white/5 rounded-md text-[9px] text-slate-400",
          more: "text-[9px] text-slate-500",
        },
        buttons: {
          container: "flex items-center gap-2",
          edit: {
            className: "p-3 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl transition-colors",
            icon: Edit2,
            iconClass: "w-4 h-4",
          },
          delete: {
            className: "p-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-xl transition-colors",
            icon: Trash2,
            iconClass: "w-4 h-4",
          },
        }
      }
    }
  },
  text: {
    title: "Team Management",
    add: "Add Member",
    permissions: "Permissions",
  }
};

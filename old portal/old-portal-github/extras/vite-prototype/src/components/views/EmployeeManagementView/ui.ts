import { UserPlus, Edit2, Shield, Trash2, X } from 'lucide-react';

export const employeeManagementViewUI = {
  container: {
    base: 'h-full w-full p-4 md:p-10 overflow-y-auto custom-scrollbar',
    animation: {
      key: 'employee-management',
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
    },
  },
  header: {
    base: 'flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-10',
    titleStyle: 'text-2xl md:text-3xl font-semibold',
    subtitleStyle: 'text-sm md:text-base text-slate-400',
    text: {
      title: 'Team Management',
      subtitle: 'Manage your agency team and their specific access permissions.',
      addButton: 'Add Member',
    },
    addButton: {
      base: 'px-6 py-2.5 md:py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary)] text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 self-start md:self-auto w-full md:w-auto',
      icon: UserPlus,
      iconSize: 'w-4 h-4',
    },
  },
  grid: 'grid grid-cols-1 gap-4 md:gap-6',
  userCard: {
    base: 'glass-card p-4 md:p-6 rounded-2xl md:rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-white/10 transition-all',
    avatarRow: 'flex items-center gap-4',
    avatar: 'w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-[var(--color-primary)]/20 text-[var(--color-primary)] flex items-center justify-center font-bold text-sm md:text-lg shrink-0',
    info: 'min-w-0',
    name: 'font-semibold truncate text-sm md:text-base',
    detail: 'text-[10px] md:text-xs text-slate-500 truncate',
    rightSection: 'flex items-center justify-between sm:justify-end gap-3 md:gap-4 w-full sm:w-auto border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0',
    permissionsBlock: 'text-left sm:text-right sm:mr-4',
    permissionsLabel: 'text-[9px] md:text-[10px] uppercase tracking-widest font-bold text-slate-600 mb-1',
    text: {
      permissionsLabel: 'Permissions',
    },
    permissionBadges: 'flex gap-1 flex-wrap sm:justify-end',
    permissionBadge: 'px-1.5 md:px-2 py-0.5 bg-white/5 border border-white/5 rounded-md text-[8px] md:text-[9px] text-slate-400',
    permissionOverflow: 'text-[8px] md:text-[9px] text-slate-500',
    actions: {
      base: 'flex items-center gap-2',
      editButton: 'p-2 md:p-3 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg md:rounded-xl transition-colors',
      editIcon: Edit2,
      deleteButton: 'p-2 md:p-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg md:rounded-xl transition-colors',
      deleteIcon: Trash2,
      iconSize: 'w-3.5 h-3.5 md:w-4 md:h-4',
    },
  },
  editModal: {
    overlay: 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm',
    card: {
      base: 'bg-[#1e1e2d] border border-white/10 rounded-2xl md:rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl',
      animation: {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
      },
    },
    header: {
      base: 'flex items-center justify-between mb-5 md:mb-6',
      titleStyle: 'text-lg md:text-xl font-semibold flex items-center gap-2',
      icon: Shield,
      iconSize: 'w-5 h-5 text-[var(--color-primary)]',
      closeButton: 'p-2 text-slate-400 hover:text-white rounded-lg transition-colors',
      closeIcon: X,
      closeIconSize: 'w-5 h-5',
    },
    body: {
      base: 'space-y-4 mb-6 md:mb-8',
      label: 'text-[10px] md:text-xs uppercase tracking-widest text-slate-500 block',
      select: 'w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 md:py-3 text-xs md:text-sm text-white focus:border-[var(--color-primary)] outline-none',
      hint: 'text-[10px] md:text-xs text-slate-500',
    },
    footer: {
      base: 'flex justify-end gap-3',
      cancelButton: 'px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs md:text-sm transition-colors',
    },
    text: {
      titlePrefix: 'Edit Role:',
      roleLabel: 'Assign Custom Role',
      hint: "Assigning a custom role will overwrite the user's current permissions with the role's permissions.",
      cancelText: 'Cancel',
    },
  },
};

  },
};

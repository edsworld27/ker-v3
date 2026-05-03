import { XCircle, ListTodo, Folder, Flag, User, AlignLeft } from 'lucide-react';

export const taskModalUI = {
  overlay: {
    base: 'fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-6',
  },
  content: {
    animation: {
      initial: { opacity: 0, y: 20, scale: 0.95 },
      animate: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 0, y: 10, scale: 0.95 },
    },
    base: 'glass-card w-full max-w-lg p-6 md:p-10 rounded-2xl md:rounded-[40px] shadow-2xl overflow-hidden relative',
  },
  header: {
    layout: 'flex items-center justify-between mb-6 md:mb-8',
    titleGroup: 'flex items-center gap-3 md:gap-4',
    iconWrapper: 'w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0',
    icon: ListTodo,
    iconSize: 'w-5 h-5 md:w-6 md:h-6 text-[var(--color-primary)]',
    titleStyle: 'text-xl md:text-2xl font-semibold',
    title: 'Create Task',
    subtitleStyle: 'text-xs md:text-sm text-slate-400 italic',
    subtitle: 'Fill in the details for the new task.',
    closeBtn: 'p-2 hover:bg-white/5 rounded-full text-slate-500 hover:text-white transition-all',
    closeIcon: XCircle,
    closeIconSize: 'w-5 h-5 md:w-6 md:h-6',
  },
  form: {
    layout: 'space-y-4 md:space-y-5 mb-6 md:mb-8',
    inputWrapper: 'space-y-1.5 md:space-y-2',
    label: 'text-[10px] uppercase tracking-widest font-bold text-slate-500 ml-1',
    inputContainer: 'relative',
    inputIconWrapper: 'absolute left-4 top-1/2 -translate-y-1/2 text-slate-500',
    input: 'w-full pl-12 pr-4 py-3 md:py-4 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl outline-none focus:border-[var(--color-primary)] transition-all text-white placeholder:text-slate-600',
    select: 'w-full pl-12 pr-4 py-3 md:py-4 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl outline-none focus:border-[var(--color-primary)] transition-all text-white cursor-pointer',
    textareaIconWrapper: 'absolute left-4 top-4 text-slate-500',
    textarea: 'w-full pl-12 pr-4 py-3 md:py-4 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl outline-none focus:border-[var(--color-primary)] transition-all text-white placeholder:text-slate-600 resize-none h-24',
    icons: {
      title: ListTodo,
      project: Folder,
      priority: Flag,
      assignee: User,
      desc: AlignLeft,
    },
    labels: {
      title: 'Task Title',
      project: 'Project',
      priority: 'Priority',
      assignee: 'Assignee',
      desc: 'Description',
    },
    placeholders: {
      title: 'Enter task title...',
      desc: 'Describe the task...',
    },
    priorityOptions: ['Low', 'Medium', 'High'],
  },
  footer: {
    layout: 'flex flex-col sm:flex-row gap-3',
    cancelBtn: 'w-full sm:flex-1 py-3 md:py-4 bg-white/5 hover:bg-white/10 rounded-xl md:rounded-2xl font-bold transition-all text-slate-400 text-sm md:text-base',
    cancelText: 'Cancel',
    submitBtn: 'w-full sm:flex-1 py-3 md:py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl md:rounded-2xl transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98] text-sm md:text-base',
    submitText: 'Create Task',
    disabledClass: 'disabled:opacity-50 disabled:cursor-not-allowed',
  },
};

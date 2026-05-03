import { XCircle } from 'lucide-react';

export const ticketModalUI = {
  overlay: 'fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-6',
  modal: {
    motion: { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 } },
    base: 'glass-card w-full max-w-lg p-6 md:p-10 rounded-2xl md:rounded-[40px] shadow-2xl overflow-hidden',
  },
  header: {
    base: 'flex items-center justify-between mb-6 md:mb-8',
    title: 'text-xl md:text-2xl font-semibold mb-1',
    subtitle: 'text-slate-400 text-xs md:text-sm italic',
    closeButton: 'p-2 hover:bg-white/5 rounded-full text-slate-500 hover:text-white transition-all',
    closeIcon: XCircle,
    closeIconSize: 'w-5 h-5 md:w-6 md:h-6',
  },
  form: {
    base: 'space-y-6',
    field: {
      base: 'space-y-2',
      label: 'text-[10px] uppercase tracking-widest font-bold text-slate-500 ml-1',
      input: 'w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-indigo-500 transition-all text-white placeholder:text-slate-600',
      select: 'w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-indigo-500 transition-all text-white cursor-pointer',
      optionBg: 'bg-slate-900',
    },
    grid: 'grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6',
  },
  footer: {
    base: 'pt-4 flex flex-col sm:flex-row gap-3 md:gap-4',
    cancelButton: 'w-full sm:flex-1 py-3 md:py-4 bg-white/5 hover:bg-white/10 rounded-xl md:rounded-2xl font-bold transition-all text-slate-400 text-sm md:text-base',
    submitButton: 'w-full sm:flex-1 py-3 md:py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl md:rounded-2xl transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98] text-sm md:text-base',
  },
  text: {
    title: 'Create Support Ticket',
    subtitlePrefix: 'New ticket as',
    subjectLabel: 'Subject / Title',
    subjectPlaceholder: 'Briefly describe the issue...',
    priorityLabel: 'Priority',
    categoryLabel: 'Category',
    priorityOptions: [
      { value: 'High', label: 'High Priority' },
      { value: 'Medium', label: 'Medium Priority' },
      { value: 'Low', label: 'Low Priority' },
    ],
    typeOptions: [
      { value: 'internal', label: 'Internal Task' },
      { value: 'client', label: 'Client Support' },
    ],
    cancelText: 'Cancel',
    submitText: 'Create Ticket',
  },
};

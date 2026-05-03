import { X, Shield, CheckSquare } from 'lucide-react';

export const addRoleModalUI = {
  overlay: {
    base: 'fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4',
    animation: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
  },
  content: {
    base: 'bg-[#1e1e2d] w-full max-w-xl rounded-2xl md:rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]',
    animation: { initial: { opacity: 0, scale: 0.95, y: 20 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.95, y: 20 } },
  },
  header: {
    layout: 'p-6 md:p-8 border-b border-white/5 flex items-center justify-between shrink-0',
    titleGroup: 'flex items-center gap-3',
    iconWrapper: 'w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center',
    icon: Shield,
    iconSize: 'w-5 h-5 text-indigo-400',
    title: 'Create Custom Role',
    titleStyle: 'text-xl font-semibold',
    subtitle: 'Define a new role with specific access permissions.',
    subtitleStyle: 'text-sm text-slate-400',
    closeBtn: 'p-2 hover:bg-white/5 rounded-xl transition-colors',
    closeIcon: X,
    closeIconSize: 'w-5 h-5 text-slate-400',
  },
  form: {
    layout: 'p-6 md:p-8 overflow-y-auto custom-scrollbar space-y-6',
    inputWrapper: 'space-y-1.5',
    label: 'text-xs font-medium text-slate-300 ml-1',
    input: 'w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder:text-slate-600 focus:border-indigo-500/50 outline-none transition-all',
    labels: { roleName: 'Role Name', permissions: 'Access Permissions' },
    placeholders: { roleName: 'e.g. Senior Designer' },
    permissions: {
      grid: 'grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2',
      itemActive: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
      itemInactive: 'bg-black/20 border-white/5 text-slate-400 hover:bg-white/5',
      itemLayout: 'flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer',
      iconSize: 'w-4 h-4 shrink-0',
      labelText: 'text-xs font-medium',
      checkIcon: CheckSquare,
      options: [
        { id: 'dashboard', label: 'Dashboard' }, { id: 'admin-dashboard', label: 'Admin Dashboard' },
        { id: 'client-management', label: 'Client Management' }, { id: 'project-hub', label: 'Project Hub' },
        { id: 'task-board', label: 'Task Board' }, { id: 'agency-communicate', label: 'Communication' },
        { id: 'support-tickets', label: 'Support Tickets' }, { id: 'logs', label: 'System Logs' },
      ]
    }
  },
  footer: {
    layout: 'p-6 md:p-8 border-t border-white/5 bg-black/20 shrink-0 flex gap-3 justify-end',
    cancelBtn: 'px-6 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors',
    submitBtn: 'px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20',
  }
};
import { X, Building2, Mail, Globe, CheckSquare } from 'lucide-react';

export const addClientModalUI = {
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
    iconWrapper: 'w-10 h-10 rounded-xl bg-[var(--color-primary)]/20 flex items-center justify-center',
    icon: Building2,
    iconSize: 'w-5 h-5 text-[var(--color-primary)]',
    title: 'New Client',
    titleStyle: 'text-xl font-semibold',
    subtitle: 'Add a new client to the agency workspace.',
    subtitleStyle: 'text-sm text-slate-400',
    closeBtn: 'p-2 hover:bg-white/5 rounded-xl transition-colors',
    closeIcon: X,
    closeIconSize: 'w-5 h-5 text-slate-400',
  },
  form: {
    layout: 'p-6 md:p-8 overflow-y-auto custom-scrollbar space-y-6',
    group: 'space-y-4',
    inputWrapper: 'space-y-1.5',
    label: 'text-xs font-medium text-slate-300 ml-1',
    inputContainer: 'relative',
    inputIconWrapper: 'absolute left-4 top-1/2 -translate-y-1/2 text-slate-500',
    inputIconSize: 'w-4 h-4',
    input: 'w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-600 focus:border-[var(--color-primary)]/50 outline-none transition-all',
    select: 'w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-sm text-white outline-none focus:border-[var(--color-primary)]/50 transition-all appearance-none',
    icons: { company: Building2, mail: Mail, globe: Globe },
    labels: { name: 'Company Name', email: 'Primary Contact Email', website: 'Website URL', stage: 'Current Stage', permissions: 'Client Permissions' },
    placeholders: { name: 'Acme Corp', email: 'contact@acme.com', website: 'https://acme.com' },
    permissions: {
      grid: 'grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2',
      itemActive: 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]/30 text-[var(--color-primary)]',
      itemInactive: 'bg-black/20 border-white/5 text-slate-400 hover:bg-white/5',
      itemLayout: 'flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer', // This line was already correct
      iconSize: 'w-4 h-4 shrink-0',
      labelText: 'text-xs font-medium',
      checkIcon: CheckSquare,
      options: [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'onboarding', label: 'Onboarding' },
        { id: 'support', label: 'Support' },
        { id: 'crm', label: 'CRM' },
        { id: 'website', label: 'Website' },
        { id: 'resources', label: 'Resources' },
        { id: 'aqua-ai', label: 'Aqua AI' },
      ]
    }
  },
  footer: {
    layout: 'p-6 md:p-8 border-t border-white/5 bg-black/20 shrink-0 flex gap-3 justify-end',
    cancelBtn: 'px-6 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors',
    submitBtn: 'px-6 py-2.5 bg-[var(--color-primary)] hover:brightness-110 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-[var(--color-primary)]/20',
  }
};
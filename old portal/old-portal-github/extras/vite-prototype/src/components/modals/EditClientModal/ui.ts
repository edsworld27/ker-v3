import { Building2, X, Save } from 'lucide-react';
import { PortalView } from '../../../types';

const AVAILABLE_MODULES: PortalView[] = ['dashboard', 'crm', 'website', 'resources', 'settings', 'support', 'onboarding', 'collaboration'];

export const editClientModalUI = {
  AVAILABLE_MODULES,
  overlay: "fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4",
  modal: {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.95, opacity: 0 },
    className: "bg-[#0f172a] border border-white/10 p-8 rounded-[2.5rem] w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto",
  },
  header: {
    container: "flex items-center justify-between mb-8",
    title: "text-2xl font-bold flex items-center gap-3",
    icon: Building2,
    iconClass: "w-6 h-6 text-indigo-400",
    closeButton: {
      className: "p-2 hover:bg-white/10 rounded-full transition-colors",
      icon: X,
      iconClass: "w-6 h-6",
    },
  },
  form: {
    container: "space-y-6",
    field: {
      container: "space-y-2",
      label: "text-xs font-bold text-slate-500 uppercase tracking-widest",
      input: "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-all",
    },
    select: "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-all",
    option: "",
    modules: {
      grid: "grid grid-cols-2 gap-2",
      button: {
        className: "px-3 py-2 rounded-lg text-xs font-medium transition-all",
        active: "bg-indigo-600 text-white",
        inactive: "bg-white/5 text-slate-400 hover:bg-white/10",
      }
    },
  },
  footer: {
    container: "flex gap-4 mt-10",
    cancelButton: "flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold transition-all",
    saveButton: {
      className: "flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition-all flex items-center justify-center gap-2",
      icon: Save,
      iconClass: "w-4 h-4",
    },
  },
  text: {
    title: "Edit Client",
    nameLabel: "Client Name",
    emailLabel: "Email",
    websiteLabel: "Website URL",
    stageLabel: "Stage",
    modulesLabel: "Modules",
    cancel: "Cancel",
    save: "Save Changes",
  },
  stages: ["discovery", "design", "development", "live"],
};

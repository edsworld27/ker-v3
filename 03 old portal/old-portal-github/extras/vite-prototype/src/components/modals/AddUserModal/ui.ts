import { XCircle, User, Mail, ShieldCheck, LayoutDashboard, Database, Globe, FolderOpen, Settings2, Zap } from 'lucide-react';

const userRoles = {
  client: ['ClientEmployee'],
  agency: ['AgencyManager', 'AgencyEmployee', 'ClientOwner', 'ClientEmployee'],
};

const permissions = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'crm', label: 'CRM Portal', icon: Database },
  { id: 'website', label: 'Website Editor', icon: Globe },
  { id: 'resources', label: 'Resources', icon: FolderOpen },
  { id: 'settings', label: 'Settings', icon: Settings2 },
  { id: 'aqua-ai', label: 'Aqua AI', icon: Zap }
];

export const addUserModalUI = {
  userRoles,
  permissions,
  overlay: "absolute inset-0 bg-slate-950/60 backdrop-blur-sm",
  container: "fixed inset-0 z-[100] flex items-center justify-center p-6",
  modal: {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 20 },
    className: "relative w-full max-w-2xl glass-card rounded-2xl md:rounded-[2.5rem] p-6 md:p-10 overflow-hidden max-h-[90vh] overflow-y-auto",
  },
  header: {
    container: "flex items-center justify-between mb-6 md:mb-8",
    textContainer: "div",
    title: "text-xl md:text-2xl font-semibold",
    subtitle: "text-xs md:text-sm text-slate-500",
    closeButton: {
      className: "p-2 hover:bg-white/5 rounded-full transition-colors",
      icon: XCircle,
      iconClass: "w-5 h-5 md:w-6 md:h-6 text-slate-500",
    },
  },
  form: {
    container: "space-y-6 md:space-y-8",
    grid: "grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6",
    field: {
      container: "space-y-2",
      label: "text-[10px] uppercase tracking-widest font-bold text-slate-500 ml-1",
      inputContainer: "relative",
      iconContainer: "absolute left-4 top-1/2 -translate-y-1/2 text-slate-500",
      input: "w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-indigo-500 transition-colors",
    },
    userType: {
      container: "space-y-4",
      label: "text-[10px] uppercase tracking-widest font-bold text-slate-500 ml-1",
      grid: "grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4",
      button: {
        className: "flex items-center gap-3 px-4 py-4 rounded-2xl border transition-all text-left", // This line was already correct
        active: "bg-[var(--color-primary)]/10 border-[var(--color-primary)]/30 text-[var(--color-primary)]",
        inactive: "bg-white/5 border-white/10 text-slate-500 hover:bg-white/10",
        radio: {
          container: "w-4 h-4 rounded-full border-2 flex items-center justify-center",
          active: "bg-[var(--color-primary)] border-[var(--color-primary)]",
          inactive: "border-white/20",
          dot: "w-1.5 h-1.5 rounded-full bg-white",
        },
        label: "text-xs font-medium",
      },
    },
    rolePreset: {
      container: "space-y-4 p-6 bg-[var(--color-primary)]/5 rounded-[2rem] border border-[var(--color-primary)]/10 animate-in fade-in slide-in-from-top-4",
      header: "flex items-center gap-2 mb-2",
      icon: ShieldCheck,
      iconClass: "w-4 h-4 text-[var(--color-primary)]",
      label: "text-[10px] uppercase font-bold text-[var(--color-primary)] tracking-widest",
      grid: "grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3",
      button: {
        className: "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left group",
        active: "bg-[var(--color-primary)] border-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/20",
        inactive: "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:border-white/20",
        label: {
          className: "text-[10px] font-bold uppercase tracking-tight",
          active: "text-white", // This line was already correct
          inactive: "text-slate-500 group-hover:text-slate-300",
        },
      },
      footer: "text-[10px] text-slate-600 mt-2 italic font-medium",
    },
    clientWorkspace: {
      container: "space-y-2",
      label: "text-[10px] uppercase tracking-widest font-bold text-slate-500 ml-1",
      select: "w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-indigo-500 transition-colors appearance-none",
      option: "bg-slate-900",
    },
    permissions: {
      container: "space-y-4",
      label: "text-[10px] uppercase tracking-widest font-bold text-slate-500 ml-1",
      grid: "grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4",
      button: {
        className: "flex items-center gap-3 px-4 py-4 rounded-2xl border transition-all text-left", // This line was already correct
        active: "bg-[var(--color-primary)]/10 border-[var(--color-primary)]/30 text-[var(--color-primary)]",
        inactive: "bg-white/5 border-white/10 text-slate-500 hover:bg-white/10",
        icon: {
          className: "w-4 h-4",
          active: "text-[var(--color-primary)]",
          inactive: "text-slate-600",
        },
        label: "text-xs font-medium",
      },
    }
  },
  footer: {
    container: "flex flex-col sm:flex-row gap-3 md:gap-4 pt-4",
    cancelButton: "w-full sm:flex-1 py-3 md:py-4 bg-white/5 hover:bg-white/10 rounded-xl md:rounded-2xl font-semibold transition-all text-sm md:text-base",
    submitButton: "w-full sm:flex-2 py-3 md:py-4 bg-[var(--color-primary)] hover:brightness-110 text-white font-semibold rounded-xl md:rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-[var(--color-primary)]/20 text-sm md::text-base",
  },
  text: {
    editTitle: "Edit Member Permissions",
    addTitle: "Invite Team Member",
    editSubtitle: "Modify access for ",
    addSubtitle: "Add a new collaborator to your agency or client workspace.",
    nameLabel: "Full Name",
    namePlaceholder: "John Doe",
    emailLabel: "Email Address",
    emailPlaceholder: "john@example.com",
    userTypeLabel: "Assign User Type",
    rolePresetLabel: "Apply Workspace Role Preset",
    rolePresetFooter: "Selecting a preset will overwrite custom permissions below.",
    clientWorkspaceLabel: "Assign to Client Workspace",
    permissionsLabel: "Permissions (Custom Access)",
    cancel: "Cancel",
    update: "Update Permissions",
    submit: "Send Invitation",
  },
  icons: {
    name: User,
    email: Mail,
  }
};

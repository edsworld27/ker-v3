import { X, Settings, Users, Shield, Database, Code2, Plus, Edit, Trash2 } from 'lucide-react';

export const settingsModalUI = {
  overlay: 'fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4',
  modal: {
    base: 'relative glass-card w-full max-w-4xl h-[80vh] flex flex-col rounded-3xl border border-white/10 text-white overflow-hidden',
    animation: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
    },
  },
  header: {
    base: 'flex items-center justify-between p-6 border-b border-white/10 shrink-0',
    titleWrapper: 'flex items-center gap-3',
    icon: Settings,
    iconSize: 'w-6 h-6 text-indigo-400',
    title: 'Agency Settings',
    titleStyle: 'text-xl font-semibold',
    closeButton: {
      base: 'p-2 rounded-full hover:bg-white/10 transition-colors',
      icon: X,
      iconSize: 'w-6 h-6 text-slate-400',
    },
  },
  mainContent: {
    base: 'flex flex-1 overflow-hidden',
  },
  sidebar: {
    base: 'w-64 border-r border-white/10 p-4 shrink-0',
    list: 'space-y-1',
    item: {
      base: 'w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
      inactive: 'text-slate-400 hover:bg-white/5 hover:text-white',
      active: 'bg-indigo-500/10 text-indigo-300',
    },
    tabs: [
      { id: 'users', label: 'Users & Permissions', icon: Users },
      { id: 'roles', label: 'Roles', icon: Shield },
      { id: 'data', label: 'Data & Export', icon: Database },
      { id: 'dev', label: 'Developer', icon: Code2 },
    ],
  },
  contentArea: {
    base: 'flex-1 p-8 overflow-y-auto custom-scrollbar',
    header: {
      base: 'flex justify-between items-center mb-8',
      title: 'text-2xl font-bold',
      button: {
        base: 'flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-semibold transition-all shadow-md shadow-indigo-600/20',
        icon: Plus,
        iconSize: 'w-4 h-4',
      },
    },
    list: {
      base: 'divide-y divide-white/10',
      item: {
        base: 'flex items-center justify-between py-4',
        info: 'flex items-center gap-4',
        avatar: 'w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-sm',
        name: 'font-medium',
        detail: 'text-sm text-slate-400',
        actions: {
          base: 'flex items-center gap-2',
          button: 'p-2 rounded-lg hover:bg-white/10 transition-colors',
          editIcon: Edit,
          deleteIcon: Trash2,
          iconSize: 'w-4 h-4 text-slate-400',
        },
      },
    },
    exportSection: {
      base: 'space-y-6',
      card: 'bg-white/5 p-6 rounded-2xl border border-white/10',
      title: 'text-lg font-semibold mb-2',
      description: 'text-sm text-slate-400 mb-4',
      button: 'px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50',
    },
  },
  text: {
    manageUsers: 'Manage Users',
    addUser: 'Add User',
    manageRoles: 'Manage Roles',
    addRole: 'Add Role',
    dataExport: 'Data & Export',
    exportDataTitle: 'Export Portal Data',
    exportDataDesc: 'Download a JSON file of all users, clients, and activity logs.',
    exportDataButton: 'Export Data',
    exportWebsiteTitle: 'Export Website',
    exportWebsiteDesc: "Download a ZIP file of the current client's website build.",
    exportWebsiteButton: 'Export Website',
    exportingText: 'Exporting...',
    permissionsCount: 'permissions',
  },
};

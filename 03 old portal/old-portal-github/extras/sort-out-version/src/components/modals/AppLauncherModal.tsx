import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Briefcase, Globe, Building2, BookOpen, Database, CreditCard, LayoutGrid } from 'lucide-react';

interface AppLauncherModalProps {
  isOpen: boolean;
  onClose: () => void;
  handleViewChange: (view: string) => void;
  hasPermission: (permission: string) => boolean;
}

export function AppLauncherModal({ isOpen, onClose, handleViewChange, hasPermission }: AppLauncherModalProps) {
  if (!isOpen) return null;

  const apps = [
    { id: 'crm', title: 'CRM Portal', description: 'Manage clients and sales pipeline.', icon: Briefcase, permission: 'workspaces', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { id: 'website', title: 'Website Editor', description: 'Build and maintain your online presence.', icon: Globe, permission: 'workspaces', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { id: 'discover', title: 'Company Discover', description: 'Explore your company structure and goals.', icon: Building2, permission: 'company', color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { id: 'resources', title: 'Resources', description: 'Access training materials and brand assets.', icon: BookOpen, permission: 'company', color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { id: 'data-hub', title: 'Data Hub', description: 'All information we know about your company.', icon: Database, permission: 'data-hub', color: 'text-rose-400', bg: 'bg-rose-500/10' },
    { id: 'your-plan', title: 'Your Plan', description: 'Manage your subscription and billing.', icon: CreditCard, permission: 'your-plan', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  ];

  const visibleApps = apps.filter(app => hasPermission(app.permission));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between p-6 border-b border-white/10 bg-black/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                <LayoutGrid className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">App Launcher</h2>
                <p className="text-sm text-slate-400">Access your tools and workspaces</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleApps.map((app) => (
                <button
                  key={app.id}
                  onClick={() => {
                    handleViewChange(app.id);
                    onClose();
                  }}
                  className="p-6 bg-white/5 rounded-2xl border border-white/5 hover:border-indigo-500/50 hover:bg-white/10 transition-all text-left group flex flex-col items-start"
                >
                  <div className={`w-12 h-12 rounded-xl ${app.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <app.icon className={`w-6 h-6 ${app.color}`} />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">{app.title}</h3>
                  <p className="text-sm text-slate-400 line-clamp-2">{app.description}</p>
                </button>
              ))}
            </div>
            
            {visibleApps.length === 0 && (
              <div className="text-center py-12">
                <LayoutGrid className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No Apps Available</h3>
                <p className="text-slate-400">You don't have permission to access any apps yet.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

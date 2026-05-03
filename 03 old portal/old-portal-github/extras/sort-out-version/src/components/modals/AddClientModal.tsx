import React from 'react';
import { motion } from 'motion/react';
import { XCircle, Users, Mail, Globe, LayoutDashboard, Database, FolderOpen, Zap, LifeBuoy } from 'lucide-react';
import { PortalView } from '../../types';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  newClientForm: {
    name: string;
    email: string;
    websiteUrl: string;
    permissions: PortalView[];
  };
  setNewClientForm: React.Dispatch<React.SetStateAction<any>>;
  handleAddClient: () => void;
}

export const AddClientModal: React.FC<AddClientModalProps> = ({
  isOpen,
  onClose,
  newClientForm,
  setNewClientForm,
  handleAddClient
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
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
        className="relative w-full max-w-2xl glass-card rounded-[2.5rem] p-10 overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-semibold">Setup New Client</h3>
            <p className="text-sm text-slate-500">Configure the workspace and initial access for your new partner.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <XCircle className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 ml-1">Client / Company Name</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  <Users className="w-4 h-4" />
                </div>
                <input 
                  type="text" 
                  placeholder="Acme Corp"
                  value={newClientForm.name}
                  onChange={(e) => setNewClientForm({...newClientForm, name: e.target.value})}
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 ml-1">Primary Email</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input 
                  type="email" 
                  placeholder="ceo@acme.com"
                  value={newClientForm.email}
                  onChange={(e) => setNewClientForm({...newClientForm, email: e.target.value})}
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 ml-1">Website URL (Optional)</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                <Globe className="w-4 h-4" />
              </div>
              <input 
                type="url" 
                placeholder="https://acme.com"
                value={newClientForm.websiteUrl}
                onChange={(e) => setNewClientForm({...newClientForm, websiteUrl: e.target.value})}
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 ml-1">Initial Feature Access</label>
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 'dashboard', label: 'Client Dashboard', icon: LayoutDashboard },
                { id: 'crm', label: 'CRM Access', icon: Database },
                { id: 'website', label: 'Website Editor', icon: Globe },
                { id: 'resources', label: 'Resource Hub', icon: FolderOpen },
                { id: 'aqua-ai', label: 'Aqua AI Assistant', icon: Zap },
                { id: 'support', label: 'Support Portal', icon: LifeBuoy }
              ].map(feature => (
                <button
                  key={feature.id}
                  onClick={() => {
                    const perms = newClientForm.permissions.includes(feature.id as PortalView)
                      ? newClientForm.permissions.filter(p => p !== feature.id)
                      : [...newClientForm.permissions, feature.id as PortalView];
                    setNewClientForm({...newClientForm, permissions: perms});
                  }}
                  className={`flex items-center gap-3 px-4 py-4 rounded-2xl border transition-all text-left ${
                    newClientForm.permissions.includes(feature.id as PortalView)
                      ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400'
                      : 'bg-white/5 border-white/10 text-slate-500 hover:bg-white/10'
                  }`}
                >
                  <feature.icon className={`w-4 h-4 ${newClientForm.permissions.includes(feature.id as PortalView) ? 'text-indigo-400' : 'text-slate-600'}`} />
                  <span className="text-xs font-medium">{feature.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              onClick={onClose}
              className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-semibold transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleAddClient}
              className="flex-2 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-indigo-600/20"
            >
              Create Workspace
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

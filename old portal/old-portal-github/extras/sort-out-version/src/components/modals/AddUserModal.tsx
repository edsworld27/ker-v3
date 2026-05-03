import React from 'react';
import { motion } from 'motion/react';
import { XCircle, User, Mail, ShieldCheck, LayoutDashboard, Database, Globe, FolderOpen, Settings2, Zap } from 'lucide-react';
import { AppUser, Client, Agency, PortalView, UserRole } from '../../types';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUserToEdit: AppUser | null;
  newUser: Omit<AppUser, 'id'>;
  setNewUser: React.Dispatch<React.SetStateAction<Omit<AppUser, 'id'>>>;
  currentUser: AppUser | undefined;
  clients: Client[];
  currentAgency: Agency | undefined;
  handleAddUser: () => void;
}

export const AddUserModal: React.FC<AddUserModalProps> = ({
  isOpen,
  onClose,
  selectedUserToEdit,
  newUser,
  setNewUser,
  currentUser,
  clients,
  currentAgency,
  handleAddUser
}) => {
  if (!isOpen) return null;

  const togglePermission = (perm: PortalView) => {
    if (newUser.permissions.includes(perm)) {
      setNewUser({ ...newUser, permissions: newUser.permissions.filter(p => p !== perm) });
    } else {
      setNewUser({ ...newUser, permissions: [...newUser.permissions, perm] });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl glass-card rounded-[2.5rem] p-10 overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-semibold">{selectedUserToEdit ? 'Edit Member Permissions' : 'Invite Team Member'}</h3>
            <p className="text-sm text-slate-500">{selectedUserToEdit ? `Modify access for ${newUser.name}.` : 'Add a new collaborator to your agency or client workspace.'}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <XCircle className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        <div className="space-y-8">
          {!selectedUserToEdit && (
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 ml-1">Full Name</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="John Doe"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 ml-1">Email Address</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input 
                    type="email" 
                    placeholder="john@example.com"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 ml-1">Assign User Type</label>
            <div className="grid grid-cols-2 gap-4">
              {(currentUser?.role === 'ClientOwner' ? ['ClientEmployee'] : ['AgencyManager', 'AgencyEmployee', 'ClientOwner', 'ClientEmployee']).map(role => (
                <button
                  key={role}
                  onClick={() => {
                    const newRole = role as UserRole;
                    setNewUser({
                      ...newUser, 
                      role: newRole,
                      clientId: (newRole === 'ClientOwner' || newRole === 'ClientEmployee') 
                        ? (currentUser?.role === 'ClientOwner' ? currentUser.clientId : clients[0]?.id) 
                        : undefined
                    });
                  }}
                  className={`flex items-center gap-3 px-4 py-4 rounded-2xl border transition-all text-left ${
                    newUser.role === role 
                      ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400' 
                      : 'bg-white/5 border-white/10 text-slate-500 hover:bg-white/10'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    newUser.role === role ? 'bg-indigo-500 border-indigo-500' : 'border-white/20'
                  }`}>
                    {newUser.role === role && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <span className="text-xs font-medium">{role.replace(/([A-Z])/g, ' $1').trim()}</span>
                </button>
              ))}
            </div>
          </div>

          {newUser.role.includes('Agency') && currentAgency?.roles && (
            <div className="space-y-4 p-6 bg-indigo-500/5 rounded-[2rem] border border-indigo-500/10 animate-in fade-in slide-in-from-top-4">
              <div className="flex items-center gap-2 mb-2">
                 <ShieldCheck className="w-4 h-4 text-indigo-400" />
                 <label className="text-[10px] uppercase font-bold text-indigo-400 tracking-widest">Apply Workspace Role Preset</label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {currentAgency.roles.map(role => (
                  <button
                    key={role.id}
                    onClick={() => setNewUser({...newUser, permissions: role.permissions})}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left group ${
                      JSON.stringify(newUser.permissions.toSorted()) === JSON.stringify(role.permissions.toSorted())
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <span className={`text-[10px] font-bold uppercase tracking-tight ${
                       JSON.stringify(newUser.permissions.toSorted()) === JSON.stringify(role.permissions.toSorted())
                       ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'
                    }`}>{role.name}</span>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-600 mt-2 italic font-medium">Selecting a preset will overwrite custom permissions below.</p>
            </div>
          )}

          {(currentUser?.role !== 'ClientOwner') && (newUser.role === 'ClientOwner' || newUser.role === 'ClientEmployee') && (
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 ml-1">Assign to Client Workspace</label>
              <select 
                value={newUser.clientId}
                onChange={(e) => setNewUser({...newUser, clientId: e.target.value})}
                className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-indigo-500 transition-colors appearance-none"
              >
                {clients.map(client => (
                  <option key={client.id} value={client.id} className="bg-slate-900">{client.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-4">
            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 ml-1">Permissions (Custom Access)</label>
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'crm', label: 'CRM Portal', icon: Database },
                { id: 'website', label: 'Website Editor', icon: Globe },
                { id: 'resources', label: 'Resources', icon: FolderOpen },
                { id: 'settings', label: 'Settings', icon: Settings2 },
                { id: 'aqua-ai', label: 'Aqua AI', icon: Zap }
              ].map(perm => (
                <button
                  key={perm.id}
                  onClick={() => togglePermission(perm.id as PortalView)}
                  className={`flex items-center gap-3 px-4 py-4 rounded-2xl border transition-all text-left ${
                    newUser.permissions.includes(perm.id as PortalView)
                      ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400'
                      : 'bg-white/5 border-white/10 text-slate-500 hover:bg-white/10'
                  }`}
                >
                  <perm.icon className={`w-4 h-4 ${newUser.permissions.includes(perm.id as PortalView) ? 'text-indigo-400' : 'text-slate-600'}`} />
                  <span className="text-xs font-medium">{perm.label}</span>
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
              onClick={handleAddUser}
              className="flex-2 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-indigo-600/20"
            >
              {selectedUserToEdit ? 'Update Permissions' : 'Send Invitation'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

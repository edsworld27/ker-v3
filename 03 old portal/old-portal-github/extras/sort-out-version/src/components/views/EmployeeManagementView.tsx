import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserPlus, UserCog, Edit2, Shield, Trash2, X } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { AppUser, CustomRole, PortalView } from '../../types';

export const EmployeeManagementView: React.FC<{ onAddUser: () => void, onDeleteUser: (id: number) => void }> = ({ onAddUser, onDeleteUser }) => {
  const { users, setUsers, currentAgency, addLog } = useAppContext();
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);

  const agencyUsers = users.filter(u => u.role.includes('Agency') || u.role === 'Founder');

  const handleUpdateUserRole = (userId: number, customRoleId: string) => {
    const role = currentAgency?.roles.find(r => r.id === customRoleId);
    if (role) {
      setUsers(users.map(u => u.id === userId ? { ...u, customRoleId, permissions: role.permissions } : u));
      addLog('User Role Updated', `Updated role for user ID ${userId} to ${role.name}`, 'system');
    } else if (customRoleId === 'none') {
      setUsers(users.map(u => u.id === userId ? { ...u, customRoleId: undefined } : u));
    }
    setEditingUser(null);
  };

  return (
    <motion.div
      key="employee-management"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full w-full p-10 overflow-y-auto custom-scrollbar"
    >
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-3xl font-semibold">Team Management</h2>
          <p className="text-slate-400">Manage your agency team and their specific access permissions.</p>
        </div>
        <button 
          onClick={onAddUser}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Add Member
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {agencyUsers.map(user => {
          const customRole = currentAgency?.roles.find(r => r.id === user.customRoleId);
          
          return (
            <div key={user.id} className="glass-card p-6 rounded-3xl flex items-center justify-between group hover:border-white/10 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-lg">
                  {user.avatar || user.name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold">{user.name}</div>
                  <div className="text-xs text-slate-500">
                    {customRole ? customRole.name : user.role} • {user.email}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right mr-4">
                  <div className="text-[10px] uppercase tracking-widest font-bold text-slate-600 mb-1">Permissions</div>
                  <div className="flex gap-1 flex-wrap justify-end">
                    {user.permissions.slice(0, 3).map(p => (
                      <span key={p} className="px-2 py-0.5 bg-white/5 border border-white/5 rounded-md text-[9px] text-slate-400">{p}</span>
                    ))}
                    {user.permissions.length > 3 && <span className="text-[9px] text-slate-500">+{user.permissions.length - 3}</span>}
                  </div>
                </div>
                <button 
                  onClick={() => setEditingUser(user)}
                  className="p-3 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl transition-colors"
                  title="Edit Role"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => onDeleteUser(user.id)}
                  className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-xl transition-colors"
                  title="Delete User"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit User Role Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1e1e2d] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-400" />
                Edit Role: {editingUser.name}
              </h3>
              <button 
                onClick={() => setEditingUser(null)}
                className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4 mb-8">
              <label className="text-xs uppercase tracking-widest text-slate-500 block">Assign Custom Role</label>
              <select
                value={editingUser.customRoleId || 'none'}
                onChange={(e) => handleUpdateUserRole(editingUser.id, e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none"
              >
                <option value="none">Default ({editingUser.role})</option>
                {currentAgency?.roles.map(role => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
              <p className="text-xs text-slate-500">
                Assigning a custom role will overwrite the user's current permissions with the role's permissions.
              </p>
            </div>
            
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

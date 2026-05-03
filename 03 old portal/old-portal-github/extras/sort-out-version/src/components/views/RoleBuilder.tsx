import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Shield, Save } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { CustomRole, PortalView } from '../../types';

export const RoleBuilder: React.FC = () => {
  const { currentAgency, setAgencies, agencies, addLog, customPages } = useAppContext();
  
  // If no agency is selected, we can't edit roles
  if (!currentAgency) return null;

  const [editingRole, setEditingRole] = useState<CustomRole | null>(null);

  const handleCreateRole = () => {
    const newRole: CustomRole = {
      id: `role-${Date.now()}`,
      name: 'New Role',
      permissions: []
    };
    
    const updatedAgency = {
      ...currentAgency,
      roles: [...currentAgency.roles, newRole]
    };
    
    setAgencies(agencies.map(a => a.id === currentAgency.id ? updatedAgency : a));
    setEditingRole(newRole);
  };

  const handleSaveRole = () => {
    if (editingRole) {
      const updatedAgency = {
        ...currentAgency,
        roles: currentAgency.roles.map(r => r.id === editingRole.id ? editingRole : r)
      };
      setAgencies(agencies.map(a => a.id === currentAgency.id ? updatedAgency : a));
      
      // Sync permissions for users with this role
      setUsers(users.map(u => u.customRoleId === editingRole.id ? { ...u, permissions: editingRole.permissions } : u));
      
      addLog('Role Updated', `Updated custom role: ${editingRole.name}`, 'system');
      setEditingRole(null);
    }
  };

  const handleDeleteRole = (id: string) => {
    const updatedAgency = {
      ...currentAgency,
      roles: currentAgency.roles.filter(r => r.id !== id)
    };
    setAgencies(agencies.map(a => a.id === currentAgency.id ? updatedAgency : a));
    
    // Remove custom role from users
    setUsers(users.map(u => u.customRoleId === id ? { ...u, customRoleId: undefined } : u));
    
    addLog('Role Deleted', `Deleted custom role`, 'system');
  };

  const togglePermission = (view: PortalView | string) => {
    if (!editingRole) return;
    
    const hasPerm = editingRole.permissions.includes(view as PortalView);
    const newPerms = hasPerm 
      ? editingRole.permissions.filter(p => p !== view)
      : [...editingRole.permissions, view as PortalView];
      
    setEditingRole({
      ...editingRole,
      permissions: newPerms
    });
  };

  // Standard views to toggle
  const standardViews = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'agency-clients', label: 'Clients' },
    { id: 'project-hub', label: 'Projects' },
    { id: 'agency-communicate', label: 'Inbox' },
    { id: 'employee-management', label: 'Team' },
    { id: 'global-activity', label: 'Activity Logs' },
    { id: 'ai-sessions', label: 'AI Monitor' },
    { id: 'agency-builder', label: 'App Builder' }
  ];

  if (editingRole) {
    return (
      <div className="glass-card p-8 rounded-3xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold flex items-center gap-3">
            <Shield className="w-6 h-6 text-indigo-400" />
            Edit Role: {editingRole.name}
          </h2>
          <div className="flex gap-3">
            <button onClick={() => setEditingRole(null)} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
              Cancel
            </button>
            <button onClick={handleSaveRole} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save Role
            </button>
          </div>
        </div>

        <div className="mb-8">
          <label className="text-xs uppercase tracking-widest text-slate-500 mb-2 block">Role Name</label>
          <input 
            type="text" 
            value={editingRole.name}
            onChange={e => setEditingRole({...editingRole, name: e.target.value})}
            className="w-full max-w-md bg-slate-900/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-medium mb-4">Standard Permissions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {standardViews.map(view => (
                <label key={view.id} className="flex items-center gap-3 p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors border border-white/5">
                  <input 
                    type="checkbox" 
                    checked={editingRole.permissions.includes(view.id as PortalView)}
                    onChange={() => togglePermission(view.id)}
                    className="w-4 h-4 rounded border-white/20 bg-slate-900 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-900"
                  />
                  <span className="text-sm font-medium">{view.label}</span>
                </label>
              ))}
            </div>
          </div>

          {customPages.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-4">Custom Page Permissions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {customPages.map(page => (
                  <label key={page.id} className="flex items-center gap-3 p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors border border-white/5">
                    <input 
                      type="checkbox" 
                      checked={editingRole.permissions.includes(page.slug as PortalView)}
                      onChange={() => togglePermission(page.slug)}
                      className="w-4 h-4 rounded border-white/20 bg-slate-900 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-900"
                    />
                    <span className="text-sm font-medium">{page.title}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-8 rounded-3xl">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-semibold flex items-center gap-3">
          <Shield className="w-6 h-6 text-indigo-400" />
          Roles & Permissions
        </h2>
        <button onClick={handleCreateRole} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Role
        </button>
      </div>

      <div className="space-y-4">
        {currentAgency.roles.length === 0 ? (
          <div className="text-center py-10 text-slate-500 border border-dashed border-white/10 rounded-2xl">
            No custom roles created yet.
          </div>
        ) : (
          currentAgency.roles.map(role => (
            <div key={role.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
              <div>
                <div className="font-medium text-white flex items-center gap-2">
                  {role.name}
                  {role.isMaster && <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-[10px] uppercase tracking-widest rounded-full font-bold">System</span>}
                </div>
                <div className="text-xs text-slate-500 mt-1">{role.permissions.length} Permissions</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setEditingRole(role)} className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                {!role.isMaster && (
                  <button onClick={() => handleDeleteRole(role.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

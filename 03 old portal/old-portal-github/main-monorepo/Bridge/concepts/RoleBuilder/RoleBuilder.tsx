import React, { useState } from 'react';
import { roleBuilderUI as ui } from './ui';
import { useAppContext } from '../../../context/AppContext';
import { useTheme } from '../../../hooks/useTheme';
import { RoleConfig } from '../../../config/agencyConfig';

export const RoleBuilder: React.FC = () => {
  const { agencyConfig, setAgencyConfig, addLog, customPages } = useAppContext();
  const theme = useTheme();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<RoleConfig | null>(null);

  const handleCreateRole = () => {
    const id = `custom-${Date.now()}`;
    const newRole: RoleConfig = {
      displayName: 'New Role',
      accentColor: '#6366f1',
      allowedViews: ['dashboard'],
      canImpersonate: false,
      canManageUsers: false,
      canManageRoles: false,
      canAccessConfigurator: false,
      labelOverrides: {},
      isSystem: false,
    };
    setAgencyConfig(cfg => ({ ...cfg, roles: { ...cfg.roles, [id]: newRole } }));
    setEditingId(id);
    setEditingRole(newRole);
    addLog('Role Created', `Created new custom role`, 'system');
  };

  const handleSaveRole = () => {
    if (!editingId || !editingRole) return;
    setAgencyConfig(cfg => ({
      ...cfg,
      roles: { ...cfg.roles, [editingId]: editingRole },
    }));
    addLog('Role Updated', `Updated role: ${editingRole.displayName}`, 'system');
    setEditingId(null);
    setEditingRole(null);
  };

  const handleDeleteRole = (id: string) => {
    setAgencyConfig(cfg => {
      const { [id]: _, ...rest } = cfg.roles;
      return { ...cfg, roles: rest };
    });
    addLog('Role Deleted', `Deleted custom role`, 'system');
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
    setEditingRole({ ...agencyConfig.roles[id] });
  };

  const toggleView = (viewId: string) => {
    if (!editingRole) return;
    const current = editingRole.allowedViews;
    if (current === '*') {
      const next = ui.standardViews.map(v => v.id).filter(id => id !== viewId);
      setEditingRole({ ...editingRole, allowedViews: next });
    } else {
      const arr = current as string[];
      const next = arr.includes(viewId) ? arr.filter(v => v !== viewId) : [...arr, viewId];
      setEditingRole({ ...editingRole, allowedViews: next });
    }
  };

  const isViewChecked = (viewId: string): boolean => {
    if (!editingRole) return false;
    if (editingRole.allowedViews === '*') return true;
    return (editingRole.allowedViews as string[]).includes(viewId);
  };

  if (editingRole && editingId) {
    return (
      <div className={ui.card}>
        <div className={ui.header.base}>
          <h2 className={ui.header.titleStyle}>
            <ui.header.icon className={ui.header.iconSize} />
            {ui.text.editTitlePrefix} {editingRole.displayName}
          </h2>
          <div className={ui.header.actions}>
            <button onClick={() => { setEditingId(null); setEditingRole(null); }} className={ui.header.cancelButton}>
              {ui.text.cancelText}
            </button>
            <button onClick={handleSaveRole} className={ui.header.saveButton} style={theme.primaryBgStyle}>
              <ui.header.saveIcon className={ui.header.buttonIconSize} />
              {ui.text.saveText}
            </button>
          </div>
        </div>

        <div className={ui.editForm.nameSection}>
          <label className={ui.editForm.label}>{ui.text.roleNameLabel}</label>
          <input
            type="text"
            value={editingRole.displayName}
            onChange={e => setEditingRole({ ...editingRole, displayName: e.target.value })}
            className={ui.editForm.input}
          />
        </div>

        <div className={ui.editForm.permissionsSection}>
          <div>
            <h3 className={ui.editForm.permissionGroupTitle}>{ui.text.standardPermissionsTitle}</h3>
            <div className={ui.editForm.permissionsGrid}>
              {ui.standardViews.map(view => (
                <label key={view.id} className={ui.editForm.permissionItem}>
                  <input
                    type="checkbox"
                    checked={isViewChecked(view.id)}
                    onChange={() => toggleView(view.id)}
                    className={ui.editForm.checkbox}
                  />
                  <span className={ui.editForm.checkboxLabel}>{view.label}</span>
                </label>
              ))}
            </div>
          </div>

          {customPages.length > 0 && (
            <div>
              <h3 className={ui.editForm.permissionGroupTitle}>{ui.text.customPermissionsTitle}</h3>
              <div className={ui.editForm.permissionsGrid}>
                {customPages.map(page => (
                  <label key={page.id} className={ui.editForm.permissionItem}>
                    <input
                      type="checkbox"
                      checked={isViewChecked(page.slug)}
                      onChange={() => toggleView(page.slug)}
                      className={ui.editForm.checkbox}
                    />
                    <span className={ui.editForm.checkboxLabel}>{page.title}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const roles = Object.entries(agencyConfig.roles);

  return (
    <div className={ui.card}>
      <div className={ui.header.base}>
        <h2 className={ui.header.titleStyle}>
          <ui.header.icon className={ui.header.iconSize} />
          {ui.text.listTitle}
        </h2>
        <button onClick={handleCreateRole} className={ui.header.createButton} style={theme.primaryBgStyle}>
          <ui.header.createIcon className={ui.header.buttonIconSize} />
          {ui.text.createText}
        </button>
      </div>

      <div className={ui.roleList}>
        {roles.length === 0 ? (
          <div className={ui.roleEmpty}>{ui.text.noRoles}</div>
        ) : (
          roles.map(([id, role]) => (
            <div key={id} className={ui.roleRow.base}>
              <div className={ui.roleRow.info}>
                <div className={ui.roleRow.name}>
                  {role.displayName}
                  {role.isSystem && <span className={ui.roleRow.systemBadge}>System</span>}
                </div>
                <div className={ui.roleRow.detail}>
                  {role.allowedViews === '*'
                    ? 'Full access'
                    : `${(role.allowedViews as string[]).length} views`}
                </div>
              </div>
              <div className={ui.roleRow.actions}>
                <button onClick={() => handleEdit(id)} className={ui.roleRow.editButton}>
                  <ui.roleRow.editIcon className={ui.roleRow.iconSize} />
                </button>
                {!role.isSystem && (
                  <button onClick={() => handleDeleteRole(id)} className={ui.roleRow.deleteButton}>
                    <ui.roleRow.deleteIcon className={ui.roleRow.iconSize} />
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

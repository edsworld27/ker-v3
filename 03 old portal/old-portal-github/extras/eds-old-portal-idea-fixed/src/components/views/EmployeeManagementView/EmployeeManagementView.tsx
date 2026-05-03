import React, { useState } from 'react';
import { motion } from 'motion/react';
import { employeeManagementViewUI as ui } from './ui';
import { useAppContext } from '../../../context/AppContext';
import { useRoleConfig } from '../../../hooks/useRoleConfig';
import { useTheme } from '../../../hooks/useTheme';
import { AppUser } from '../../../types';

export const EmployeeManagementView: React.FC<{ onAddUser: () => void; onDeleteUser: (id: number) => void }> = ({ onAddUser, onDeleteUser }) => {
  const { users, setUsers, agencyConfig, addLog } = useAppContext();
  const { label } = useRoleConfig();
  const theme = useTheme();
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);

  // Agency-side users: exclude client roles
  const agencyUsers = users.filter(u => !u.role.startsWith('Client'));

  // All non-client roles from agencyConfig — includes any custom roles created in Configurator
  const agencyRoles = Object.entries(agencyConfig.roles).filter(([k]) => !k.startsWith('Client'));

  const handleUpdateUserRole = (userId: number, roleId: string) => {
    if (roleId === 'none') {
      setUsers(users.map(u => u.id === userId ? { ...u, customRoleId: undefined } : u));
    } else {
      const roleCfg = agencyConfig.roles[roleId];
      setUsers(users.map(u => u.id === userId ? { ...u, customRoleId: roleId } : u));
      addLog('User Role Updated', `Updated role for user ID ${userId} to ${roleCfg?.displayName ?? roleId}`, 'system');
    }
    setEditingUser(null);
  };

  return (
    <motion.div
      key={ui.container.animation.key}
      initial={ui.container.animation.initial}
      animate={ui.container.animation.animate}
      className={ui.container.base}
    >
      <div className={ui.header.base}>
        <div>
          <h2 className={ui.header.titleStyle}>{label('team')} Management</h2>
          <p className={ui.header.subtitleStyle}>{ui.header.text.subtitle}</p>
        </div>
        <button onClick={onAddUser} className={ui.header.addButton.base} style={theme.primaryBgStyle}>
          <ui.header.addButton.icon className={ui.header.addButton.iconSize} />
          {ui.header.text.addButton}
        </button>
      </div>

      <div className={ui.grid}>
        {agencyUsers.map(user => {
          const customRole = user.customRoleId ? agencyConfig.roles[user.customRoleId] : undefined;
          const effectiveRole = customRole ?? agencyConfig.roles[user.role];
          const allowedViews: string[] = effectiveRole?.allowedViews === '*'
            ? ['All Views']
            : (effectiveRole?.allowedViews as string[] | undefined) ?? [];

          return (
            <div key={user.id} className={ui.userCard.base}>
              <div className={ui.userCard.avatarRow}>
                <div className={ui.userCard.avatar}>
                  {user.avatar || user.name.charAt(0)}
                </div>
                <div className={ui.userCard.info}>
                  <div className={ui.userCard.name}>{user.name}</div>
                  <div className={ui.userCard.detail}>
                    {customRole ? customRole.displayName : user.role} • {user.email}
                  </div>
                </div>
              </div>
              <div className={ui.userCard.rightSection}>
                <div className={ui.userCard.permissionsBlock}>
                  <div className={ui.userCard.permissionsLabel}>{ui.userCard.text.permissionsLabel}</div>
                  <div className={ui.userCard.permissionBadges}>
                    {allowedViews.slice(0, 2).map((p, i) => (
                      <span key={`${p}-${i}`} className={ui.userCard.permissionBadge}>{p}</span>
                    ))}
                    {allowedViews.length > 2 && (
                      <span className={ui.userCard.permissionOverflow}>+ {allowedViews.length - 2}</span>
                    )}
                  </div>
                </div>
                <div className={ui.userCard.actions.base}>
                  <button
                    onClick={() => setEditingUser(user)}
                    className={ui.userCard.actions.editButton}
                    title="Edit Role"
                  >
                    <ui.userCard.actions.editIcon className={ui.userCard.actions.iconSize} />
                  </button>
                  <button
                    onClick={() => onDeleteUser(user.id)}
                    className={ui.userCard.actions.deleteButton}
                    title="Delete User"
                  >
                    <ui.userCard.actions.deleteIcon className={ui.userCard.actions.iconSize} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {editingUser && (
        <div className={ui.editModal.overlay}>
          <motion.div
            initial={ui.editModal.card.animation.initial}
            animate={ui.editModal.card.animation.animate}
            className={ui.editModal.card.base}
          >
            <div className={ui.editModal.header.base}>
              <h3 className={ui.editModal.header.titleStyle}>
                <ui.editModal.header.icon className={ui.editModal.header.iconSize} />
                {ui.editModal.text.titlePrefix} {editingUser.name}
              </h3>
              <button onClick={() => setEditingUser(null)} className={ui.editModal.header.closeButton}>
                <ui.editModal.header.closeIcon className={ui.editModal.header.closeIconSize} />
              </button>
            </div>

            <div className={ui.editModal.body.base}>
              <label className={ui.editModal.body.label}>{ui.editModal.text.roleLabel}</label>
              <select
                value={editingUser.customRoleId || 'none'}
                onChange={(e) => handleUpdateUserRole(editingUser.id, e.target.value)}
                className={ui.editModal.body.select}
              >
                <option value="none">Default ({editingUser.role})</option>
                {agencyRoles.map(([roleId, roleCfg]) => (
                  <option key={roleId} value={roleId}>{roleCfg.displayName}</option>
                ))}
              </select>
              <p className={ui.editModal.body.hint}>{ui.editModal.text.hint}</p>
            </div>

            <div className={ui.editModal.footer.base}>
              <button onClick={() => setEditingUser(null)} className={ui.editModal.footer.cancelButton}>
                {ui.editModal.text.cancelText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

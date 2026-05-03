import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { employeeManagementModalUI as ui } from './ui';
import { useAppContext } from '../../../context/AppContext';
import { AppUser } from '../../../types';

interface EmployeeManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddUser: () => void;
  onDeleteUser: (id: number) => void;
}

export function EmployeeManagementModal({
  isOpen,
  onClose,
  onAddUser,
  onDeleteUser,
}: EmployeeManagementModalProps) {
  const { users, setUsers, agencyConfig, addLog } = useAppContext();
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);

  if (!isOpen) return null;

  const agencyUsers = users.filter(u => u.role.includes('Agency') || u.role === 'Founder');

  const handleUpdateUserRole = (userId: number, customRoleId: string) => {
    const role = agencyConfig.roles[customRoleId];
    if (role) {
      setUsers(users.map(u => u.id === userId ? { ...u, customRoleId } : u));
      addLog('User Role Updated', `Updated role for user ID ${userId} to ${role.displayName}`, 'system');
    } else if (customRoleId === 'none') {
      setUsers(users.map(u => u.id === userId ? { ...u, customRoleId: undefined } : u));
    }
    setEditingUser(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={ui.container}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className={ui.overlay}
          />
          <motion.div
            initial={ui.modal.initial}
            animate={ui.modal.animate}
            exit={ui.modal.exit}
            className={ui.modal.className}
          >
            <div className={ui.header.container}>
              <h2 className={ui.header.title}>{ui.text.title}</h2>
              <button
                onClick={onClose}
                className={ui.header.closeButton.className}
              >
                <ui.header.closeButton.icon className={ui.header.closeButton.iconClass} />
              </button>
            </div>
            <div className={ui.body.container}>
              <div className={ui.body.actions.container}>
                <button
                  onClick={onAddUser}
                  className={ui.body.actions.addButton.className}
                >
                  <ui.body.actions.addButton.icon className={ui.body.actions.addButton.iconClass} />
                  {ui.text.add}
                </button>
              </div>

              <div className={ui.body.grid}>
                {agencyUsers.map(user => {
                  const roleId = user.customRoleId || user.role;
                  const roleConfig = agencyConfig.roles[roleId];
                  const allowedViews = roleConfig?.allowedViews === '*' ? ['all'] : (roleConfig?.allowedViews || []);
                  
                  return (
                    <div key={user.id} className={ui.body.card.className}>
                      <div className={ui.body.card.main}>
                        <div className={ui.body.card.avatar}>
                          {user.avatar || user.name.charAt(0)}
                        </div>
                        <div>
                          <div className={ui.body.card.name}>{user.name}</div>
                          <div className={ui.body.card.details}>
                            {roleConfig ? roleConfig.displayName : user.role} • {user.email}
                          </div>
                        </div>
                      </div>
                      <div className={ui.body.card.actions.container}>
                        <div className={ui.body.card.actions.permissions.container}>
                          <div className={ui.body.card.actions.permissions.label}>{ui.text.permissions}</div>
                          <div className={ui.body.card.actions.permissions.pills}>
                            {allowedViews.slice(0, 2).map((p, i) => (
                              <span key={`${p}-${i}`} className={ui.body.card.actions.permissions.pill}>{p}</span>
                            ))}
                            {allowedViews.length > 2 && <span className={ui.body.card.actions.permissions.more}>+{allowedViews.length - 2}</span>}
                          </div>
                        </div>
                        <div className={ui.body.card.actions.buttons.container}>
                          <button
                            onClick={() => setEditingUser(user)}
                            className={ui.body.card.actions.buttons.edit.className}
                          >
                            <ui.body.card.actions.buttons.edit.icon className={ui.body.card.actions.buttons.edit.iconClass} />
                          </button>
                          <button
                            onClick={() => onDeleteUser(user.id)}
                            className={ui.body.card.actions.buttons.delete.className}
                          >
                            <ui.body.card.actions.buttons.delete.icon className={ui.body.card.actions.buttons.delete.iconClass} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

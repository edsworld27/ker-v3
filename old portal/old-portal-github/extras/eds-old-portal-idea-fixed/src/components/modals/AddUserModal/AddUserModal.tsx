import React from 'react';
import { motion } from 'motion/react';
import { addUserModalUI as ui } from './ui';
import { useTheme } from '../../../hooks/useTheme';
import { AppUser, Client, Agency, UserRole } from '../../../types';
import { useAppContext } from '../../../context/AppContext';
import { useRoleConfig } from '../../../hooks/useRoleConfig';

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
  const theme = useTheme();
  const { allRoles } = useRoleConfig();
  if (!isOpen) return null;

  const STANDARD_ROLES: UserRole[] = ['Founder', 'AgencyManager', 'AgencyEmployee', 'ClientOwner', 'ClientEmployee'];
  const handleRoleSelect = (roleId: string) => {
    const baseRole: UserRole = STANDARD_ROLES.includes(roleId as UserRole)
      ? roleId as UserRole
      : (roleId.startsWith('Client') ? 'ClientEmployee' : 'AgencyEmployee');
    setNewUser({
      ...newUser,
      role: roleId as UserRole, // Correctly saves roleId as the role state per user request
      customRoleId: roleId,
      clientId: (baseRole === 'ClientOwner' || baseRole === 'ClientEmployee')
        ? (currentUser?.role === 'ClientOwner' ? currentUser.clientId : clients[0]?.id)
        : undefined,
    });
  };

  return (
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
          <div className={ui.header.textContainer}>
            <h3 className={ui.header.title}>{selectedUserToEdit ? ui.text.editTitle : ui.text.addTitle}</h3>
            <p className={ui.header.subtitle}>{selectedUserToEdit ? `${ui.text.editSubtitle} ${newUser.name}.` : ui.text.addSubtitle}</p>
          </div>
          <button
            onClick={onClose}
            className={ui.header.closeButton.className}
          >
            <ui.header.closeButton.icon className={ui.header.closeButton.iconClass} />
          </button>
        </div>

        <div className={ui.form.container}>
          {!selectedUserToEdit && (
            <div className={ui.form.grid}>
              <div className={ui.form.field.container}>
                <label className={ui.form.field.label}>{ui.text.nameLabel}</label>
                <div className={ui.form.field.inputContainer}>
                  <div className={ui.form.field.iconContainer}>
                    <ui.icons.name className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder={ui.text.namePlaceholder}
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className={ui.form.field.input}
                  />
                </div>
              </div>
              <div className={ui.form.field.container}>
                <label className={ui.form.field.label}>{ui.text.emailLabel}</label>
                <div className={ui.form.field.inputContainer}>
                  <div className={ui.form.field.iconContainer}>
                    <ui.icons.email className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    placeholder={ui.text.emailPlaceholder}
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className={ui.form.field.input}
                  />
                </div>
              </div>
            </div>
          )}

          <div className={ui.form.userType.container}>
            <label className={ui.form.userType.label}>{ui.text.userTypeLabel}</label>
            <select
              value={newUser.customRoleId ?? newUser.role}
              onChange={(e) => handleRoleSelect(e.target.value)}
              className={ui.form.clientWorkspace.select}
            >
              {allRoles.map(role => (
                <option key={role.id} value={role.id} className={ui.form.clientWorkspace.option}>
                  {role.displayName}
                </option>
              ))}
            </select>
          </div>

          {(currentUser?.role !== 'ClientOwner') && (newUser.role === 'ClientOwner' || newUser.role === 'ClientEmployee') && (
            <div className={ui.form.clientWorkspace.container}>
              <label className={ui.form.clientWorkspace.label}>{ui.text.clientWorkspaceLabel}</label>
              <select
                value={newUser.clientId}
                onChange={(e) => setNewUser({ ...newUser, clientId: e.target.value })}
                className={ui.form.clientWorkspace.select}
              >
                {clients.map(client => (
                  <option key={client.id} value={client.id} className={ui.form.clientWorkspace.option}>{client.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className={ui.footer.container}>
            <button
              onClick={onClose}
              className={ui.footer.cancelButton}
            >
              {ui.text.cancel}
            </button>
            <button
              onClick={handleAddUser}
              className={`${ui.footer.submitButton} !shadow-none`}
              style={theme.primaryBgStyle}
            >
              {selectedUserToEdit ? ui.text.update : ui.text.submit}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

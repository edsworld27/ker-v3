import React from 'react';
import { motion } from 'motion/react';
import { addRoleModalUI as ui } from './ui';
import { PortalView } from '../../../types';

interface AddRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  newRoleForm: { name: string; permissions: (PortalView | string)[] };
  setNewRoleForm: React.Dispatch<React.SetStateAction<any>>;
  handleCreateRole: () => void;
}

export const AddRoleModal: React.FC<AddRoleModalProps> = ({
  isOpen,
  onClose,
  newRoleForm,
  setNewRoleForm,
  handleCreateRole
}) => {
  if (!isOpen) return null;

  const togglePermission = (permId: string) => {
    const current = newRoleForm.permissions;
    const updated = current.includes(permId as PortalView)
      ? current.filter(p => p !== permId)
      : [...current, permId as PortalView];
    
    setNewRoleForm({ ...newRoleForm, permissions: updated });
  };

  return (
    <div className={ui.overlay.base}>
      <motion.div
        initial={ui.content.animation.initial}
        animate={ui.content.animation.animate}
        exit={ui.content.animation.exit}
        className={ui.content.base}
      >
        <div className={ui.header.layout}>
          <div className={ui.header.titleGroup}>
            <div className={ui.header.iconWrapper}>
              <ui.header.icon className={ui.header.iconSize} />
            </div>
            <div>
              <h3 className={ui.header.titleStyle}>{ui.header.title}</h3>
              <p className={ui.header.subtitleStyle}>{ui.header.subtitle}</p>
            </div>
          </div>
          <button onClick={onClose} className={ui.header.closeBtn}>
            <ui.header.closeIcon className={ui.header.closeIconSize} />
          </button>
        </div>

        <div className={ui.form.layout}>
          <div className={ui.form.inputWrapper}>
            <label className={ui.form.label}>{ui.form.labels.roleName}</label>
            <input type="text" placeholder={ui.form.placeholders.roleName} value={newRoleForm.name} onChange={(e) => setNewRoleForm({...newRoleForm, name: e.target.value})} className={ui.form.input} />
          </div>

          <div className={ui.form.inputWrapper}>
            <label className={ui.form.label}>{ui.form.labels.permissions}</label>
            <div className={ui.form.permissions.grid}>
              {ui.form.permissions.options.map(opt => (
                <div key={opt.id} onClick={() => togglePermission(opt.id)} className={`${ui.form.permissions.itemLayout} ${newRoleForm.permissions.includes(opt.id as any) ? ui.form.permissions.itemActive : ui.form.permissions.itemInactive}`}>
                  <ui.form.permissions.checkIcon className={`${ui.form.permissions.iconSize} ${newRoleForm.permissions.includes(opt.id as any) ? 'opacity-100' : 'opacity-0'}`} />
                  <span className={ui.form.permissions.labelText}>{opt.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className={ui.footer.layout}>
          <button onClick={onClose} className={ui.footer.cancelBtn}>Cancel</button>
          <button onClick={handleCreateRole} disabled={!newRoleForm.name} className={`${ui.footer.submitBtn} disabled:opacity-50 disabled:cursor-not-allowed`}>Create Role</button>
        </div>
      </motion.div>
    </div>
  );
};
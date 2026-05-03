import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { editClientModalUI as ui } from './ui';
import { PortalView, ClientStage } from '../../../types';

interface EditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: any;
  onSave: (updatedClient: any) => void;
}

export function EditClientModal({ isOpen, onClose, client, onSave }: EditClientModalProps) {
  const [formData, setFormData] = useState({ ...client });

  useEffect(() => {
    if (client) {
      setFormData({ ...client });
    }
  }, [client]);

  if (!isOpen) return null;

  const togglePermission = (permission: PortalView) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p: string) => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={ui.overlay}
          onClick={onClose}
        >
          <motion.div
            initial={ui.modal.initial}
            animate={ui.modal.animate}
            exit={ui.modal.exit}
            className={ui.modal.className}
            onClick={e => e.stopPropagation()}
          >
            <div className={ui.header.container}>
              <h2 className={ui.header.title}>
                <ui.header.icon className={ui.header.iconClass} />
                {ui.text.title}
              </h2>
              <button onClick={onClose} className={ui.header.closeButton.className}>
                <ui.header.closeButton.icon className={ui.header.closeButton.iconClass} />
              </button>
            </div>

            <div className={ui.form.container}>
              <div className={ui.form.field.container}>
                <label className={ui.form.field.label}>{ui.text.nameLabel}</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className={ui.form.field.input}
                />
              </div>
              <div className={ui.form.field.container}>
                <label className={ui.form.field.label}>{ui.text.emailLabel}</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className={ui.form.field.input}
                />
              </div>
              <div className={ui.form.field.container}>
                <label className={ui.form.field.label}>{ui.text.websiteLabel}</label>
                <input
                  type="text"
                  value={formData.websiteUrl || ''}
                  onChange={e => setFormData({ ...formData, websiteUrl: e.target.value })}
                  className={ui.form.field.input}
                />
              </div>
              <div className={ui.form.field.container}>
                <label className={ui.form.field.label}>{ui.text.stageLabel}</label>
                <select
                  value={formData.stage}
                  onChange={e => setFormData({ ...formData, stage: e.target.value as ClientStage })}
                  className={ui.form.select}
                >
                  {ui.stages.map(stage => (
                    <option key={stage} value={stage} className={ui.form.option}>{stage.charAt(0).toUpperCase() + stage.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className={ui.form.field.container}>
                <label className={ui.form.field.label}>{ui.text.modulesLabel}</label>
                <div className={ui.form.modules.grid}>
                  {ui.AVAILABLE_MODULES.map(module => (
                    <button
                      key={module}
                      onClick={() => togglePermission(module)}
                      className={`${ui.form.modules.button.className} ${formData.permissions?.includes(module) ? ui.form.modules.button.active : ui.form.modules.button.inactive}`}
                    >
                      {module.charAt(0).toUpperCase() + module.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className={ui.footer.container}>
              <button
                onClick={onClose}
                className={ui.footer.cancelButton}
              >
                {ui.text.cancel}
              </button>
              <button
                onClick={handleSave}
                className={ui.footer.saveButton.className}
              >
                <ui.footer.saveButton.icon className={ui.footer.saveButton.iconClass} />
                {ui.text.save}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

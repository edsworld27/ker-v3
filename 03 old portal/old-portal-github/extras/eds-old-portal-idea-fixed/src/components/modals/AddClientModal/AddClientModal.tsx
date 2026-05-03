import React from 'react';
import { motion } from 'motion/react';
import { addClientModalUI as ui } from './ui';
import { ClientStage, PortalView } from '../../../types';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  newClientForm: {
    name: string;
    email: string;
    stage: ClientStage;
    websiteUrl: string;
    permissions?: any[];
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
          <div className={ui.form.group}>
            <div className={ui.form.inputWrapper}>
              <label className={ui.form.label}>{ui.form.labels.name}</label>
              <div className={ui.form.inputContainer}>
                <ui.form.icons.company className={ui.form.inputIconWrapper} />
                <input type="text" placeholder={ui.form.placeholders.name} value={newClientForm.name} onChange={(e) => setNewClientForm({...newClientForm, name: e.target.value})} className={ui.form.input} />
              </div>
            </div>
            
            <div className={ui.form.inputWrapper}>
              <label className={ui.form.label}>{ui.form.labels.email}</label>
              <div className={ui.form.inputContainer}>
                <ui.form.icons.mail className={ui.form.inputIconWrapper} />
                <input type="email" placeholder={ui.form.placeholders.email} value={newClientForm.email} onChange={(e) => setNewClientForm({...newClientForm, email: e.target.value})} className={ui.form.input} />
              </div>
            </div>

            <div className={ui.form.inputWrapper}>
              <label className={ui.form.label}>{ui.form.labels.website}</label>
              <div className={ui.form.inputContainer}>
                <ui.form.icons.globe className={ui.form.inputIconWrapper} />
                <input type="url" placeholder={ui.form.placeholders.website} value={newClientForm.websiteUrl} onChange={(e) => setNewClientForm({...newClientForm, websiteUrl: e.target.value})} className={ui.form.input} />
              </div>
            </div>

            <div className={ui.form.inputWrapper}>
              <label className={ui.form.label}>{ui.form.labels.stage}</label>
              <select value={newClientForm.stage} onChange={(e) => setNewClientForm({...newClientForm, stage: e.target.value})} className={ui.form.select}>
                <option value="discovery">Discovery</option>
                <option value="onboarding">Onboarding</option>
                <option value="design">Design</option>
                <option value="development">Development</option>
                <option value="live">Live</option>
              </select>
            </div>
          </div>
        </div>
        <div className={ui.footer.layout}>
          <button onClick={onClose} className={ui.footer.cancelBtn}>Cancel</button>
          <button onClick={handleAddClient} disabled={!newClientForm.name || !newClientForm.email} className={`${ui.footer.submitBtn} disabled:opacity-50 disabled:cursor-not-allowed`}>Create Client</button>
        </div>
      </motion.div>
    </div>
  );
};
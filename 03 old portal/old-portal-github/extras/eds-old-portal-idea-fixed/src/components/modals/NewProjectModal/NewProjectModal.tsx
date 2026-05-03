import React from 'react';
import { motion } from 'motion/react';
import { newProjectModalUI as ui } from './ui';
import { Client } from '../../../types';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  newProjectForm: { name: string; clientId: string; description: string; status: 'Planning' | 'Active' | 'Completed' };
  setNewProjectForm: React.Dispatch<React.SetStateAction<any>>;
  clients: Client[];
  handleAddProject: () => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen, onClose, newProjectForm, setNewProjectForm, clients, handleAddProject
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
          <div className={ui.form.inputWrapper}>
            <label className={ui.form.label}>{ui.form.labels.name}</label>
            <div className={ui.form.inputContainer}>
              <ui.form.icons.name className={`${ui.form.inputIconWrapper} w-4 h-4`} />
              <input type="text" placeholder={ui.form.placeholders.name} value={newProjectForm.name} onChange={(e) => setNewProjectForm({ ...newProjectForm, name: e.target.value })} className={ui.form.input} />
            </div>
          </div>

          <div className={ui.form.inputWrapper}>
            <label className={ui.form.label}>{ui.form.labels.client}</label>
            <div className={ui.form.inputContainer}>
              <ui.form.icons.client className={`${ui.form.inputIconWrapper} w-4 h-4`} />
              <select value={newProjectForm.clientId} onChange={(e) => setNewProjectForm({ ...newProjectForm, clientId: e.target.value })} className={ui.form.select}>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className={ui.form.inputWrapper}>
            <label className={ui.form.label}>{ui.form.labels.status}</label>
            <div className={ui.form.inputContainer}>
              <ui.form.icons.status className={`${ui.form.inputIconWrapper} w-4 h-4`} />
              <select value={newProjectForm.status} onChange={(e) => setNewProjectForm({ ...newProjectForm, status: e.target.value })} className={ui.form.select}>
                {ui.form.statusOptions.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>

          <div className={ui.form.inputWrapper}>
            <label className={ui.form.label}>{ui.form.labels.desc}</label>
            <div className={ui.form.inputContainer}>
              <ui.form.icons.desc className={`${ui.form.textareaIconWrapper} w-4 h-4`} />
              <textarea placeholder={ui.form.placeholders.desc} value={newProjectForm.description} onChange={(e) => setNewProjectForm({ ...newProjectForm, description: e.target.value })} className={ui.form.textarea} />
            </div>
          </div>
        </div>

        <div className={ui.footer.layout}>
          <button onClick={onClose} className={ui.footer.cancelBtn}>{ui.footer.cancelText}</button>
          <button onClick={handleAddProject} disabled={!newProjectForm.name} className={`${ui.footer.submitBtn} ${ui.footer.disabledClass}`}>{ui.footer.submitText}</button>
        </div>
      </motion.div>
    </div>
  );
};

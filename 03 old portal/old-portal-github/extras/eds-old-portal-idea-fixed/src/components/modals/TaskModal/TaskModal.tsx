import React from 'react';
import { motion } from 'motion/react';
import { taskModalUI as ui } from './ui';
import { Project, AppUser } from '../../../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  newTaskForm: { title: string; projectId: string; priority: 'Low' | 'Medium' | 'High'; assigneeId: number; description: string };
  setNewTaskForm: React.Dispatch<React.SetStateAction<any>>;
  projects: Project[];
  users: AppUser[];
  handleAddTask: () => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen, onClose, newTaskForm, setNewTaskForm, projects, users, handleAddTask
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
            <label className={ui.form.label}>{ui.form.labels.title}</label>
            <div className={ui.form.inputContainer}>
              <ui.form.icons.title className={`${ui.form.inputIconWrapper} w-4 h-4`} />
              <input type="text" placeholder={ui.form.placeholders.title} value={newTaskForm.title} onChange={(e) => setNewTaskForm({ ...newTaskForm, title: e.target.value })} className={ui.form.input} />
            </div>
          </div>

          <div className={ui.form.inputWrapper}>
            <label className={ui.form.label}>{ui.form.labels.project}</label>
            <div className={ui.form.inputContainer}>
              <ui.form.icons.project className={`${ui.form.inputIconWrapper} w-4 h-4`} />
              <select value={newTaskForm.projectId} onChange={(e) => setNewTaskForm({ ...newTaskForm, projectId: e.target.value })} className={ui.form.select}>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>

          <div className={ui.form.inputWrapper}>
            <label className={ui.form.label}>{ui.form.labels.priority}</label>
            <div className={ui.form.inputContainer}>
              <ui.form.icons.priority className={`${ui.form.inputIconWrapper} w-4 h-4`} />
              <select value={newTaskForm.priority} onChange={(e) => setNewTaskForm({ ...newTaskForm, priority: e.target.value })} className={ui.form.select}>
                {ui.form.priorityOptions.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>

          <div className={ui.form.inputWrapper}>
            <label className={ui.form.label}>{ui.form.labels.assignee}</label>
            <div className={ui.form.inputContainer}>
              <ui.form.icons.assignee className={`${ui.form.inputIconWrapper} w-4 h-4`} />
              <select value={newTaskForm.assigneeId} onChange={(e) => setNewTaskForm({ ...newTaskForm, assigneeId: parseInt(e.target.value) })} className={ui.form.select}>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
          </div>

          <div className={ui.form.inputWrapper}>
            <label className={ui.form.label}>{ui.form.labels.desc}</label>
            <div className={ui.form.inputContainer}>
              <ui.form.icons.desc className={`${ui.form.textareaIconWrapper} w-4 h-4`} />
              <textarea placeholder={ui.form.placeholders.desc} value={newTaskForm.description} onChange={(e) => setNewTaskForm({ ...newTaskForm, description: e.target.value })} className={ui.form.textarea} />
            </div>
          </div>
        </div>

        <div className={ui.footer.layout}>
          <button onClick={onClose} className={ui.footer.cancelBtn}>{ui.footer.cancelText}</button>
          <button onClick={handleAddTask} disabled={!newTaskForm.title} className={`${ui.footer.submitBtn} ${ui.footer.disabledClass}`}>{ui.footer.submitText}</button>
        </div>
      </motion.div>
    </div>
  );
};

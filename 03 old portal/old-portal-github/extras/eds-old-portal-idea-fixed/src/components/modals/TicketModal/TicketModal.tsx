import React from 'react';
import { motion } from 'motion/react';
import { ticketModalUI as ui } from './ui';
import { AppTicket, AppUser, LogEntry } from '../../../types';

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  newTicket: { title: string; priority: 'High' | 'Medium' | 'Low'; type: 'internal' | 'client' };
  setNewTicket: (ticket: { title: string; priority: 'High' | 'Medium' | 'Low'; type: 'internal' | 'client' }) => void;
  userProfile: { name: string; email: string };
  currentUser: AppUser | null;
  tickets: AppTicket[];
  setTickets: (tickets: AppTicket[]) => void;
  addLog: (action: string, details: string, type: LogEntry['type']) => void;
}

export function TicketModal({
  isOpen,
  onClose,
  newTicket,
  setNewTicket,
  userProfile,
  currentUser,
  tickets,
  setTickets,
  addLog
}: TicketModalProps) {
  if (!isOpen) return null;

  const handleCreateTicket = () => {
    if (!newTicket.title) return;
    setTickets([...tickets, {
      id: `TIC-00${tickets.length + 1}`,
      title: newTicket.title,
      status: 'Open',
      priority: newTicket.priority,
      creator: userProfile.name,
      creatorId: currentUser?.id || 'guest',
      createdAt: new Date().toISOString(),
      type: newTicket.type
    }]);
    onClose();
    setNewTicket({ title: '', priority: 'Medium', type: 'internal' });
    addLog('Ticket Created', `New ${newTicket.type} ticket: ${newTicket.title}`, 'action');
  };

  return (
    <div className={ui.overlay}>
      <motion.div
        initial={ui.modal.motion.initial}
        animate={ui.modal.motion.animate}
        className={ui.modal.base}
      >
        <div className={ui.header.base}>
          <div>
            <h3 className={ui.header.title}>{ui.text.title}</h3>
            <p className={ui.header.subtitle}>{ui.text.subtitlePrefix} {userProfile.name}</p>
          </div>
          <button onClick={onClose} className={ui.header.closeButton}>
            <ui.header.closeIcon className={ui.header.closeIconSize} />
          </button>
        </div>

        <div className={ui.form.base}>
          <div className={ui.form.field.base}>
            <label className={ui.form.field.label}>{ui.text.subjectLabel}</label>
            <input
              type="text"
              value={newTicket.title}
              onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
              placeholder={ui.text.subjectPlaceholder}
              className={ui.form.field.input}
            />
          </div>

          <div className={ui.form.grid}>
            <div className={ui.form.field.base}>
              <label className={ui.form.field.label}>{ui.text.priorityLabel}</label>
              <select
                value={newTicket.priority}
                onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value as 'High' | 'Medium' | 'Low' })}
                className={ui.form.field.select}
              >
                {ui.text.priorityOptions.map(o => (
                  <option key={o.value} value={o.value} className={ui.form.field.optionBg}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className={ui.form.field.base}>
              <label className={ui.form.field.label}>{ui.text.categoryLabel}</label>
              <select
                value={newTicket.type}
                onChange={(e) => setNewTicket({ ...newTicket, type: e.target.value as 'internal' | 'client' })}
                className={ui.form.field.select}
              >
                {ui.text.typeOptions.map(o => (
                  <option key={o.value} value={o.value} className={ui.form.field.optionBg}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={ui.footer.base}>
            <button onClick={onClose} className={ui.footer.cancelButton}>{ui.text.cancelText}</button>
            <button onClick={handleCreateTicket} className={ui.footer.submitButton}>{ui.text.submitText}</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

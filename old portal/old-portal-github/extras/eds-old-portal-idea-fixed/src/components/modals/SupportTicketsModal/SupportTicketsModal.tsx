import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supportTicketsModalUI as ui } from './ui';
import { useAppContext } from '../../../context/AppContext';

interface SupportTicketsModalProps {
  isOpen: boolean;
  onClose: () => void;
  setShowTicketModal: (show: boolean) => void;
}

export function SupportTicketsModal({ isOpen, onClose, setShowTicketModal }: SupportTicketsModalProps) {
  const { tickets } = useAppContext();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className={ui.overlay}>
        <motion.div
          initial={ui.motion.backdrop.initial}
          animate={ui.motion.backdrop.animate}
          exit={ui.motion.backdrop.exit}
          onClick={onClose}
          className={ui.backdrop}
        />
        <motion.div
          initial={ui.motion.modal.initial}
          animate={ui.motion.modal.animate}
          exit={ui.motion.modal.exit}
          className={ui.modal}
        >
          <div className={ui.header.base}>
            <h2 className={ui.header.title}>{ui.text.title}</h2>
            <button onClick={onClose} className={ui.header.closeButton}>
              <ui.header.closeIcon className={ui.header.closeIconSize} />
            </button>
          </div>
          <div className={ui.body}>
            <div className={ui.toolbar}>
              <button onClick={() => setShowTicketModal(true)} className={ui.newTicketButton.base}>
                <ui.newTicketButton.icon className={ui.newTicketButton.iconSize} />
                {ui.text.newTicket}
              </button>
            </div>

            <div className={ui.table.wrapper}>
              <div className={ui.table.scrollWrapper}>
                <table className={ui.table.base}>
                  <thead>
                    <tr className={ui.table.thead}>
                      {ui.text.tableHeaders.map((h, i) => (
                        <th key={h} className={i === ui.text.tableHeaders.length - 1 ? ui.table.thRight : ui.table.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className={ui.table.tbody}>
                    {tickets.map(ticket => (
                      <tr key={ticket.id} className={ui.table.tr}>
                        <td className={ui.table.tdId}>{ticket.id}</td>
                        <td className={ui.table.tdDetails}>
                          <div className={ui.table.tdTitle}>{ticket.title}</div>
                          <div className={`${ui.table.priority.base} ${
                            ticket.priority === 'High' ? ui.table.priority.high :
                            ticket.priority === 'Medium' ? ui.table.priority.medium : ui.table.priority.low
                          }`}>
                            {ticket.priority} {ui.text.prioritySuffix}
                          </div>
                        </td>
                        <td className={ui.table.tdType}>
                          <span className={`${ui.table.typeBadge.base} ${ticket.type === 'client' ? ui.table.typeBadge.client : ui.table.typeBadge.internal}`}>
                            {ticket.type}
                          </span>
                        </td>
                        <td className={ui.table.tdStatus}>
                          <span className={`${ui.table.statusBadge.base} ${ticket.status === 'Open' ? ui.table.statusBadge.open : ui.table.statusBadge.closed}`}>
                            {ticket.status}
                          </span>
                        </td>
                        <td className={ui.table.tdCreator}>{ticket.creator}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

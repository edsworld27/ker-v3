import React from 'react';
import { motion } from 'motion/react';
import { AppTicket } from '../../../types';
import { supportTicketsViewUI as ui } from './ui';
import { useAppContext } from '../../../context/AppContext';
import { useModalContext } from '../../../context/ModalContext';

interface SupportTicketsViewProps {
  tickets?: AppTicket[];
  setShowTicketModal?: (show: boolean) => void;
}

export const SupportTicketsView: React.FC<SupportTicketsViewProps> = (props) => {
  const { tickets: contextTickets } = useAppContext();
  const { setShowTicketModal: setModalShow } = useModalContext();

  const tickets = props.tickets || contextTickets;
  const setShowTicketModal = props.setShowTicketModal || setModalShow;
  return (
    <motion.div key={ui.page.motionKey} initial={ui.page.animation.initial} animate={ui.page.animation.animate} className={ui.page.layout}>
      <div className={ui.header.layout}>
        <div>
          <h2 className={ui.header.titleStyle}>{ui.header.title}</h2>
          <p className={ui.header.subtitleStyle}>{ui.header.subtitle}</p>
        </div>
        <button onClick={() => setShowTicketModal(true)} className={ui.header.newTicketBtn.layout}>
          <ui.header.newTicketBtn.icon className={ui.header.newTicketBtn.iconSize} />
          {ui.header.newTicketBtn.label}
        </button>
      </div>

      <div className={ui.table.container}>
        <div className={ui.table.wrapper}>
          <table className={ui.table.layout}>
            <thead>
              <tr className={ui.table.header.row}>
                <th className={ui.table.header.cells.id}>{ui.table.header.labels.id}</th>
                <th className={ui.table.header.cells.details}>{ui.table.header.labels.details}</th>
                <th className={ui.table.header.cells.type}>{ui.table.header.labels.type}</th>
                <th className={ui.table.header.cells.status}>{ui.table.header.labels.status}</th>
                <th className={ui.table.header.cells.creator}>{ui.table.header.labels.creator}</th>
              </tr>
            </thead>
            <tbody className={ui.table.body.layout}>
              {tickets.map(ticket => (
                <tr key={ticket.id} className={ui.table.body.row}>
                  <td className={ui.table.body.cells.id}>{ticket.id}</td>
                  <td className={ui.table.body.cells.details}>
                    <div className={ui.table.body.details.title}>{ticket.title}</div>
                    <div className={`${ui.table.body.details.priorityBase} ${ticket.priority === 'High' ? ui.table.body.details.priorityColors.High : ticket.priority === 'Medium' ? ui.table.body.details.priorityColors.Medium : ui.table.body.details.priorityColors.Low}`}>
                      {ticket.priority}{ui.table.body.details.prioritySuffix}
                    </div>
                  </td>
                  <td className={ui.table.body.cells.type}>
                    <span className={`${ui.table.body.type.base} ${ticket.type === 'client' ? ui.table.body.type.client : ui.table.body.type.internal}`}>{ticket.type}</span>
                  </td>
                  <td className={ui.table.body.cells.status}>
                    <span className={`${ui.table.body.status.base} ${ticket.status === 'Open' ? ui.table.body.status.open : ui.table.body.status.closed}`}>{ticket.status}</span>
                  </td>
                  <td className={ui.table.body.cells.creator}>
                    <div className={ui.table.body.creator.name}>{ticket.creator}</div>
                    <div className={ui.table.body.creator.date}>{new Date(ticket.createdAt).toLocaleDateString()}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { planModalUI as ui } from './ui';
import { useTheme } from '../../../hooks/useTheme';

interface PlanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PlanModal({ isOpen, onClose }: PlanModalProps) {
  const theme = useTheme();
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
            <div className={ui.summaryGrid}>
              <div className={ui.paymentCard.base} style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', borderColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)' }}>
                <div className={ui.paymentCard.label}>{ui.text.nextPaymentLabel}</div>
                <div className={ui.paymentCard.amount}>{ui.text.nextPaymentAmount}</div>
                <div className={ui.paymentCard.dateRow} style={theme.primaryTextStyle}>
                  <ui.paymentCard.calendarIcon className={ui.paymentCard.calendarIconSize} />
                  {ui.text.nextPaymentDate}
                </div>
              </div>

              <div className={ui.planCard.base}>
                <div>
                  <div className={ui.planCard.label}>{ui.text.currentPlanLabel}</div>
                  <div className={ui.planCard.planName}>{ui.text.currentPlanName}</div>
                </div>
                <button className={ui.planCard.manageButton}>{ui.text.managePlan}</button>
              </div>
            </div>

            <div className={ui.historyCard.base}>
              <div className={ui.historyCard.header}>
                <h3 className={ui.historyCard.headerTitle}>{ui.text.paymentHistoryTitle}</h3>
              </div>
              <div className={ui.historyCard.tableWrapper}>
                <table className={ui.historyCard.table}>
                  <thead>
                    <tr className={ui.historyCard.thead}>
                      {ui.text.tableHeaders.map(h => (
                        <th key={h} className={h === 'Action' ? ui.historyCard.thRight : ui.historyCard.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className={ui.historyCard.tbody}>
                    {ui.invoices.map(inv => (
                      <tr key={inv.id} className={ui.historyCard.tr}>
                        <td className={ui.historyCard.td}>{inv.id}</td>
                        <td className={ui.historyCard.tdMuted}>{inv.date}</td>
                        <td className={ui.historyCard.td}>{inv.amount}</td>
                        <td className={ui.historyCard.td}>
                          <span className={ui.historyCard.statusBadge}>{inv.status}</span>
                        </td>
                        <td className={ui.historyCard.tdRight}>
                          <button className={ui.historyCard.downloadButton} style={theme.primaryTextStyle}>
                            <ui.historyCard.downloadIcon className={ui.historyCard.downloadIconSize} />
                          </button>
                        </td>
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

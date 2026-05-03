import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { confirmationModalUI as ui } from './ui';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger'
}) => {

  return (
    <AnimatePresence>
      {isOpen && (
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
              <div className={`${ui.header.iconContainer} ${ui.iconColors[type]}`}>
                <ui.header.icon className={ui.header.iconClass} />
              </div>
              <button onClick={onClose} className={ui.header.closeButton.className}>
                <ui.header.closeButton.icon className={ui.header.closeButton.iconClass} />
              </button>
            </div>

            <h3 className={ui.body.title}>{title}</h3>
            <p className={ui.body.message}>{message}</p>

            <div className={ui.footer.container}>
              <button
                onClick={onClose}
                className={ui.footer.cancelButton}
              >
                {cancelText}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`${ui.footer.confirmButton} ${ui.colors[type]}`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

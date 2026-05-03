import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { appLauncherModalUI as ui } from './ui';

interface AppLauncherModalProps {
  isOpen: boolean;
  onClose: () => void;
  handleViewChange: (view: string) => void;
  hasPermission: (permission: string) => boolean;
}

export function AppLauncherModal({ isOpen, onClose, handleViewChange, hasPermission }: AppLauncherModalProps) {

  const visibleApps = ui.apps.filter(app => hasPermission(app.permission));

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
              <div className={ui.header.titleContainer}>
                <div className={ui.header.iconContainer}>
                  <ui.header.icon className={ui.header.iconClass} />
                </div>
                <div>
                  <h2 className={ui.header.title}>{ui.text.title}</h2>
                  <p className={ui.header.subtitle}>{ui.text.subtitle}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className={ui.header.closeButton.className}
              >
                <ui.header.closeButton.icon className={ui.header.closeButton.iconClass} />
              </button>
            </div>

            <div className={ui.body.container}>
              <div className={ui.body.grid}>
                {visibleApps.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => {
                      handleViewChange(app.id);
                      onClose();
                    }}
                    className={ui.body.card.className}
                  >
                    <div className={`${ui.body.card.iconContainer} ${app.bg}`}>
                      <app.icon className={`${ui.body.card.iconClass} ${app.color}`} />
                    </div>
                    <h3 className={ui.body.card.title}>{app.title}</h3>
                    <p className={ui.body.card.description}>{app.description}</p>
                  </button>
                ))}
              </div>
              
              {visibleApps.length === 0 && (
                <div className={ui.body.empty.container}>
                  <ui.body.empty.icon className={ui.body.empty.iconClass} />
                  <h3 className={ui.body.empty.title}>{ui.text.emptyTitle}</h3>
                  <p className={ui.body.empty.subtitle}>{ui.text.emptySubtitle}</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

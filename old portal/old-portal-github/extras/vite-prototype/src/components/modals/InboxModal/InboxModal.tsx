import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { inboxModalUI as ui } from './ui';

interface InboxModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InboxModal({ isOpen, onClose }: InboxModalProps) {
  const [activeTab, setActiveTab] = useState<'notifications' | 'updates'>('notifications');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className={ui.overlay}>
        <motion.div
          initial={ui.backdrop.motion.initial}
          animate={ui.backdrop.motion.animate}
          exit={ui.backdrop.motion.exit}
          onClick={onClose}
          className={ui.backdrop.className}
        />

        <motion.div
          initial={ui.panel.animation.initial}
          animate={ui.panel.animation.animate}
          exit={ui.panel.animation.exit}
          transition={ui.panel.animation.transition}
          className={ui.panel.base}
        >
          <div className={ui.header.base}>
            <h2 className={ui.header.title}>{ui.text.title}</h2>
            <button onClick={onClose} className={ui.header.closeButton}>
              <ui.header.closeIcon className={ui.header.closeIconSize} />
            </button>
          </div>

          <div className={ui.tabs.base}>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`${ui.tabs.button.base} ${activeTab === 'notifications' ? ui.tabs.button.active : ui.tabs.button.inactive}`}
            >
              <ui.tabs.notifications.icon className={ui.tabs.iconClass} />
              {ui.tabs.notifications.label}
            </button>
            <button
              onClick={() => setActiveTab('updates')}
              className={`${ui.tabs.button.base} ${activeTab === 'updates' ? ui.tabs.button.active : ui.tabs.button.inactive}`}
            >
              <ui.tabs.updates.icon className={ui.tabs.iconClass} />
              {ui.tabs.updates.label}
            </button>
          </div>

          <div className={ui.content.base}>
            {activeTab === 'notifications' && (
              <div className={ui.content.emptyState.container}>
                <ui.content.emptyState.icon className={ui.content.emptyState.iconClass} />
                <div>
                  <h3 className={ui.content.emptyState.title}>{ui.text.noNotifications}</h3>
                  <p className={ui.content.emptyState.subtitle}>{ui.text.allCaughtUp}</p>
                </div>
              </div>
            )}

            {activeTab === 'updates' && (
              <div className={ui.content.updatesContainer}>
                {ui.updates.map((update, i) => (
                  <div key={i} className={ui.content.updateCard.base}>
                    <div className={ui.content.updateCard.header}>
                      <h3 className={ui.content.updateCard.title}>{update.title}</h3>
                      <span className={ui.content.updateCard.badge}>{update.date}</span>
                    </div>
                    <p className={ui.content.updateCard.description}>{update.desc}</p>
                    <button className={ui.content.updateCard.readMoreButton}>
                      {ui.text.readMore} <ui.content.updateCard.readMoreIcon className={ui.content.updateCard.readMoreIconClass} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

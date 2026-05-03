import React from 'react';
import { motion } from 'motion/react';
import { crmViewUI as ui } from './ui';
import { PortalView } from '../../../types';

interface CrmViewProps {
  handleViewChange: (view: PortalView | string) => void;
}

export const CrmView: React.FC<CrmViewProps> = ({ handleViewChange }) => {
  return (
    <motion.div
      key="crm"
      initial={ui.motion.initial}
      animate={ui.motion.animate}
      exit={ui.motion.exit}
      className={ui.container}
    >
      <div className={ui.header.container}>
        <button
          onClick={() => handleViewChange('workspaces')}
          className={ui.header.backButton.className}
        >
          <ui.header.backButton.icon className={ui.header.backButton.iconClass} />
          {ui.header.backButton.text}
        </button>
      </div>
      <div className={ui.card.container}>
        <div className={ui.card.header.container}>
          <div className={ui.card.header.titleContainer}>
            <ui.card.header.icon className={ui.card.header.iconClass} />
            <h2 className={ui.card.header.title}>{ui.text.title}</h2>
          </div>
          <div className={ui.card.header.status}>{ui.text.status}</div>
        </div>
        <div className={ui.card.body.container}>
          <div className={ui.card.body.content}>
            <div className={ui.card.body.iconContainer}>
              <div className={ui.card.body.iconBg}></div>
              <ui.card.body.icon className={ui.card.body.iconClass} />
            </div>
            <h3 className={ui.card.body.title}>{ui.text.interfaceTitle}</h3>
            <p className={ui.card.body.description}>{ui.text.description}</p>
            <button
              onClick={() => alert('Opening CRM in new tab...')}
              className={ui.card.body.externalButton.className}
            >
              <ui.card.body.externalButton.icon className={ui.card.body.externalButton.iconClass} />
              {ui.card.body.externalButton.text}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

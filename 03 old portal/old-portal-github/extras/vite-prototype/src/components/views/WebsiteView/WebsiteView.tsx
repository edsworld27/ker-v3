import React from 'react';
import { motion } from 'motion/react';
import { websiteViewUI as ui } from './ui';
import { PortalView } from '../../../types';

interface WebsiteViewProps {
  handleViewChange: (view: PortalView | string) => void;
  handleExportWebsite: () => void;
}

export const WebsiteView: React.FC<WebsiteViewProps> = ({ handleViewChange, handleExportWebsite }) => {
  return (
    <motion.div
      key="website"
      initial={ui.motion.initial}
      animate={ui.motion.animate}
      exit={ui.motion.exit}
      className={ui.container}
    >
      <div className={ui.header.container}>
        <div className={ui.header.titleContainer}>
          <button
            onClick={() => handleViewChange('workspaces')}
            className={ui.header.backButton.className}
          >
            <ui.header.backButton.icon className={ui.header.backButton.iconClass} />
          </button>
          <div className={ui.header.titleIconContainer}>
            <ui.header.titleIcon className={ui.header.titleIconClass} />
            <h2 className={ui.header.title}>{ui.text.title}</h2>
          </div>
        </div>
        <div className={ui.header.actionsContainer}>
          <button
            onClick={() => alert('Report generation started...')}
            className={ui.header.reportButton.className}
          >
            <ui.header.reportButton.icon className={ui.header.reportButton.iconClass} />
            {ui.header.reportButton.text}
          </button>
          <button
            onClick={() => handleViewChange('dashboard')}
            className={ui.header.analyticsButton.className}
          >
            <ui.header.analyticsButton.icon className={ui.header.analyticsButton.iconClass} />
            {ui.header.analyticsButton.text}
          </button>
        </div>
      </div>

      <div className={ui.card.container}>
        <div className={ui.card.body}>
          <div className={ui.card.content}>
            <div className={ui.card.iconContainer}>
              <div className={ui.card.iconBg}></div>
              <ui.card.icon className={ui.card.iconClass} />
            </div>
            <h3 className={ui.card.title}>{ui.text.title}</h3>
            <p className={ui.card.description}>{ui.text.description}</p>
            <div className={ui.card.buttonsContainer}>
              <button
                onClick={() => alert('Launching editor...')}
                className={ui.card.launchButton.className}
              >
                {ui.card.launchButton.text}
              </button>
              <button
                onClick={handleExportWebsite}
                className={ui.card.backupButton.className}
              >
                {ui.card.backupButton.text}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

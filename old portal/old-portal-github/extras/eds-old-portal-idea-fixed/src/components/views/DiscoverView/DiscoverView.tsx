import React from 'react';
import { motion } from 'motion/react';
import { discoverViewUI as ui } from './ui';
import { PortalView } from '../../../types';
import { useAppContext } from '../../../context/AppContext';

interface DiscoverViewProps {
  handleViewChange?: (view: PortalView | string) => void;
}

export const DiscoverView: React.FC<DiscoverViewProps> = (props) => {
  const ctx = useAppContext();
  const handleViewChange = props.handleViewChange ?? ctx.handleViewChange;
  return (
    <motion.div
      key="discover"
      initial={ui.motion.initial}
      animate={ui.motion.animate}
      exit={ui.motion.exit}
      className={ui.container}
    >
      <ui.icon className={ui.iconClass} />
      <h1 className={ui.title}>{ui.text.title}</h1>
      <p className={ui.subtitle}>{ui.text.subtitle}</p>
      <button
        onClick={() => handleViewChange('company')}
        className={ui.backButton.className}
      >
        <ui.backButton.icon className={ui.backButton.iconClass} />
        {ui.backButton.text}
      </button>
    </motion.div>
  );
};

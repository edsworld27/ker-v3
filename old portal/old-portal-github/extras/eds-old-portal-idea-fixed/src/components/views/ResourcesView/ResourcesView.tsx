import React from 'react';
import { motion } from 'motion/react';
import { resourcesViewUI as ui } from './ui';
import { useTheme } from '../../../hooks/useTheme';
import { useRoleConfig } from '../../../hooks/useRoleConfig';
import { PortalView } from '../../../types';
import { useAppContext } from '../../../context/AppContext';

interface ResourcesViewProps {
  handleViewChange?: (view: PortalView | string) => void;
}

export const ResourcesView: React.FC<ResourcesViewProps> = (props) => {
  const ctx = useAppContext();
  const handleViewChange = props.handleViewChange ?? ctx.handleViewChange;
  const theme = useTheme();
  const { label } = useRoleConfig();

  return (
    <motion.div
      initial={ui.motion.initial}
      animate={ui.motion.animate}
      className={ui.container}
    >
      <header className={ui.header.container}>
        <div className={ui.header.textContainer}>
          <h1 className={ui.header.title}>{label('resources') || ui.text.title}</h1>
          <p className={ui.header.subtitle}>{ui.text.subtitle}</p>
        </div>
        <button onClick={() => handleViewChange('support')} className={ui.header.backButton.className}>
          <ui.header.backButton.icon className={ui.header.backButton.iconClass} />
          {ui.header.backButton.text}
        </button>
      </header>

      <div className={ui.grid.container}>
        {ui.resources.map((resource, index) => (
          <div key={index} className={`${ui.grid.card.container} hover-border-primary`}>
            <div className={ui.grid.card.iconContainer} style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)' }}>
              <resource.icon className={ui.grid.card.iconClass} style={theme.primaryTextStyle} />
            </div>
            <p className={ui.grid.card.category} style={{ color: 'color-mix(in srgb, var(--color-primary) 60%, transparent)' }}>{resource.category}</p>
            <h3 className={ui.grid.card.title}>{resource.title}</h3>
            <p className={ui.grid.card.description}>{resource.description}</p>
            <a href="#" className={ui.grid.card.link.className} style={theme.primaryTextStyle}>
              <span>{ui.grid.card.link.text}</span>
              <ui.grid.card.link.icon className={ui.grid.card.link.iconClass} />
            </a>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
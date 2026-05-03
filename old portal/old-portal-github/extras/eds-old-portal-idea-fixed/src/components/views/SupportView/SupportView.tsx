import React from 'react';
import { motion } from 'motion/react';
import { supportViewUI as ui } from './ui';
import { useTheme } from '../../../hooks/useTheme';
import { useRoleConfig } from '../../../hooks/useRoleConfig';
import { PortalView } from '../../../types';
import { useAppContext } from '../../../context/AppContext';

interface SupportViewProps {
  handleViewChange?: (view: PortalView | string) => void;
}

export const SupportView: React.FC<SupportViewProps> = (props) => {
  const ctx = useAppContext();
  const handleViewChange = props.handleViewChange ?? ctx.handleViewChange;
  const theme = useTheme();
  const { label } = useRoleConfig();

  const handleCardClick = (action: string, target: string, alertMessage?: string) => {
    if (action === 'navigate') {
      handleViewChange(target);
    } else if (action === 'alert' && alertMessage) {
      alert(alertMessage);
    }
  };

  return (
    <motion.div
      key={ui.page.motionKey}
      initial={ui.page.animation.initial}
      animate={ui.page.animation.animate}
      className={`${ui.page.layout} ${ui.page.padding} ${ui.page.maxWidth}`}
    >
      <header className={`${ui.hero.layout} ${ui.hero.gap}`}>
        <div className={ui.hero.iconLayout}>
          <ui.hero.icon className={ui.hero.iconSize} style={theme.primaryTextStyle} />
        </div>
        <h1 className={`${ui.hero.titleSize} ${ui.hero.titleWeight} ${ui.hero.titleGap}`}>{label('support') || ui.hero.title}</h1>
        <p className={`${ui.hero.subtitleSize} ${ui.hero.subtitleColor}`}>{ui.hero.subtitle}</p>
      </header>

      <div className={ui.grid.layout}>
        {ui.options.map((option, index) => (
          <div key={index} className={`${ui.card.padding} ${ui.card.radius} ${ui.card.bgHover} ${ui.card.transition} ${ui.card.layout} glass-card cursor-pointer`} onClick={() => handleCardClick(option.action, option.target, option.alertMessage)}>
            <option.icon className={`${ui.card.iconSize} ${ui.card.iconGap} ${ui.card.iconHover}`} style={theme.primaryTextStyle} />
            <div>
              <h3 className={`${ui.card.titleSize} ${ui.card.titleWeight} ${ui.card.titleGap}`}>{option.title}</h3>
              <p className={`${ui.card.bodySize} ${ui.card.bodyColor}`}>{option.body}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
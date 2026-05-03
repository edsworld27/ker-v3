import React from 'react';
import { motion } from 'motion/react';
import { DynamicRenderer, ComponentConfig } from '../../DynamicRenderer';
import { collaborationViewUI as ui } from './ui';

const CollaborationView: React.FC = () => {
  const StatusIcon = ui.statusBadge.icon;

  return (
    <motion.div
      key={ui.page.motionKey}
      initial={ui.page.animation.initial}
      animate={ui.page.animation.animate}
      className={`${ui.page.padding} ${ui.page.maxWidth}`}
    >
      {/* Header */}
      <div className={`${ui.header.layout} ${ui.header.gap}`}>
        <div>
          <h2 className={`${ui.header.titleSize} ${ui.header.titleWeight} ${ui.header.titleGap}`}>{ui.header.title}</h2>
          <p className={`${ui.header.subtitleSize} ${ui.header.subtitleColor}`}>{ui.header.subtitle}</p>
        </div>
        <div className={`${ui.statusBadge.layout} ${ui.statusBadge.textColor} ${ui.statusBadge.fontWeight} ${ui.statusBadge.alignment} ${ui.statusBadge.fontSize}`}>
          <StatusIcon className={ui.statusBadge.iconSize} />
          {ui.statusBadge.label}
        </div>
      </div>

      {/* Content grid */}
      <div className={ui.contentGrid.layout}>
        <div className={ui.contentGrid.mainCol}>
          <DynamicRenderer config={ui.leftComponents as ComponentConfig[]} />
        </div>
        <div className={ui.contentGrid.sideCol}>
          <DynamicRenderer config={ui.rightComponents as ComponentConfig[]} />
        </div>
      </div>
    </motion.div>
  );
};

export default CollaborationView;

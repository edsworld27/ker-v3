import React from 'react';
import { motion } from 'motion/react';
import { DashboardWidget } from '../../shared/DashboardWidget';
import { discoveryDashboardUI as ui } from './ui';

const DiscoveryDashboardView: React.FC = () => {
  const PhaseBadgeIcon = ui.phaseBadge.icon;

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
          <h2 className={`${ui.header.titleSize} ${ui.header.titleWeight} ${ui.header.titleGap}`}>
            {ui.header.title}
          </h2>
          <p className={`${ui.header.subtitleSize} ${ui.header.subtitleColor}`}>
            {ui.header.subtitle}
          </p>
        </div>
        <div className={`${ui.phaseBadge.layout} ${ui.phaseBadge.textColor} ${ui.phaseBadge.fontWeight} ${ui.phaseBadge.bg} ${ui.phaseBadge.paddingX} ${ui.phaseBadge.paddingY} ${ui.phaseBadge.radius} ${ui.phaseBadge.border} ${ui.phaseBadge.alignment} ${ui.phaseBadge.fontSize}`}>
          <PhaseBadgeIcon className={ui.phaseBadge.iconSize} />
          {ui.phaseBadge.label}
        </div>
      </div>

      {/* Widgets */}
      <div className={`${ui.widgets.grid} ${ui.widgets.gap}`}>
        {ui.widgets.items.map((w, i) => (
          <DashboardWidget key={i} icon={w.icon} label={w.label} value={w.value} trend={w.trend} color={w.color} />
        ))}
      </div>

      {/* Content grid */}
      <div className={ui.contentGrid.layout}>

        {/* Main column — Goals */}
        <div className={ui.contentGrid.mainCol}>
          <section className={`glass-card ${ui.goals.padding} ${ui.goals.radius}`}>
            <h3 className={`${ui.goals.titleSize} ${ui.goals.titleWeight} ${ui.goals.titleGap}`}>
              {ui.goals.title}
            </h3>
            <div className={ui.goals.listSpacing}>
              {ui.goals.items.map((goal, i) => (
                <div key={i} className={`${ui.goals.item.layout} ${ui.goals.item.padding} ${ui.goals.item.bg} ${ui.goals.item.radius} ${ui.goals.item.border}`}>
                  <div className={`${ui.goals.dot.margin} ${ui.goals.dot.size} ${ui.goals.dot.radius} ${ui.goals.dot.bg} ${ui.goals.dot.flex} ${ui.goals.dot.textColor} ${ui.goals.dot.fontSize} ${ui.goals.dot.fontWeight}`}>
                    {i + 1}
                  </div>
                  <span className={`${ui.goals.text.fontSize} ${ui.goals.text.textColor} ${ui.goals.text.leading}`}>
                    {goal}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Side column — Insights */}
        <div className={ui.contentGrid.sideCol}>
          <section className={`glass-card ${ui.insights.padding} ${ui.insights.radius}`}>
            <h3 className={`${ui.insights.titleSize} ${ui.insights.titleWeight} ${ui.insights.titleGap}`}>
              {ui.insights.title}
            </h3>
            <div className={ui.insights.listSpacing}>
              {ui.insights.items.map((item, i) => (
                <div key={i} className={`${ui.insights.row.padding} ${ui.insights.row.bg} ${ui.insights.row.radius} ${ui.insights.row.border}`}>
                  <div className={`${ui.insights.row.labelSize} ${ui.insights.row.labelWeight} ${item.labelColor} ${ui.insights.row.labelTransform} ${ui.insights.row.labelTracking} ${ui.insights.row.labelGap}`}>
                    {item.label}
                  </div>
                  <div className={`${ui.insights.row.valueSize} ${ui.insights.row.valueWeight} ${ui.insights.row.valueTruncate}`}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

      </div>
    </motion.div>
  );
};

export default DiscoveryDashboardView;

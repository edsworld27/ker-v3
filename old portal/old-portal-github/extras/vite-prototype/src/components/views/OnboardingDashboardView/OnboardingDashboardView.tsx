import React from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { DynamicRenderer, ComponentConfig } from '../../DynamicRenderer';
import { onboardingDashboardUI as ui } from './ui';

const OnboardingDashboardView: React.FC = () => {
  const PhaseBadgeIcon = ui.phaseBadge.icon;
  const widgetConfig: ComponentConfig[] = ui.widgets.items as ComponentConfig[];

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
        <div className={`${ui.phaseBadge.layout} ${ui.phaseBadge.textColor} ${ui.phaseBadge.fontWeight} ${ui.phaseBadge.bg} ${ui.phaseBadge.paddingX} ${ui.phaseBadge.paddingY} ${ui.phaseBadge.radius} ${ui.phaseBadge.border} ${ui.phaseBadge.alignment} ${ui.phaseBadge.fontSize}`}>
          <PhaseBadgeIcon className={ui.phaseBadge.iconSize} />
          {ui.phaseBadge.label}
        </div>
      </div>

      {/* Widgets */}
      <div className={`${ui.widgets.grid} ${ui.widgets.gap}`}>
        <DynamicRenderer config={widgetConfig} />
      </div>

      <div className={ui.contentGrid.layout}>

        {/* Main column — Checklist */}
        <div className={ui.contentGrid.mainCol}>
          <section className={`glass-card ${ui.checklist.padding} ${ui.checklist.radius}`}>
            <h3 className={`${ui.checklist.titleSize} ${ui.checklist.titleWeight} ${ui.checklist.titleGap}`}>{ui.checklist.title}</h3>
            <div className={ui.checklist.listSpacing}>
              {ui.checklist.tasks.map((t, i) => (
                <div key={i} className={`${ui.checklist.row.layout} ${ui.checklist.row.padding} ${ui.checklist.row.bg} ${ui.checklist.row.radius} ${ui.checklist.row.border}`}>
                  <div className={ui.checklist.row.leftLayout}>
                    <div className={`${ui.checklist.dot.size} ${ui.checklist.dot.radius} ${t.status === 'Completed' ? ui.checklist.dot.completedStyle : ui.checklist.dot.pendingStyle}`}>
                      {t.status === 'Completed' && <Check className={`${ui.checklist.dot.iconSize} ${ui.checklist.dot.iconColor}`} />}
                    </div>
                    <span className={`${ui.checklist.taskLabel.fontSize} ${ui.checklist.taskLabel.fontWeight} ${ui.checklist.taskLabel.truncate} ${t.status === 'Completed' ? ui.checklist.taskLabel.completedStyle : ui.checklist.taskLabel.activeStyle}`}>
                      {t.task}
                    </span>
                  </div>
                  <span className={`${ui.checklist.statusBadge.fontSize} ${ui.checklist.statusBadge.fontWeight} ${ui.checklist.statusBadge.transform} ${ui.checklist.statusBadge.tracking} ${ui.checklist.statusBadge.shrink} ${
                    t.status === 'Completed'   ? ui.checklist.statusBadge.completedColor  :
                    t.status === 'In Progress' ? ui.checklist.statusBadge.inProgressColor :
                    ui.checklist.statusBadge.pendingColor
                  }`}>
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Side column */}
        <div className={ui.contentGrid.sideCol}>
          <DynamicRenderer config={[{ component: 'AIChatbot', props: {} }]} />

          {/* Success team */}
          <section className={`glass-card ${ui.team.padding} ${ui.team.radius}`}>
            <h3 className={`${ui.team.titleSize} ${ui.team.titleWeight} ${ui.team.titleGap}`}>{ui.team.title}</h3>
            <div className={ui.team.listSpacing}>
              {ui.team.members.map((m, i) => (
                <div key={i} className={`${ui.team.card.padding} ${ui.team.card.bg} ${ui.team.card.radius} ${ui.team.card.border}`}>
                  <div className={ui.team.card.avatarRow}>
                    <div className={`${ui.team.card.avatarSize} ${ui.team.card.avatarRadius} ${ui.team.card.avatarBg} ${ui.team.card.avatarFlex} ${ui.team.card.avatarTextColor} ${ui.team.card.avatarFontWeight} ${ui.team.card.avatarFontSize} ${ui.team.card.avatarShrink}`}>
                      {m.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className={`${ui.team.card.nameSize} ${ui.team.card.nameFontWeight} ${ui.team.card.nameTruncate}`}>{m.name}</div>
                      <div className={`${ui.team.card.roleSize} ${ui.team.card.roleColor} ${ui.team.card.roleTruncate}`}>{m.role}</div>
                    </div>
                  </div>
                  <a href={`mailto:${m.contact}`} className={ui.team.card.contactLink}>
                    {ui.team.card.contactPrefix} {m.name.split(' ')[0]}
                  </a>
                </div>
              ))}
            </div>
          </section>

          {/* Help CTA */}
          <div className={`${ui.help.padding} ${ui.help.radius} ${ui.help.bg} ${ui.help.border}`}>
            <h4 className={`${ui.help.titleWeight} ${ui.help.titleGap} ${ui.help.titleSize}`}>{ui.help.title}</h4>
            <p className={`${ui.help.bodySize} ${ui.help.bodyColor} ${ui.help.bodyGap}`}>{ui.help.body}</p>
            <button className={`${ui.help.button.width} ${ui.help.button.paddingY} ${ui.help.button.bg} ${ui.help.button.bgHover} ${ui.help.button.radius} ${ui.help.button.fontSize} ${ui.help.button.fontWeight} ${ui.help.button.transition}`}>
              {ui.help.button.label}
            </button>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default OnboardingDashboardView;

import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Activity, Circle, ExternalLink } from 'lucide-react';
import { devDashboardUI as ui } from './ui';

export function DevDashboardView() {
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
          <h2 className={`${ui.header.titleSize} ${ui.header.titleWeight} ${ui.header.titleGap}`}>{ui.header.title}</h2>
          <p className={`${ui.header.subtitleSize} ${ui.header.subtitleColor}`}>{ui.header.subtitle}</p>
        </div>
        <div className={`${ui.phaseBadge.layout} ${ui.phaseBadge.textColor} ${ui.phaseBadge.fontWeight} ${ui.phaseBadge.bg} ${ui.phaseBadge.paddingX} ${ui.phaseBadge.paddingY} ${ui.phaseBadge.radius} ${ui.phaseBadge.border} ${ui.phaseBadge.alignment} ${ui.phaseBadge.fontSize}`}>
          <PhaseBadgeIcon className={ui.phaseBadge.iconSize} />
          {ui.phaseBadge.label}
        </div>
      </div>

      <div className={ui.contentGrid.layout}>

        {/* Main column */}
        <div className={ui.contentGrid.mainCol}>

          {/* Build progress card */}
          <section className={`glass-card ${ui.buildProgress.padding} ${ui.buildProgress.radius}`}>
            <div className={`${ui.buildProgress.headerLayout} ${ui.buildProgress.headerGap}`}>
              <h3 className={`${ui.buildProgress.titleSize} ${ui.buildProgress.titleWeight}`}>{ui.buildProgress.title}</h3>
              <div className={`${ui.buildProgress.statusBadge.padding} ${ui.buildProgress.statusBadge.bg} ${ui.buildProgress.statusBadge.textColor} ${ui.buildProgress.statusBadge.fontSize} ${ui.buildProgress.statusBadge.fontWeight} ${ui.buildProgress.statusBadge.radius} ${ui.buildProgress.statusBadge.transform} ${ui.buildProgress.statusBadge.tracking}`}>
                {ui.buildProgress.statusBadge.label}
              </div>
            </div>

            <div className={ui.buildProgress.contentSpacing}>

              {/* Overall progress bar */}
              <div className={ui.buildProgress.overallProgress.wrapper}>
                <div className={ui.buildProgress.overallProgress.labelRow}>
                  <span className={ui.buildProgress.overallProgress.labelBg}>{ui.buildProgress.overallProgress.labelText}</span>
                  <span className={`${ui.buildProgress.overallProgress.valueFontSize} ${ui.buildProgress.overallProgress.valueFontWeight} ${ui.buildProgress.overallProgress.valueColor}`}>
                    {ui.buildProgress.overallProgress.percentage}%
                  </span>
                </div>
                <div className={ui.buildProgress.overallProgress.trackBg}>
                  <div style={{ width: `${ui.buildProgress.overallProgress.percentage}%` }} className={ui.buildProgress.overallProgress.fillBg} />
                </div>
              </div>

              {/* Task checklist */}
              <div className={ui.buildProgress.taskGrid}>
                {ui.buildProgress.tasks.map((step, i) => {
                  const dot = ui.buildProgress.task.statusDot[step.status as keyof typeof ui.buildProgress.task.statusDot];
                  const labelColor = step.status === 'pending' ? ui.buildProgress.task.statusLabel.pending : ui.buildProgress.task.statusLabel.default;
                  return (
                    <div key={i} className={`${ui.buildProgress.task.layout} ${ui.buildProgress.task.padding} ${ui.buildProgress.task.bg} ${ui.buildProgress.task.radius} ${ui.buildProgress.task.border}`}>
                      <div className={`${ui.buildProgress.task.dotSize} ${ui.buildProgress.task.dotRadius} ${ui.buildProgress.task.dotFlex} ${dot.bg} ${dot.textColor} ${dot.extra}`}>
                        {step.status === 'completed'   && <CheckCircle2 className={ui.buildProgress.task.iconSize} />}
                        {step.status === 'in-progress' && <Activity     className={ui.buildProgress.task.iconSize} />}
                        {step.status === 'pending'     && <Circle       className={ui.buildProgress.task.iconSize} />}
                      </div>
                      <span className={`${ui.buildProgress.task.labelSize} ${labelColor}`}>{step.label}</span>
                    </div>
                  );
                })}
              </div>

            </div>
          </section>

          {/* Staging card */}
          <section className={`glass-card ${ui.staging.padding} ${ui.staging.radius}`}>
            <h3 className={`${ui.staging.titleSize} ${ui.staging.titleWeight} ${ui.staging.titleGap}`}>{ui.staging.title}</h3>
            <div className={`${ui.staging.box.padding} ${ui.staging.box.bg} ${ui.staging.box.radius} ${ui.staging.box.border} ${ui.staging.box.layout}`}>
              <div className="min-w-0">
                <h4 className={ui.staging.buildLabelSize}>{ui.staging.buildLabel}</h4>
                <p className={ui.staging.deployedAtStyle}>{ui.staging.deployedAt}</p>
              </div>
              <button className={`${ui.staging.openBtn.padding} ${ui.staging.openBtn.bg} ${ui.staging.openBtn.bgHover} ${ui.staging.openBtn.radius} ${ui.staging.openBtn.fontSize} ${ui.staging.openBtn.fontWeight} ${ui.staging.openBtn.transition} ${ui.staging.openBtn.layout}`}>
                <ExternalLink className={ui.staging.openBtn.iconSize} />
                {ui.staging.openBtn.label}
              </button>
            </div>
          </section>

        </div>

        {/* Side column */}
        <div className={ui.contentGrid.sideCol}>

          {/* Tech stack card */}
          <section className={`glass-card ${ui.techStack.padding} ${ui.techStack.radius}`}>
            <h3 className={`${ui.techStack.titleSize} ${ui.techStack.titleWeight} ${ui.techStack.titleGap}`}>{ui.techStack.title}</h3>
            <div className={ui.techStack.listSpacing}>
              {ui.techStack.items.map((tech, i) => (
                <div key={i} className={`${ui.techStack.row.layout} ${ui.techStack.row.padding} ${ui.techStack.row.border}`}>
                  <span className={`${ui.techStack.row.labelSize} ${ui.techStack.row.labelColor}`}>{tech.label}</span>
                  <span className={`${ui.techStack.row.valueSize} ${ui.techStack.row.valueWeight} ${ui.techStack.row.valueColor}`}>{tech.value}</span>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </motion.div>
  );
}

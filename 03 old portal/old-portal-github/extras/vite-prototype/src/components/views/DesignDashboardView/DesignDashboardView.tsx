import React from 'react';
import { motion } from 'motion/react';
import { Send, FileText, Download } from 'lucide-react';
import { designDashboardUI as ui } from './ui';
import { useTheme } from '../../../hooks/useTheme';

export function DesignDashboardView() {
  const PhaseBadgeIcon = ui.phaseBadge.icon;
  const theme = useTheme();

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

          {/* Concepts card */}
          <section className={`glass-card ${ui.concepts.padding} ${ui.concepts.radius}`}>
            <h3 className={`${ui.concepts.titleSize} ${ui.concepts.titleWeight} ${ui.concepts.titleGap}`}>{ui.concepts.title}</h3>
            <div className={ui.concepts.grid}>
              {ui.concepts.items.map((design, i) => (
                <div key={i} className={ui.concepts.card.wrapper}>
                  <img src={design.img} alt={design.title} className={ui.concepts.card.img} referrerPolicy="no-referrer" />
                  <div className={ui.concepts.card.overlay}>
                    <h4 className={ui.concepts.card.overlayTitle}>{design.title}</h4>
                    <div className={ui.concepts.card.overlayButtons}>
                      <button className={ui.concepts.card.btnPrimary} style={theme.primaryBgStyle}>{ui.concepts.card.btnPrimaryLabel}</button>
                      <button className={ui.concepts.card.btnSecondary}>{ui.concepts.card.btnSecondaryLabel}</button>
                    </div>
                  </div>
                  <div className={ui.concepts.card.statusBadge}>{design.status}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Feedback card */}
          <section className={`glass-card ${ui.feedback.padding} ${ui.feedback.radius}`}>
            <h3 className={`${ui.feedback.titleSize} ${ui.feedback.titleWeight} ${ui.feedback.titleGap}`}>{ui.feedback.title}</h3>
            <div className={ui.feedback.listSpacing}>

              {/* Client message */}
              <div className={`${ui.feedback.msgClient.layout} ${ui.feedback.msgClient.padding} ${ui.feedback.msgClient.bg} ${ui.feedback.msgClient.radius} ${ui.feedback.msgClient.border}`}>
                <div className={`${ui.feedback.msgClient.avatarSize} ${ui.feedback.msgClient.avatarRadius} ${ui.feedback.msgClient.avatarBg} ${ui.feedback.msgClient.avatarFlex} ${ui.feedback.msgClient.avatarFontSize}`}>
                  {ui.feedback.msgClient.avatarInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`${ui.feedback.msgClient.nameSize} ${ui.feedback.msgClient.nameFontWeight} ${ui.feedback.msgClient.nameTruncate}`}>{ui.feedback.msgClient.senderName}</span>
                    <span className={`${ui.feedback.msgClient.timeSize} ${ui.feedback.msgClient.timeColor} ${ui.feedback.msgClient.timeShrink}`}>{ui.feedback.msgClient.timestamp}</span>
                  </div>
                  <p className={`${ui.feedback.msgClient.bodySize} ${ui.feedback.msgClient.bodyColor} ${ui.feedback.msgClient.bodyClamp}`}>{ui.feedback.msgClient.message}</p>
                </div>
              </div>

              {/* Agency reply */}
              <div className={`${ui.feedback.msgAgency.layout} ${ui.feedback.msgAgency.padding} ${ui.feedback.msgAgency.bg} ${ui.feedback.msgAgency.radius} ${ui.feedback.msgAgency.border} ${ui.feedback.msgAgency.indent}`}>
                <div className={`${ui.feedback.msgAgency.avatarSize} ${ui.feedback.msgAgency.avatarRadius} ${ui.feedback.msgAgency.avatarBg} ${ui.feedback.msgAgency.avatarFlex} ${ui.feedback.msgAgency.avatarTextColor} ${ui.feedback.msgAgency.avatarFontSize}`}>
                  {ui.feedback.msgAgency.avatarInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`${ui.feedback.msgAgency.nameSize} ${ui.feedback.msgAgency.nameFontWeight} ${ui.feedback.msgAgency.nameColor} ${ui.feedback.msgAgency.nameTruncate}`}>{ui.feedback.msgAgency.senderName}</span>
                    <span className={`${ui.feedback.msgAgency.timeSize} ${ui.feedback.msgAgency.timeColor} ${ui.feedback.msgAgency.timeShrink}`}>{ui.feedback.msgAgency.timestamp}</span>
                  </div>
                  <p className={`${ui.feedback.msgAgency.bodySize} ${ui.feedback.msgAgency.bodyColor} ${ui.feedback.msgAgency.bodyClamp}`}>{ui.feedback.msgAgency.message}</p>
                </div>
              </div>

            </div>

            {/* Comment input */}
            <div className={ui.feedback.input.wrapperGap}>
              <input type="text" placeholder={ui.feedback.input.placeholder} className={ui.feedback.input.field} />
              <button className={ui.feedback.input.sendBtn} style={theme.primaryBgStyle}>
                <Send className={ui.feedback.input.sendIconSize} />
              </button>
            </div>
          </section>

        </div>

        {/* Side column */}
        <div className={ui.contentGrid.sideCol}>

          {/* Progress card */}
          <section className={`glass-card ${ui.progress.padding} ${ui.progress.radius}`}>
            <h3 className={`${ui.progress.titleSize} ${ui.progress.titleWeight} ${ui.progress.titleGap}`}>{ui.progress.title}</h3>
            <div className={ui.progress.listSpacing}>
              {ui.progress.items.map((item, i) => (
                <div key={i} className={ui.progress.item.spacing}>
                  <div className={ui.progress.item.labelRow}>
                    <span className={ui.progress.item.labelColor}>{item.label}</span>
                    <span className={`${ui.progress.item.valueColor} ${ui.progress.item.valueFontWeight}`}>{item.progress}%</span>
                  </div>
                  <div className={ui.progress.item.trackBg}>
                    <div className={ui.progress.item.fillBg} style={{ width: `${item.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Brand assets card */}
          <section className={`glass-card ${ui.assets.padding} ${ui.assets.radius}`}>
            <h3 className={`${ui.assets.titleSize} ${ui.assets.titleWeight} ${ui.assets.titleGap}`}>{ui.assets.title}</h3>
            <div className={ui.assets.listSpacing}>
              {ui.assets.files.map((file, i) => (
                <div key={i} className={`${ui.assets.row.layout} ${ui.assets.row.padding} ${ui.assets.row.bg} ${ui.assets.row.radius} ${ui.assets.row.border} ${ui.assets.row.borderHover} ${ui.assets.row.transition} ${ui.assets.row.cursor} ${ui.assets.row.group}`}>
                  <div className={ui.assets.row.iconLayout}>
                    <FileText className={`${ui.assets.row.iconSize} ${ui.assets.row.iconColor}`} />
                    <span className={`${ui.assets.row.nameSize} ${ui.assets.row.nameColor}`}>{file}</span>
                  </div>
                  <Download className={`${ui.assets.row.downloadIconSize} ${ui.assets.row.downloadColor}`} />
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </motion.div>
  );
}

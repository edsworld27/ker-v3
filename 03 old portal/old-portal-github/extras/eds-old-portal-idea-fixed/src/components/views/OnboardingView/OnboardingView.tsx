import React from 'react';
import { motion } from 'motion/react';
import { FileText } from 'lucide-react';
import { useAppContext } from '../../../context/AppContext';
import { onboardingViewUI as ui } from './ui';
import { useTheme } from '../../../hooks/useTheme';
import { useRoleConfig } from '../../../hooks/useRoleConfig';

const OnboardingView: React.FC = () => {
  const { clients, setClients, impersonatingClientId } = useAppContext();
  const theme = useTheme();
  const { label } = useRoleConfig();

  const activeClient = clients.find(c => c.id === impersonatingClientId);
  const PhaseBadgeIcon = ui.phaseBadge.icon;
  const UploadIcon = ui.upload.titleIcon;

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
            {label('onboarding') || ui.header.title}
          </h2>
          <p className={`${ui.header.subtitleSize} ${ui.header.subtitleColor}`}>
            {ui.header.subtitle}
          </p>
        </div>
        <div
          className={`${ui.phaseBadge.layout} ${ui.phaseBadge.fontWeight} ${ui.phaseBadge.alignment} ${ui.phaseBadge.fontSize}`}
          style={theme.primaryTextStyle}
        >
          <PhaseBadgeIcon className={ui.phaseBadge.iconSize} style={theme.primaryTextStyle} />
          {ui.phaseBadge.label}
        </div>
      </div>

      <div className={ui.content.spacing}>

        {/* Questionnaire */}
        <section className={`glass-card ${ui.questionnaire.padding} ${ui.questionnaire.radius}`}>
          <h3 className={`${ui.questionnaire.titleSize} ${ui.questionnaire.titleWeight} ${ui.questionnaire.titleGap}`}>
            {ui.questionnaire.title}
          </h3>
          <div className={ui.questionnaire.formSpacing}>
            {ui.questionnaire.questions.map((item, i) => (
              <div key={item.id} className={ui.questionnaire.question.spacing}>
                <label className={`${ui.questionnaire.question.labelSize} ${ui.questionnaire.question.labelWeight} ${ui.questionnaire.question.labelColor}`}>
                  {i + 1}. {item.q}
                </label>
                <textarea
                  className={`${ui.questionnaire.question.textarea} focus-within-primary`}
                  style={{ '--tw-ring-color': 'var(--color-primary)' } as React.CSSProperties}
                  placeholder={ui.questionnaire.question.placeholder}
                  value={activeClient?.discoveryAnswers?.[item.id] || ''}
                  onChange={(e) => {
                    if (!activeClient) return;
                    const newAnswers = { ...activeClient.discoveryAnswers, [item.id]: e.target.value };
                    setClients(prev => prev.map(c => c.id === activeClient.id ? { ...c, discoveryAnswers: newAnswers } : c));
                  }}
                />
              </div>
            ))}
          </div>
          <div className={ui.questionnaire.saveButton.wrapperLayout}>
            <button
              className={`${ui.questionnaire.saveButton.width} ${ui.questionnaire.saveButton.paddingX} ${ui.questionnaire.saveButton.paddingY} ${ui.questionnaire.saveButton.radius} ${ui.questionnaire.saveButton.fontSize} ${ui.questionnaire.saveButton.fontWeight} ${ui.questionnaire.saveButton.transition} ${ui.questionnaire.saveButton.shadow}`}
              style={{ ...theme.primaryBgStyle, boxShadow: `0 10px 15px -3px color-mix(in srgb, var(--color-primary) 20%, transparent)` }}
            >
              {ui.questionnaire.saveButton.label}
            </button>
          </div>
        </section>

        {/* Resource upload */}
        <section className={`glass-card ${ui.upload.padding} ${ui.upload.radius}`}>
          <h3 className={ui.upload.titleLayout}>
            <UploadIcon className={ui.upload.titleIconSize} style={theme.primaryTextStyle} />
            {ui.upload.title}
          </h3>
          <p className={`${ui.upload.subtitleSize} ${ui.upload.subtitleColor} ${ui.upload.subtitleGap}`}>
            {ui.upload.subtitle}
          </p>

          {/* Drop zone */}
          <div className={`${ui.upload.dropZone.border} ${ui.upload.dropZone.radius} ${ui.upload.dropZone.padding} ${ui.upload.dropZone.layout} ${ui.upload.dropZone.transition} ${ui.upload.dropZone.cursor} ${ui.upload.dropZone.group} hover-border-primary`}>
            <div
              className={ui.upload.dropZone.iconWrapper}
              style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)' }}
            >
              <UploadIcon className={ui.upload.dropZone.iconSize} style={theme.primaryTextStyle} />
            </div>
            <h4 className={ui.upload.dropZone.labelSize}>{ui.upload.dropZone.label}</h4>
            <p className={`${ui.upload.dropZone.hintSize} ${ui.upload.dropZone.hintColor}`}>
              {ui.upload.dropZone.hint}
            </p>
          </div>

          {/* File list */}
          {activeClient?.resources && activeClient.resources.length > 0 && (
            <div className={ui.upload.fileList.spacing}>
              {activeClient.resources.map((res, i) => (
                <div key={i} className={`${ui.upload.fileList.row.layout}`}>
                  <div className={`${ui.upload.fileList.row.padding} ${ui.upload.fileList.row.bg} ${ui.upload.fileList.row.radius} ${ui.upload.fileList.row.iconLayout}`}>
                    <FileText className={`${ui.upload.fileList.row.iconSize} ${ui.upload.fileList.row.iconColor}`} />
                    <span className={ui.upload.fileList.row.nameSize}>{res.name}</span>
                  </div>
                  <button className={ui.upload.fileList.row.removeBtn}>
                    {ui.upload.fileList.row.removeLabel}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </motion.div>
  );
};

export default OnboardingView;

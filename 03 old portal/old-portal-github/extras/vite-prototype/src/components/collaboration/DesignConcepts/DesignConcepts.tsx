import React from 'react';
import { Layout } from 'lucide-react';
import { designConceptsUI as ui } from './ui';

export const DesignConcepts: React.FC = () => (
  <section className={`glass-card ${ui.wrapper.padding} ${ui.wrapper.radius}`}>

    {/* Header */}
    <div className={`${ui.header.layout} ${ui.header.gap}`}>
      <h3 className={`${ui.header.titleSize} ${ui.header.titleWeight}`}>Design Concepts</h3>
      <span className={`${ui.badge.padding} ${ui.badge.bg} ${ui.badge.textColor} ${ui.badge.radius} ${ui.badge.fontSize} ${ui.badge.fontWeight} ${ui.badge.transform} ${ui.badge.tracking}`}>
        {ui.badge.label}
      </span>
    </div>

    {/* Preview */}
    <div className={`${ui.preview.aspect} ${ui.preview.bg} ${ui.preview.radius} ${ui.preview.border} ${ui.preview.layout}`}>
      <div className={`${ui.preview.overlayBg} ${ui.preview.overlayPadding}`}>
        <button className={`${ui.viewButton.padding} ${ui.viewButton.bg} ${ui.viewButton.radius} ${ui.viewButton.fontSize} ${ui.viewButton.fontWeight}`}>
          {ui.viewButton.label}
        </button>
      </div>
      <Layout className={`${ui.preview.placeholderIconSize} ${ui.preview.placeholderIconColor}`} />
      <p className={ui.preview.placeholderTextStyle}>{ui.preview.placeholderText}</p>
    </div>

    {/* Actions */}
    <div className={ui.actions.gap}>
      <button className={`${ui.actionSecondary.flex} ${ui.actionSecondary.paddingY} ${ui.actionSecondary.bg} ${ui.actionSecondary.bgHover} ${ui.actionSecondary.radius} ${ui.actionSecondary.fontSize} ${ui.actionSecondary.fontWeight} ${ui.actionSecondary.transition}`}>
        {ui.actionSecondary.label}
      </button>
      <button className={`${ui.actionPrimary.flex} ${ui.actionPrimary.paddingY} ${ui.actionPrimary.bg} ${ui.actionPrimary.bgHover} ${ui.actionPrimary.radius} ${ui.actionPrimary.fontSize} ${ui.actionPrimary.fontWeight} ${ui.actionPrimary.transition}`}>
        {ui.actionPrimary.label}
      </button>
    </div>

  </section>
);

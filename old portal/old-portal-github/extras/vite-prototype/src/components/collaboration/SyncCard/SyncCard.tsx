import React from 'react';
import { syncCardUI as ui } from './ui';

export const SyncCard: React.FC = () => (
  <div className={`${ui.wrapper.padding} ${ui.wrapper.radius} ${ui.wrapper.bg} ${ui.wrapper.border}`}>
    <h4 className={`${ui.title.fontWeight} ${ui.title.gap} ${ui.title.fontSize}`}>{ui.title.label}</h4>
    <p className={`${ui.body.fontSize} ${ui.body.textColor} ${ui.body.gap}`}>{ui.body.label}</p>
    <button className={`${ui.button.width} ${ui.button.paddingY} ${ui.button.bg} ${ui.button.bgHover} ${ui.button.radius} ${ui.button.fontSize} ${ui.button.fontWeight} ${ui.button.transition}`}>
      {ui.button.label}
    </button>
  </div>
);

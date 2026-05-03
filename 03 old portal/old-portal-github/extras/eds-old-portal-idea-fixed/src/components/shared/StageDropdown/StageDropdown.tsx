import React from 'react';
import { ClientStage } from '../../../types';
import { stageDropdownUI as ui } from './ui';

interface StageDropdownProps {
  currentStage: ClientStage;
  onUpdate: (stage: ClientStage) => void;
}

export const StageDropdown: React.FC<StageDropdownProps> = ({ currentStage, onUpdate }) => {
  const stages: ClientStage[] = ['discovery', 'design', 'development', 'live'];

  return (
    <select
      value={currentStage}
      onChange={(e) => onUpdate(e.target.value as ClientStage)}
      className={`${ui.select.bg} ${ui.select.border} ${ui.select.radius} ${ui.select.paddingX} ${ui.select.paddingY} ${ui.select.fontSize} ${ui.select.textColor} ${ui.select.transform} ${ui.select.tracking} ${ui.select.fontWeight} ${ui.select.focus} ${ui.select.transition}`}
    >
      {stages.map((stage) => (
        <option key={stage} value={stage} className={`${ui.option.bg} ${ui.option.textColor}`}>
          {ui.stageLabels[stage]}
        </option>
      ))}
    </select>
  );
};

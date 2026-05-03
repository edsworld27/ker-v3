import React from 'react';
import { ClientStage } from '@ClientShell/bridge/types';
import { stageDropdownUI as ui } from './Clientui';
import { CLIENT_STAGES } from '../../../logic/Clientconstants';

interface StageDropdownProps {
  currentStage: ClientStage;
  onUpdate: (stage: ClientStage) => void;
}

export const StageDropdown: React.FC<StageDropdownProps> = ({ currentStage, onUpdate }) => {
  const stages = CLIENT_STAGES;

  return (
    <select
      value={currentStage}
      onChange={(e) => onUpdate(e.target.value as ClientStage)}
      className={`${ui.select.bg} ${ui.select.border} ${ui.select.radius} ${ui.select.paddingX} ${ui.select.paddingY} ${ui.select.fontSize} ${ui.select.textColor} ${ui.select.transform} ${ui.select.tracking} ${ui.select.fontWeight} ${ui.select.focus} ${ui.select.transition}`}
    >
      {stages.map((s) => (
        <option key={s.id} value={s.id} className={`${ui.option.bg} ${ui.option.textColor}`}>
          {s.label}
        </option>
      ))}
    </select>
  );
};

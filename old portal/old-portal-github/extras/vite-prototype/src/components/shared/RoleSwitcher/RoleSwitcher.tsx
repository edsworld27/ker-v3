import React from 'react';
import { useAppContext } from '../../../context/AppContext';
import { roleSwitcherUI as ui } from './ui';

export const RoleSwitcher: React.FC = () => {
  const { setImpersonatedUserEmail } = useAppContext();

  return (
    <div className={`${ui.wrapper.position} ${ui.wrapper.zIndex} ${ui.wrapper.layout} ${ui.wrapper.padding} ${ui.wrapper.bg} ${ui.wrapper.border} ${ui.wrapper.radius} ${ui.wrapper.shadow}`}>
      {ui.roles.map(role => (
        <button
          key={role.label}
          onClick={() => setImpersonatedUserEmail(role.email)}
          className={`${ui.button.paddingX} ${ui.button.paddingY} ${ui.button.fontSize} ${ui.button.textColor} ${ui.button.bg} ${ui.button.bgHover} ${ui.button.radius} ${ui.button.transition}`}
        >
          {role.label}
        </button>
      ))}
    </div>
  );
};

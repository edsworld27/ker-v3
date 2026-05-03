import React from 'react';
import { motion } from 'motion/react';
import { clientLoginViewUI as ui } from './ui';

interface ClientLoginViewProps {
  onLogin: () => void;
}

export const ClientLoginView: React.FC<ClientLoginViewProps> = ({ onLogin }) => {
  return (
    <div className={ui.wrapper}>
      <div className={ui.gradient} />
      <motion.div
        initial={ui.card.animation.initial}
        animate={ui.card.animation.animate}
        className={ui.card.base}
      >
        <div className={ui.headerContainer}>
          <div className={ui.logoContainer}>
            <ui.logoIcon className={ui.logoIconSize} />
          </div>
          <h1 className={ui.text.titleStyle}>{ui.text.title}</h1>
          <p className={ui.text.subtitleStyle}>{ui.text.subtitle}</p>
        </div>

        <div className={ui.form.base}>
          <input type="email" placeholder="Email" className={ui.form.input} />
          <input type="password" placeholder="Password" className={ui.form.input} />

          <button onClick={onLogin} className={ui.submitButton.base}>
            {ui.text.buttonLabel}
            <ui.submitButton.icon className={ui.submitButton.iconSize} />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

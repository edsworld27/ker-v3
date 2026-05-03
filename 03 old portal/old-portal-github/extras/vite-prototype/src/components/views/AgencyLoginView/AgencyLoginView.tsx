import React, { useState } from 'react';
import { motion } from 'motion/react';
import { agencyLoginViewUI as ui } from './ui';
import { useTheme } from '../../../hooks/useTheme';

interface AgencyLoginViewProps {
  onLogin: () => void;
  onSignup: () => void;
}

export const AgencyLoginView: React.FC<AgencyLoginViewProps> = ({ onLogin, onSignup }) => {
  const [isLogin, setIsLogin] = useState(true);
  const theme = useTheme();

  return (
    <div className={ui.wrapper}>
      <div className={ui.gradient} />
      <motion.div
        initial={ui.card.animation.initial}
        animate={ui.card.animation.animate}
        className={ui.card.base}
      >
        <div className={ui.headerContainer}>
          <div className={ui.logoContainer} style={theme.primaryBgStyle}>
            <ui.logoIcon className={ui.logoIconSize} />
          </div>
          <h1 className={ui.text.titleStyle}>{isLogin ? ui.text.loginTitle : ui.text.signupTitle}</h1>
          <p className={ui.text.subtitleStyle}>{isLogin ? ui.text.loginSubtitle : ui.text.signupSubtitle}</p>
        </div>

        <div className={ui.form.base}>
          <input type="email" placeholder="Email" className={ui.form.input} />
          <input type="password" placeholder="Password" className={ui.form.input} />

          <button
            onClick={isLogin ? onLogin : onSignup}
            className={ui.submitButton.base}
            style={theme.primaryBgStyle}
          >
            {isLogin ? ui.text.loginButtonLabel : ui.text.signupButtonLabel}
            <ui.submitButton.icon className={ui.submitButton.iconSize} />
          </button>
        </div>

        <button
          onClick={() => setIsLogin(!isLogin)}
          className={ui.toggleButton}
        >
          {isLogin ? ui.text.toggleToSignup : ui.text.toggleToLogin}
        </button>
      </motion.div>
    </div>
  );
};

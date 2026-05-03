import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { featureRequestViewUI as ui } from './ui';
import { PortalView } from '../../../types';
import { useAppContext } from '../../../context/AppContext';
import { useTheme } from '../../../hooks/useTheme';

interface FeatureRequestViewProps {
  handleViewChange?: (view: PortalView | string) => void;
  feedbackSubmitted?: boolean;
  setFeedbackSubmitted?: React.Dispatch<React.SetStateAction<boolean>>;
}

export const FeatureRequestView: React.FC<FeatureRequestViewProps> = (props) => {
  const { handleViewChange: contextHandleViewChange } = useAppContext();
  
  // feedbackSubmitted and setFeedbackSubmitted might not be in context,
  // we'll use a local fallback if they aren't provided by props or context.
  const handleViewChange = props.handleViewChange || contextHandleViewChange;
  const theme = useTheme();
  
  const [localFeedbackSubmitted, localSetFeedbackSubmitted] = useState(false);
  
  const feedbackSubmitted = props.feedbackSubmitted !== undefined ? props.feedbackSubmitted : localFeedbackSubmitted;
  const setFeedbackSubmitted = props.setFeedbackSubmitted || localSetFeedbackSubmitted;
  return (
    <motion.div
      key="feature-request"
      initial={ui.motion.initial}
      animate={ui.motion.animate}
      className={ui.container}
    >
      <AnimatePresence mode="wait">
        {!feedbackSubmitted ? (
          <motion.div
            key={ui.form.motion.key}
            initial={ui.form.motion.initial}
            animate={ui.form.motion.animate}
            exit={ui.form.motion.exit}
            className={ui.form.container}
          >
            <div className={ui.form.headerIconContainer}>
              <ui.form.headerIcon className={ui.form.headerIconClass} />
            </div>
            <h2 className={ui.form.title}>{ui.text.title}</h2>
            <p className={ui.form.subtitle}>{ui.text.subtitle}</p>
            
            <div className={ui.form.fieldsContainer}>
              <div className={ui.form.field.container}>
                <label className={ui.form.field.label}>{ui.text.featureTitleLabel}</label>
                <input
                  type="text"
                  placeholder={ui.text.featureTitlePlaceholder}
                  className={ui.form.field.titleInput}
                />
              </div>
              <div className={ui.form.field.container}>
                <label className={ui.form.field.label}>{ui.text.descriptionLabel}</label>
                <textarea
                  placeholder={ui.text.descriptionPlaceholder}
                  className={ui.form.field.descriptionInput}
                ></textarea>
              </div>
              <button
                onClick={() => setFeedbackSubmitted(true)}
                className={ui.form.submitButton.className}
                style={theme.primaryBgStyle}
              >
                {ui.form.submitButton.text}
                <ui.form.submitButton.icon className={ui.form.submitButton.iconClass} />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={ui.success.motion.key}
            initial={ui.success.motion.initial}
            animate={ui.success.motion.animate}
            exit={ui.success.motion.exit}
            className={ui.success.container}
          >
            <div className={ui.success.iconContainer}>
              <ui.success.icon className={ui.success.iconClass} />
            </div>
            <h2 className={ui.success.title}>{ui.text.successTitle}</h2>
            <p className={ui.success.subtitle}>{ui.text.successSubtitle}</p>
            <button 
              onClick={() => {
                setFeedbackSubmitted(false);
                handleViewChange('dashboard');
              }}
              className={ui.success.backButton.className}
            >
              {ui.success.backButton.text}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

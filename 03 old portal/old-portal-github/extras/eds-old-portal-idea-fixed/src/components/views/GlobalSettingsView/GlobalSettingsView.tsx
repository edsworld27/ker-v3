/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { globalSettingsViewUI as ui } from './ui';
import { useTheme } from '../../../hooks/useTheme';

export const GlobalSettingsView: React.FC = () => {
  const theme = useTheme();

  return (
    <motion.div
      key={ui.page.motionKey}
      initial={ui.page.animation.initial}
      animate={ui.page.animation.animate}
      className={ui.page.layout}
    >
      <div className={ui.page.maxWidth}>
        <div className={ui.header.container}>
          <h2 className={ui.header.titleStyle}>{ui.header.title}</h2>
          <p className={ui.header.subtitleStyle}>{ui.header.subtitle}</p>
        </div>

        <div className={ui.sections.container}>
          <div className={ui.sections.card}>
            <h3 className={ui.sections.titleStyle}>
              <div className={`${ui.sections.dotBase}`} style={{ backgroundColor: 'var(--color-primary)' }} />
              Agency Identity
            </h3>
            <div className={ui.sections.grid}>
              <div className={ui.sections.field.container}>
                <label className={ui.sections.field.label}>Agency Name</label>
                <input 
                  type="text" 
                  className={ui.sections.field.input} 
                  defaultValue={theme.agencyName} 
                />
              </div>
              <div className={ui.sections.field.container}>
                <label className={ui.sections.field.label}>Primary Color</label>
                <div className={ui.sections.colorPicker.container}>
                  <div 
                    className={`${ui.sections.colorPicker.swatch} ${ui.sections.colorPicker.activeSwatch}`} 
                    style={{ backgroundColor: 'var(--color-primary)' }} 
                  />
                  <div className={`${ui.sections.colorPicker.swatch} ${ui.sections.colorPicker.inactiveSwatch} bg-emerald-600`} />
                  <div className={`${ui.sections.colorPicker.swatch} ${ui.sections.colorPicker.inactiveSwatch} bg-rose-600`} />
                </div>
              </div>
            </div>
          </div>

          <div className={ui.sections.card}>
            <h3 className={ui.sections.titleStyle}>
              <div className={`${ui.sections.dotBase} bg-emerald-500`} />
              Security & Compliance
            </h3>
            <div className={ui.sections.container}>
              <div className={ui.sections.toggle.container}>
                <div>
                  <p className={ui.sections.toggle.title}>Strict AI Monitoring</p>
                  <p className={ui.sections.toggle.subtitle}>Record all AI interactions for audit purposes.</p>
                </div>
                <div className={`${ui.sections.toggle.switchBase} ${ui.sections.toggle.switchOn}`}>
                  <div className={`${ui.sections.toggle.knob} ${ui.sections.toggle.knobOn}`} />
                </div>
              </div>
              <div className={ui.sections.toggle.disabledContainer}>
                <div>
                  <p className={ui.sections.toggle.disabledTitle}>Session Timeout</p>
                  <p className={ui.sections.toggle.subtitle}>Auto logout after 30 minutes of inactivity.</p>
                </div>
                <div className={`${ui.sections.toggle.switchBase} ${ui.sections.toggle.switchOff}`}>
                  <div className={`${ui.sections.toggle.knob} ${ui.sections.toggle.knobOff}`} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default GlobalSettingsView;

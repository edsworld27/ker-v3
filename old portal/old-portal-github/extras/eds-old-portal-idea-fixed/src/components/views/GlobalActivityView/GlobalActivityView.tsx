import React from 'react';
import { motion } from 'motion/react';
import { globalActivityUI as ui } from './ui';
import { LogEntry } from '../../../types';
import { useAppContext } from '../../../context/AppContext';

interface GlobalActivityViewProps {
  activityLogs?: LogEntry[];
}

export const GlobalActivityView: React.FC<GlobalActivityViewProps> = (props) => {
  const ctx = useAppContext();
  const activityLogs = props.activityLogs ?? ctx.activityLogs ?? [];
  return (
    <motion.div
      key="global-activity"
      initial={ui.motion.initial}
      animate={ui.motion.animate}
      className={ui.container}
    >
      <div className={ui.wrapper}>
        <div className={ui.header.container}>
          <h2 className={ui.header.title}>{ui.text.title}</h2>
          <p className={ui.header.subtitle}>{ui.text.subtitle}</p>
        </div>

        <div className={ui.card.container}>
          <div className={ui.card.header}>
            <div className={ui.card.stream.container}>
              <div className={ui.card.stream.indicator} />
              <span className={ui.card.stream.label}>{ui.text.streamLabel}</span>
            </div>
            <div className={ui.card.liveUpdates.container}>
              <div className={ui.card.liveUpdates.badge}>{ui.text.liveUpdates}</div>
            </div>
          </div>
          <div className={ui.logList.container}>
            {activityLogs.map(log => (
              <div key={log.id} className={ui.logList.logItem.container}>
                <div className={ui.logList.logItem.iconContainer}>
                  <ui.logList.logItem.icon className={ui.logList.logItem.iconClass} />
                </div>
                <div className={ui.logList.logItem.content}>
                  <div className={ui.logList.logItem.header}>
                    <span className={ui.logList.logItem.userName}>{log.userName}</span>
                    <span className={ui.logList.logItem.timestamp}>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className={ui.logList.logItem.details.container}>
                    <p className={ui.logList.logItem.details.action}>{log.action}</p>
                    <span className={ui.logList.logItem.details.separator} />
                    {(log as any).module && <span className={ui.logList.logItem.details.module}>{(log as any).module}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

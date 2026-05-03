import React from 'react';
import { motion } from 'motion/react';
import { LogEntry, AppUser } from '../../../types';
import { logsViewUI as ui } from './ui';

interface LogsViewProps {
  activityLogs: LogEntry[];
  isAgencyAdmin: boolean;
  currentUser: AppUser | null;
}

export const LogsView: React.FC<LogsViewProps> = ({
  activityLogs,
  isAgencyAdmin,
  currentUser,
}) => {
  const getAvatarInitials = (name: string) => {
    return (name || '').split(' ').map(n => n[0]).join('');
  };

  const filteredLogs = isAgencyAdmin
    ? activityLogs
    : activityLogs.filter(l => l.clientId === currentUser?.clientId || l.userId === currentUser?.id);

  return (
    <motion.div
      key={ui.page.motionKey}
      initial={ui.page.animation.initial}
      animate={ui.page.animation.animate}
      className={ui.page.layout}
    >
      <div className={ui.header.layout}>
        <div>
          <h2 className={ui.header.titleStyle}>{ui.header.title}</h2>
          <p className={ui.header.subtitleStyle}>{ui.header.subtitle}</p>
        </div>
        <div className={ui.header.actions.layout}>
          <select className={ui.header.actions.select}>
            {ui.header.actions.options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button className={ui.header.actions.exportButton}>
            {ui.header.actions.exportLabel}
          </button>
        </div>
      </div>

      <div className={ui.tableContainer}>
        <div className={ui.table.wrapper}>
          <table className={ui.table.table}>
            <thead>
              <tr className={ui.table.header.row}>
                {ui.table.header.columns.map(col => (
                  <th key={col} className={ui.table.header.cell}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLogs.map((log) => (
                <tr key={log.id} className={ui.table.body.row}>
                  <td className={`${ui.table.body.cell} ${ui.table.body.timestampStyle}`}>
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className={ui.table.body.cell}>
                    <div className={ui.table.body.userContainer}>
                      <div className={ui.table.body.userAvatar}>
                        {getAvatarInitials(log.userName)}
                      </div>
                      <span className={ui.table.body.userName}>{log.userName}</span>
                    </div>
                  </td>
                  <td className={`${ui.table.body.cell} ${ui.table.body.actionStyle}`}>{log.action}</td>
                  <td className={`${ui.table.body.cell} ${ui.table.body.detailsStyle}`}>{log.details}</td>
                  <td className={ui.table.body.cell}>
                    <span className={`${ui.table.body.typeBadge.base} ${ui.table.body.typeBadge[log.type]}`}>
                      {log.type}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};
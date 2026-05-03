/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { AppUser, AppTicket, PortalView } from '../../../types';
import { DashboardWidget } from '../../shared/DashboardWidget';
import { agencyHubViewUI as ui } from './ui';
import { useRoleConfig } from '../../../hooks/useRoleConfig';
import { useTheme } from '../../../hooks/useTheme';

interface AgencyHubViewProps {
  currentUser: AppUser | null;
  users: AppUser[];
  tickets: AppTicket[];
  aiSessions: { id: string; userName: string; interactions: { prompt: string }[] }[];
  handleViewChange: (view: PortalView | string) => void;
  setShowEmployeeManagementModal: (show: boolean) => void;
}

export const AgencyHubView: React.FC<AgencyHubViewProps> = ({
  currentUser,
  users,
  tickets,
  aiSessions,
  handleViewChange,
  setShowEmployeeManagementModal,
}) => {
  const { label } = useRoleConfig();
  const theme = useTheme();

  const getWidgetValue = (key: string) => {
    if (key === 'users.length') return users.length.toString();
    if (key === 'openTickets.length') return tickets.filter(t => t.status === 'Open').length.toString();
    if (key === 'aiSessions.length') return aiSessions.length.toString();
    return '0';
  };

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
        {currentUser?.role === 'Founder' && (
          <button
            onClick={() => handleViewChange(ui.header.configuratorBtn.targetView)}
            className={ui.header.configuratorBtn.layout}
            style={theme.primaryBgStyle}
          >
            <ui.header.configuratorBtn.icon className={ui.header.configuratorBtn.iconSize} />
            {ui.header.configuratorBtn.label}
          </button>
        )}
      </div>

      <div className={ui.widgets.grid}>
        {ui.widgets.items.map(widget => (
          <DashboardWidget
            key={widget.id}
            icon={widget.icon}
            label={widget.label}
            value={widget.valueKey ? getWidgetValue(widget.valueKey) : widget.value!}
            trend={widget.trend}
            color={widget.color as any}
          />
        ))}
      </div>

      <div className={ui.mainGrid}>
        <div className={ui.teamModule.container}>
          <div className={ui.teamModule.header.layout}>
            <h3 className={ui.teamModule.header.titleStyle}>{ui.teamModule.header.title}</h3>
            <button onClick={() => setShowEmployeeManagementModal(true)} className={ui.teamModule.header.viewAllBtn}>
              {ui.teamModule.header.viewAllLabel}
            </button>
          </div>
          <div className={ui.teamModule.list}>
            {users.slice(0, 4).map(u => (
              <div key={u.id} className={ui.teamModule.item.layout}>
                <div className={ui.teamModule.item.userGroup}>
                  <div 
                    className={ui.teamModule.item.avatar}
                    style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)', color: 'var(--color-primary)' }}
                  >
                    {u.avatar}
                  </div>
                  <span className={ui.teamModule.item.name}>{u.name}</span>
                </div>
                <span className={ui.teamModule.item.status}>{ui.teamModule.item.statusLabel}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={ui.aiModule.container}>
          <div className={ui.aiModule.header.layout}>
            <h3 className={ui.aiModule.header.titleStyle}>{ui.aiModule.header.title}</h3>
            <button onClick={() => handleViewChange(ui.aiModule.header.auditorTargetView)} className={ui.aiModule.header.auditorBtn}>
              {ui.aiModule.header.auditorLabel}
            </button>
          </div>
          <div className={ui.aiModule.list}>
            {aiSessions.slice(0, 2).map((session) => (
              <div key={session.id} className={ui.aiModule.item.layout}>
                <div className={ui.aiModule.item.header}>
                  <span className={ui.aiModule.item.userName}>{session.userName}</span>
                  <span>{ui.aiModule.item.time}</span>
                </div>
                <p className={ui.aiModule.item.prompt}>"{session.interactions[0].prompt}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

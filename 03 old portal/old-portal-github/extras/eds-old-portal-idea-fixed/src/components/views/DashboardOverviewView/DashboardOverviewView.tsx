/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { dashboardOverviewViewUI as ui } from './ui';
import { useRoleConfig } from '../../../hooks/useRoleConfig';
import { useTheme } from '../../../hooks/useTheme';
import { useAppContext } from '../../../context/AppContext';
import { useModalContext } from '../../../context/ModalContext';

interface DashboardOverviewViewProps {
  userProfile?: { name: string };
  currentUser?: { role: string };
  setShowAddUserModal?: (show: boolean) => void;
  dashboardData?: any[];
}

export const DashboardOverviewView: React.FC<DashboardOverviewViewProps> = (props) => {
  const { userProfile: contextUserProfile, currentUser: contextCurrentUser } = useAppContext();
  const { setShowAddUserModal: setModalShow } = useModalContext();

  const userProfile = props.userProfile || contextUserProfile || { name: 'User' };
  const currentUser = props.currentUser || contextCurrentUser;
  const setShowAddUserModal = props.setShowAddUserModal || setModalShow;
  const dashboardData = props.dashboardData || [];

  const { label } = useRoleConfig();
  const theme = useTheme();

  return (
    <motion.div
      key={ui.page.motionKey}
      initial={ui.page.animation.initial}
      animate={ui.page.animation.animate}
      exit={ui.page.animation.exit}
      className={ui.page.layout}
    >
      <div className={ui.header.layout}>
        <div>
          <h1 className={ui.header.title.base}>{ui.header.title.text}</h1>
          <p className={ui.header.subtitle.base}>
            Welcome back, {userProfile.name}. Here's what's happening today.
          </p>
        </div>
        <div className={ui.header.actions.layout}>
          {currentUser?.role === 'ClientOwner' && (
            <button 
              onClick={() => setShowAddUserModal(true)}
              className={ui.header.actions.manageTeamBtn.layout}
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              <ui.header.actions.manageTeamBtn.icon className="w-4 h-4" />
              Manage {label('team')}
            </button>
          )}
          <div className={ui.header.actions.liveTraffic.layout}>
            <div className={ui.header.actions.liveTraffic.dot} />
            <span className={ui.header.actions.liveTraffic.labelStyle}>
              {ui.header.actions.liveTraffic.label}
            </span>
          </div>
        </div>
      </div>

      <div className={ui.stats.grid}>
        {ui.stats.items.map((item) => (
          <div key={item.id} className={ui.stats.card.base}>
            <div className={ui.stats.card.header}>
              <div 
                className={ui.stats.card.iconWrapper}
                style={{ backgroundColor: `color-mix(in srgb, var(--color-primary) 20%, transparent)`, color: 'var(--color-primary)' }}
              >
                <item.icon className="w-5 h-5" />
              </div>
              <span className={`${ui.stats.card.trend} ${item.trend.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
                {item.trend}
              </span>
            </div>
            <div className={ui.stats.card.value}>{item.value}</div>
            <div className={ui.stats.card.label}>{item.label}</div>
          </div>
        ))}
      </div>

      <div className={ui.charts.container}>
        <div className={ui.charts.header.layout}>
          <h3 className={ui.charts.header.title}>Growth Analytics</h3>
          <select className={ui.charts.header.select}>
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
          </select>
        </div>
        <div className={ui.charts.wrapper}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dashboardData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                dy={10}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                dx={-10}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                itemStyle={{ color: '#e2e8f0' }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="var(--color-primary)" 
                fillOpacity={1} 
                fill="url(#colorValue)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardOverviewView;

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Client } from '@ClientShell/bridge/types';
import { projectsStatsWidgetUI as ui } from './Clientui';
import { useAppContext } from '@ClientShell/bridge/ClientAppContext';
import { useRoleConfig } from '@ClientShell/logic/ClientuseRoleConfig';
import { useDesignAwareData } from '@ClientShell/hooks/ClientuseDesignAwareData';

interface ProjectsStatsWidgetProps {
  projects?: any[];
  clients?: Client[];
}

export const ProjectsStatsWidget: React.FC<ProjectsStatsWidgetProps> = (props) => {
  const context = useAppContext();
  
  // Rule 4: Use design-aware data for collectors
  const { data: contextProjects = [] } = useDesignAwareData(context.projects, 'admin-projects-stats');
  const { data: contextClients = [] } = useDesignAwareData(context.clients, 'admin-clients-stats-summary');
  
  const projects = props.projects || contextProjects;
  const clients = props.clients || contextClients;

  const { label } = useRoleConfig();

  const activeProjects = projects.filter(p => p.status === 'Active').length;
  const planningProjects = projects.filter(p => p.status === 'Planning').length;
  const completedProjects = projects.filter(p => p.status === 'Completed').length;
  const totalClients = clients.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={ui.container}
    >
      <div className={ui.grid}>
        <div className={ui.card}>
          <div className={ui.cardIconWrapper}>
            <ui.icons.briefcase className={ui.cardIcon} />
          </div>
          <div className={ui.cardContent}>
            <span className={ui.statValue}>{activeProjects}</span>
            <p className={ui.statLabel}>Active {label('projects')}</p>
          </div>
        </div>

        <div className={ui.card}>
          <div className={ui.cardIconWrapper}>
            <ui.icons.calendar className={ui.cardIcon} />
          </div>
          <div className={ui.cardContent}>
            <span className={ui.statValue}>{planningProjects}</span>
            <p className={ui.statLabel}>Planning</p>
          </div>
        </div>

        <div className={ui.card}>
          <div className={ui.cardIconWrapper}>
            <ui.icons.checkCircle className={ui.cardIcon} />
          </div>
          <div className={ui.cardContent}>
            <span className={ui.statValue}>{completedProjects}</span>
            <p className={ui.statLabel}>Completed</p>
          </div>
        </div>

        <div className={ui.card}>
          <div className={ui.cardIconWrapper}>
            <ui.icons.users className={ui.cardIcon} />
          </div>
          <div className={ui.cardContent}>
            <span className={ui.statValue}>{totalClients}</span>
            <p className={ui.statLabel}>Total {label('clients')}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Project, Client } from '../../types';
import { projectsStatsWidgetUI as ui } from './ui';
import { useAppContext } from '../../context/AppContext';
import { useRoleConfig } from '../../hooks/useRoleConfig';

interface ProjectsStatsWidgetProps {
  projects?: Project[];
  clients?: Client[];
}

export const ProjectsStatsWidget: React.FC<ProjectsStatsWidgetProps> = (props) => {
  const { projects: contextProjects, clients: contextClients } = useAppContext();
  
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
            <p className={ui.statLabel}>{label('activeProjects')}</p>
          </div>
        </div>

        <div className={ui.card}>
          <div className={ui.cardIconWrapper}>
            <ui.icons.calendar className={ui.cardIcon} />
          </div>
          <div className={ui.cardContent}>
            <span className={ui.statValue}>{planningProjects}</span>
            <p className={ui.statLabel}>{label('planningProjects')}</p>
          </div>
        </div>

        <div className={ui.card}>
          <div className={ui.cardIconWrapper}>
            <ui.icons.checkCircle className={ui.cardIcon} />
          </div>
          <div className={ui.cardContent}>
            <span className={ui.statValue}>{completedProjects}</span>
            <p className={ui.statLabel}>{label('completedProjects')}</p>
          </div>
        </div>

        <div className={ui.card}>
          <div className={ui.cardIconWrapper}>
            <ui.icons.users className={ui.cardIcon} />
          </div>
          <div className={ui.cardContent}>
            <span className={ui.statValue}>{totalClients}</span>
            <p className={ui.statLabel}>{label('totalClients')}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

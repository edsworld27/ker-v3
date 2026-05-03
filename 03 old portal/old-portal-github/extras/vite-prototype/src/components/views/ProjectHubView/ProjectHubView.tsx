/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { projectHubViewUI as ui } from './ui';
import { ProjectListWidget } from '../../widgets/ProjectListWidget';
import { ProjectsStatsWidget } from '../../widgets/ProjectsStatsWidget';
import { useAppContext } from '../../../context/AppContext';
import { useRoleConfig } from '../../../hooks/useRoleConfig';

export const ProjectHubView: React.FC = () => {
  const { projects, clients, projectTasks, setPortalView } = useAppContext();
  const { label } = useRoleConfig();

  return (
    <motion.div
      key={ui.page.motionKey}
      initial={ui.page.animation.initial}
      animate={ui.page.animation.animate}
      className={`${ui.page.layout} ${ui.page.padding}`}
    >
      <div className={ui.header.layout}>
        <div>
          <h2 className={ui.header.titleStyle}>{label('projects')}</h2>
          <p className={ui.header.subtitleStyle}>{ui.header.subtitle}</p>
        </div>
      </div>

      <ProjectsStatsWidget projects={projects} clients={clients} />
      <ProjectListWidget projects={projects} clients={clients} projectTasks={projectTasks} setPortalView={setPortalView} />
    </motion.div>
  );
};

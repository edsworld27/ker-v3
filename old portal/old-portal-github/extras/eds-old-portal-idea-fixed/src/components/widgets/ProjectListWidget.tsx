/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Project, Client, ProjectTask } from '../../types';
import { projectListWidgetUI as ui } from './ui';
import { useAppContext } from '../../context/AppContext';
import { useRoleConfig } from '../../hooks/useRoleConfig';

interface ProjectListWidgetProps {
  projects?: Project[];
  clients?: Client[];
  projectTasks?: ProjectTask[];
  setPortalView?: (view: string) => void;
}

export const ProjectListWidget: React.FC<ProjectListWidgetProps> = (props) => {
  const { 
    projects: contextProjects, 
    clients: contextClients, 
    tasks: contextTasks,
    setPortalView: contextSetPortalView 
  } = useAppContext();
  
  const projects = props.projects || contextProjects;
  const clients = props.clients || contextClients;
  const projectTasks = props.projectTasks || contextTasks;
  const setPortalView = props.setPortalView || contextSetPortalView;

  const { label } = useRoleConfig();

  return (
    <div className={ui.grid}>
      {projects.map(project => {
        const client = clients.find(c => c.id === project.clientId);
        const tasks = projectTasks.filter(t => t.projectId === project.id);
        const completedTasks = tasks.filter(t => t.status === 'Done').length;
        const progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

        return (
          <motion.div
            key={project.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={ui.card.base}
            onClick={() => setPortalView('task-board')}
          >
            <div className={ui.card.header.layout}>
              <div className={ui.card.header.iconWrapper}>
                <ui.card.header.icon className={ui.card.header.iconSize} />
              </div>
              <span className={`${ui.card.header.statusBadge.base} ${project.status === 'Active' ? ui.card.header.statusBadge.active : ui.card.header.statusBadge.planning}`}>
                {project.status}
              </span>
            </div>
            <h3 className={ui.card.title}>{project.name}</h3>
            <p className={ui.card.description}>{project.description}</p>
            
            <div className={ui.card.details.container}>
              <div className={ui.card.details.clientRow.layout}>
                <span className={ui.card.details.clientRow.labelStyle}>{ui.card.details.clientRow.label}</span>
                <span className={ui.card.details.clientRow.valueStyle}>{client?.name || 'Internal'}</span>
              </div>
              <div className={ui.card.details.progress.container}>
                <div className={ui.card.details.progress.header}><span>{ui.card.details.progress.label}</span><span>{Math.round(progress)}%</span></div>
                <div className={ui.card.details.progress.track}>
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${progress}%` }} 
                    transition={{ duration: 0.5, ease: "easeOut" }} 
                    className={ui.card.details.progress.fillBase} 
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

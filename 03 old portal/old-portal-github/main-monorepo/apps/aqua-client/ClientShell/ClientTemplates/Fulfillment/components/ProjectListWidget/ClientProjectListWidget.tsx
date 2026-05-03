import React from 'react';
import { motion } from 'motion/react';
import { Client } from '@ClientShell/bridge/types';
import { projectListWidgetUI as ui } from './Clientui';
import { useAppContext } from '@ClientShell/bridge/ClientAppContext';
import { useRoleConfig } from '@ClientShell/logic/ClientuseRoleConfig';
import { useDesignAwareData } from '@ClientShell/hooks/ClientuseDesignAwareData';
import { EditableText } from '@ClientShell/components/design/ClientEditableText';

interface ProjectListWidgetProps {
  projects?: any[];
  clients?: Client[];
  projectTasks?: any[];
  setPortalView?: (view: string) => void;
}

export const ProjectListWidget: React.FC<ProjectListWidgetProps> = (props) => {
  const context = useAppContext();
  const { label } = useRoleConfig();

  // Rule 4: Use design-aware data for collectors
  const { data: contextProjects = [] } = useDesignAwareData(context.projects, 'admin-projects-list');
  const { data: contextClients = [] } = useDesignAwareData(context.clients, 'admin-clients-list-summary');
  const { data: contextTasks = [] } = useDesignAwareData(context.tasks, 'admin-tasks-list-summary');

  const projects = props.projects || contextProjects;
  const clients = props.clients || contextClients;
  const projectTasks = props.projectTasks || contextTasks;
  const setPortalView = props.setPortalView || context.setPortalView;

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
              {/* project.status is dynamic — data-design-static on this cell */}
              <span
                data-design-static="true"
                className={`${ui.card.header.statusBadge.base} ${project.status === 'Active' ? ui.card.header.statusBadge.active : ui.card.header.statusBadge.planning}`}
              >
                {project.status}
              </span>
            </div>

            {/* Dynamic project content — all protected */}
            <div data-design-static="true">
              <h3 className={ui.card.title}>{project.name}</h3>
              <p className={ui.card.description}>{project.description}</p>
              {project.tags && project.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {project.tags.map((t: string) => (
                    <span key={t} className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                      style={{ backgroundColor: 'color-mix(in srgb, var(--client-widget-primary-color-1) 20%, transparent)', color: 'var(--client-widget-primary-color-1)' }}>
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className={ui.card.details.container}>
              <div className={ui.card.details.clientRow.layout}>
                <span className={ui.card.details.clientRow.labelStyle}>
                  <EditableText textKey="projects.card.clientLabel" fallback={ui.card.details.clientRow.label} />
                </span>
                <span className={ui.card.details.clientRow.valueStyle} data-design-static="true">
                  {client?.name || 'Internal'}
                </span>
              </div>
              <div className={ui.card.details.progress.container}>
                <div className={ui.card.details.progress.header}>
                  <span>
                    <EditableText textKey="projects.card.progressLabel" fallback={ui.card.details.progress.label} />
                  </span>
                  <span data-design-static="true">{Math.round(progress)}%</span>
                </div>
                <div className={ui.card.details.progress.track}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
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

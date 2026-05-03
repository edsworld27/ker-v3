import React from 'react';
import { motion } from 'motion/react';
import { AppUser } from '@ClientShell/bridge/types';
import { taskBoardViewUI as ui } from '@ClientShell/Clientui';
import { useAppContext } from '@ClientShell/bridge/ClientAppContext';
import { useDesignAwareData } from '@ClientShell/hooks/ClientuseDesignAwareData';
import { Briefcase } from 'lucide-react';

interface TaskBoardWidgetProps {
  tasks?: any[];
  users?: AppUser[];
}

export const TaskBoardWidget: React.FC<TaskBoardWidgetProps> = ({ tasks, users }) => {
  const context = useAppContext();
  const { setSelectedTask } = context;

  // Rule 4: Use design-aware data for collectors
  const { data: contextTasks = [] } = useDesignAwareData(context.tasks, 'admin-tasks-board');
  const { data: contextUsers = [] } = useDesignAwareData(context.users, 'admin-users-board');
  const { data: contextProjects = [] } = useDesignAwareData(context.projects, 'admin-projects-board');

  const projectTasks = tasks || contextTasks;
  const allUsers = users || contextUsers;
  const allProjects = contextProjects;

  const statuses = ['Backlog', 'In Progress', 'Review', 'Done'] as const;

  return (
    <div className={ui.board.layout}>
      {statuses.map(status => (
        <div key={status} className={ui.board.column.layout}>
          <div className={ui.board.column.header.layout}>
            <div className={ui.board.column.header.titleGroup}>
              <div className={`${ui.board.column.header.indicator} ${ui.board.column.header.colors[status]}`} />
              <h3 className={ui.board.column.header.title}>{status}</h3>
            </div>
            <span className={ui.board.column.header.countBadge}>
              {projectTasks.filter(t => t.status === status).length}
            </span>
          </div>

          <div className={ui.board.column.list}>
            {projectTasks.filter(t => t.status === status).map(task => (
              <motion.div 
                key={task.id} 
                layoutId={task.id} 
                onClick={() => setSelectedTask(task)} 
                className={ui.taskCard.base}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <div className={ui.taskCard.header.layout}>
                  <span className={`${ui.taskCard.header.priorityBadge.base} ${ui.taskCard.header.priorityBadge[task.priority]}`}>
                    {task.priority}
                  </span>
                  <div className={ui.taskCard.header.assigneeGroup}>
                    {task.assigneeId && (
                      <div className={ui.taskCard.header.assigneeAvatar}>
                        {allUsers.find(u => u.id === task.assigneeId)?.avatar || 'U'}
                      </div>
                    )}
                  </div>
                </div>
                {task.projectId && (
                  <div className="flex items-center gap-1 mb-1">
                    <Briefcase className="w-2.5 h-2.5 text-[var(--client-widget-text-muted)]" />
                    <span className="text-[10px] text-[var(--client-widget-text-muted)] truncate">
                      {allProjects.find(p => p.id === task.projectId)?.name ?? task.projectId}
                    </span>
                  </div>
                )}
                <h4 className={ui.taskCard.title}>{task.title}</h4>
                <div className={ui.taskCard.footer.layout}>
                  <div className={ui.taskCard.footer.itemGroup}>
                    <ui.taskCard.footer.stepsIcon className={ui.taskCard.footer.iconSize} />
                    {(task.steps ?? []).filter(s => s.completed).length}/{(task.steps ?? []).length}
                  </div>
                  {(task.attachments ?? []).length > 0 && (
                    <div className={ui.taskCard.footer.itemGroup}>
                      <ui.taskCard.footer.attachmentsIcon className={ui.taskCard.footer.iconSize} />
                      {(task.attachments ?? []).length}
                    </div>
                  )}
                  {task.dueDate && (
                    <div className={ui.taskCard.footer.dateGroup}>
                      <ui.taskCard.footer.dateIcon className={ui.taskCard.footer.iconSize} />
                      {new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

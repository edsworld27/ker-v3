import React from 'react';
import { motion } from 'motion/react';
import { ProjectTask, AppUser } from '../../types';
import { taskBoardViewUI as ui } from '../views/TaskBoardView/ui';
import { useAppContext } from '../../context/AppContext';

interface TaskBoardWidgetProps {
  tasks?: ProjectTask[];
  users?: AppUser[];
}

export const TaskBoardWidget: React.FC<TaskBoardWidgetProps> = ({ tasks, users }) => {
  const { 
    tasks: contextTasks, 
    users: contextUsers,
    setSelectedTask
  } = useAppContext();

  const projectTasks = tasks || contextTasks;
  const allUsers = users || contextUsers;

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
                <h4 className={ui.taskCard.title}>{task.title}</h4>
                <div className={ui.taskCard.footer.layout}>
                  <div className={ui.taskCard.footer.itemGroup}>
                    <ui.taskCard.footer.stepsIcon className={ui.taskCard.footer.iconSize} />
                    {task.steps.filter(s => s.completed).length}/{task.steps.length}
                  </div>
                  {task.attachments.length > 0 && (
                    <div className={ui.taskCard.footer.itemGroup}>
                      <ui.taskCard.footer.attachmentsIcon className={ui.taskCard.footer.iconSize} />
                      {task.attachments.length}
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

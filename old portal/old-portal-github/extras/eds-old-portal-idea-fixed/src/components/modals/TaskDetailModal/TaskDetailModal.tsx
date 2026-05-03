import React from 'react';
import { motion } from 'motion/react';
import { taskDetailModalUI as ui } from './ui';
import { AppUser } from '../../../types';

interface TaskDetailModalProps {
  selectedTask: any;
  setSelectedTask: (task: any | null) => void;
  users: AppUser[];
  projectTasks: any[];
  setProjectTasks: (tasks: any[]) => void;
}

export function TaskDetailModal({
  selectedTask,
  setSelectedTask,
  users,
  projectTasks,
  setProjectTasks
}: TaskDetailModalProps) {
  if (!selectedTask) return null;

  const getStatusDotClass = (status: string) => {
    if (status === 'In Progress') return ui.header.statusDot.inProgress;
    if (status === 'Review') return ui.header.statusDot.review;
    if (status === 'Done') return ui.header.statusDot.done;
    return ui.header.statusDot.backlog;
  };

  const getAttachmentIconContainer = (type: string) => {
    if (type === 'sop') return ui.attachments.iconContainer.sop;
    if (type === 'link') return ui.attachments.iconContainer.link;
    return ui.attachments.iconContainer.download;
  };

  const AttachmentIcon = ({ type }: { type: string }) => {
    if (type === 'sop') return <ui.attachments.icons.sop className={ui.attachments.iconSize} />;
    if (type === 'link') return <ui.attachments.icons.link className={ui.attachments.iconSize} />;
    return <ui.attachments.icons.download className={ui.attachments.iconSize} />;
  };

  return (
    <div className={ui.overlay}>
      <motion.div
        initial={ui.backdrop.motion.initial}
        animate={ui.backdrop.motion.animate}
        exit={ui.backdrop.motion.exit}
        onClick={() => setSelectedTask(null)}
        className={ui.backdrop.className}
      />
      <motion.div
        layoutId={selectedTask.id}
        className={ui.modal}
      >
        <div className={ui.header.base}>
          <div className={ui.header.statusContainer}>
            <div className={`${ui.header.statusDot.base} ${getStatusDotClass(selectedTask.status)}`} />
            <span className={ui.header.statusLabel}>{selectedTask.status}</span>
          </div>
          <button onClick={() => setSelectedTask(null)} className={ui.header.closeButton}>
            <ui.header.closeIcon className={ui.header.closeIconSize} />
          </button>
        </div>

        <h2 className={ui.title}>{selectedTask.title}</h2>
        <p className={ui.description}>{selectedTask.description}</p>

        <div className={ui.metaGrid}>
          <div className={ui.metaCard.base}>
            <div className={ui.metaCard.label}>{ui.text.assigneeLabel}</div>
            <div className={ui.metaCard.assigneeRow}>
              <div className={ui.metaCard.avatar}>
                {users.find(u => u.id === selectedTask.assigneeId)?.avatar}
              </div>
              <div>
                <div className={ui.metaCard.name}>{users.find(u => u.id === selectedTask.assigneeId)?.name}</div>
                <div className={ui.metaCard.role}>{users.find(u => u.id === selectedTask.assigneeId)?.role}</div>
              </div>
            </div>
          </div>
          <div className={ui.metaCard.base}>
            <div className={ui.metaCard.label}>{ui.text.timelineLabel}</div>
            <div className={ui.metaCard.dateRow}>
              <ui.metaCard.calendarIcon className={ui.metaCard.calendarIconClass} />
              <span className={ui.metaCard.dateText}>
                {selectedTask.dueDate
                  ? new Date(selectedTask.dueDate).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })
                  : ui.text.noDate}
              </span>
            </div>
          </div>
        </div>

        <div className={ui.subtasks.container}>
          <div className={ui.subtasks.header}>
            <h3 className={ui.subtasks.title}>{ui.text.subTasksTitle}</h3>
            <span className={ui.subtasks.counter}>
              {selectedTask.steps.filter((s: any) => s.completed).length}/{selectedTask.steps.length} {ui.text.completeSuffix}
            </span>
          </div>
          <div className={ui.subtasks.list}>
            {selectedTask.steps.map((step: any) => (
              <button
                key={step.id}
                onClick={() => {
                  const updatedTasks = projectTasks.map(t => {
                    if (t.id === selectedTask.id) {
                      return { ...t, steps: t.steps.map((s: any) => s.id === step.id ? { ...s, completed: !s.completed } : s) };
                    }
                    return t;
                  });
                  setProjectTasks(updatedTasks);
                  setSelectedTask(updatedTasks.find(t => t.id === selectedTask.id) || null);
                }}
                className={step.completed ? ui.subtasks.itemCompleted : ui.subtasks.itemIncomplete}
              >
                <div className={step.completed ? ui.subtasks.checkboxCompleted : ui.subtasks.checkboxIncomplete}>
                  {step.completed && <ui.subtasks.checkIcon className={ui.subtasks.checkIconClass} />}
                </div>
                <span className={`${ui.subtasks.stepText} ${step.completed ? ui.subtasks.stepTextCompleted : ''}`}>{step.text}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={ui.attachments.container}>
          <h3 className={ui.attachments.title}>{ui.text.attachmentsTitle}</h3>
          <div className={ui.attachments.grid}>
            {selectedTask.attachments.map((att: any) => (
              <a key={att.id} href={att.url} className={ui.attachments.item}>
                <div className={getAttachmentIconContainer(att.type)}>
                  <AttachmentIcon type={att.type} />
                </div>
                <div className={ui.attachments.textContainer}>
                  <div className={ui.attachments.name}>{att.name}</div>
                  <div className={ui.attachments.type}>{att.type}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

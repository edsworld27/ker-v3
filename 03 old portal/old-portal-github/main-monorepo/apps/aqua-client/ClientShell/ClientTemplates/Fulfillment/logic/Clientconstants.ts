export const TASK_STATUS_CONFIG = {
  Backlog:     { label: 'Backlog',     hex: '#64748b' },
  'In Progress':{ label: 'In Progress', hex: '#6366f1' },
  Review:      { label: 'Review',      hex: '#f59e0b' },
  Done:        { label: 'Done',        hex: '#10b981' },
} as const;

export type TaskStatusKey = keyof typeof TASK_STATUS_CONFIG;

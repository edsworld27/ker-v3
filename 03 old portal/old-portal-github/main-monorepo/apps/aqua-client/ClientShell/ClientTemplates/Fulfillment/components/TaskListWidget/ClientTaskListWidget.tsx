import React from 'react';
import { CheckSquare, ArrowRight } from 'lucide-react';
import { useAppContext } from '@ClientShell/bridge/ClientAppContext';
import { useTheme } from '@ClientShell/hooks/ClientuseTheme';
import { useRoleConfig } from '@ClientShell/logic/ClientuseRoleConfig';
import { PRIORITY_CONFIG, TASK_STATUS_CONFIG } from '@ClientShell/bridge/config/Clientconstants';
import { useDesignAwareData } from '@ClientShell/hooks/ClientuseDesignAwareData';

export function TaskListWidget() {
  const context = useAppContext();
  const theme = useTheme();
  const { label } = useRoleConfig();
  const { handleViewChange } = context;

  // Rule 4: Use design-aware data for all collections
  const { data: projectTasks = [] } = useDesignAwareData(context.projectTasks, 'widget-tasks-list');
  const { data: users = [] } = useDesignAwareData(context.users, 'widget-users-list');

  // Most recent 5 non-done tasks, then done ones
  const visible = React.useMemo(() => 
    ([...(projectTasks || [])])
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6),
    [projectTasks]
  );

  return (
    <div className="glass-card p-4 rounded-[var(--radius-card)] border border-[var(--client-widget-border)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-4 h-4" style={{ color: 'var(--client-widget-primary-color-1)' }} />
          <h3 className="text-sm font-semibold">Recent {label('tasks')}</h3>
        </div>
        <button
          onClick={() => handleViewChange('task-board')}
          className="text-[10px] text-[var(--client-widget-text-muted)] hover:text-[var(--client-widget-text)] flex items-center gap-1 transition-colors"
        >
          Board <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-1.5">
        {(visible || []).length === 0 ? (
          <p className="text-xs text-[var(--client-widget-text-muted)] text-center py-4">No tasks yet.</p>
        ) : (
          (visible || []).map(task => {
            const assignee = (users || []).find((u: any) => u.id === task.assigneeId);
            const statusColor = TASK_STATUS_CONFIG[task.status as keyof typeof TASK_STATUS_CONFIG]?.color ?? 'var(--client-widget-text-muted)';
            const priorityColor = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG]?.color ?? 'var(--client-widget-text-muted)';
            return (
              <div key={task.id} data-design-static="true" className="flex items-center gap-3 px-3 py-2 rounded-[var(--radius-button)] bg-[var(--client-widget-surface-1-glass)] hover:bg-[var(--client-widget-surface-1-hover)] transition-colors border border-[var(--client-widget-border)]/20">
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: priorityColor }} />
                <span className="text-xs flex-1 truncate">{task.title}</span>
                {assignee && (
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-[var(--client-widget-text)] shrink-0"
                    style={{ backgroundColor: 'var(--client-widget-primary-color-1)' }}>
                    {assignee.avatar || assignee.name.charAt(0)}
                  </div>
                )}
                <span className="text-[9px] px-1.5 py-0.5 rounded-md font-medium shrink-0"
                  style={{ backgroundColor: `color-mix(in srgb, ${statusColor} 15%, transparent)`, color: statusColor }}>
                  {task.status}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

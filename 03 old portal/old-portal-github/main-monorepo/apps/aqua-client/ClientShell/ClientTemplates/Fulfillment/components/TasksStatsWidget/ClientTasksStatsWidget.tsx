import React from 'react';
import { CheckSquare, Plus, ArrowLeft } from 'lucide-react';
import { useAppContext } from '@ClientShell/bridge/ClientAppContext';
import { useModalContext } from '@ClientShell/bridge/ClientModalContext';
import { useTheme } from '@ClientShell/hooks/ClientuseTheme';
import { useRoleConfig } from '@ClientShell/logic/ClientuseRoleConfig';
import { useDesignAwareData } from '@ClientShell/hooks/ClientuseDesignAwareData';
import { TASK_STATUS_CONFIG } from '@ClientShell/bridge/config/Clientconstants';

const STATUS_COLORS = Object.entries(TASK_STATUS_CONFIG).map(([status, cfg]) => ({ status, color: cfg.color }));

interface TasksStatsWidgetProps {
  variant?: 'card' | 'bar';
}

export function TasksStatsWidget({ variant = 'bar' }: TasksStatsWidgetProps) {
  const context = useAppContext();
  const { setPortalView } = context;
  const { openModal } = useModalContext();
  const theme = useTheme();
  const { label } = useRoleConfig();

  // Rule 4: Use design-aware data for collectors
  const { data: projectTasks = [] } = useDesignAwareData(context.projectTasks, 'admin-tasks-stats-summary');

  const highPriority = projectTasks.filter(t => t.priority === 'High' && t.status !== 'Done').length;

  if (variant === 'card') {
    return (
      <div className="glass-card p-4 rounded-[var(--radius-button)] border border-[var(--client-widget-border)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4" style={{ color: theme.primary }} />
            <h3 className="text-sm font-semibold">{label('tasks')} Board</h3>
          </div>
          {highPriority > 0 && (
            <span className="px-2 py-0.5 bg-[var(--client-widget-error)]/15 text-[var(--client-widget-error)] text-[10px] rounded-full font-semibold">
              {highPriority} high priority
            </span>
          )}
        </div>

        <div className="grid grid-cols-4 gap-2" data-design-static="true">
          {STATUS_COLORS.map(({ status, color }) => {
            const count = projectTasks.filter(t => t.status === status).length;
            const pct = projectTasks.length > 0 ? (count / projectTasks.length) * 100 : 0;
            return (
              <div key={status} className="bg-[var(--client-widget-surface-1)] rounded-[var(--radius-button)] p-3 text-center">
                <div className="text-xl font-bold leading-none mb-1" style={{ color }}>{count}</div>
                <div className="text-[10px] text-[var(--client-widget-text-muted)] leading-tight mb-2">{status}</div>
                <div className="h-1 bg-[var(--client-widget-surface-1-glass)] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setPortalView('project-hub')} 
              className="p-2 rounded-[var(--radius-button)] bg-[var(--client-widget-surface-1-glass)] hover:bg-[var(--client-widget-surface-1-hover)] text-[var(--client-widget-text-muted)] hover:text-[var(--client-widget-text)] transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h2 className="text-2xl font-bold tracking-tight">{label('tasks')}</h2>
          </div>
          <p className="text-[var(--client-widget-text-muted)] text-sm mt-1">Manage and track your project tasks.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => openModal('NewTaskModal')}
            className="flex items-center gap-2 px-4 py-2 rounded-[var(--radius-button)] text-sm font-semibold text-[var(--client-widget-text)] transition-all shadow-lg hover:opacity-90"
            style={{ backgroundColor: 'var(--client-widget-primary-color-1)' }}
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" data-design-static="true">
        {STATUS_COLORS.map(({ status, color }) => {
          const count = projectTasks.filter(t => t.status === status).length;
          const pct = projectTasks.length > 0 ? (count / projectTasks.length) * 100 : 0;
          return (
            <div key={status} className="glass-card rounded-[var(--radius-button)] p-4 border border-[var(--client-widget-border)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--client-widget-text-muted)]">{status}</span>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              </div>
              <div className="text-2xl font-bold mb-1">{count}</div>
              <div className="h-1 bg-[var(--client-widget-surface-1-glass)] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

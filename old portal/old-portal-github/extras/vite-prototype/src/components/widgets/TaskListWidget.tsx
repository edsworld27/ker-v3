import React from 'react';
import { CheckSquare, ArrowRight } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useTheme } from '../../hooks/useTheme';
import { useRoleConfig } from '../../hooks/useRoleConfig';

const PRIORITY_COLORS: Record<string, string> = {
  High:   '#ef4444',
  Medium: '#f59e0b',
  Low:    '#64748b',
};

const STATUS_COLORS: Record<string, string> = {
  Backlog:      '#64748b',
  'In Progress':'#6366f1',
  Review:       '#f59e0b',
  Done:         '#10b981',
};

export function TaskListWidget() {
  const { projectTasks, users, handleViewChange } = useAppContext();
  const theme = useTheme();
  const { label } = useRoleConfig();

  // Most recent 5 non-done tasks, then done ones
  const sorted = [...projectTasks].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const visible = sorted.slice(0, 6);

  return (
    <div className="glass-card p-4 rounded-2xl border border-white/5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-4 h-4" style={{ color: theme.primary }} />
          <h3 className="text-sm font-semibold">Recent {label('tasks')}</h3>
        </div>
        <button
          onClick={() => handleViewChange('task-board')}
          className="text-[10px] text-slate-500 hover:text-white flex items-center gap-1 transition-colors"
        >
          Board <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-1.5">
        {visible.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">No tasks yet.</p>
        ) : (
          visible.map(task => {
            const assignee = users.find(u => u.id === task.assigneeId);
            return (
              <div key={task.id} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/4 hover:bg-white/7 transition-colors">
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: PRIORITY_COLORS[task.priority] }} />
                <span className="text-xs flex-1 truncate">{task.title}</span>
                {assignee && (
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white shrink-0"
                    style={{ backgroundColor: theme.primary }}>
                    {assignee.avatar || assignee.name.charAt(0)}
                  </div>
                )}
                <span className="text-[9px] px-1.5 py-0.5 rounded-md font-medium shrink-0"
                  style={{ backgroundColor: `${STATUS_COLORS[task.status] ?? '#64748b'}22`, color: STATUS_COLORS[task.status] ?? '#64748b' }}>
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

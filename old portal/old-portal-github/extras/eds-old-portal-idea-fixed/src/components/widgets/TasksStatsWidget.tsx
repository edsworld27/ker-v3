import React from 'react';
import { CheckSquare, Plus, ArrowLeft } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useModalContext } from '../../context/ModalContext';
import { useTheme } from '../../hooks/useTheme';
import { useRoleConfig } from '../../hooks/useRoleConfig';

const STATUS_CONFIG = [
  { status: 'Backlog',     color: '#64748b' },
  { status: 'In Progress', color: '#6366f1' },
  { status: 'Review',      color: '#f59e0b' },
  { status: 'Done',        color: '#10b981' },
] as const;

interface TasksStatsWidgetProps {
  variant?: 'card' | 'bar';
}

export function TasksStatsWidget({ variant = 'bar' }: TasksStatsWidgetProps) {
  const { projectTasks, setPortalView } = useAppContext();
  const { setShowNewTaskModal } = useModalContext();
  const theme = useTheme();
  const { label } = useRoleConfig();

  const highPriority = projectTasks.filter(t => t.priority === 'High' && t.status !== 'Done').length;

  if (variant === 'card') {
    return (
      <div className="glass-card p-4 rounded-2xl border border-white/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4" style={{ color: theme.primary }} />
            <h3 className="text-sm font-semibold">{label('tasks')} Board</h3>
          </div>
          {highPriority > 0 && (
            <span className="px-2 py-0.5 bg-red-500/15 text-red-400 text-[10px] rounded-full font-semibold">
              {highPriority} high priority
            </span>
          )}
        </div>

        <div className="grid grid-cols-4 gap-2">
          {STATUS_CONFIG.map(({ status, color }) => {
            const count = projectTasks.filter(t => t.status === status).length;
            const pct = projectTasks.length > 0 ? (count / projectTasks.length) * 100 : 0;
            return (
              <div key={status} className="bg-white/4 rounded-xl p-3 text-center">
                <div className="text-xl font-bold leading-none mb-1" style={{ color }}>{count}</div>
                <div className="text-[10px] text-slate-500 leading-tight mb-2">{status}</div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
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
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h2 className="text-2xl font-bold tracking-tight">{label('tasks')}</h2>
          </div>
          <p className="text-slate-400 text-sm mt-1">Manage and track your project tasks.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNewTaskModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all shadow-lg hover:opacity-90 bg-indigo-600"
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATUS_CONFIG.map(({ status, color }) => {
          const count = projectTasks.filter(t => t.status === status).length;
          const pct = projectTasks.length > 0 ? (count / projectTasks.length) * 100 : 0;
          return (
            <div key={status} className="glass-card rounded-2xl p-4 border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{status}</span>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              </div>
              <div className="text-2xl font-bold mb-1">{count}</div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

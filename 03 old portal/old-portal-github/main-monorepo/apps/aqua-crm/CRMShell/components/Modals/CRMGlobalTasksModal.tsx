import React, { useState } from 'react';
import { CheckSquare, Circle, Clock } from 'lucide-react';
import { useAppContext } from '@CRMShell/bridge/CRMAppContext';

interface Props { onClose?: () => void; }

export function GlobalTasksModal({ onClose }: Props) {
  const { activityLogs } = useAppContext();
  const [filter, setFilter] = useState<'all' | 'action' | 'system'>('all');

  const filtered = (activityLogs || [])
    .filter(log => filter === 'all' || log.type === filter)
    .slice(0, 50);

  return (
    <div className="bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[70vh] flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-[var(--people-widget-primary-color-1)]" />
          <h2 className="text-lg font-semibold text-white">Activity & Tasks</h2>
        </div>
        <div className="flex items-center gap-2">
          {(['all', 'action', 'system'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${
                filter === f ? 'bg-[var(--people-widget-primary-color-1)] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
          {onClose && (
            <button onClick={onClose} className="ml-2 text-slate-400 hover:text-white text-xs uppercase tracking-widest">
              Close
            </button>
          )}
        </div>
      </div>
      <div className="overflow-y-auto flex-1 divide-y divide-white/5">
        {filtered.length === 0 && (
          <div className="px-6 py-12 text-center text-slate-500 text-sm">No activity yet.</div>
        )}
        {filtered.map(log => (
          <div key={log.id} className="flex items-start gap-3 px-6 py-3 hover:bg-white/5 transition-colors">
            <div className="mt-0.5">
              {log.type === 'action' ? (
                <Circle className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Clock className="w-3.5 h-3.5 text-slate-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">{log.action}</p>
              <p className="text-xs text-slate-400 mt-0.5 truncate">{log.details}</p>
            </div>
            <p className="text-[10px] text-slate-600 shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

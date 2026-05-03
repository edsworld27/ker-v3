import React from 'react';
import { Activity } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useTheme } from '../../hooks/useTheme';

const TYPE_COLORS: Record<string, string> = {
  auth:         '#6366f1',
  impersonation:'#f59e0b',
  action:       '#10b981',
  system:       '#64748b',
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function ActivityFeedWidget() {
  const { activityLogs } = useAppContext();
  const theme = useTheme();

  const recent = [...activityLogs]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 7);

  return (
    <div className="glass-card p-4 rounded-2xl border border-white/5">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-4 h-4" style={{ color: theme.primary }} />
        <h3 className="text-sm font-semibold">Activity Feed</h3>
      </div>

      <div className="space-y-1">
        {recent.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">No activity yet.</p>
        ) : (
          recent.map(log => (
            <div key={log.id} className="flex items-start gap-2.5 px-2 py-2 rounded-xl hover:bg-white/4 transition-colors">
              <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                style={{ backgroundColor: TYPE_COLORS[log.type] ?? '#64748b' }} />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium truncate">{log.action}</div>
                <div className="text-[10px] text-slate-500 truncate">{log.details}</div>
              </div>
              <span className="text-[10px] text-slate-600 shrink-0">{timeAgo(log.timestamp)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

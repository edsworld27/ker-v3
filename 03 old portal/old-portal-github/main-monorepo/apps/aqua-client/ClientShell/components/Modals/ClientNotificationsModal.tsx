import React from 'react';
import { Bell, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useAppContext } from '@ClientShell/bridge/ClientAppContext';

const typeIcon: Record<string, React.ReactNode> = {
  info:    <Info className="w-4 h-4 text-blue-400" />,
  warning: <AlertCircle className="w-4 h-4 text-amber-400" />,
  success: <CheckCircle className="w-4 h-4 text-emerald-400" />,
  error:   <AlertCircle className="w-4 h-4 text-red-400" />,
};

interface Props { onClose?: () => void; }

export function NotificationsModal({ onClose }: Props) {
  const { notifications } = useAppContext();
  const sorted = [...(notifications || [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[70vh] flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-[var(--people-widget-primary-color-1)]" />
          <h2 className="text-lg font-semibold text-white">Notifications</h2>
          {sorted.filter(n => !n.read).length > 0 && (
            <span className="px-2 py-0.5 text-[10px] font-bold bg-red-500/20 text-red-400 rounded-full">
              {sorted.filter(n => !n.read).length} new
            </span>
          )}
        </div>
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xs uppercase tracking-widest">
            Close
          </button>
        )}
      </div>
      <div className="overflow-y-auto flex-1 divide-y divide-white/5">
        {sorted.length === 0 && (
          <div className="px-6 py-12 text-center text-slate-500 text-sm">No notifications yet.</div>
        )}
        {sorted.map(n => (
          <div key={n.id} className={`flex items-start gap-3 px-6 py-4 transition-colors ${n.read ? 'opacity-50' : 'hover:bg-white/5'}`}>
            <div className="mt-0.5">{typeIcon[n.type] || typeIcon.info}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{n.title}</p>
              <p className="text-xs text-slate-400 mt-0.5">{n.message}</p>
              <p className="text-[10px] text-slate-600 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
            </div>
            {!n.read && <div className="w-2 h-2 rounded-full bg-[var(--people-widget-primary-color-1)] mt-1.5 shrink-0" />}
          </div>
        ))}
      </div>
    </div>
  );
}

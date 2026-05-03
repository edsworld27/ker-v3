import React from 'react';
import { Ticket } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useTheme } from '../../hooks/useTheme';
import { useRoleConfig } from '../../hooks/useRoleConfig';

export function TicketsStatsWidget() {
  const { tickets } = useAppContext();
  const theme = useTheme();
  const { label } = useRoleConfig();

  const open       = tickets.filter(t => t.status === 'Open').length;
  const inProgress = tickets.filter(t => t.status === 'In Progress').length;
  const closed     = tickets.filter(t => t.status === 'Closed').length;
  const highPri    = tickets.filter(t => t.priority === 'High' && t.status !== 'Closed').length;

  const stats = [
    { label: 'Open',        value: open,       color: '#ef4444' },
    { label: 'In Progress', value: inProgress,  color: '#f59e0b' },
    { label: 'Closed',      value: closed,      color: '#10b981' },
    { label: 'High Pri',    value: highPri,     color: '#ec4899' },
  ];

  return (
    <div className="glass-card p-4 rounded-2xl border border-white/5">
      <div className="flex items-center gap-2 mb-4">
        <Ticket className="w-4 h-4" style={{ color: theme.primary }} />
        <h3 className="text-sm font-semibold">{label('tickets')} Summary</h3>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {stats.map(stat => (
          <div key={stat.label} className="bg-white/4 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold leading-none" style={{ color: stat.color }}>{stat.value}</div>
            <div className="text-[10px] text-slate-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

import React from 'react';

export const DashboardWidget: React.FC<{ icon: any, label: string, value: string, trend: string, color: string }> = ({ icon: Icon, label, value, trend, color }) => (
  <div className="glass-card p-6 rounded-3xl border border-white/5 hover:border-white/10 transition-all group">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-2xl bg-${color}-500/10 text-${color}-400 group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className={`text-[10px] font-bold px-2 py-1 rounded-lg ${trend.startsWith('+') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'}`}>
        {trend}
      </div>
    </div>
    <div className="text-2xl font-bold text-white mb-1">{value}</div>
    <div className="text-xs text-slate-500 uppercase tracking-widest font-bold">{label}</div>
  </div>
);

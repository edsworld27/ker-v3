import React from 'react';
import { Users, Building2, CheckCircle, Clock, Zap } from 'lucide-react';
import { useRevenueContext as useSalesContext } from '../../../ClientRevenueContext';
import { useTheme } from '@ClientShell/hooks/ClientuseTheme';
import { useRoleConfig } from '@ClientShell/logic/ClientuseRoleConfig';
import { useDesignAwareData } from '@ClientShell/hooks/ClientuseDesignAwareData';
import { CLIENT_STAGES } from '../../../logic/Clientconstants';

export const ClientsStatsWidget: React.FC = () => {
  const context = useSalesContext();
  
  // Rule 4: Use design-aware data
  const { data: clients = [] } = useDesignAwareData(context.clients, 'admin-clients-stats');

  const theme = useTheme();
  const { label } = useRoleConfig();

  const icons = [Users, Zap, Clock, Building2, CheckCircle];

  const stageRows = ([...CLIENT_STAGES] as Array<{ id: string; label: string; hex: string }>)
    .filter(s => s.id !== 'development') // development merged into design row
    .map(s => ({
      label: s.label,
      value: s.id === 'design'
        ? (clients || []).filter(c => c.stage === 'design' || c.stage === 'development').length
        : (clients || []).filter(c => c.stage === s.id).length,
      hex: s.hex,
    }));

  const stats = [
    { label: `Total ${label('clients')}`, value: (clients || []).length, hex: 'var(--client-widget-primary-color-1)' },
    ...stageRows,
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className="glass-card p-5 rounded-[2rem] border border-[var(--client-widget-border)] flex flex-col items-center text-center group hover:border-[var(--client-widget-border)] transition-all"
        >
          <div
            className="w-12 h-12 rounded-[var(--radius-button)] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
            style={{ backgroundColor: `${stat.hex}1A`, color: stat.hex }}
          >
            {React.createElement(icons[i] ?? Users, { className: 'w-6 h-6' })}
          </div>
          <div className="text-2xl font-bold mb-1">{stat.value}</div>
          <div className="text-[10px] uppercase tracking-widest font-bold text-[var(--client-widget-text-muted)]">{stat.label}</div>
        </div>
      ))}
    </div>
  );
};

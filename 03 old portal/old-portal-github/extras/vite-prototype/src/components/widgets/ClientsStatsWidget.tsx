import React from 'react';
import { Users, Building2, CheckCircle, Clock, Zap } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useTheme } from '../../hooks/useTheme';
import { useRoleConfig } from '../../hooks/useRoleConfig';

export const ClientsStatsWidget: React.FC = () => {
  const { clients } = useAppContext();
  const theme = useTheme();
  const { label } = useRoleConfig();

  const stats = [
    { 
      label: `Total ${label('clients')}`, 
      value: clients.length, 
      icon: Users,
      color: 'indigo'
    },
    { 
      label: 'Discovery', 
      value: clients.filter(c => c.stage === 'discovery').length, 
      icon: Zap,
      color: 'amber'
    },
    { 
      label: 'Onboarding', 
      value: clients.filter(c => c.stage === 'onboarding').length, 
      icon: Clock,
      color: 'blue'
    },
    { 
      label: 'Design & Dev', 
      value: clients.filter(c => c.stage === 'design' || c.stage === 'development').length, 
      icon: Building2,
      color: 'purple'
    },
    { 
      label: 'Live', 
      value: clients.filter(c => c.stage === 'live').length, 
      icon: CheckCircle,
      color: 'emerald'
    }
  ];

  const getColorStyles = (color: string) => {
    const colors: Record<string, string> = {
      indigo: '#6366f1',
      amber: '#f59e0b',
      blue: '#3b82f6',
      purple: '#8b5cf6',
      emerald: '#10b981',
    };
    const hex = colors[color] || colors.indigo;
    return {
      bg: `${hex}1A`,
      text: hex,
      border: `${hex}33`,
    };
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      {stats.map((stat, i) => {
        const styles = getColorStyles(stat.color);
        return (
          <div 
            key={i} 
            className="glass-card p-5 rounded-[2rem] border border-white/5 flex flex-col items-center text-center group hover:border-white/10 transition-all"
          >
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
              style={{ backgroundColor: styles.bg, color: styles.text }}
            >
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="text-2xl font-bold mb-1">{stat.value}</div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500">{stat.label}</div>
          </div>
        );
      })}
    </div>
  );
};

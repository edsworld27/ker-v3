import React from 'react';
import { dashboardWidgetUI as ui } from './ui';
import { useTheme } from '../../../hooks/useTheme';

interface DashboardWidgetProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  trend?: string;
  color?: string; // e.g. 'indigo', 'emerald', 'amber', 'slate'
}

export const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  icon: Icon,
  label,
  value,
  trend,
  color = 'indigo'
}) => {
  const theme = useTheme();
  const isPositive = trend?.startsWith('+');
  const trendBg = isPositive ? ui.trend.positiveBg : ui.trend.neutralBg;
  const trendText = isPositive ? ui.trend.positiveText : ui.trend.neutralText;

  // Treat default tailwind colours dynamically so the Configurator drives it
  const isPrimary = color === 'primary' || color === 'indigo';

  return (
    <div className={`${ui.wrapper.padding} ${ui.wrapper.radius} ${ui.wrapper.border} ${ui.wrapper.borderHover} ${ui.wrapper.transition} ${ui.wrapper.group} bg-white/5`}>
      <div className={`${ui.header.layout} ${ui.header.gap}`}>
        <div 
          className={`${ui.icon.padding} ${ui.icon.radius} ${ui.icon.hoverScale} ${ui.icon.transition} ${isPrimary ? '' : ui.icon.colorBg(color)} ${isPrimary ? '' : ui.icon.colorText(color)}`}
          style={isPrimary ? { backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', color: 'var(--color-primary)' } : {}}
        >
          <Icon className={ui.icon.size} />
        </div>
        {trend && (
          <span className={`${ui.trend.fontSize} ${ui.trend.fontWeight} ${ui.trend.paddingX} ${ui.trend.paddingY} ${ui.trend.radius} ${trendBg} ${trendText}`}>
            {trend}
          </span>
        )}
      </div>
      <div className={`${ui.value.fontSize} ${ui.value.fontWeight} ${ui.value.color} ${ui.value.gap}`}>
        {value}
      </div>
      <div className={`${ui.label.fontSize} ${ui.label.color} ${ui.label.transform} ${ui.label.tracking} ${ui.label.fontWeight}`}>
        {label}
      </div>
    </div>
  );
};
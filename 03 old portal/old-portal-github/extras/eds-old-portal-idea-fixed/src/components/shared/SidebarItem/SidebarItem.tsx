import React from 'react';
import { sidebarItemUI as ui } from './ui';
import { useTheme } from '../../../hooks/useTheme';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick?: () => void;
  collapsed?: boolean;
  badge?: string | number;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
  icon: Icon,
  label,
  active,
  onClick,
  collapsed,
  badge
}) => {
  const theme = useTheme();

  return (
    <button
      onClick={onClick}
      className={`${ui.wrapper.base} ${active ? '' : ui.wrapper.inactive} ${collapsed ? ui.wrapper.collapsed : ''}`}
      style={active ? { 
        backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', 
        color: 'var(--color-primary)' 
      } : {}}
    >
      <div className={ui.leftGroup.layout}>
        <Icon className={`${ui.icon.size} ${active ? '' : ui.icon.inactive}`} />
        {!collapsed && (
          <span className={`${ui.label.base} ${active ? '' : ui.label.inactive}`}>
            {label}
          </span>
        )}
      </div>
      
      {!collapsed && badge && (
        <span className={`${ui.badge.base} ${active ? '' : ui.badge.inactive}`} style={active ? { 
          backgroundColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)' 
        } : {}}>
          {badge}
        </span>
      )}

      {collapsed && (
        <div className={ui.tooltip.layout}>
          {label}
        </div>
      )}
    </button>
  );
};
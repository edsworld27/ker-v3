import React from 'react';
import { ChevronRight } from 'lucide-react';
import { sidebarItemUI as ui } from './Clientui';
import { useTheme } from '@ClientShell/hooks/ClientuseTheme';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick?: () => void;
  collapsed?: boolean;
  badge?: string | number;
  hasChildren?: boolean;
  isExpanded?: boolean;
  isChild?: boolean;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
  icon: Icon,
  label,
  active,
  onClick,
  collapsed,
  badge,
  hasChildren,
  isExpanded,
  isChild,
}) => {
  const theme = useTheme();

  return (
    <button
      onClick={onClick}
      className={`${ui.wrapper.base} ${active ? '' : ui.wrapper.inactive} ${collapsed ? ui.wrapper.collapsed : ''} ${isChild ? 'pl-3' : ''}`}
      style={active ? {
        backgroundColor: 'color-mix(in srgb, var(--people-widget-primary-color-1) 10%, transparent)',
        color: 'var(--people-widget-primary-color-1)'
      } : {}}
    >
      <div className={ui.leftGroup.layout}>
        <Icon className={`${isChild ? 'w-3.5 h-3.5' : ui.icon.size} ${active ? '' : ui.icon.inactive}`} />
        {!collapsed && (
          <span className={`${ui.label.base} ${active ? '' : ui.label.inactive} ${isChild ? 'text-xs' : ''}`}>
            {label}
          </span>
        )}
      </div>

      {!collapsed && badge && !hasChildren && (
        <span className={`${ui.badge.base} ${active ? '' : ui.badge.inactive}`} style={active ? {
          backgroundColor: 'color-mix(in srgb, var(--people-widget-primary-color-1) 20%, transparent)'
        } : {}}>
          {badge}
        </span>
      )}

      {!collapsed && hasChildren && (
        <ChevronRight
          className="w-3.5 h-3.5 shrink-0 transition-transform duration-200"
          style={isExpanded ? { transform: 'rotate(90deg)' } : {}}
        />
      )}

      {collapsed && (
        <div className={ui.tooltip.layout}>
          {label}
        </div>
      )}
    </button>
  );
};

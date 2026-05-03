import React from 'react';
import { ChevronRight } from 'lucide-react';

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
  const wrapperBase =
    'group relative w-full flex items-center justify-between rounded-lg transition-colors duration-150';
  const wrapperPad = collapsed ? 'h-10 justify-center' : isChild ? 'h-9 pl-9 pr-3' : 'h-10 px-3';
  const wrapperState = active
    ? 'bg-white/[0.05] text-white'
    : 'text-slate-400 hover:bg-white/[0.03] hover:text-white';
  const accentBar = active && !collapsed
    ? 'before:content-[""] before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-[3px] before:rounded-r-full'
    : '';

  return (
    <button
      onClick={onClick}
      className={`${wrapperBase} ${wrapperPad} ${wrapperState} ${accentBar}`}
      style={
        active && !collapsed
          ? ({ ['--tw-content' as string]: '""' } as React.CSSProperties)
          : undefined
      }
    >
      {active && !collapsed ? (
        <span
          className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full"
          style={{ backgroundColor: 'var(--host-widget-primary-color-1)' }}
        />
      ) : null}
      <span className="flex items-center gap-3 min-w-0">
        <Icon
          className={`shrink-0 ${isChild ? 'w-3.5 h-3.5' : 'w-[18px] h-[18px]'} ${active ? 'text-white' : 'text-slate-500 group-hover:text-slate-200'}`}
        />
        {!collapsed && (
          <span className={`truncate font-medium ${isChild ? 'text-xs' : 'text-sm'}`}>
            {label}
          </span>
        )}
      </span>

      {!collapsed && badge != null && !hasChildren && (
        <span
          className={`shrink-0 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-md text-[10px] font-medium border ${
            active
              ? 'bg-white/10 text-white border-white/15'
              : 'bg-white/[0.04] text-slate-400 border-white/10'
          }`}
        >
          {badge}
        </span>
      )}

      {!collapsed && hasChildren && (
        <ChevronRight
          className={`w-3.5 h-3.5 shrink-0 text-slate-500 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
        />
      )}

      {collapsed && (
        <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1 bg-[#0e0e10] border border-white/10 text-white text-xs font-medium rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-xl">
          {label}
        </span>
      )}
    </button>
  );
};

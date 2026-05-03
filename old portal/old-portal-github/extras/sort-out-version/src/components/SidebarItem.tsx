import React from 'react';
import { motion } from 'motion/react';
import { PortalView } from '../types';

export const SidebarItem = ({ view, icon: Icon, label, active, collapsed, onClick, className = "", badge }: { key?: React.Key, view?: PortalView | string, icon: any, label: string, active: boolean, collapsed: boolean, onClick: () => void, className?: string, badge?: number | string }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group ${
      active 
        ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' 
        : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
    } ${collapsed ? 'justify-center' : ''} ${className}`}
    title={collapsed ? label : ''}
  >
    <div className="relative">
      <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-indigo-400' : 'group-hover:text-white'}`} />
      {badge !== undefined && collapsed && (
        <span className="absolute -top-2 -right-2 min-w-[16px] h-4 bg-indigo-600 text-[10px] font-bold text-white rounded-full flex items-center justify-center px-1 border border-black shadow-lg">
          {badge}
        </span>
      )}
    </div>
    {!collapsed && (
      <div className="flex-1 flex items-center justify-between overflow-hidden">
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="font-medium whitespace-nowrap"
        >
          {label}
        </motion.span>
        {badge !== undefined && (
          <span className="px-2 py-0.5 rounded-full bg-indigo-600/20 text-[10px] font-bold text-indigo-400 border border-indigo-500/20">
            {badge}
          </span>
        )}
      </div>
    )}
  </button>
);

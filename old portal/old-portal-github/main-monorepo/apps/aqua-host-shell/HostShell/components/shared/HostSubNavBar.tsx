import React from 'react';
import { LucideProps } from 'lucide-react';

export interface SubNavItem {
  id: string;
  label: string;
  icon?: React.ComponentType<LucideProps>;
  view: string;
  active?: boolean;
  onClick?: () => void;
  badge?: string | number;
  children?: SubNavItem[];
}

interface SubNavBarProps {
  items: SubNavItem[];
  title: string;
}

export const SubNavBar: React.FC<SubNavBarProps> = ({ items, title }) => {
  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <div className="flex items-center gap-2 p-1 rounded-xl bg-black/20 border border-[var(--host-border-color)] overflow-x-auto no-scrollbar">
        {items.map(item => (
          <button
            key={item.id}
            onClick={item.onClick}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shrink-0 ${
              item.active
                ? 'bg-[var(--host-widget-primary-color-1)] text-white shadow-md'
                : 'text-[var(--host-text-color-muted)] hover:text-[var(--host-text-color)]'
            }`}
          >
            <item.icon size={12} />
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

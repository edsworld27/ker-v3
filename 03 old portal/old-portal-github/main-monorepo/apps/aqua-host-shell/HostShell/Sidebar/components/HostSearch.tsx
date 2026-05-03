import React from 'react';
import { Search as SearchIcon } from 'lucide-react';

interface SearchProps {
  collapsed: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Search: React.FC<SearchProps> = ({ collapsed, value, onChange }) => {
  if (collapsed) {
    return (
      <div className="px-3 pb-3">
        <button
          type="button"
          className="w-full h-9 flex items-center justify-center rounded-lg bg-white/[0.03] border border-white/5 text-slate-500 hover:text-white hover:bg-white/[0.06] transition-colors"
          aria-label="Search"
        >
          <SearchIcon className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 pb-3">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
        <input
          type="text"
          placeholder="Search..."
          value={value}
          onChange={onChange}
          className="w-full h-9 bg-white/[0.03] border border-white/5 rounded-lg pl-8 pr-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-white/15 focus:bg-white/[0.05] transition-colors"
        />
      </div>
    </div>
  );
};

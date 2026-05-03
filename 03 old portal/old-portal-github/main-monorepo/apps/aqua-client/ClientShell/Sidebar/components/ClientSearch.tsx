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
      <div className="px-3 py-3">
        <button className="w-full flex items-center justify-center p-2 rounded-lg transition-colors hover:bg-slate-800 text-slate-500 hover:text-white">
          <SearchIcon className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 pt-1 pb-3">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="w-4 h-4 text-slate-500" />
        </div>
        <input
          type="text"
          placeholder="Search..."
          value={value}
          onChange={onChange}
          className="w-full bg-slate-900/70 border border-transparent rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-slate-700 focus:bg-slate-800 transition-all duration-200"
        />
      </div>
    </div>
  );
};

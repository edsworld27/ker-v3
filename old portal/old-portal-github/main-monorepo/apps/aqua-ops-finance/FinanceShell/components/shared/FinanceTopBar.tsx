import React from 'react';

type AppMode = string;

interface FinanceTopBarProps {
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
  isAgencyRole: boolean;
  impersonatingClientId: string | null;
}

export const FinanceTopBar: React.FC<FinanceTopBarProps> = ({ appMode, setAppMode, isAgencyRole, impersonatingClientId }) => {
  if (!isAgencyRole || impersonatingClientId) {
    return null;
  }

  const modes = [
    { mode: 'operations',        label: 'Operations' },
    { mode: 'crm',               label: 'CRM & Sales' },
    { mode: 'business-os',       label: 'Business OS' },
    { mode: 'company',           label: 'Company' },
    { mode: 'client-portal-demo',label: 'Portal Preview' },
    { mode: 'settings',          label: 'Settings' },
  ];

  return (
    <div className="h-16 border-b border-[var(--finance-border-color)] flex items-center justify-center px-4 md:px-8 shrink-0 z-10" style={{ backgroundColor: 'color-mix(in srgb, var(--finance-bg-color) 80%, transparent)', backdropFilter: 'blur(16px)' }}>
      <div className="flex items-center gap-2 p-1 rounded-xl bg-black/20 border border-[var(--finance-border-color)] overflow-x-auto no-scrollbar">
        {modes.map(m => (
          <button
            key={m.mode}
            onClick={() => setAppMode(m.mode as any)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shrink-0 ${
              appMode === m.mode
                ? 'bg-[var(--finance-primary-color)] text-white shadow-md'
                : 'text-[var(--finance-text-color-muted)] hover:text-[var(--finance-text-color)]'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
};

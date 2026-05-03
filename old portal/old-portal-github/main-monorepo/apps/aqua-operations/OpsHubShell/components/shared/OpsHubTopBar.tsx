import React from 'react';

type AppMode = string;

interface OpsHubTopBarProps {
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
  isAgencyRole: boolean;
  impersonatingClientId: string | null;
}

export const OpsHubTopBar: React.FC<OpsHubTopBarProps> = ({ appMode, setAppMode, isAgencyRole, impersonatingClientId }) => {
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
    <div className="h-16 border-b border-[var(--opshub-widget-border)] flex items-center justify-center px-4 md:px-8 shrink-0 z-10" style={{ backgroundColor: 'color-mix(in srgb, var(--opshub-widget-bg-color-1) 80%, transparent)', backdropFilter: 'blur(16px)' }}>
      <div className="flex items-center gap-2 p-1 rounded-xl bg-black/20 border border-[var(--opshub-widget-border)] overflow-x-auto no-scrollbar">
        {modes.map(m => (
          <button
            key={m.mode}
            onClick={() => setAppMode(m.mode as any)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shrink-0 ${
              appMode === m.mode
                ? 'bg-[var(--people-widget-primary-color-1)] text-white shadow-md'
                : 'text-[var(--opshub-widget-text-muted)] hover:text-[var(--opshub-widget-text)]'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
};

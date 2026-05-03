'use client';
import React from 'react';
import { Compass, Palette, Code, Activity, UserCheck, UserCog, Settings2, BarChart3 } from 'lucide-react';
import { Page, PageHeader, Card, Button } from '@aqua/bridge/ui/kit';
import { useAppContext } from '@ClientShell/bridge/ClientAppContext';

const PHASE_MAP = [
  { id: 'discovery',   label: 'Discovery',   icon: Compass,    color: '#818cf8', bg: 'bg-indigo-500/10',  border: 'border-indigo-500/20',  description: 'Initial structural alignment and goal setting.',          targetClientId: 'client-1' },
  { id: 'design',      label: 'Design',      icon: Palette,    color: '#f472b6', bg: 'bg-pink-500/10',    border: 'border-pink-500/20',    description: 'Brand identity, UI/UX, and creative assets.',            targetClientId: 'client-2' },
  { id: 'development', label: 'Development', icon: Code,       color: '#60a5fa', bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    description: 'Software engineering, CMS integration, and QA.',         targetClientId: 'client-3' },
  { id: 'onboarding',  label: 'Onboarding',  icon: UserCheck,  color: '#34d399', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', description: 'Client training, credential handoff, and final checks.', targetClientId: 'client-4' },
  { id: 'live',        label: 'Live ops',    icon: Activity,   color: '#fbbf24', bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   description: 'Active maintenance, analytics, and ongoing support.',     targetClientId: 'client-5' },
];

export const PhasesHubView: React.FC = () => {
  const { clients, handleImpersonate, handleViewChange, currentUserEmail } = useAppContext();

  return (
    <Page>
      <PageHeader
        eyebrow="Lifecycle"
        title="Phases hub"
        subtitle={`Lifecycle simulator — switch into any phase to see how the client portal renders for that engagement state. Authorized: ${currentUserEmail}.`}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {PHASE_MAP.map(phase => {
          const Icon = phase.icon;
          const hasClient = !!clients.find(c => c.id === phase.targetClientId);
          return (
            <Card key={phase.id} padding="md">
              <div className={`w-11 h-11 rounded-xl border ${phase.bg} ${phase.border} flex items-center justify-center mb-4`}>
                <Icon className="w-5 h-5" style={{ color: phase.color }} />
              </div>
              <h3 className="text-base font-semibold mb-1.5" style={{ color: phase.color }}>
                {phase.label}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-5 min-h-[40px]">
                {phase.description}
              </p>
              <div className="pt-4 border-t border-white/5 space-y-2">
                <Button
                  variant="primary"
                  size="sm"
                  icon={UserCog}
                  disabled={!hasClient}
                  onClick={() => handleImpersonate(phase.targetClientId)}
                  className="w-full"
                >
                  {hasClient ? 'Impersonate phase' : 'No demo linked'}
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Settings2}
                    onClick={() => handleViewChange(`${phase.id}-phase-view`)}
                  >
                    Editor
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={BarChart3}
                    onClick={() => {
                      if (typeof window !== 'undefined') window.alert('Phases analytics module coming soon');
                    }}
                  >
                    Analytics
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </Page>
  );
};

export default PhasesHubView;

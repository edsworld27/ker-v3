import React from 'react';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { useAppContext } from '@ClientShell/bridge/ClientAppContext';
import { useDesignAwareData } from '@ClientShell/hooks/ClientuseDesignAwareData';
import { CLIENT_STAGES } from '@ClientShell/bridge/config/Clientconstants';

export const ProjectTimeline: React.FC = () => {
  const context = useAppContext();
  const { impersonatingClientId } = context;

  // Rule 4: Use design-aware data for milestones
  const { data: activeClient } = useDesignAwareData(context.activeClient, 'admin-active-client-timeline');
  const { data: clients = [] } = useDesignAwareData(context.clients, 'admin-clients-timeline');

  // Resolve the client we're viewing — active impersonation or first client
  const client = activeClient ?? clients.find(c => c.id === impersonatingClientId) ?? clients[0];

  if (!client) {
    return (
      <section className="glass-card rounded-[var(--radius-card)] border border-[var(--client-widget-border)] p-5">
        <h3 className="text-sm font-bold text-[var(--client-widget-text)] mb-4">Project Timeline</h3>
        <p className="text-xs text-[var(--client-widget-text-muted)] text-center py-6">No client selected.</p>
      </section>
    );
  }

  // Build timeline from CLIENT_STAGES
  const currentIdx = CLIENT_STAGES.findIndex(s => s.id === client.stage);

  return (
    <section className="glass-card rounded-[var(--radius-card)] border border-[var(--client-widget-border)] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-[var(--client-widget-text)]">Project Timeline</h3>
        <span
          className="text-[10px] font-bold px-2.5 py-1 rounded-full"
          style={{ backgroundColor: 'color-mix(in srgb, var(--client-widget-primary-color-1) 20%, transparent)', color: 'var(--client-widget-primary-color-1)' }}
          data-design-static="true"
        >
          {client.name}
        </span>
      </div>

      <div className="space-y-0" data-design-static="true">
        {CLIENT_STAGES.map((stage, i) => {
          const isCompleted = i < currentIdx;
          const isCurrent   = i === currentIdx;
          const isPending   = i > currentIdx;
          const isLast      = i === CLIENT_STAGES.length - 1;

          return (
            <div key={stage.id} className="flex gap-3">
              {/* Spine */}
              <div className="flex flex-col items-center">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-all"
                  style={
                    isCompleted
                      ? { backgroundColor: 'var(--client-widget-success)', borderColor: 'var(--client-widget-success)', color: '#fff' }
                      : isCurrent
                      ? { backgroundColor: 'color-mix(in srgb, var(--client-widget-primary-color-1) 20%, transparent)', borderColor: 'var(--client-widget-primary-color-1)', color: 'var(--client-widget-primary-color-1)' }
                      : { backgroundColor: 'transparent', borderColor: 'var(--client-widget-border)', color: 'var(--client-widget-text-muted)' }
                  }
                >
                  {isCompleted ? <CheckCircle2 size={14} /> : isCurrent ? <Clock size={14} /> : <Circle size={14} />}
                </div>
                {!isLast && (
                  <div
                    className="w-0.5 flex-1 my-1 min-h-[20px]"
                    style={{ backgroundColor: isCompleted ? 'var(--client-widget-success)' : 'var(--client-widget-border)' }}
                  />
                )}
              </div>

              {/* Label */}
              <div className={`pb-4 ${isLast ? '' : ''}`}>
                <p
                  className="text-sm font-semibold mb-0.5"
                  style={{ color: isCurrent ? 'var(--client-widget-primary-color-1)' : isPending ? 'var(--client-widget-text-muted)' : 'var(--client-widget-text)' }}
                >
                  {stage.label}
                </p>
                {isCurrent && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="h-1 w-24 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--client-widget-border)' }}>
                      <div className="h-full w-1/2 rounded-full" style={{ backgroundColor: 'var(--client-widget-primary-color-1)' }} />
                    </div>
                    <span className="text-[9px] text-[var(--client-widget-primary-color-1)] font-semibold">In progress</span>
                  </div>
                )}
                {isCompleted && (
                  <p className="text-[10px] text-[var(--client-widget-success)]">Completed</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

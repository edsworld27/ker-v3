import React from 'react';
import { Wrench, CheckSquare, AlertTriangle, Layers, Clock } from 'lucide-react';
import { useDesignAwareData } from '@ClientShell/hooks/ClientuseDesignAwareData';

export function FulfillmentWidget() {
  const rawProductionQueue = [
    { task: 'Homepage Hero Redesign', client: 'Acme Corp', assignee: 'Sarah', status: 'In Review', priority: 'High' },
    { task: 'Stripe Payment Integration', client: 'Global Tech', assignee: 'John', status: 'Blocked', priority: 'High' },
    { task: 'Brand Guidelines PDF', client: 'Nova Studio', assignee: 'Sarah', status: 'In Progress', priority: 'Medium' }
  ];

  const { data: productionQueue } = useDesignAwareData(rawProductionQueue, 'fulfillment-production-queue');

  return (
    <div className="flex flex-col h-[75vh] w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2"><Wrench className="w-5 h-5 text-[var(--client-widget-primary-color-1)]" /> Fulfillment & Delivery</h2>
          <p className="text-sm text-[var(--client-widget-text-muted)] mt-1">Track sprint progress, blockages, and live deployments.</p>
        </div>
        <button className="px-4 py-2 bg-[var(--client-widget-primary-color-1)] text-[var(--client-widget-text-on-primary)] rounded-[var(--radius-button)] text-sm font-semibold transition-all hover:brightness-110 shadow-lg">
          New Sprint
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="glass-card p-5 rounded-[var(--radius-card)] border border-[var(--client-widget-border)]">
          <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--client-widget-text-muted)] mb-2 flex items-center gap-1.5"><Layers size={12}/> Active Projects</div>
          <div className="text-2xl font-bold">12</div>
        </div>
        <div className="glass-card p-5 rounded-[var(--radius-card)] border border-[var(--client-widget-border)]">
          <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--client-widget-text-muted)] mb-2 flex items-center gap-1.5"><Clock size={12}/> In Revision</div>
          <div className="text-2xl font-bold text-[var(--client-widget-info)]">4</div>
        </div>
        <div className="glass-card p-5 rounded-[var(--radius-card)] border border-[var(--client-widget-border)] bg-[color-mix(in_srgb,var(--client-widget-error)_5%,var(--client-widget-surface-1-glass))] border-[var(--client-widget-error)]/30">
          <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--client-widget-error)] mb-2 flex items-center gap-1.5"><AlertTriangle size={12}/> Blocked</div>
          <div className="text-2xl font-bold text-[var(--client-widget-error)]">1</div>
        </div>
        <div className="glass-card p-5 rounded-[var(--radius-card)] border border-[var(--client-widget-border)]">
          <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--client-widget-text-muted)] mb-2 flex items-center gap-1.5"><CheckSquare size={12}/> Sprint Goal</div>
          <div className="text-2xl font-bold text-[var(--client-widget-success)]">94%</div>
        </div>
      </div>

      <div className="flex-1 glass-card rounded-[var(--radius-card)] border border-[var(--client-widget-border)] p-6">
        <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--client-widget-text-muted)] mb-4">Active Production Queue</h3>
        <div className="space-y-3" data-design-static="true">
          {productionQueue.map((item: any, i: number) => (
            <div key={i} className="flex items-center justify-between p-4 bg-[var(--client-widget-surface-1-glass)] rounded-[var(--radius-button)] border border-[var(--client-widget-border)] hover:bg-[var(--client-widget-surface-1-hover)] transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-[var(--client-widget-primary-color-1)]/20 flex items-center justify-center text-xs font-bold text-[var(--client-widget-primary-color-1)]">{item.assignee.charAt(0)}</div>
                <div>
                  <p className="font-semibold text-sm">{item.task}</p>
                  <p className="text-[10px] text-[var(--client-widget-text-muted)] uppercase tracking-widest mt-1">{item.client}</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${item.status === 'Blocked' ? 'bg-[var(--client-widget-error)]/20 text-[var(--client-widget-error)]' : item.status === 'In Review' ? 'bg-[var(--client-widget-info)]/20 text-[var(--client-widget-info)]' : 'bg-[var(--client-widget-surface-1-hover)] text-[var(--client-widget-text-muted)]'}`}>{item.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
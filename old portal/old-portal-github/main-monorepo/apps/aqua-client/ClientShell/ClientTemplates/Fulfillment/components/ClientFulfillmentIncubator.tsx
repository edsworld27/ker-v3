import React from 'react';
import { Plus, Settings } from 'lucide-react';
import { FulfillmentIncubatorDemo } from './ClientFulfillmentIncubator.demo';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const FulfillmentIncubator: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">Client Portal Incubator</h3>
          <p className="text-sm text-[var(--client-widget-text-muted)]">Manage and configure client environments before they go live.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[var(--client-widget-primary-color-1)] text-[var(--client-widget-text-on-primary)] rounded-[var(--radius-button)] text-sm font-semibold hover:brightness-110 transition-all">
          <Plus className="w-4 h-4" /> New Portal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Simulated Portal Previews */}
        <div className="glass-card p-6 rounded-[var(--radius-card)] border border-[var(--client-widget-border)] group">
          <div className="flex justify-between items-start mb-4">
            <span className="px-2 py-1 bg-orange-500/10 text-orange-500 text-[10px] font-bold uppercase rounded-md">In Configuration</span>
            <Settings className="w-4 h-4 text-[var(--client-widget-text-muted)] group-hover:text-[var(--client-widget-primary-color-1)] transition-colors cursor-pointer" />
          </div>
          <h4 className="text-xl font-bold mb-1">Acme Corp Portal</h4>
          <p className="text-xs text-[var(--client-widget-text-muted)] mb-6">Theme: Light & Modern • Role limits: Standard</p>
          
          <div className="aspect-[16/9] w-full bg-[var(--client-widget-bg-color-1)] rounded-sm border border-[var(--client-widget-border)] p-2 relative overflow-hidden group-hover:border-[var(--client-widget-primary-color-1)]/50 transition-colors">
            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px] z-10 cursor-pointer">
              <span className="px-4 py-2 bg-[var(--client-widget-primary-color-1)] text-white text-xs font-bold rounded-lg shadow-lg">Preview Portal</span>
            </div>
            {/* Wireframe UI */}
            <div className="w-full h-4 bg-[var(--client-widget-surface-1-glass)] rounded-sm mb-2 flex items-center px-2 gap-2">
               <div className="w-2 h-2 rounded-full bg-red-400" />
               <div className="w-2 h-2 rounded-full bg-amber-400" />
               <div className="w-2 h-2 rounded-full bg-green-400" />
            </div>
            <div className="flex gap-2 h-[calc(100%-1.5rem)]">
              <div className="w-1/4 h-full bg-[var(--client-widget-surface-1-glass)] rounded-sm" />
              <div className="w-3/4 h-full flex flex-col gap-2">
                <div className="h-1/3 w-full bg-[var(--client-widget-surface-1-glass)] rounded-sm" />
                <div className="h-2/3 w-full bg-[var(--client-widget-surface-1-glass)] rounded-sm flex gap-2">
                   <div className="w-1/2 h-full bg-[var(--client-widget-bg-color-1)] rounded-sm border border-[var(--client-widget-border)]" />
                   <div className="w-1/2 h-full bg-[var(--client-widget-bg-color-1)] rounded-sm border border-[var(--client-widget-border)]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-[var(--radius-card)] border border-[var(--client-widget-border)] group">
          <div className="flex justify-between items-start mb-4">
            <span className="px-2 py-1 bg-green-500/10 text-green-500 text-[10px] font-bold uppercase rounded-md">Live - Monitoring</span>
            <Settings className="w-4 h-4 text-[var(--client-widget-text-muted)] group-hover:text-[var(--client-widget-primary-color-1)] transition-colors cursor-pointer" />
          </div>
          <h4 className="text-xl font-bold mb-1">TechFlow OS</h4>
          <p className="text-xs text-[var(--client-widget-text-muted)] mb-6">Theme: Dark Executive • Role limits: Custom</p>
          
          <div className="aspect-[16/9] w-full bg-[#0f172a] rounded-sm border border-[var(--client-widget-border)] p-2 relative overflow-hidden group-hover:border-[var(--client-widget-primary-color-1)]/50 transition-colors">
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px] z-10 cursor-pointer">
              <span className="px-4 py-2 bg-[var(--client-widget-primary-color-1)] text-white text-xs font-bold rounded-lg shadow-lg">Manage Portal</span>
            </div>
            {/* Wireframe UI */}
            <div className="w-full h-4 bg-[#1e293b] rounded-sm mb-2 flex items-center px-2 gap-2 border-b border-[#334155]">
               <div className="w-2 h-2 rounded-full bg-[#334155]" />
               <div className="w-2 h-2 rounded-full bg-[#334155]" />
               <div className="w-2 h-2 rounded-full bg-[#334155]" />
            </div>
            <div className="flex gap-2 h-[calc(100%-1.5rem)]">
              <div className="w-1/5 h-full bg-[#1e293b] rounded-sm border border-[#334155]" />
              <div className="w-4/5 h-full flex flex-col gap-2">
                <div className="h-full w-full bg-[#1e293b] rounded-sm border border-[#334155] p-2">
                  <div className="w-1/3 h-2 bg-[var(--client-widget-primary-color-1)]/50 rounded-full mb-2" />
                  <div className="w-full h-[1px] bg-[#334155] mb-2" />
                  <div className="w-full h-2/3 bg-[#334155]/30 rounded-sm" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

(FulfillmentIncubator as any).DemoVariant = FulfillmentIncubatorDemo;

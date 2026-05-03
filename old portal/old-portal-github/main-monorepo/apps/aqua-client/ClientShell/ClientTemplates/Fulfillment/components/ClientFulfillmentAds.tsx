import React from 'react';
import { Target, Plus, Filter } from 'lucide-react';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface FulfillmentAdsProps {
  clientAds: any[];
}

export const FulfillmentAds: React.FC<FulfillmentAdsProps> = ({ clientAds }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Target className="w-5 h-5 text-[var(--client-widget-primary-color-1)]" /> Active Ad Operations
        </h3>
        <div className="flex gap-2">
          <button className="p-2 glass-card rounded-lg border border-[var(--client-widget-border)] text-[var(--client-widget-text-muted)]">
            <Filter className="w-4 h-4" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[var(--client-widget-bg-color-1)] border border-[var(--client-widget-border)] text-[var(--client-widget-text)] rounded-[var(--radius-button)] text-sm font-semibold hover:bg-[var(--client-widget-surface-1-glass)] transition-all">
            <Plus className="w-4 h-4" /> Sync Account
          </button>
        </div>
      </div>

      <div className="glass-card rounded-[var(--radius-card)] border border-[var(--client-widget-border)] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--client-widget-surface-1-glass)] border-b border-[var(--client-widget-border)] text-[10px] uppercase font-bold text-[var(--client-widget-text-muted)] tracking-wider">
              <th className="p-4">Client / Campaign</th>
              <th className="p-4">Platform</th>
              <th className="p-4 text-right">Spend</th>
              <th className="p-4 text-center">ROAS</th>
              <th className="p-4 text-right">Conversions</th>
              <th className="p-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--client-widget-border)]">
            {clientAds.map(ad => (
              <tr key={ad.id} className="hover:bg-[var(--client-widget-surface-1-glass)]/50 transition-colors group cursor-pointer">
                <td className="p-4">
                  <div className="font-bold text-sm group-hover:text-[var(--client-widget-primary-color-1)] transition-colors">{ad.clientName}</div>
                  <div className="text-xs text-[var(--client-widget-text-muted)]">{ad.campaignName}</div>
                </td>
                <td className="p-4">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${
                    ad.platform === 'Meta' ? 'bg-blue-500/10 border-blue-500/30 text-blue-500' :
                    ad.platform === 'Google' ? 'bg-orange-500/10 border-orange-500/30 text-orange-500' :
                    'bg-blue-600/10 border-blue-600/30 text-blue-600'
                  }`}>
                    {ad.platform}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="font-mono text-sm">£{(ad.spendToDate / 100).toLocaleString('en-GB', { minimumFractionDigits: 2 })}</div>
                  <div className="text-[10px] text-[var(--client-widget-text-muted)]">£{(ad.dailyBudget / 100).toLocaleString()}/day</div>
                </td>
                <td className="p-4 text-center">
                  <span className={`font-bold ${ad.roas >= 3 ? 'text-green-500' : ad.roas >= 2 ? 'text-orange-500' : 'text-red-500'}`}>
                    {ad.roas}x
                  </span>
                </td>
                <td className="p-4 text-right font-semibold">
                  {ad.conversions.toLocaleString()}
                </td>
                <td className="p-4 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full border border-[var(--client-widget-border)]">
                    {ad.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

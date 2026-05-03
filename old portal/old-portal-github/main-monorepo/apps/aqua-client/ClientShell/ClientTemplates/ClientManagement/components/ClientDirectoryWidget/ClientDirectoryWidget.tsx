import React from 'react';
import { Building2, MoreHorizontal, Globe, Search, Filter, Mail } from 'lucide-react';
import { ClientStage } from '@ClientShell/bridge/types';
import { StageDropdown } from '../StageDropdown/ClientStageDropdown';
import { CLIENT_STAGES } from '@ClientShell/bridge/config/Clientconstants';
import { useModalContext } from '@ClientShell/bridge/ClientModalContext';
import { useRevenueContext as useSalesContext } from '../../../ClientRevenueContext';
import { useTheme } from '@ClientShell/hooks/ClientuseTheme';
import { useRoleConfig } from '@ClientShell/logic/ClientuseRoleConfig';
import { useDesignAwareData } from '@ClientShell/hooks/ClientuseDesignAwareData';

export const ClientDirectoryWidget: React.FC = () => {
  const context = useSalesContext();
  const { handleUpdateClientStage, handleEditClient, handleImpersonate, canCurrentUserImpersonate } = context;
  
  // Rule 4: Use design-aware data
  const { data: clients = [] } = useDesignAwareData(context.clients, 'admin-clients-directory');

  const canImpersonate = canCurrentUserImpersonate;
  const theme = useTheme();
  const { label } = useRoleConfig();
  const { openModal: setShowAddClientModal } = useModalContext();

  const [searchTerm, setSearchTerm] = React.useState('');
  const [stageFilter, setStageFilter] = React.useState<ClientStage | 'All'>('All');

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          client.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = stageFilter === 'All' || client.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  return (
    <div className="glass-card rounded-[2.5rem] border border-[var(--client-widget-border)] overflow-hidden flex flex-col h-full bg-[var(--client-widget-bg-color-1)]/40 backdrop-blur-xl">
      {/* Header with Search/Filter */}
      <div className="p-6 md:p-8 border-b border-[var(--client-widget-border)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h3 className="text-xl font-semibold">Managed {label('clients')}</h3>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--client-widget-text-muted)]" />
            <input
              type="text"
              placeholder={`Search ${label('clients')}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[var(--client-widget-surface-1-glass)] border border-[var(--client-widget-border)] rounded-[var(--radius-button)] outline-none focus:border-[var(--client-widget-primary-color-1)] transition-all text-sm"
            />
          </div>
          <div className="relative w-full sm:w-auto">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--client-widget-text-muted)] pointer-events-none" />
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value as ClientStage | 'All')}
              className="w-full sm:w-auto pl-10 pr-8 py-2 bg-[var(--client-widget-surface-1-glass)] border border-[var(--client-widget-border)] rounded-[var(--radius-button)] outline-none focus:border-[var(--client-widget-primary-color-1)] transition-all text-sm appearance-none cursor-pointer"
            >
              <option value="All" className="bg-[var(--client-widget-bg-color-1)]">All Stages</option>
              {CLIENT_STAGES.map(s => (
                <option key={s.id} value={s.id} className="bg-[var(--client-widget-bg-color-1)]">{s.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table Area */}
      <div className="flex-1 overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-white/2 border-b border-[var(--client-widget-border)]">
              <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-[var(--client-widget-text-muted)]">{label('clients')}</th>
              <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-[var(--client-widget-text-muted)]">Stage</th>
              <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-[var(--client-widget-text-muted)]">Modules</th>
              <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-[var(--client-widget-text-muted)]">Contact</th>
              <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-[var(--client-widget-text-muted)] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--client-widget-border)]">
            {filteredClients.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-8 py-16 text-center text-[var(--client-widget-text-muted)]">
                  <Building2 className="w-12 h-12 mx-auto mb-4 opacity-10" />
                  <p>No {label('clients').toLowerCase()} found matching your criteria.</p>
                </td>
              </tr>
            ) : (
              filteredClients.map(client => (
                <tr key={client.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[var(--radius-button)] flex items-center justify-center text-sm font-bold text-[var(--client-widget-text)] shrink-0 shadow-lg"
                           style={{ backgroundColor: 'var(--client-widget-primary-color-1)' }}>
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-sm truncate">{client.name}</div>
                        <div className="text-[10px] text-[var(--client-widget-text-muted)] flex items-center gap-1 mt-0.5">
                          <Globe className="w-3 h-3" />
                          {client.websiteUrl || 'No website linked'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <StageDropdown 
                      currentStage={client.stage} 
                      onUpdate={(stage) => handleUpdateClientStage(client.id, stage)} 
                    />
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex -space-x-2">
                      {Object.keys(client.permissions ?? {}).slice(0, 3).map((perm: string, i: number) => (
                        <div 
                          key={i} 
                          className="w-7 h-7 rounded-lg bg-[var(--client-widget-surface-1)] border border-[var(--client-widget-border)] flex items-center justify-center shadow-md tooltip relative group/module"
                          title={perm}
                        >
                          <span className="text-[10px] uppercase font-bold" style={{ color: 'var(--client-widget-primary-color-1)' }}>{perm.charAt(0)}</span>
                        </div>
                      ))}
                      {Object.keys(client.permissions ?? {}).length > 3 && (
                        <div className="w-7 h-7 rounded-lg bg-[var(--client-widget-surface-1)] border border-[var(--client-widget-border)] flex items-center justify-center text-[8px] font-bold text-[var(--client-widget-text-muted)]">
                          +{Object.keys(client.permissions ?? {}).length - 3}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-xs text-[var(--client-widget-text)]">
                        <Mail className="w-3 h-3 text-[var(--client-widget-text-muted)]" />
                        {client.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleEditClient(client)}
                        className="p-2 hover:bg-[var(--client-widget-surface-1-glass)] rounded-lg text-[var(--client-widget-text-muted)] hover:text-[var(--client-widget-text)] transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      {canImpersonate && (
                        <button
                          onClick={() => handleImpersonate(client.id)}
                          className="px-4 py-1.5 bg-[var(--client-widget-primary-color-1)]/10 hover:bg-[var(--client-widget-primary-color-1)] text-[var(--client-widget-primary-color-1)] hover:text-[var(--client-widget-text-on-primary)] rounded-lg text-xs font-bold transition-all"
                        >
                          Access
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

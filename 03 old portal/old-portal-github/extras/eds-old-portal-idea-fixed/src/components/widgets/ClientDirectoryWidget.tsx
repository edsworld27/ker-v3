import React from 'react';
import { motion } from 'motion/react';
import { Building2, MoreHorizontal, Globe, UserPlus, Search, Filter, Mail } from 'lucide-react';
import { Client, ClientStage, PortalView, AppUser } from '../../types';
import { StageDropdown } from '../shared/StageDropdown';
import { useAppContext } from '../../context/AppContext';
import { useModalContext } from '../../context/ModalContext';
import { useTheme } from '../../hooks/useTheme';
import { useRoleConfig } from '../../hooks/useRoleConfig';
import { clientManagementViewUI as ui } from './ui'; // Assuming ui is in the same directory

interface ClientDirectoryWidgetProps {
  clients: Client[];
  selectedClientId: string | null;
  setSelectedClientId: (id: string | null) => void;
  handleUpdateClientStage: (clientId: string, stage: ClientStage) => void;
  handleEditClient: (client: Client) => void;
  handleImpersonate: (clientId: string) => void;
  canImpersonate: boolean;
  users: AppUser[];
}

export const ClientDirectoryWidget: React.FC<ClientDirectoryWidgetProps> = ({
  clients,
  selectedClientId,
  setSelectedClientId,
  handleUpdateClientStage,
  handleEditClient,
  handleImpersonate,
  canImpersonate,
  users,
}) => {
  const theme = useTheme();
  const { label } = useRoleConfig();
  const { setShowAddClientModal } = useModalContext();

  const [searchTerm, setSearchTerm] = React.useState('');
  const [stageFilter, setStageFilter] = React.useState<ClientStage | 'All'>('All');

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          client.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = stageFilter === 'All' || client.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  return (
    <div className="glass-card rounded-[2.5rem] border border-white/5 overflow-hidden flex flex-col h-full bg-slate-900/40 backdrop-blur-xl">
      {/* Header with Search/Filter */}
      <div className="p-6 md:p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h3 className="text-xl font-semibold">Managed {label('clients')}</h3>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder={`Search ${label('clients')}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-[var(--color-primary)] transition-all text-sm"
            />
          </div>
          <div className="relative w-full sm:w-auto">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value as any)}
              className="w-full sm:w-auto pl-10 pr-8 py-2 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-[var(--color-primary)] transition-all text-sm appearance-none cursor-pointer"
            >
              <option value="All" className="bg-slate-900">All Stages</option>
              <option value="discovery" className="bg-slate-900">Discovery</option>
              <option value="onboarding" className="bg-slate-900">Onboarding</option>
              <option value="design" className="bg-slate-900">Design</option>
              <option value="development" className="bg-slate-900">Development</option>
              <option value="live" className="bg-slate-900">Live</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Area */}
      <div className="flex-1 overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-white/2 border-b border-white/5">
              <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">{label('clients')}</th>
              <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Stage</th>
              <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Modules</th>
              <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Contact</th>
              <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredClients.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-8 py-16 text-center text-slate-500">
                  <Building2 className="w-12 h-12 mx-auto mb-4 opacity-10" />
                  <p>No {label('clients').toLowerCase()} found matching your criteria.</p>
                </td>
              </tr>
            ) : (
              filteredClients.map(client => (
                <tr key={client.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-lg"
                           style={{ backgroundColor: 'var(--color-primary)' }}>
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-sm truncate">{client.name}</div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
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
                      {client.permissions?.slice(0, 3).map((perm: string, i: number) => (
                        <div 
                          key={i} 
                          className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shadow-md tooltip relative group/module"
                          title={perm}
                        >
                          <span className="text-[10px] uppercase font-bold text-indigo-400">{perm.charAt(0)}</span>
                        </div>
                      ))}
                      {(client.permissions?.length || 0) > 3 && (
                        <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-[8px] font-bold text-slate-400">
                          +{client.permissions.length - 3}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-xs text-slate-300">
                        <Mail className="w-3 h-3 text-slate-500" />
                        {client.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleEditClient(client)}
                        className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      {canImpersonate && (
                        <button
                          onClick={() => handleImpersonate(client.id)}
                          className="px-4 py-1.5 bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)] text-[var(--color-primary)] hover:text-white rounded-lg text-xs font-bold transition-all"
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

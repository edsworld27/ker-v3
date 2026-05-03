import React from 'react';
import { ArrowLeft, Plus, Zap, UserCog } from 'lucide-react';
import {
  Page,
  PageHeader,
  Card,
  Button,
  Input,
  EmptyState,
  Field,
} from '@aqua/bridge/ui/kit';
import { AppUser } from '@ClientShell/bridge/types';
import { useClientManagementLogic } from '../logic/ClientuseClientManagementLogic';

const STAGES = ['discovery', 'design', 'development', 'onboarding', 'live'] as const;

export const ClientManagementOverview: React.FC = () => {
  const {
    clients,
    users,
    managedClient,
    selectedClientId,
    setSelectedClientId,
    cmsConfig,
    setCmsConfig,
    handleSaveCmsConfig,
    handleResourceUpload,
    handleEmployeeAssignment,
    handleViewChange,
    handleImpersonate,
    handleUpdateClientStage,
    handleProvisionClient,
    openModal,
    agencyConfig,
  } = useClientManagementLogic();

  const isInternal = (u: AppUser): boolean => {
    const roleId = u.customRoleId || u.role || 'AgencyEmployee';
    return agencyConfig?.roles?.[roleId]?.isInternalStaff ?? false;
  };

  return (
    <Page>
      <PageHeader
        eyebrow="Agency"
        title="Client management"
        subtitle="Configure each client's stage, CMS endpoint, resources, and assigned team."
        actions={
          <Button variant="ghost" icon={ArrowLeft} onClick={() => handleViewChange('dashboard')}>
            Back
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        <div className="space-y-2">
          {clients.map(client => {
            const active = selectedClientId === client.id;
            return (
              <button
                key={client.id}
                onClick={() => setSelectedClientId(client.id)}
                className={`w-full text-left p-3 rounded-xl border transition-colors ${
                  active
                    ? 'bg-indigo-500/[0.06] border-indigo-500/25'
                    : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
                }`}
              >
                <div className="text-sm font-semibold text-white truncate">{client.name}</div>
                <div className="text-[11px] text-slate-500 capitalize mt-0.5">{client.stage} stage</div>
              </button>
            );
          })}
          <Button
            variant="outline"
            size="sm"
            icon={Plus}
            onClick={() => openModal('AddClientModal')}
            className="w-full"
          >
            Add client
          </Button>
        </div>

        <div>
          {managedClient ? (
            <Card padding="md">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">{managedClient.name}</h3>
                <Button
                  variant="primary"
                  size="sm"
                  icon={UserCog}
                  onClick={() => handleImpersonate(managedClient.id)}
                >
                  Impersonate
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <Field label="Stage">
                    <div className="flex flex-wrap gap-1.5">
                      {STAGES.map(stage => (
                        <button
                          key={stage}
                          onClick={() => handleUpdateClientStage(managedClient.id, stage)}
                          className={`h-8 px-3 rounded-md text-xs font-medium border capitalize transition-colors ${
                            managedClient.stage === stage
                              ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-200'
                              : 'bg-white/[0.03] border-white/5 text-slate-400 hover:text-white hover:bg-white/[0.06]'
                          }`}
                        >
                          {stage}
                        </button>
                      ))}
                    </div>
                  </Field>

                  <div className="pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-4 h-4 text-indigo-300" />
                      <h4 className="text-sm font-semibold text-white">CMS configuration</h4>
                    </div>
                    <div className="space-y-2">
                      <Input
                        value={cmsConfig.owner}
                        onChange={e => setCmsConfig(prev => ({ ...prev, owner: e.target.value }))}
                        placeholder="GitHub owner"
                      />
                      <Input
                        value={cmsConfig.repo}
                        onChange={e => setCmsConfig(prev => ({ ...prev, repo: e.target.value }))}
                        placeholder="GitHub repo"
                      />
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleSaveCmsConfig} className="flex-1">
                          Save
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleProvisionClient(managedClient.id)}
                          className="flex-1"
                        >
                          {managedClient?.cmsProvisioned ? 'Synced' : 'Provision'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <Field
                    label={(
                      <span className="inline-flex items-center justify-between w-full">
                        <span>Resources</span>
                        <button
                          onClick={() => handleResourceUpload(managedClient.id)}
                          className="text-[10px] uppercase tracking-wider text-indigo-300 hover:text-indigo-200"
                        >
                          + Add
                        </button>
                      </span>
                    ) as unknown as string}
                  >
                    <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                      {(managedClient.resources || []).length === 0 ? (
                        <p className="text-xs text-slate-500 italic px-1 py-2">No resources yet.</p>
                      ) : (
                        (managedClient.resources || []).map((res, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between px-3 py-2 bg-white/[0.02] border border-white/5 rounded-lg"
                          >
                            <span className="text-xs text-slate-200 truncate">{res.name}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </Field>

                  <Field label="Assigned employees">
                    <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
                      {users.filter(isInternal).map(employee => {
                        const checked = managedClient.assignedEmployees?.includes(employee.id) ?? false;
                        return (
                          <label
                            key={employee.id}
                            className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-white/[0.04] cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={e => handleEmployeeAssignment(managedClient.id, employee.id, e.target.checked)}
                              className="w-3.5 h-3.5 rounded border-white/20 bg-white/5 accent-indigo-500"
                            />
                            <span className="text-sm text-slate-200 truncate">{employee.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </Field>
                </div>
              </div>
            </Card>
          ) : (
            <Card padding="lg">
              <EmptyState
                title="No client selected"
                description="Choose a client from the list to configure their workspace."
              />
            </Card>
          )}
        </div>
      </div>
    </Page>
  );
};

export default ClientManagementOverview;

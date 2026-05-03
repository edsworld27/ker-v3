import React from 'react';
import { clientManagementViewUI as ui } from '../../ClientManagementView.ui';
import { useTheme } from '@ClientShell/hooks/ClientuseTheme';
import { useRevenueContext as useSalesContext } from '../../../ClientRevenueContext';
import { useRoleConfig } from '@ClientShell/logic/ClientuseRoleConfig';
import { useDesignAwareData } from '@ClientShell/hooks/ClientuseDesignAwareData';

export const ClientActivityWidget: React.FC = () => {
  const theme = useTheme();
  const { label } = useRoleConfig();
  const context = useSalesContext();
  const [uploadingForClient, setUploadingForClient] = React.useState(false);
  const [uploadName, setUploadName] = React.useState('');

  // Rule 4: Use design-aware data
  const { data: clients = [] } = useDesignAwareData(context.clients, 'admin-clients-activity');
  const { data: users = [] } = useDesignAwareData(context.users, 'admin-users-activity');

  const {
    handleUpdateClientStage,
    handleImpersonate,
    canCurrentUserImpersonate,
    handleUploadClientResource,
    handleAssignEmployeeToClient,
    currentUser,
  } = context;

  const [selectedClientId, setSelectedClientId] = React.useState<string | null>(
    clients[0]?.id ?? null
  );

  const managedClient = clients.find(c => c.id === selectedClientId);

  const handleResourceUpload = (_clientId: string) => {
    setUploadingForClient(true);
    setUploadName('');
  };

  const confirmResourceUpload = () => {
    if (!uploadName.trim() || !managedClient) return;
    handleUploadClientResource(managedClient.id, { name: uploadName.trim(), url: '#', type: 'document' });
    setUploadingForClient(false);
    setUploadName('');
  };

  const handleEmployeeAssignment = (clientId: string, employeeId: number, isChecked: boolean) => {
    handleAssignEmployeeToClient(clientId, employeeId, isChecked);
  };

  const canImpersonate = canCurrentUserImpersonate;

  if (!managedClient) {
    return (
      <div className={ui.emptyState.container}>
        <ui.emptyState.icon className={ui.emptyState.iconSize} />
        <h3 className={ui.emptyState.titleStyle}>{ui.emptyState.title}</h3>
        <p className={ui.emptyState.subtitleStyle}>{ui.emptyState.subtitle}</p>
      </div>
    );
  }

  return (
    <div className={ui.detailsPane.container}>
      <div className={ui.detailsPane.contentContainer}>
        <div className={ui.detailsPane.card} data-design-static="true">
          <div className={ui.detailsPane.header.layout}>
            <h3 className={ui.detailsPane.header.titleStyle}>{ui.detailsPane.header.titlePrefix}{managedClient.name}</h3>
            {canImpersonate && (
              <button
                onClick={() => handleImpersonate(managedClient.id)}
                className={ui.detailsPane.header.impersonateButton.layout}
              >
                <ui.detailsPane.header.impersonateButton.icon className={ui.detailsPane.header.impersonateButton.iconSize} />
                {ui.detailsPane.header.impersonateButton.label}
              </button>
            )}
          </div>

          <div className={ui.detailsPane.grid}>
            <div className={ui.detailsPane.leftCol}>
              <div>
                <label className={ui.detailsPane.stageSelector.labelStyle}>{ui.detailsPane.stageSelector.label}</label>
                <div className={ui.detailsPane.stageSelector.container}>
                  {ui.detailsPane.stageSelector.stages.map(stage => (
                    <button
                      key={stage}
                      onClick={() => handleUpdateClientStage(managedClient.id, stage)}
                      className={`${ui.detailsPane.stageSelector.button.base} ${
                        managedClient.stage === stage
                          ? ui.detailsPane.stageSelector.button.active
                          : ui.detailsPane.stageSelector.button.inactive
                      }`}
                    >
                      {stage.charAt(0).toUpperCase() + stage.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className={ui.detailsPane.rightCol}>
              <div>
                <label className={ui.detailsPane.discoveryStatus.labelStyle}>{ui.detailsPane.discoveryStatus.label}</label>
                <div className={ui.detailsPane.discoveryStatus.card} data-design-static="true">
                  <div className={ui.detailsPane.discoveryStatus.header}>
                    <span className={ui.detailsPane.discoveryStatus.titleStyle}>{ui.detailsPane.discoveryStatus.title}</span>
                    <span className={ui.detailsPane.discoveryStatus.countStyle}>
                      {Object.keys(managedClient.discoveryAnswers || {}).length} / 12
                    </span>
                  </div>
                  <div className={ui.detailsPane.discoveryStatus.progressContainer}>
                    <div
                      className={ui.detailsPane.discoveryStatus.progressBar}
                      style={{ width: `${(Object.keys(managedClient.discoveryAnswers || {}).length / 12) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className={ui.detailsPane.resources.header}>
                  <label className={ui.detailsPane.resources.labelStyle}>{ui.detailsPane.resources.label}</label>
                  <button
                    onClick={() => handleResourceUpload(managedClient.id)}
                    className={ui.detailsPane.resources.uploadButton}
                  >
                    {ui.detailsPane.resources.uploadLabel}
                  </button>
                </div>
                {uploadingForClient && (
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={uploadName}
                      onChange={e => setUploadName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') confirmResourceUpload(); if (e.key === 'Escape') setUploadingForClient(false); }}
                      placeholder="Resource name"
                      autoFocus
                      className="flex-1 bg-[var(--client-widget-surface-1-glass)] border border-[var(--client-widget-border)] rounded-[var(--radius-button)] px-2 py-1 text-xs text-[var(--client-widget-text)] focus:outline-none focus:border-[var(--client-widget-primary-color-1)]"
                    />
                    <button onClick={confirmResourceUpload} disabled={!uploadName.trim()} className="px-2 py-1 text-xs rounded-[var(--radius-button)] bg-[var(--client-widget-primary-color-1)] text-[var(--client-widget-text-on-primary)] disabled:opacity-40">Add</button>
                    <button onClick={() => setUploadingForClient(false)} className="px-2 py-1 text-xs rounded-[var(--radius-button)] border border-[var(--client-widget-border)] text-[var(--client-widget-text-muted)]">✕</button>
                  </div>
                )}
                <div className={ui.detailsPane.resources.listContainer}>
                  {(managedClient.resources || []).length === 0 ? (
                    <p className={ui.detailsPane.resources.emptyStyle}>{ui.detailsPane.resources.emptyText}</p>
                  ) : (
                    (managedClient.resources || []).map((res, i) => (
                      <div key={`${res.name}-${i}`} className={ui.detailsPane.resources.item.layout} data-design-static="true">
                        <span className={ui.detailsPane.resources.item.nameStyle}>{res.name}</span>
                        <ui.detailsPane.resources.item.icon className={ui.detailsPane.resources.item.iconSize} />
                      </div>
                    ))
                  )}
                </div>

                <label className={ui.detailsPane.assignedEmployees.labelStyle}>{ui.detailsPane.assignedEmployees.label}</label>
                <div className={ui.detailsPane.assignedEmployees.listContainer}>
                  {users.filter(u => u.role === 'AgencyEmployee').map(employee => (
                    <label key={employee.id} className={ui.detailsPane.assignedEmployees.item.layout} data-design-static="true">
                      <input
                        type="checkbox"
                        checked={managedClient.assignedEmployees?.includes(employee.id)}
                        onChange={(e) => handleEmployeeAssignment(managedClient.id, employee.id, e.target.checked)}
                        className={ui.detailsPane.assignedEmployees.item.checkbox}
                      />
                      <div className={ui.detailsPane.assignedEmployees.item.avatarContainer}>
                        <div className={ui.detailsPane.assignedEmployees.item.avatar}>
                          {employee.avatar || employee.name.charAt(0)}
                        </div>
                        <span className={ui.detailsPane.assignedEmployees.item.nameStyle}>{employee.name}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Building2, Edit2, FileText, Mail, UserPlus } from 'lucide-react';
import { Client, ClientStage, PortalView, AppUser, LogEntry } from '../../types';
import { clientManagementViewUI as ui } from './ui';
import { useTheme } from '../../hooks/useTheme';
import { useAppContext } from '../../context/AppContext';
import { useRoleConfig } from '../../hooks/useRoleConfig';

interface ClientActivityWidgetProps {
  managedClient: Client | undefined;
  users: AppUser[];
  handleUpdateClientStage: (clientId: string, stage: ClientStage) => void;
  handleResourceUpload: (clientId: string) => void;
  handlePermissionChange: (clientId: string, perm: PortalView | string, isChecked: boolean) => void;
  handleEmployeeAssignment: (clientId: string, employeeId: number, isChecked: boolean) => void;
  handleImpersonate: (clientId: string) => void;
  canImpersonate: boolean;
}

export const ClientActivityWidget: React.FC<ClientActivityWidgetProps> = ({
  managedClient,
  users,
  handleUpdateClientStage,
  handleResourceUpload,
  handlePermissionChange,
  handleEmployeeAssignment,
  handleImpersonate,
  canImpersonate,
}) => {
  const theme = useTheme();
  const { label } = useRoleConfig();
  const { addLog } = useAppContext();

  if (!managedClient) {
    return (
      <div className={ui.emptyState.container}>
        <ui.emptyState.icon className={ui.emptyState.iconSize} />
        <h3 className={ui.emptyState.titleStyle}>{ui.emptyState.title}</h3>
        <p className={ui.emptyState.subtitleStyle}>
          {ui.emptyState.subtitle}
        </p>
      </div>
    );
  }

  return (
    <div className={ui.detailsPane.container}>
      <div className={ui.detailsPane.contentContainer}>
        <div className={ui.detailsPane.card}>
          <div className={ui.detailsPane.header.layout}>
            <h3 className={ui.detailsPane.header.titleStyle}>{ui.detailsPane.header.titlePrefix}{managedClient.name}</h3>
            <button
              onClick={() => handleImpersonate(managedClient.id)}
              className={ui.detailsPane.header.impersonateButton.layout}
            >
              <ui.detailsPane.header.impersonateButton.icon className={ui.detailsPane.header.impersonateButton.iconSize} />
              {ui.detailsPane.header.impersonateButton.label}
            </button>
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

              <div>
                <label className={ui.detailsPane.permissions.labelStyle}>{ui.detailsPane.permissions.label}</label>
                <div className={ui.detailsPane.permissions.grid}>
                  {ui.detailsPane.permissions.list.map(perm => (
                    <label key={perm} className={ui.detailsPane.permissions.item.layout}>
                      <input
                        type="checkbox"
                        checked={managedClient.permissions.includes(perm as PortalView)}
                        onChange={(e) => handlePermissionChange(managedClient.id, perm, e.target.checked)}
                        className={ui.detailsPane.permissions.item.checkbox}
                      />
                      <span className={ui.detailsPane.permissions.item.labelStyle}>{perm.replace('-', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className={ui.detailsPane.rightCol}>
              <div>
                <label className={ui.detailsPane.discoveryStatus.labelStyle}>{ui.detailsPane.discoveryStatus.label}</label>
                <div className={ui.detailsPane.discoveryStatus.card}>
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
                <div className={ui.detailsPane.resources.listContainer}>
                  {(managedClient.resources || []).length === 0 ? (
                    <p className={ui.detailsPane.resources.emptyStyle}>{ui.detailsPane.resources.emptyText}</p>
                  ) : (
                    (managedClient.resources || []).map((res, i) => (
                      <div key={`${res.name}-${i}`} className={ui.detailsPane.resources.item.layout}>
                        <span className={ui.detailsPane.resources.item.nameStyle}>{res.name}</span>
                        <ui.detailsPane.resources.item.icon className={ui.detailsPane.resources.item.iconSize} />
                      </div>
                    ))
                  )}
                </div>

                <label className={ui.detailsPane.assignedEmployees.labelStyle}>{ui.detailsPane.assignedEmployees.label}</label>
                <div className={ui.detailsPane.assignedEmployees.listContainer}>
                  {users.filter(u => u.role === 'AgencyEmployee').map(employee => (
                    <label key={employee.id} className={ui.detailsPane.assignedEmployees.item.layout}>
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

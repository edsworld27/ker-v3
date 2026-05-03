import React from 'react';
import { motion } from 'motion/react';
import { Client, ClientStage, PortalView, AppUser, LogEntry } from '../../../types';
import { clientManagementViewUI as ui } from './ui';
import { useAppContext } from '../../../context/AppContext';
import { useModalContext } from '../../../context/ModalContext';

interface ClientManagementViewProps {
  clients?: Client[];
  users?: AppUser[];
  selectedClientId?: string | null;
  setSelectedClientId?: (id: string | null) => void;
  managedClient?: Client | undefined;
  handleViewChange?: (view: PortalView | string) => void;
  setShowAddClientModal?: (show: boolean) => void;
  handleImpersonate?: (clientId: string) => void;
  handleUpdateClientStage?: (clientId: string, stage: ClientStage) => void;
  setClients?: React.Dispatch<React.SetStateAction<Client[]>>;
  addLog?: (action: string, details: string, type?: LogEntry['type'], clientId?: string) => void;
}

export const ClientManagementView: React.FC<ClientManagementViewProps> = (props) => {
  const { 
    clients: contextClients, 
    users: contextUsers, 
    handleViewChange: contextHandleViewChange,
    handleImpersonate: contextHandleImpersonate,
    handleUpdateClientStage: contextHandleUpdateClientStage,
    setClients: contextSetClients,
    addLog: contextAddLog
  } = useAppContext();

  const { setShowAddClientModal: setModalShow } = useModalContext();

  const clients = props.clients || contextClients;
  const users = props.users || contextUsers;
  const selectedClientId = props.selectedClientId !== undefined ? props.selectedClientId : null;
  const setSelectedClientId = props.setSelectedClientId || (() => {});
  const managedClient = props.managedClient || clients.find(c => c.id === selectedClientId);
  const handleViewChange = props.handleViewChange || contextHandleViewChange;
  const setShowAddClientModal = props.setShowAddClientModal || setModalShow;
  const handleImpersonate = props.handleImpersonate || contextHandleImpersonate;
  const handleUpdateClientStage = props.handleUpdateClientStage || contextHandleUpdateClientStage;
  const setClients = props.setClients || contextSetClients;
  const addLog = props.addLog || ((action: string, details: string, type?: LogEntry['type'], clientId?: string) => contextAddLog(action, details, type as any, clientId));

  const handleResourceUpload = (clientId: string) => {
    const name = prompt(ui.detailsPane.resources.uploadPrompt);
    if (!name || !managedClient) return;
    const newResource = { name, url: '#', type: 'document' };
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, resources: [...(c.resources || []), newResource] } : c));
    addLog('Client Update', `Uploaded resource ${name} for ${managedClient.name}`, 'action', managedClient.id);
  };

  const handleEmployeeAssignment = (clientId: string, employeeId: number, isChecked: boolean) => {
    if (!managedClient) return;
    const currentAssigned = managedClient.assignedEmployees || [];
    const newAssigned = isChecked
      ? [...currentAssigned, employeeId]
      : currentAssigned.filter(id => id !== employeeId);
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, assignedEmployees: newAssigned } : c));
    const employee = users.find(u => u.id === employeeId);
    if (employee) {
        addLog('Client Update', `${isChecked ? 'Assigned' : 'Unassigned'} ${employee.name} ${isChecked ? 'to' : 'from'} ${managedClient.name}`, 'action', managedClient.id);
    }
  };

  return (
    <motion.div
      key={ui.page.motionKey}
      initial={ui.page.animation.initial}
      animate={ui.page.animation.animate}
      className={`${ui.page.padding} ${ui.page.maxWidth}`}
    >
      <div className={ui.header.layout}>
        <div>
          <h2 className={ui.header.titleStyle}>{ui.header.title}</h2>
          <p className={ui.header.subtitleStyle}>{ui.header.subtitle}</p>
        </div>
        <button
          onClick={() => handleViewChange(ui.header.backButton.targetView)}
          className={ui.header.backButton.layout}
        >
          <ui.header.backButton.icon className={ui.header.backButton.iconSize} />
          {ui.header.backButton.label}
        </button>
      </div>

      <div className={ui.mainGrid.layout}>
        <div className={ui.clientList.container}>
          <div className={ui.clientList.listContainer}>
            {clients.map(client => (
              <button
                key={client.id}
                onClick={() => setSelectedClientId(client.id)}
                className={`${ui.clientList.clientButton.base} ${
                  selectedClientId === client.id
                    ? ui.clientList.clientButton.active
                    : ui.clientList.clientButton.inactive
                }`}
              >
                <div className={ui.clientList.clientButton.nameStyle}>{client.name}</div>
                <div className={ui.clientList.clientButton.stageStyle}>{client.stage}</div>
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowAddClientModal(true)}
            className={ui.clientList.addClientButton.layout}
          >
            <ui.clientList.addClientButton.icon className={ui.clientList.addClientButton.iconSize} />
            {ui.clientList.addClientButton.label}
          </button>
        </div>

        <div className={ui.detailsPane.container}>
          {managedClient ? (
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
                  </div>

                  <div className={ui.detailsPane.rightCol}>
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
          ) : (
            <div className={ui.emptyState.container}>
              <ui.emptyState.icon className={ui.emptyState.iconSize} />
              <h3 className={ui.emptyState.titleStyle}>{ui.emptyState.title}</h3>
              <p className={ui.emptyState.subtitleStyle}>
                {ui.emptyState.subtitle}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
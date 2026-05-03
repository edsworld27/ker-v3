// ============================================================
// Modals — UI Config
// This file imports all individual modal UI configurations
// and exports them as a single object.
// Feeds up to: uiMaster.ts
// ============================================================

import { addClientModalUI } from './AddClientModal/ui';
import { addRoleModalUI } from './AddRoleModal/ui';
import { addUserModalUI } from './AddUserModal/ui';
import { agencyCommunicateModalUI } from './AgencyCommunicateModal/ui';
import { appLauncherModalUI } from './AppLauncherModal/ui';
import { confirmationModalUI } from './ConfirmationModal/ui';
import { editClientModalUI } from './EditClientModal/ui';
import { employeeManagementModalUI } from './EmployeeManagementModal/ui';
import { employeeProfileModalUI } from './EmployeeProfileModal/ui';
import { globalTasksModalUI } from './GlobalTasksModal/ui';
import { inboxModalUI } from './InboxModal/ui';
import { newProjectModalUI } from './NewProjectModal/ui';
import { planModalUI } from './PlanModal/ui';
import { settingsModalUI } from './SettingsModal/ui';
import { supportTicketsModalUI } from './SupportTicketsModal/ui';
import { taskDetailModalUI } from './TaskDetailModal/ui';
import { taskModalUI } from './TaskModal/ui';
import { ticketModalUI } from './TicketModal/ui';

export const modalsUI = {
  addClient: addClientModalUI,
  addRole: addRoleModalUI,
  addUser: addUserModalUI,
  agencyCommunicate: agencyCommunicateModalUI,
  appLauncher: appLauncherModalUI,
  confirmation: confirmationModalUI,
  editClient: editClientModalUI,
  employeeManagement: employeeManagementModalUI,
  employeeProfile: employeeProfileModalUI,
  globalTasks: globalTasksModalUI,
  inbox: inboxModalUI,
  newProject: newProjectModalUI,
  plan: planModalUI,
  settings: settingsModalUI,
  supportTickets: supportTicketsModalUI,
  taskDetail: taskDetailModalUI,
  task: taskModalUI,
  ticket: ticketModalUI,
};
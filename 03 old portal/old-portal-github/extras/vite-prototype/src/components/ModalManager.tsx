/**
 * ModalManager — all application modals in one place.
 *
 * Reads modal visibility flags from ModalContext and data from AppContext.
 * Owns all form state that exists purely to service modals (newClientForm, etc.).
 * App.tsx renders <ModalManager /> as a single line — no props required.
 */

import React, { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

import { useModalContext } from '../context/ModalContext';
import { useAppContext } from '../context/AppContext';

import { AppUser, Client, ClientStage, Project, ProjectTask, AppTicket } from '../types';

import { PlanModal } from './modals/PlanModal';
import { EmployeeManagementModal } from './modals/EmployeeManagementModal';
import { EmployeeProfileModal } from './modals/EmployeeProfileModal';
import { AgencyCommunicateModal } from './modals/AgencyCommunicateModal';
import { SupportTicketsModal } from './modals/SupportTicketsModal';
import { EditClientModal } from './modals/EditClientModal';
import { AddClientModal } from './modals/AddClientModal';
import { AddUserModal } from './modals/AddUserModal';
import { TaskDetailModal } from './modals/TaskDetailModal';
import { NewProjectModal } from './modals/NewProjectModal';
import { TaskModal } from './modals/TaskModal';
import { TicketModal } from './modals/TicketModal';
import { SettingsModal } from './modals/SettingsModal';
import { ConfirmationModal } from './modals/ConfirmationModal';
import { GlobalTasksModal } from './modals/GlobalTasksModal/GlobalTasksModal';
import { InboxModal } from './modals/InboxModal';
import { AppLauncherModal } from './modals/AppLauncherModal';

export function ModalManager() {
  // ── Context ────────────────────────────────────────────────────────────────
  const {
    showPlanModal, setShowPlanModal,
    showAgencyCommunicateModal, setShowAgencyCommunicateModal,
    showSupportTicketsModal, setShowSupportTicketsModal,
    showNewProjectModal, setShowNewProjectModal,
    showNewTaskModal, setShowNewTaskModal,
    showAddUserModal, setShowAddUserModal,
    showSettingsModal, setShowSettingsModal,
    showGlobalTasksModal, setShowGlobalTasksModal,
    showInboxModal, setShowInboxModal,
    showAppLauncherModal, setShowAppLauncherModal,
    showTicketModal, setShowTicketModal,
    showAddClientModal, setShowAddClientModal,
    showEditClientModal, setShowEditClientModal,
    showConfirmationModal, setShowConfirmationModal,
    showEmployeeProfileModal, setShowEmployeeProfileModal,
    showEmployeeManagementModal, setShowEmployeeManagementModal,
  } = useModalContext();

  const {
    clients, setClients,
    users, setUsers,
    projects, setProjects,
    projectTasks, setProjectTasks,
    tickets, setTickets,
    activityLogs,
    userProfile, setUserProfile,
    currentUser,
    currentAgency,
    agencies, setAgencies,
    activeAgencyId,
    agencyConfig,
    addLog,
    handleDeleteUser,
    handleViewChange,
    canCurrentUserImpersonate,
    editingClient,
    selectedTask, setSelectedTask,
    confirmationConfig,
  } = useAppContext();

  // ── Form state (owned here, only needed by modals) ─────────────────────────
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const [newClientForm, setNewClientForm] = useState({
    name: '',
    email: '',
    stage: 'discovery' as ClientStage,
    websiteUrl: '',
  });

  const [newUser, setNewUser] = useState<Omit<AppUser, 'id'>>({
    name: '',
    email: '',
    role: 'AgencyEmployee',
    customRoleId: undefined,
    avatar: '',
    clientId: undefined,
  });
  const [selectedUserToEdit, setSelectedUserToEdit] = useState<AppUser | null>(null);

  const [newProjectForm, setNewProjectForm] = useState({
    name: '',
    clientId: clients[0]?.id ?? 'client-1',
    description: '',
    status: 'Planning' as const,
  });

  const [newTaskForm, setNewTaskForm] = useState({
    title: '',
    projectId: projects[0]?.id ?? 'proj-1',
    priority: 'Medium' as const,
    assigneeId: 1,
    description: '',
  });

  const [newTicket, setNewTicket] = useState<{
    title: string;
    priority: 'High' | 'Medium' | 'Low';
    type: 'internal' | 'client';
  }>({ title: '', priority: 'Medium', type: 'internal' });

  const [exporting, setExporting] = useState(false);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSaveClient = (updatedClient: Client) => {
    setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
    addLog('Client', `Updated client ${updatedClient.name}`, 'action');
  };

  const handleAddClient = () => {
    if (!newClientForm.name || !newClientForm.email) return;
    const newClient: Client = {
      id: `client-${Date.now()}`,
      name: newClientForm.name,
      email: newClientForm.email,
      websiteUrl: newClientForm.websiteUrl,
      stage: 'discovery',
      discoveryAnswers: {},
      resources: [],
      assignedEmployees: [],
    };
    setClients(prev => [...prev, newClient]);
    addLog('Client Created', `New client ${newClient.name} added`, 'action', newClient.id);
    setShowAddClientModal(false);
    setNewClientForm({ name: '', email: '', stage: 'discovery', websiteUrl: '' });
  };

  const handleAddProject = () => {
    if (!newProjectForm.name) return;
    const project: Project = {
      id: `proj-${Date.now()}`,
      ...newProjectForm,
      createdAt: new Date().toISOString(),
    };
    setProjects(prev => [...prev, project]);
    setShowNewProjectModal(false);
    setNewProjectForm({ name: '', clientId: clients[0]?.id ?? 'client-1', description: '', status: 'Planning' });
    addLog('Project Created', `New project: ${project.name}`, 'action');
  };

  const handleAddTask = () => {
    if (!newTaskForm.title) return;
    const task: ProjectTask = {
      id: `task-${Date.now()}`,
      ...newTaskForm,
      status: 'Backlog',
      steps: [],
      attachments: [],
      createdAt: new Date().toISOString(),
    };
    setProjectTasks(prev => [...prev, task]);
    setShowNewTaskModal(false);
    setNewTaskForm({ title: '', projectId: projects[0]?.id ?? 'proj-1', priority: 'Medium', assigneeId: 1, description: '' });
    addLog('Task Created', `New task: ${task.title}`, 'action');
  };

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) return;
    if (selectedUserToEdit) {
      setUsers(prev => prev.map(u => u.id === selectedUserToEdit.id ? { ...u, ...newUser } : u));
      addLog('User Updated', `Permissions updated for ${newUser.name}`, 'action');
    } else {
      const user: AppUser = {
        ...newUser,
        id: Date.now(),
        avatar: (newUser.name || '').split(' ').map(n => n[0]).join(''),
      };
      setUsers(prev => [...prev, user]);
      addLog('User Created', `New user ${user.name} added with role ${user.role}`, 'action');
    }
    setShowAddUserModal(false);
    setSelectedUserToEdit(null);
    setNewUser({ name: '', email: '', role: 'AgencyEmployee', customRoleId: undefined, avatar: '', clientId: undefined });
  };

  const handleEditUser = (user: AppUser) => {
    setSelectedUserToEdit(user);
    setNewUser({ name: user.name, email: user.email, role: user.role, customRoleId: user.customRoleId, avatar: user.avatar, clientId: user.clientId });
    setShowAddUserModal(true);
  };

  const handleExportData = () => {
    const data = {
      profile: userProfile,
      users,
      activityLogs,
      timestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    saveAs(blob, 'portal-data-export.json');
    addLog('Data Export', 'User exported account and employee data logs', 'action');
  };

  const handleExportWebsite = async () => {
    setExporting(true);
    try {
      const zip = new JSZip();
      zip.file('index.html', '<html><body><h1>My Website</h1></body></html>');
      zip.file('styles.css', 'body { background: #000; color: #fff; }');
      zip.file('script.js', 'console.log("Hello World");');
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'website-export.zip');
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteRole = (roleId: string) => {
    setAgencyConfig(prevConfig => {
      const newRoles = { ...prevConfig.roles };
      delete newRoles[roleId];
      addLog('Role Deleted', `Role ${roleId} deleted`, 'system');
      return { ...prevConfig, roles: newRoles };
    });
    setShowConfirmationModal(false); // Close confirmation modal after deletion
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <PlanModal
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
      />

      <EmployeeManagementModal
        isOpen={showEmployeeManagementModal}
        onClose={() => setShowEmployeeManagementModal(false)}
        onAddUser={() => {
          setShowEmployeeManagementModal(false);
          setShowAddUserModal(true);
        }}
        onDeleteUser={handleDeleteUser}
      />

      <EmployeeProfileModal
        isOpen={showEmployeeProfileModal}
        onClose={() => setShowEmployeeProfileModal(false)}
        userProfile={userProfile}
        setUserProfile={setUserProfile}
        currentUser={currentUser}
        isEditingProfile={isEditingProfile}
        setIsEditingProfile={setIsEditingProfile}
        users={users}
        setUsers={setUsers}
        addLog={addLog}
      />

      <AgencyCommunicateModal
        isOpen={showAgencyCommunicateModal}
        onClose={() => setShowAgencyCommunicateModal(false)}
      />

      <SupportTicketsModal
        isOpen={showSupportTicketsModal}
        onClose={() => setShowSupportTicketsModal(false)}
        setShowTicketModal={setShowTicketModal}
      />

      <AnimatePresence>
        <EditClientModal
          isOpen={showEditClientModal}
          onClose={() => setShowEditClientModal(false)}
          client={editingClient}
          onSave={handleSaveClient}
        />

        <AddClientModal
          isOpen={showAddClientModal}
          onClose={() => setShowAddClientModal(false)}
          newClientForm={newClientForm}
          setNewClientForm={setNewClientForm}
          handleAddClient={handleAddClient}
        />

        <AddUserModal
          isOpen={showAddUserModal}
          onClose={() => {
            setShowAddUserModal(false);
            setSelectedUserToEdit(null);
            setNewUser({ name: '', email: '', role: 'AgencyEmployee', customRoleId: undefined, avatar: '', clientId: undefined });
          }}
          selectedUserToEdit={selectedUserToEdit}
          newUser={newUser}
          setNewUser={setNewUser}
          currentUser={currentUser}
          clients={clients}
          currentAgency={currentAgency}
          handleAddUser={handleAddUser}
        />

        <TaskDetailModal
          selectedTask={selectedTask}
          setSelectedTask={setSelectedTask}
          users={users}
          projectTasks={projectTasks}
          setProjectTasks={setProjectTasks}
        />

        <NewProjectModal
          isOpen={showNewProjectModal}
          onClose={() => setShowNewProjectModal(false)}
          newProjectForm={newProjectForm}
          setNewProjectForm={setNewProjectForm}
          clients={clients}
          handleAddProject={handleAddProject}
        />

        <TaskModal
          isOpen={showNewTaskModal}
          onClose={() => setShowNewTaskModal(false)}
          newTaskForm={newTaskForm}
          setNewTaskForm={setNewTaskForm}
          projects={projects}
          users={users}
          handleAddTask={handleAddTask}
        />

        <TicketModal
          isOpen={showTicketModal}
          onClose={() => setShowTicketModal(false)}
          newTicket={newTicket}
          setNewTicket={setNewTicket}
          userProfile={userProfile}
          currentUser={currentUser}
          tickets={tickets}
          setTickets={setTickets}
          addLog={addLog}
        />
<SettingsModal
  isOpen={showSettingsModal}
  onClose={() => setShowSettingsModal(false)}
  onOpenAddUser={() => setShowAddUserModal(true)}
  onEditUser={handleEditUser}
  onDeleteUser={handleDeleteUser}
  onDeleteRole={handleDeleteRole}
  onExportData={handleExportData}
  onExportWebsite={handleExportWebsite}
  exporting={exporting}
/>

        <ConfirmationModal
          isOpen={showConfirmationModal}
          onClose={() => setShowConfirmationModal(false)}
          onConfirm={confirmationConfig.onConfirm}
          title={confirmationConfig.title}
          message={confirmationConfig.message}
          type={confirmationConfig.type}
        />

        <GlobalTasksModal
          isOpen={showGlobalTasksModal}
          onClose={() => setShowGlobalTasksModal(false)}
        />

        <InboxModal
          isOpen={showInboxModal}
          onClose={() => setShowInboxModal(false)}
        />

        <AppLauncherModal
          isOpen={showAppLauncherModal}
          onClose={() => setShowAppLauncherModal(false)}
          handleViewChange={handleViewChange}
          hasPermission={canCurrentUserImpersonate}
        />
      </AnimatePresence>
    </>
  );
}

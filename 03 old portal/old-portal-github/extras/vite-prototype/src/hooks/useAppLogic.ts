import { useState, useEffect } from 'react';
import { 
  Step, 
  PortalView, 
  Todo, 
  AppUser, 
  Project, 
  ProjectTask, 
  AppTicket, 
  LogEntry, 
  Client, 
  ClientStage, 
  Agency, 
  CustomSidebarLink, 
  CustomPage,
  AgencyTemplate
} from '../types';
import { initialTodos, initialUsers, initialClients, initialProjects, initialProjectTasks, initialTickets, initialActivityLogs, initialAiSessions } from '../data/mockData';
import { initialMasterConfig, MasterConfig } from '../config/masterConfig';
import { agencyConfig as defaultAgencyConfig } from '../config/agencyConfig';
import { useModalContext } from '../context/ModalContext';

export function useAppLogic() {
  const [step, setStep] = useState<Step>('login');
  const [portalView, setPortalView] = useState<PortalView | string>('dashboard');
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState(['', '', '', '']);

  const [userProfile, setUserProfile] = useState({
    name: 'Edward Hallam',
    email: 'edwardhallam07@gmail.com',
    avatar: 'EH'
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const modalContext = useModalContext();
  
  const [editingClient, setEditingClient] = useState<any>(null);
  const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null);
  const [users, setUsers] = useState<AppUser[]>(initialUsers);
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [projectTasks, setProjectTasks] = useState<ProjectTask[]>(initialProjectTasks);
  const [tickets, setTickets] = useState<AppTicket[]>(initialTickets);
  const [aiSessions, setAiSessions] = useState(initialAiSessions);
  const [activityLogs, setActivityLogs] = useState<LogEntry[]>(initialActivityLogs);

  const [confirmationConfig, setConfirmationConfig] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'danger' | 'warning' | 'info';
  }>({ title: '', message: '', onConfirm: () => {} });

  const [customSidebarLinks, setCustomSidebarLinks] = useState<CustomSidebarLink[]>([]);
  const [customPages, setCustomPages] = useState<CustomPage[]>([]);
  const [masterConfig, setMasterConfig] = useState<MasterConfig>(initialMasterConfig);
  const [agencyConfig, setAgencyConfig] = useState(defaultAgencyConfig);
  const [activeAgencyId, setActiveAgencyId] = useState<string | null>('aqua-agency-1');
  const [agencies, setAgencies] = useState<Agency[]>([
    {
      id: 'aqua-agency-1',
      name: 'Aqua Digital HQ',
      isConfigured: true
    }
  ]);

  const [impersonatingClientId, setImpersonatingClientId] = useState<string | null>(null);
  const [impersonatedUserEmail, setImpersonatedUserEmail] = useState<string | null>(null);
  const [activeTemplate, setActiveTemplate] = useState<AgencyTemplate | null>(null);
  const [appLogo, setAppLogo] = useState<string | null>(null);
  const [loginPortalType, setLoginPortalType] = useState<'standard' | 'branded'>('standard');

  const currentUser = users.find(u => u.email === (impersonatedUserEmail || userProfile.email)) || users[0];
  const currentAgency = agencies.find(a => a.id === activeAgencyId);

  const addLog = (action: string, details: string, type: LogEntry['type'] = 'action', clientId?: string) => {
    const actorName = userProfile.name;
    const perspectiveName = impersonatedUserEmail ? users.find(u => u.email === impersonatedUserEmail)?.name : null;
    const logAction = impersonatedUserEmail ? `[IMPERSONATION] ${action}` : action;
    const logDetails = impersonatedUserEmail ? `(By ${actorName} as ${perspectiveName}): ${details}` : details;

    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      userId: userProfile.email,
      userName: actorName + (perspectiveName ? ` (as ${perspectiveName})` : ''),
      action: logAction,
      details: logDetails,
      clientId: clientId || impersonatingClientId || undefined,
      type
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  const handleImpersonate = (clientId: string) => {
    const roleId = currentUser?.customRoleId || currentUser?.role || 'AgencyEmployee';
    if (!agencyConfig.roles[roleId]?.canImpersonate) return;
    
    const client = clients.find(c => c.id === clientId);
    addLog('Impersonation', `Started impersonating ${client?.name}`, 'impersonation', clientId);
    setImpersonatingClientId(clientId);
    setPortalView('dashboard');
  };

  const handleStopImpersonating = () => {
    addLog('Impersonation', 'Stopped impersonation', 'impersonation');
    setImpersonatingClientId(null);
    setImpersonatedUserEmail(null);
    setPortalView('dashboard');
  };

  const handleUpdateClientStage = (clientId: string, stage: ClientStage) => {
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, stage } : c));
    addLog('Client', `Updated client stage to ${stage}`, 'action');
  };

  const handleEditClient = (client: any) => {
    setEditingClient(client);
    modalContext.setShowEditClientModal(true);
  };

  const handleDeleteUser = (id: number) => {
    const user = users.find(u => u.id === id);
    if (!user || user.role === 'Founder') return;

    setConfirmationConfig({
      title: 'Delete User',
      message: `Are you sure you want to delete ${user.name}?`,
      onConfirm: () => {
        setUsers(prev => prev.filter(u => u.id !== id));
        addLog('User Deleted', `User ${user.name} removed`, 'action');
      }
    });
    modalContext.setShowConfirmationModal(true);
  };

  const handleViewChange = (view: PortalView | string) => {
    if (view === 'your-plan') {
      modalContext.setShowPlanModal(true);
      return;
    }
    if (view === 'inbox') {
      setPortalView('inbox');
      modalContext.setShowMobileMenu(false);
      return;
    }
    if (view === 'support-tickets') {
      modalContext.setShowSupportTicketsModal(true);
      return;
    }
    if (view === 'agency-configurator') {
      setPortalView('agency-configurator');
      modalContext.setShowMobileMenu(false);
      return;
    }
    setPortalView(view);
    modalContext.setShowMobileMenu(false);
    if (view === 'website') {
      setSidebarCollapsed(true);
    } else {
      setSidebarCollapsed(false);
    }
  };

  const canCurrentUserImpersonate = () => {
    const roleId = currentUser?.customRoleId || currentUser?.role || 'AgencyEmployee';
    return agencyConfig.roles[roleId]?.canImpersonate ?? false;
  };

  const isAgencyAdmin = (() => {
    const roleId = currentUser?.customRoleId || currentUser?.role || 'AgencyEmployee';
    return agencyConfig.roles[roleId]?.canManageUsers ?? false;
  })();

  const isAgencyEmployee = (() => {
    const roleId = currentUser?.customRoleId || currentUser?.role || 'AgencyEmployee';
    const roleConfig = agencyConfig.roles[roleId];
    const AGENCY_VIEW_MARKERS = ['agency-hub', 'agency-clients', 'project-hub', 'admin-dashboard'];
    const isAgencyRole = roleConfig?.allowedViews === '*' ||
      (Array.isArray(roleConfig?.allowedViews) &&
        (roleConfig.allowedViews as string[]).some(v => AGENCY_VIEW_MARKERS.includes(v)));
    return isAgencyRole && !isAgencyAdmin;
  })();

  return {
    step, setStep,
    portalView, setPortalView,
    todos, setTodos,
    sidebarCollapsed, setSidebarCollapsed,
    username, setUsername,
    password, setPassword,
    code, setCode,
    userProfile, setUserProfile,
    isEditingProfile, setIsEditingProfile,
    editingClient, setEditingClient,
    selectedTask, setSelectedTask,
    users, setUsers,
    clients, setClients,
    projects, setProjects,
    projectTasks, setProjectTasks,
    tickets, setTickets,
    aiSessions, setAiSessions,
    activityLogs, setActivityLogs,
    confirmationConfig, setConfirmationConfig,
    customSidebarLinks, setCustomSidebarLinks,
    customPages, setCustomPages,
    masterConfig, setMasterConfig,
    agencyConfig, setAgencyConfig,
    activeAgencyId, setActiveAgencyId,
    agencies, setAgencies,
    impersonatingClientId, setImpersonatingClientId,
    impersonatedUserEmail, setImpersonatedUserEmail,
    activeTemplate, setActiveTemplate,
    appLogo, setAppLogo,
    loginPortalType, setLoginPortalType,
    currentUser, currentAgency,
    addLog,
    handleImpersonate,
    handleStopImpersonating,
    handleUpdateClientStage,
    handleEditClient,
    handleDeleteUser,
    handleViewChange,
    canCurrentUserImpersonate,
    isAgencyAdmin,
    isAgencyEmployee
  };
}

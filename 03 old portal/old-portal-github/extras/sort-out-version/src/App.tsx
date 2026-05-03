/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Lock, 
  User, 
  ShieldCheck, 
  ChevronRight, 
  LayoutDashboard, 
  Users, 
  Globe, 
  ChevronLeft, 
  FileText, 
  BarChart3,
  ExternalLink,
  BookOpen,
  Settings,
  LogOut,
  LifeBuoy,
  CreditCard,
  Lightbulb,
  Calendar,
  MessageSquare,
  Star,
  Download,
  Link2,
  Sparkles,
  Send,
  Zap,
  Bell,
  Clock,
  Briefcase,
  Building2,
  HelpCircle,
  Database,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Shield,
  ArrowLeft,
  Play,
  UserPlus,
  Settings2,
  Monitor,
  Layers,
  Compass,
  CheckCircle,
  Circle,
  Upload,
  MessageSquarePlus,
  Layout,
  Activity,
  Palette,
  Code2,
  Ticket,
  History,
  MessageCircle,
  ShieldAlert,
  UserCog,
  UserCircle,
  Mail,
  FolderOpen,
  PlusCircle,
  CheckSquare,
  LayoutGrid,
  Terminal,
  UserCheck
} from 'lucide-react';

import {
  Step,
  ClientStage,
  PortalView,
  Todo,
  ActivityLog,
  Client,
  CustomRole,
  Agency,
  UserRole,
  AppUser,
  LogEntry,
  AppTicket,
  SubStep,
  TaskAttachment,
  Project,
  ProjectTask,
  CustomSidebarLink,
  AgencyTemplate,
  CustomPage
} from './types';

import { AppProvider } from './context/AppContext';
import { SidebarItem } from './components/SidebarItem';
import { DashboardWidget } from './components/DashboardWidget';
import { AddClientModal } from './components/modals/AddClientModal';
import { AddRoleModal } from './components/modals/AddRoleModal';
import { AddUserModal } from './components/modals/AddUserModal';
import { NewProjectModal } from './components/modals/NewProjectModal';
import { TaskDetailModal } from './components/modals/TaskDetailModal';
import { TaskModal } from './components/modals/TaskModal';
import { TicketModal } from './components/modals/TicketModal';

import { SupportView } from './components/views/SupportView';
import { DataHubView } from './components/views/DataHubView';
import { DesignDashboardView } from './components/views/DesignDashboardView';
import { DevDashboardView } from './components/views/DevDashboardView';
import OnboardingDashboardView from './components/views/OnboardingDashboardView';
import DiscoveryDashboardView from './components/views/DiscoveryDashboardView';
import OnboardingView from './components/views/OnboardingView';
import CollaborationView from './components/views/CollaborationView';
import { AgencyBuilderView } from './components/views/AgencyBuilderView';
import { CustomPageView } from './components/views/CustomPageView';
import { EmployeeManagementView } from './components/views/EmployeeManagementView';
import { SettingsModal } from './components/modals/SettingsModal';
import { GlobalTasksModal } from './components/modals/GlobalTasksModal';
import { InboxModal } from './components/modals/InboxModal';
import { AppLauncherModal } from './components/modals/AppLauncherModal';

export const iconMap: Record<string, any> = {
  Lock, User, ShieldCheck, ChevronRight, LayoutDashboard, Users, Globe, ChevronLeft, FileText, BarChart3, ExternalLink, BookOpen, Settings, LogOut, LifeBuoy, CreditCard, Lightbulb, Calendar, MessageSquare, Star, Download, Link2, Sparkles, Send, Zap, Bell, Clock, Briefcase, Building2, HelpCircle, Database, Plus, Trash2, CheckCircle2, XCircle, Shield, ArrowLeft, Play, UserPlus, Settings2, Monitor, Layers, Compass, CheckCircle, Circle, Upload, MessageSquarePlus, Layout, Activity, Palette, Code2, Ticket, History, MessageCircle, ShieldAlert, UserCog, UserCircle, Mail, FolderOpen, PlusCircle, CheckSquare, LayoutGrid, Terminal, UserCheck
};

export default function App() {
  const [step, setStep] = useState<Step>('setup');
  const [portalView, setPortalView] = useState<PortalView | string>('dashboard');
  const [todos, setTodos] = useState<Todo[]>([
    { id: '1', text: 'Review Q1 performance reports', completed: false, priority: 'High', category: 'Strategic' },
    { id: '2', text: 'Onboard new development lead', completed: false, priority: 'Medium', category: 'HR' },
    { id: '3', text: 'Update global compliance docs', completed: true, priority: 'High', category: 'Legal' },
  ]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState(['', '', '', '']);

  // Settings & User Management State
  const [userProfile, setUserProfile] = useState({
    name: 'Edward Hallam',
    email: 'edwardhallam07@gmail.com',
    avatar: 'EH'
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null);
  const [users, setUsers] = useState<AppUser[]>([
    { id: 1, name: 'Edward Hallam', email: 'edwardhallam07@gmail.com', role: 'Founder', permissions: ['dashboard', 'admin-dashboard', 'client-management', 'settings', 'logs', 'employee-management', 'agency-communicate', 'support-tickets', 'ai-sessions', 'employee-profile', 'agency-clients', 'project-hub', 'task-board'], avatar: 'EH', workingHours: '9:00 AM - 6:00 PM', bio: 'Founder & CEO', joinedDate: '2025-01-01' },
    { id: 2, name: 'John Manager', email: 'john@example.com', role: 'AgencyManager', permissions: ['dashboard', 'admin-dashboard', 'client-management', 'logs', 'agency-communicate', 'support-tickets', 'employee-profile', 'project-hub', 'task-board'], avatar: 'JM', workingHours: '9:00 AM - 5:00 PM', bio: 'Operations Manager', joinedDate: '2025-02-15' },
    { id: 3, name: 'Sarah Employee', email: 'sarah@example.com', role: 'AgencyEmployee', permissions: ['dashboard', 'client-management', 'agency-communicate', 'employee-profile', 'project-hub', 'task-board'], avatar: 'SE', workingHours: '10:00 AM - 4:00 PM', bio: 'Design Lead', joinedDate: '2025-03-10' },
    { id: 4, name: 'Client Owner', email: 'contact@acme.com', role: 'ClientOwner', permissions: ['dashboard', 'onboarding', 'support', 'logs', 'employee-profile'], clientId: 'client-1', avatar: 'CO', workingHours: '8:00 AM - 4:00 PM', bio: 'CEO at Acme Corp', joinedDate: '2026-01-20' },
    { id: 101, name: 'Example Operator', email: 'operator@example.com', role: 'AgencyEmployee', permissions: ['dashboard', 'client-management', 'agency-communicate', 'employee-profile', 'project-hub', 'task-board'], avatar: 'EO', workingHours: '9-5', bio: 'Mock Operator', joinedDate: '2026-01-01' },
    { id: 102, name: 'Example Manager', email: 'manager@example.com', role: 'AgencyManager', permissions: ['dashboard', 'admin-dashboard', 'client-management', 'logs', 'agency-communicate', 'support-tickets', 'employee-profile', 'project-hub', 'task-board'], avatar: 'EM', workingHours: '9-5', bio: 'Mock Manager', joinedDate: '2026-01-01' },
    { id: 103, name: 'Example Client', email: 'client@example.com', role: 'ClientOwner', permissions: ['dashboard', 'onboarding', 'support', 'logs', 'employee-profile'], clientId: 'client-1', avatar: 'EC', workingHours: '9-5', bio: 'Mock Client', joinedDate: '2026-01-01' },
  ]);

  const [agencyMessages, setAgencyMessages] = useState([
    { id: '1', senderId: 1, text: "Hey team, how's the new portal coming along?", timestamp: new Date().toISOString() },
    { id: '2', senderId: 2, text: "Almost there! Working on the AI integration now.", timestamp: new Date().toISOString() }
  ]);

  const [projects, setProjects] = useState<Project[]>([
    { id: 'proj-1', name: 'Aqua Portal V2', clientId: 'client-1', description: 'Internal refactor and feature expansion.', status: 'Active', createdAt: '2026-03-01' },
    { id: 'proj-2', name: 'Brand Identity', clientId: 'client-1', description: 'Redesigning the core brand elements.', status: 'Planning', createdAt: '2026-03-15' },
  ]);

  const [projectTasks, setProjectTasks] = useState<ProjectTask[]>([
    { 
      id: 'task-1', 
      projectId: 'proj-1', 
      title: 'Implement Task Management', 
      description: 'Create the core UI and state for managing projects and tasks.',
      status: 'In Progress',
      priority: 'High',
      assigneeId: 1,
      dueDate: '2026-03-26',
      steps: [
        { id: 's1', text: 'Define Data Models', completed: true },
        { id: 's2', text: 'Implement Project Hub', completed: false },
        { id: 's3', text: 'Build Task Board', completed: false }
      ],
      attachments: [
        { id: 'a1', name: 'SOP: Project Standards', url: '#', type: 'sop' }
      ],
      createdAt: '2026-03-24'
    }
  ]);

  const [tickets, setTickets] = useState<AppTicket[]>([
    { id: 'TIC-001', title: 'Login issue reported via call', status: 'Open', priority: 'High', creator: 'Client Owner', creatorId: 4, createdAt: new Date().toISOString(), type: 'internal', description: 'Client mentioned login lag during the weekly sync.' },
    { id: 'TIC-002', title: 'Feature request: Dark mode', status: 'Closed', priority: 'Low', creator: 'Edward Hallam', creatorId: 1, createdAt: new Date().toISOString(), type: 'internal' },
    { id: 'TIC-003', title: 'Unable to upload logo', status: 'Open', priority: 'Medium', creator: 'Acme Corp', creatorId: 'client-1', createdAt: new Date().toISOString(), type: 'client' }
  ]);

  const [aiSessions, setAiSessions] = useState([
    { id: 'sess-1', userId: 1, userName: 'Edward Hallam', interactions: [{ prompt: 'Analyze revenue', response: 'Revenue is up 20%...', timestamp: new Date().toISOString() }] },
    { id: 'sess-2', userId: 4, userName: 'Client Owner', interactions: [{ prompt: 'How do I add a logo?', response: 'Go to settings...', timestamp: new Date().toISOString() }] }
  ]);
  const [activityLogs, setActivityLogs] = useState<LogEntry[]>([
    { id: '1', timestamp: new Date().toISOString(), userId: 1, userName: 'Founder', action: 'Login', details: 'Founder logged in', type: 'system' },
    { id: '2', timestamp: new Date().toISOString(), userId: 1, userName: 'Founder', action: 'Portal Access', details: 'Accessed Agency Hub', type: 'action' },
    { id: '3', timestamp: new Date().toISOString(), userId: 2, userName: 'John Manager', action: 'Update', details: 'Updated client priority', type: 'action' },
  ]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showGlobalTasksModal, setShowGlobalTasksModal] = useState(false);
  const [showInboxModal, setShowInboxModal] = useState(false);
  const [showAppLauncherModal, setShowAppLauncherModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [newTicket, setNewTicket] = useState({ title: '', priority: 'Medium' as const, type: 'internal' as const });
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [newUser, setNewUser] = useState<Omit<AppUser, 'id'>>({
    name: '',
    email: '',
    role: 'AgencyEmployee',
    permissions: ['dashboard'] as PortalView[],
    avatar: '',
    clientId: undefined
  });
  const [selectedUserToEdit, setSelectedUserToEdit] = useState<AppUser | null>(null);
  const [newClientForm, setNewClientForm] = useState({
    name: '',
    email: '',
    stage: 'discovery' as ClientStage,
    websiteUrl: '',
    permissions: ['dashboard', 'crm', 'website', 'resources', 'aqua-ai', 'support']
  });

  const [newProjectForm, setNewProjectForm] = useState({
    name: '',
    clientId: 'client-1',
    description: '',
    status: 'Planning' as const
  });

  const [newTaskForm, setNewTaskForm] = useState({
    title: '',
    projectId: 'proj-1',
    priority: 'Medium' as const,
    assigneeId: 1,
    description: ''
  });
  const [exporting, setExporting] = useState(false);
  
  // App Customization State
  const [appTheme, setAppTheme] = useState('indigo');
  const [customSidebarLinks, setCustomSidebarLinks] = useState<CustomSidebarLink[]>([]);
  const [customPages, setCustomPages] = useState<CustomPage[]>([]);
  const [activeTemplate, setActiveTemplate] = useState<AgencyTemplate | null>(null);
  const [appLogo, setAppLogo] = useState<string | null>(null);
  const [loginPortalType, setLoginPortalType] = useState<'standard' | 'branded'>('standard');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [isMasterAdmin, setIsMasterAdmin] = useState(true); // Default to true for development
  const [agencies, setAgencies] = useState<Agency[]>([
    {
      id: 'aqua-agency-1',
      name: 'Aqua Digital HQ',
      isConfigured: true,
      roles: [
        { id: 'Founder', name: 'Founder', permissions: ['dashboard', 'admin-dashboard', 'client-management', 'settings', 'logs', 'employee-management', 'agency-communicate', 'support-tickets', 'ai-sessions', 'employee-profile', 'agency-clients', 'project-hub', 'task-board'], isMaster: true },
        { id: 'AgencyManager', name: 'Agency Manager', permissions: ['dashboard', 'admin-dashboard', 'client-management', 'logs', 'agency-communicate', 'support-tickets', 'employee-profile', 'project-hub', 'task-board'] },
        { id: 'AgencyEmployee', name: 'Agency Employee', permissions: ['dashboard', 'client-management', 'agency-communicate', 'employee-profile', 'project-hub', 'task-board'] }
      ]
    }
  ]);
  const [activeAgencyId, setActiveAgencyId] = useState<string | null>('aqua-agency-1');
  const [appMode, setAppMode] = useState<'setup' | 'auth' | 'portal'>('portal');
  const [setupStep, setSetupStep] = useState(1);
  const [newAgencyForm, setNewAgencyForm] = useState({
    name: '',
    logo: null as string | null,
    primaryColor: '#6366f1'
  });
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [newRoleForm, setNewRoleForm] = useState<Omit<CustomRole, 'id'>>({
    name: '',
    permissions: []
  });
  const [impersonatingClientId, setImpersonatingClientId] = useState<string | null>(null);
  const [impersonatedUserEmail, setImpersonatedUserEmail] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const handleAgencySetup = () => {
    if (!newAgencyForm.name) return;

    const newAgency: Agency = {
      id: `agency-${Date.now()}`,
      name: newAgencyForm.name,
      logo: newAgencyForm.logo || undefined,
      theme: { primary: newAgencyForm.primaryColor, secondary: '#1e293b' },
      isConfigured: true,
      roles: [
        { id: 'Founder', name: 'Founder', permissions: ['dashboard', 'admin-dashboard', 'client-management', 'settings', 'logs', 'employee-management', 'agency-communicate', 'support-tickets', 'ai-sessions', 'employee-profile', 'agency-clients', 'project-hub', 'task-board'], isMaster: true },
        { id: 'AgencyManager', name: 'Agency Manager', permissions: ['dashboard', 'admin-dashboard', 'client-management', 'logs', 'agency-communicate', 'support-tickets', 'employee-profile', 'project-hub', 'task-board'] },
        { id: 'AgencyEmployee', name: 'Agency Employee', permissions: ['dashboard', 'client-management', 'agency-communicate', 'employee-profile', 'project-hub', 'task-board'] }
      ]
    };

    setAgencies(prev => [...prev, newAgency]);
    setActiveAgencyId(newAgency.id);
    setAppMode('auth');
    setStep('login');
    addLog('Agency Setup', `Agency ${newAgency.name} configured successfully`, 'system');
  };

  const currentAgency = agencies.find(a => a.id === activeAgencyId);
  const currentUser = users.find(u => u.email === (impersonatedUserEmail || userProfile.email)) || users[0];
  const isImpersonating = !!impersonatedUserEmail;
  
  const [clients, setClients] = useState<Client[]>([
    {
      id: 'client-1',
      name: 'Acme Corp',
      email: 'contact@acme.com',
      stage: 'discovery',
      discoveryAnswers: {
        'business-goals': 'We want to increase our online sales by 50% this year.',
        'target-audience': 'Tech-savvy professionals aged 25-45.',
        'brand-voice': 'Professional, yet approachable and innovative.'
      },
      resources: [],
      permissions: ['dashboard', 'onboarding', 'support']
    },
    {
      id: 'client-2',
      name: 'Global Tech',
      email: 'info@globaltech.io',
      stage: 'design',
      websiteUrl: 'https://example.com/preview/globaltech',
      discoveryAnswers: {},
      resources: [{ name: 'Brand Assets', url: '#', type: 'zip' }],
      permissions: ['dashboard', 'collaboration', 'support', 'resources']
    }
  ]);


  const isAgencyAdmin = currentUser?.role === 'Founder' || currentUser?.role === 'AgencyManager';
  const isAgencyEmployee = currentUser?.role === 'AgencyEmployee';
  const isAgencyRole = isAgencyAdmin || isAgencyEmployee;

  const activeClient = impersonatingClientId 
    ? clients.find(c => c.id === impersonatingClientId) 
    : (!isAgencyRole ? clients.find(c => c.email === userProfile.email) : null);

  const managedClient = clients.find(c => c.id === selectedClientId);

  const [workspaces, setWorkspaces] = useState([
    { id: 'crm', title: 'CRM Portal', description: 'Manage your clients, leads, and sales pipeline in one secure place.', icon: Users },
    { id: 'website', title: 'Website Editor', description: 'Build and maintain your online presence with our powerful editor.', icon: Globe }
  ]);
  // Logging Helper
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

  const hasPermission = (view: PortalView) => {

    if (!currentUser) return false;

    // Founder has full access
    if (currentUser.role === 'Founder' && !impersonatingClientId) return true;

    // If impersonating, use the client's permissions
    if (impersonatingClientId && activeClient) {
      return activeClient.permissions.includes(view);
    }

    // Otherwise use the user's own permissions
    // Check custom roles from current agency
    const customRole = currentAgency?.roles.find(r => r.id === currentUser.role);
    if (customRole) {
      if (customRole.isMaster) return true;
      return customRole.permissions.includes(view);
    }
    
    // Fallback for legacy roles
    if (currentUser.role === 'Founder') return true;
    return currentUser.permissions.includes(view);
  };

  const handleAddWorkspace = () => {
    const name = prompt('Enter workspace name:');
    if (name) {
      const id = name.toLowerCase().replace(/\s+/g, '-');
      setWorkspaces([...workspaces, {
        id: id as any,
        title: name,
        description: 'New custom workspace for your business needs.',
        icon: Briefcase
      }]);
    }
  };

  const handleImpersonate = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    addLog('Impersonation', `Started impersonating ${client?.name}`, 'impersonation', clientId);
    setImpersonatingClientId(clientId);
    setPortalView('dashboard');
  };

  const handleStopImpersonating = () => {
    addLog('Impersonation', 'Stopped impersonation', 'impersonation');
    setImpersonatingClientId(null);
    setImpersonatedUserEmail(null);
    setPortalView('operations-hub');
  };

  const handleUpdateClientStage = (clientId: string, stage: ClientStage) => {
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, stage } : c));
  };

  const handleAddClient = () => {
    if (!newClientForm.name || !newClientForm.email) return;
    const newClient: Client = {
      id: `client-${Date.now()}`,
      ...newClientForm,
      name: newClientForm.name,
      email: newClientForm.email,
      websiteUrl: newClientForm.websiteUrl,
      stage: 'discovery',
      discoveryAnswers: {},
      resources: [],
      assignedEmployees: []
    };

    setClients(prev => [...prev, newClient]);
    addLog('Client Created', `New client ${newClient.name} added to the system`, 'action', newClient.id);
    setShowAddClientModal(false);
    setNewClientForm({
      name: '',
      email: '',
      stage: 'discovery',
      websiteUrl: '',
      permissions: ['dashboard', 'crm', 'website', 'resources', 'aqua-ai', 'support']
    });
  };

  const handleAddProject = () => {
    if (!newProjectForm.name) return;
    const project: Project = {
      id: `proj-${Date.now()}`,
      ...newProjectForm,
      createdAt: new Date().toISOString()
    };
    setProjects(prev => [...prev, project]);
    setShowNewProjectModal(false);
    setNewProjectForm({ name: '', clientId: clients[0]?.id || 'client-1', description: '', status: 'Planning' });
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
      createdAt: new Date().toISOString()
    };
    setProjectTasks(prev => [...prev, task]);
    setShowNewTaskModal(false);
    setNewTaskForm({ title: '', projectId: projects[0]?.id || 'proj-1', priority: 'Medium', assigneeId: 1, description: '' });
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
        avatar: newUser.name.split(' ').map(n => n[0]).join('')
      };
      setUsers(prev => [...prev, user]);
      addLog('User Created', `New user ${user.name} added with role ${user.role}`, 'action');
    }
    
    setShowAddUserModal(false);
    setSelectedUserToEdit(null);
    setNewUser({
      name: '',
      email: '',
      role: 'AgencyEmployee',
      permissions: ['dashboard'],
      avatar: '',
      clientId: undefined
    });
  };

  const handleDeleteUser = (id: number) => {
    const user = users.find(u => u.id === id);
    if (!user) return;
    if (user.role === 'Founder') {
      alert('Cannot delete the Founder account.');
      return;
    }
    setUsers(prev => prev.filter(u => u.id !== id));
    addLog('User Deleted', `User ${user.name} removed from the system`, 'action');
  };

  const handleCreateRole = () => {
    if (!newRoleForm.name || !activeAgencyId) return;
    const role: CustomRole = {
      ...newRoleForm,
      id: `role-${Date.now()}`
    };
    setAgencies(prev => prev.map(a => 
      a.id === activeAgencyId ? { ...a, roles: [...a.roles, role] } : a
    ));
    setShowAddRoleModal(false);
    setNewRoleForm({ name: '', permissions: [] });
    addLog('Role Created', `New role "${role.name}" created`, 'action');
  };

  const toggleRolePermission = (permission: PortalView) => {
    setNewRoleForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };
  
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hello Edward! I'm Aqua AI, your personal assistant trained on your company's data. How can I help you today?", time: '10:22 AM' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (portalView === 'aqua-ai') {
      scrollToBottom();
    }
  }, [messages, portalView]);

  const codeRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      addLog('Login Attempt', `User ${username} attempted login`, 'auth');
      setStep('security');
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 3) {
      codeRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      codeRefs[index - 1].current?.focus();
    }
  };

  const handleVerify = () => {
    if (code.every(digit => digit !== '')) {
      addLog('Login Success', `User ${username} verified and logged in`, 'auth');
      setStep('portal');
    }
  };

  const handleLogout = () => {
    setStep('login');
    setUsername('');
    setPassword('');
    setCode(['', '', '', '']);
    setPortalView('dashboard');
    setSidebarCollapsed(false);
  };

  const handleExportWebsite = async () => {
    setExporting(true);
    try {
      const zip = new JSZip();
      zip.file("index.html", "<html><body><h1>My Website</h1></body></html>");
      zip.file("styles.css", "body { background: #000; color: #fff; }");
      zip.file("script.js", "console.log('Hello World');");
      
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "website-export.zip");
    } finally {
      setExporting(false);
    }
  };

  const handleExportData = () => {
    const data = {
      profile: userProfile,
      users: users,
      activityLogs: activityLogs,
      aiSessions: aiSessions,
      employeeLogs: activityLogs.filter(log => {
        const user = users.find(u => u.id === log.userId);
        return user?.role.includes('Agency');
      }),
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    saveAs(blob, "portal-data-export.json");
    addLog('Data Export', 'User exported account and employee data logs', 'action');
  };

  const togglePermission = (perm: PortalView) => {
    if (newUser.permissions.includes(perm)) {
      setNewUser({ ...newUser, permissions: newUser.permissions.filter(p => p !== perm) });
    } else {
      setNewUser({ ...newUser, permissions: [...newUser.permissions, perm] });
    }
  };

  const handleViewChange = (view: PortalView | string) => {
    setPortalView(view);
    if (view === 'website') {
      setSidebarCollapsed(true);
    } else {
      setSidebarCollapsed(false);
    }
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    const userMsg = { role: 'user', text: inputMessage, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');

    // Mock AI Response
    setTimeout(() => {
      const aiMsg = { 
        role: 'ai', 
        text: "I've analyzed your request. Based on the current data, I recommend focusing on the conversion rate optimization for your landing page. Would you like me to generate a detailed report?", 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 1000);
  };

  const dashboardData = [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 300 },
    { name: 'Mar', value: 600 },
    { name: 'Apr', value: 800 },
    { name: 'May', value: 500 },
    { name: 'Jun', value: 900 },
    { name: 'Jul', value: 1100 },
  ];

  const appContextValue = {
    users,
    setUsers,
    clients,
    setClients,
    tickets,
    setTickets,
    projects,
    setProjects,
    tasks: projectTasks,
    setTasks: setProjectTasks,
    activityLogs,
    setActivityLogs,
    userProfile,
    setUserProfile,
    impersonatedUserEmail,
    setImpersonatedUserEmail,
    impersonatingClientId,
    setImpersonatingClientId,
    appTheme,
    setAppTheme,
    appLogo,
    setAppLogo,
    loginPortalType,
    setLoginPortalType,
    portalView,
    setPortalView,
    addLog,
    currentUser,
    isAgencyAdmin,
    isAgencyEmployee,
    customSidebarLinks,
    setCustomSidebarLinks,
    activeTemplate,
    setActiveTemplate,
    agencies,
    setAgencies,
    currentAgency,
    activeAgencyId,
    customPages,
    setCustomPages
  };

  return (
    <AppProvider value={appContextValue}>
      <div className={`relative flex min-h-screen overflow-hidden transition-colors duration-1000 ${step === 'portal' ? 'bg-black' : 'bg-[#0f172a]'}`}>
      {/* Background Orbs */}
      {step !== 'portal' && (
        <>
          <motion.div 
            animate={{ 
              x: [0, 100, 0], 
              y: [0, 50, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="bg-glow top-1/4 left-1/4" 
          />
          <motion.div 
            animate={{ 
              x: [0, -100, 0], 
              y: [0, -50, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="bg-glow bottom-1/4 right-1/4" 
          />
        </>
      )}

      <AnimatePresence mode="wait">
        {step === 'setup' && (
          <motion.div
            key="setup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center w-full min-h-screen relative z-[100] px-6"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.1),transparent_50%)]" />
            
            {/* Animated Background Stars */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full"
                  initial={{ 
                    x: Math.random() * 1200, 
                    y: Math.random() * 800,
                    opacity: Math.random() * 0.5 
                  }}
                  animate={{ 
                    opacity: [0.2, 0.8, 0.2],
                    scale: [1, 1.5, 1]
                  }}
                  transition={{ 
                    duration: 3 + Math.random() * 4, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative w-full max-w-4xl glass-card rounded-[2.5rem] p-12 overflow-hidden shadow-2xl border border-white/10"
            >
              <div className="flex flex-col h-full max-h-[85vh]">
                <div className="flex items-center justify-between mb-12">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
                      <Sparkles className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold tracking-tight">Agency Configuration</h1>
                      <p className="text-slate-500 text-sm font-medium">Step {setupStep} of 3</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setStep('login');
                      addLog('Setup Bypassed', 'User skipped initial agency configuration', 'system');
                    }}
                    className="px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-400 transition-all border border-white/10 flex items-center gap-2 group"
                  >
                    Skip to Login
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
                  <AnimatePresence mode="wait">
                    {setupStep === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                      >
                        <div>
                          <h2 className="text-4xl font-bold mb-3 tracking-tight">Identity & Spirit</h2>
                          <p className="text-slate-400 text-lg">Let's give your agency a name and a face. This will be visible to your clients and team.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                          <div className="space-y-4">
                            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 ml-1">Agency Name</label>
                            <div className="relative group">
                              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
                              <input 
                                type="text"
                                placeholder="e.g. Acme Digital HQ"
                                value={newAgencyForm.name}
                                onChange={(e) => setNewAgencyForm({...newAgencyForm, name: e.target.value})}
                                className="w-full pl-12 pr-4 py-5 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-indigo-500 transition-all text-white text-xl font-semibold shadow-inner"
                              />
                            </div>
                          </div>

                          <div className="space-y-4">
                            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 ml-1">Primary Brand Color</label>
                            <div className="flex flex-wrap items-center gap-4 p-5 bg-white/5 border border-white/10 rounded-2xl">
                              {['#6366f1', '#06b6d4', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6'].map(color => (
                                <button
                                  key={color}
                                  onClick={() => setNewAgencyForm({...newAgencyForm, primaryColor: color})}
                                  className={`w-10 h-10 rounded-full border-2 transition-all ${
                                    newAgencyForm.primaryColor === color ? 'border-white scale-125 shadow-[0_0_15px_rgba(255,255,255,0.3)] z-10' : 'border-transparent opacity-40 hover:opacity-100'
                                  }`}
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                              <div className="w-px h-8 bg-white/10 mx-2" />
                              <input 
                                type="color"
                                value={newAgencyForm.primaryColor}
                                onChange={(e) => setNewAgencyForm({...newAgencyForm, primaryColor: e.target.value})}
                                className="w-10 h-10 rounded-full bg-transparent border-none cursor-pointer p-0 overflow-hidden"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 ml-1">Agency Logo (Optional)</label>
                          <div className="h-56 border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center bg-white/5 hover:bg-white/10 transition-all group cursor-pointer border-spacing-4">
                            <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform group-hover:bg-indigo-500/20 shadow-lg shadow-indigo-500/5">
                              <Upload className="w-10 h-10 text-indigo-400" />
                            </div>
                            <p className="text-lg font-semibold text-slate-300">Drag and drop or click to upload</p>
                            <p className="text-sm text-slate-500 mt-1">PNG, SVG or WEBP up to 5MB</p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {setupStep === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                      >
                        <div>
                          <h2 className="text-4xl font-bold mb-3 tracking-tight">Define Core roles</h2>
                          <p className="text-slate-400 text-lg">Initialize your foundational team structure. You can customize these and add more in Settings.</p>
                        </div>

                        <div className="grid grid-cols-1 gap-5">
                          {[
                            { id: 'Founder', name: 'Master Founder', desc: 'Full root access to agency metrics, global settings, and audit logs.', icon: ShieldCheck, color: 'text-indigo-400' },
                            { id: 'AgencyManager', name: 'Operations Lead', desc: 'Manages projects, task boards, and client relations. Restricted global settings.', icon: Star, color: 'text-amber-400' },
                            { id: 'AgencyEmployee', name: 'Agency Operator', desc: 'Focus on daily execution, project tasks, and internal communication.', icon: User, color: 'text-emerald-400' }
                          ].map(role => (
                            <div key={role.id} className="p-8 glass-card border border-white/5 rounded-[2rem] flex items-center justify-between group hover:bg-white/5 hover:border-white/10 transition-all">
                              <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-[1.25rem] bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                                  <role.icon className={`w-8 h-8 ${role.color}`} />
                                </div>
                                <div>
                                  <h3 className="font-bold text-xl mb-1">{role.name}</h3>
                                  <p className="text-slate-500 max-w-md">{role.desc}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="px-4 py-1.5 bg-white/5 text-[10px] font-bold uppercase tracking-widest text-slate-400 rounded-full border border-white/10">Default</span>
                                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                  <CheckSquare className="w-5 h-5 text-emerald-400" />
                                </div>
                              </div>
                            </div>
                          ))}
                          <button className="p-8 border-2 border-dashed border-white/10 rounded-[2rem] flex items-center justify-center gap-3 text-slate-500 hover:text-indigo-400 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all font-bold text-lg group italic">
                            <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                            Create Custom Role Configuration
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {setupStep === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-10"
                      >
                        <div className="text-center py-6">
                          <div className="w-28 h-28 rounded-[2.5rem] bg-indigo-600 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-600/40 relative">
                             <Sparkles className="w-14 h-14 text-white" />
                             <motion.div 
                               animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                               transition={{ duration: 2, repeat: Infinity }}
                               className="absolute inset-0 bg-indigo-400 rounded-[2.5rem] blur-xl -z-10" 
                             />
                          </div>
                          <h2 className="text-5xl font-bold mb-4 tracking-tighter">Infrastructure Ready.</h2>
                          <p className="text-slate-400 text-xl max-w-lg mx-auto leading-relaxed">Your professional environment has been provisioned. Welcome to the command center of your agency.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                           <div className="glass-card p-8 rounded-[2rem] border border-white/5 space-y-4">
                            <div className="flex items-center justify-between py-3 border-b border-white/5">
                              <span className="text-slate-500 font-medium">Agency Name</span>
                              <span className="font-bold text-lg">{newAgencyForm.name || 'Universal Agency'}</span>
                            </div>
                            <div className="flex items-center justify-between py-3 border-b border-white/5">
                              <span className="text-slate-500 font-medium">Instance ID</span>
                              <span className="font-bold text-indigo-400 font-mono tracking-wider uppercase">AQ-{Math.floor(1000 + Math.random() * 9000)}-HQ</span>
                            </div>
                            <div className="flex items-center justify-between py-3">
                              <span className="text-slate-500 font-medium">Branding Type</span>
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full shadow-lg" style={{ backgroundColor: newAgencyForm.primaryColor }} />
                                <span className="font-bold text-slate-300">Custom</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="glass-card p-8 rounded-[2rem] border border-white/5 flex flex-col justify-center gap-4 bg-indigo-600/5">
                            <div className="flex items-center gap-4 italic text-slate-400">
                              <ShieldCheck className="w-5 h-5 text-indigo-400" />
                              <p className="text-sm">Root access will be granted to the initial Founder account created during login.</p>
                            </div>
                            <div className="flex items-center gap-4 italic text-slate-400">
                              <LayoutGrid className="w-5 h-5 text-indigo-400" />
                              <p className="text-sm">Default operational dashboards (Project Hub, Task Board) have been pre-installed.</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="mt-12 flex gap-5">
                  {setupStep > 1 && (
                    <button 
                      onClick={() => setSetupStep(setupStep - 1)}
                      className="px-10 py-5 bg-white/5 hover:bg-white/10 rounded-2xl font-bold text-slate-400 transition-all flex items-center gap-3 border border-white/5 active:scale-95"
                    >
                      <ChevronLeft className="w-6 h-6" />
                      Back
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      if (setupStep < 3) {
                        setSetupStep(setupStep + 1);
                      } else {
                        handleAgencySetup();
                      }
                    }}
                    disabled={setupStep === 1 && !newAgencyForm.name}
                    className={`flex-1 py-5 font-bold rounded-2xl transition-all shadow-2xl flex items-center justify-center gap-3 text-lg relative overflow-hidden group ${
                      setupStep === 1 && !newAgencyForm.name 
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 active:scale-[0.98]'
                    }`}
                  >
                    <span className="relative z-10">{setupStep === 3 ? 'Deploy Agency Environment' : 'Continue'}</span>
                    {setupStep < 3 && <ChevronRight className="w-6 h-6 relative z-10 group-hover:translate-x-1 transition-transform" />}
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.6 }}
                    />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {step === 'login' && (
          <div className="flex items-center justify-center w-full">
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card w-full max-w-md p-10 rounded-[32px] shadow-2xl z-10"
            >
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/20 mb-6">
                  <User className="w-8 h-8 text-indigo-400" />
                </div>
                <h2 className="text-3xl font-semibold tracking-tight mb-2">Welcome Back</h2>
                <p className="text-slate-400">Enter your credentials to access the portal.</p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] uppercase tracking-widest font-semibold text-slate-500 ml-1">Username</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="admin@premium.com"
                      className="w-full pl-12 pr-4 py-4 bg-black/20 border border-white/10 rounded-xl outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] uppercase tracking-widest font-semibold text-slate-500 ml-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-4 bg-black/20 border border-white/10 rounded-xl outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600 text-white"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    type="submit"
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
                  >
                    Continue
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setUserProfile({
                        name: 'Edward Hallam',
                        email: 'edwardhallam07@gmail.com',
                        avatar: 'EH'
                      });
                      setStep('portal');
                      setPortalView('dashboard');
                      addLog('Dev Bypass', 'Founder bypassed login via Dev button', 'system');
                    }}
                    className="w-full py-3 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white font-medium rounded-xl border border-white/5 transition-all flex items-center justify-center gap-2"
                  >
                    <Terminal className="w-4 h-4" />
                    Dev Bypass
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {step === 'security' && (
          <div className="flex items-center justify-center w-full">
            <motion.div
              key="security"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card w-full max-w-md p-10 rounded-[32px] shadow-2xl z-10"
            >
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/20 mb-6">
                  <ShieldCheck className="w-8 h-8 text-indigo-400" />
                </div>
                <h2 className="text-3xl font-semibold tracking-tight mb-2">Security Check</h2>
                <p className="text-slate-400">We've sent a 4-digit code to your email.</p>
              </div>

              <div className="flex justify-center gap-4 mb-10">
                {code.map((digit, i) => (
                  <input
                    key={i}
                    ref={codeRefs[i]}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e) }
                    className="w-16 h-20 text-center text-3xl font-bold bg-black/20 border border-white/10 rounded-2xl outline-none focus:border-indigo-500 transition-colors text-white"
                  />
                ))}
              </div>

              <button
                onClick={handleVerify}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
              >
                Verify Identity
                <ShieldCheck className="w-5 h-5" />
              </button>
              
              <button 
                onClick={() => setStep('login')}
                className="w-full mt-4 py-2 text-slate-500 hover:text-slate-300 text-sm transition-colors"
              >
                Back to login
              </button>
            </motion.div>
          </div>
        )}

        {step === 'portal' && (
          <motion.div
            key="portal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex w-full h-screen text-white"
          >
            {/* Sidebar */}
            <motion.aside
              animate={{ width: sidebarCollapsed ? 80 : 280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 35 }}
              className="relative h-full glass-card border-r border-white/5 flex flex-col z-20 group/sidebar"
            >
              <div className="flex flex-col h-full">
                <div className={`p-6 mb-8 flex items-center gap-3 ${sidebarCollapsed ? 'justify-center' : ''}`}>
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0 overflow-hidden">
                    {currentAgency?.logo ? (
                      <img src={currentAgency.logo} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <ShieldCheck className="w-5 h-5 text-white" />
                    )}
                  </div>
                  {!sidebarCollapsed && (
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xl font-semibold tracking-tight"
                    >
                      {currentAgency?.name || 'Portal'}
                    </motion.span>
                  )}
                </div>

                <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
                  {isAgencyRole && !impersonatingClientId ? (
                    <>
                      {/* Agency Hub Section */}
                      <div className="mb-6 space-y-1">
                        {!sidebarCollapsed && <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500 mb-2 px-4">Agency Workspace</div>}
                        <SidebarItem icon={LayoutDashboard} label="Dashboard" active={portalView === 'agency-hub'} onClick={() => handleViewChange('agency-hub')} collapsed={sidebarCollapsed} />
                        <SidebarItem icon={Users} label="Clients" active={portalView === 'agency-clients'} onClick={() => handleViewChange('agency-clients')} collapsed={sidebarCollapsed} badge={clients.length} />
                        <SidebarItem icon={Briefcase} label="Projects" active={portalView === 'project-hub'} onClick={() => handleViewChange('project-hub')} collapsed={sidebarCollapsed} badge={projects.length} />
                        <SidebarItem icon={MessageSquare} label="Inbox" active={portalView === 'agency-communicate'} onClick={() => handleViewChange('agency-communicate')} collapsed={sidebarCollapsed} badge={tickets.filter(t => t.status === 'Open').length} />
                        <SidebarItem icon={UserCog} label="Team" active={portalView === 'employee-management'} onClick={() => handleViewChange('employee-management')} collapsed={sidebarCollapsed} />
                      </div>

                      {/* Founder Section */}
                      {currentUser?.role === 'Founder' && (
                        <div className="mb-6 space-y-1">
                          {!sidebarCollapsed && <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-indigo-400 mb-2 px-4 italic">Founder Tools</div>}
                          <SidebarItem icon={History} label="Global Activity" active={portalView === 'global-activity'} onClick={() => handleViewChange('global-activity')} collapsed={sidebarCollapsed} />
                          <SidebarItem icon={ShieldAlert} label="AI Monitor" active={portalView === 'ai-sessions'} onClick={() => handleViewChange('ai-sessions')} collapsed={sidebarCollapsed} />
                        </div>
                      )}

                      {/* Custom Sidebar Links */}
                      {customSidebarLinks.length > 0 && (
                        <div className="mb-6 space-y-1">
                          {!sidebarCollapsed && <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-emerald-400 mb-2 px-4 italic">Custom Links</div>}
                          {customSidebarLinks
                            .filter(link => currentUser && (link.roles.includes(currentUser.role) || currentUser.permissions.includes(link.view as any)))
                            .sort((a, b) => a.order - b.order)
                            .map(link => {
                              // Dynamic icon mapping fallback
                              const IconComponent = iconMap[link.iconName] || Link2;
                              
                              return (
                                <SidebarItem 
                                  key={link.id}
                                  icon={IconComponent} 
                                  label={link.label} 
                                  active={portalView === link.view} 
                                  onClick={() => handleViewChange(link.view as any)} 
                                  collapsed={sidebarCollapsed} 
                                />
                              );
                            })}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {/* Client-Facing View */}
                      {!sidebarCollapsed && <div className="text-[10px] uppercase tracking-widest font-bold text-slate-600 mb-2 px-4">
                        {activeClient ? 'Client Portal' : 'Main'}
                      </div>}
                      {hasPermission('dashboard') && activeClient?.stage === 'live' && (
                        <SidebarItem icon={LayoutDashboard} label="Live Dashboard" active={portalView === 'dashboard'} onClick={() => handleViewChange('dashboard')} collapsed={sidebarCollapsed} />
                      )}
                      {/* ... other client items continue here ... */}

                      {/* Stage-specific Dashboards */}
                      {activeClient?.stage === 'discovery' && (
                        <>
                          <SidebarItem 
                            view="discovery-dashboard" 
                            icon={Compass} 
                            label="Discovery Dashboard" 
                            active={portalView === 'discovery-dashboard'}
                            collapsed={sidebarCollapsed}
                            onClick={() => handleViewChange('discovery-dashboard')}
                          />
                          <SidebarItem 
                            view="onboarding" 
                            icon={FileText} 
                            label="Discovery Form" 
                            active={portalView === 'onboarding'}
                            collapsed={sidebarCollapsed}
                            onClick={() => handleViewChange('onboarding')}
                          />
                        </>
                      )}

                      {activeClient?.stage === 'design' && (
                        <SidebarItem 
                          view="design-dashboard" 
                          icon={Palette} 
                          label="Design Dashboard" 
                          active={portalView === 'design-dashboard'}
                          collapsed={sidebarCollapsed}
                          onClick={() => handleViewChange('design-dashboard')}
                        />
                      )}

                      {activeClient?.stage === 'development' && (
                        <SidebarItem 
                          view="dev-dashboard" 
                          icon={Code2} 
                          label="Dev Dashboard" 
                          active={portalView === 'dev-dashboard'}
                          collapsed={sidebarCollapsed}
                          onClick={() => handleViewChange('dev-dashboard')}
                        />
                      )}

                      {/* Collaboration Center - For design/dev phase */}
                      {hasPermission('collaboration') && (activeClient?.stage === 'design' || activeClient?.stage === 'development') && (
                        <SidebarItem 
                          view="collaboration" 
                          icon={Monitor} 
                          label="Collaboration" 
                          active={portalView === 'collaboration'}
                          collapsed={sidebarCollapsed}
                          onClick={() => handleViewChange('collaboration')}
                        />
                      )}

                      {hasPermission('aqua-ai') && (
                        <SidebarItem 
                          view="aqua-ai" 
                          icon={Sparkles} 
                          label="Aqua AI" 
                          active={portalView === 'aqua-ai'}
                          collapsed={sidebarCollapsed}
                          onClick={() => handleViewChange('aqua-ai')}
                        />
                      )}
                      
                      {!sidebarCollapsed && <div className="text-[10px] uppercase tracking-widest font-bold text-slate-600 mt-6 mb-2 px-4">Operations</div>}
                      {(hasPermission('workspaces') || hasPermission('company') || hasPermission('data-hub') || hasPermission('your-plan')) && (
                        <SidebarItem 
                          view="apps" 
                          icon={LayoutGrid} 
                          label="Apps & Tools" 
                          active={['crm', 'website', 'discover', 'resources', 'data-hub', 'your-plan'].includes(portalView)}
                          collapsed={sidebarCollapsed}
                          onClick={() => setShowAppLauncherModal(true)}
                        />
                      )}
                      
                      {!sidebarCollapsed && <div className="text-[10px] uppercase tracking-widest font-bold text-slate-600 mt-6 mb-2 px-4">Help</div>}
                      {hasPermission('support') && (
                        <SidebarItem 
                          view="support" 
                          icon={HelpCircle} 
                          label="Support & Help" 
                          active={['support', 'feature-request', 'resources'].includes(portalView)}
                          collapsed={sidebarCollapsed}
                          onClick={() => handleViewChange('support')}
                        />
                      )}
                    </>
                  )}
                </nav>


                <div className="p-4 border-t border-white/5 space-y-1">
                  <button
                    onClick={handleLogout}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-all duration-300 ${sidebarCollapsed ? 'justify-center' : ''}`}
                  >
                    <LogOut className="w-5 h-5 shrink-0" />
                    {!sidebarCollapsed && <span className="font-medium">Logout</span>}
                  </button>
                </div>
              </div>

              {/* Toggle Button */}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className={`absolute bottom-8 -right-3 w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg border border-white/10 hover:scale-110 transition-transform z-30`}
              >
                {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            </motion.aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-hidden relative bg-black/40 flex flex-col">
              {impersonatedUserEmail && (
                <div className="h-10 bg-indigo-600/90 backdrop-blur-md flex items-center justify-between px-8 text-white z-50">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                    <ShieldCheck className="w-4 h-4" />
                    Viewing as {currentUser.name} ({currentUser.role})
                  </div>
                  <button 
                    onClick={() => {
                      setImpersonatedUserEmail(null);
                      setPortalView('dashboard');
                      addLog('Impersonation Stopped', `Returned to ${userProfile.name}'s account`, 'system');
                    }}
                    className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all"
                  >
                    Switch back to my profile
                  </button>
                </div>
              )}
              {impersonatingClientId && !impersonatedUserEmail && (
                <div className="h-10 bg-amber-600/90 backdrop-blur-md flex items-center justify-between px-8 text-white z-50">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                    <Building2 className="w-4 h-4" />
                    Viewing {clients.find(c => c.id === impersonatingClientId)?.name} Workspace
                  </div>
                  <button 
                    onClick={() => {
                      setImpersonatingClientId(null);
                      setPortalView('operations-hub');
                    }}
                    className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all"
                  >
                    Return to Agency Hub
                  </button>
                </div>
              )}

              {/* Top Header */}
              <header className="h-16 border-b border-white/5 bg-black/20 backdrop-blur-xl flex items-center justify-between px-8 shrink-0 z-10">
                <div className="flex items-center gap-4">
                  <h2 className="text-sm font-medium text-slate-400 capitalize">
                    {portalView.replace('-', ' ')}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setShowGlobalTasksModal(true)}
                    className="p-2 rounded-lg transition-all hover:bg-white/5 group relative text-slate-400 hover:text-indigo-400"
                  >
                    <CheckSquare className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setShowInboxModal(true)}
                    className={`p-2 rounded-lg transition-all hover:bg-white/5 group relative ${showInboxModal ? 'text-indigo-400' : 'text-slate-400'}`}
                  >
                    <Clock className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full border border-black" />
                  </button>
                  <button 
                    onClick={() => setShowInboxModal(true)}
                    className={`p-2 rounded-lg transition-all hover:bg-white/5 group relative ${showInboxModal ? 'text-indigo-400' : 'text-slate-400'}`}
                  >
                    <Bell className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-black" />
                  </button>
                  <div className="w-px h-4 bg-white/10 mx-2" />
                     {userProfile.role === 'Founder' && (
                    <div className="flex items-center gap-3 mr-4">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Perspective:</span>
                      <select 
                        value={impersonatedUserEmail || userProfile.email}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === userProfile.email) {
                            setImpersonatedUserEmail(null);
                            setPortalView('dashboard');
                          } else {
                            const targetUser = users.find(u => u.email === val);
                            if (targetUser) {
                              setImpersonatedUserEmail(val);
                              setPortalView('dashboard');
                              addLog('Perspective Switched', `Founder is now viewing as ${targetUser.name} (${targetUser.role})`, 'system');
                            }
                          }
                        }}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-300 outline-none focus:border-indigo-500 transition-all cursor-pointer hover:bg-white/10"
                      >
                        <option value="edwardhallam07@gmail.com" className="bg-slate-900 italic">Self (Founder Mode)</option>
                        <optgroup label="Test As Role" className="bg-slate-900">
                          <option value="operator@example.com" className="bg-slate-900">Example Operator</option>
                          <option value="manager@example.com" className="bg-slate-900">Example Manager</option>
                          <option value="client@example.com" className="bg-slate-900">Example Client</option>
                        </optgroup>
                        <optgroup label="Impersonate User" className="bg-slate-900">
                          {users.filter(u => u.id <= 4 && u.role !== 'Founder').map(u => (
                            <option key={u.id} value={u.email} className="bg-slate-900">{u.name}</option>
                          ))}
                        </optgroup>
                      </select>
                    </div>
                  )}

                  <button 
                    onClick={() => setShowSettingsModal(true)}
                    className="flex items-center gap-3 pl-2 group"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      appTheme === 'indigo' ? 'bg-indigo-600' :
                      appTheme === 'cyan' ? 'bg-cyan-600' :
                      appTheme === 'emerald' ? 'bg-emerald-600' :
                      'bg-rose-600'
                    }`}>
                      {userProfile.avatar}
                    </div>
                  </button>
                </div>
              </header>

              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <AnimatePresence mode="wait">


                  {portalView === 'support' && (
                    <SupportView key="support" handleViewChange={handleViewChange} />
                  )}

                  {portalView === 'data-hub' && (
                    <DataHubView key="data-hub" handleViewChange={handleViewChange} />
                  )}

                  {portalView === 'design-dashboard' && (
                    <DesignDashboardView key="design-dashboard" />
                  )}

                  {portalView === 'dev-dashboard' && (
                    <DevDashboardView key="dev-dashboard" />
                  )}

                  {portalView === 'agency-builder' && (
                    <AgencyBuilderView key="agency-builder" />
                  )}

                  {customPages.find(p => p.slug === portalView) && (
                    <CustomPageView key={portalView} pageId={customPages.find(p => p.slug === portalView)!.id} />
                  )}

                  {portalView === 'onboarding-dashboard' && (
                    <OnboardingDashboardView key="onboarding-dashboard" />
                  )}

                  {portalView === 'discovery-dashboard' && (
                    <DiscoveryDashboardView key="discovery-dashboard" />
                  )}

                  {portalView === 'onboarding' && (
                    <OnboardingView key="onboarding" />
                  )}

                  {portalView === 'collaboration' && (
                    <CollaborationView key="collaboration" />
                  )}
                  {portalView === 'admin-dashboard' && (
                    <motion.div
                      key="admin-dashboard"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-10 max-w-6xl mx-auto w-full"
                    >
                      <div className="flex items-center justify-between mb-10">
                        <div>
                          <h2 className="text-3xl font-semibold mb-2">
                            {currentUser?.role === 'Founder' ? 'Founder Command Center' : 
                             currentUser?.role === 'AgencyManager' ? 'Agency Operations' : 
                             'Employee Dashboard'}
                          </h2>
                          <p className="text-slate-500">
                            {currentUser?.role === 'Founder' ? 'Global overview of your agency performance and growth.' : 
                             currentUser?.role === 'AgencyManager' ? 'Manage your team, clients, and operational workflows.' : 
                             'Track your assigned clients and daily tasks.'}
                          </p>
                        </div>
                        <div className="flex gap-3">
                          {isAgencyAdmin && (
                            <button 
                              onClick={() => setShowAddClientModal(true)}
                              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-2xl font-semibold transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
                            >
                              <Plus className="w-5 h-5" />
                              Add New Client
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                        {currentUser?.role === 'Founder' ? (
                          <>
                            <DashboardWidget 
                              icon={CreditCard} 
                              label="Monthly Revenue" 
                              value="$124,500" 
                              trend="+12.5%" 
                              color="emerald" 
                            />
                            <DashboardWidget 
                              icon={Users} 
                              label="Total Clients" 
                              value={clients.length.toString()} 
                              trend="+2" 
                              color="indigo" 
                            />
                            <DashboardWidget 
                              icon={Zap} 
                              label="Agency Growth" 
                              value="24%" 
                              trend="+5%" 
                              color="amber" 
                            />
                            <DashboardWidget 
                              icon={ShieldCheck} 
                              label="System Health" 
                              value="99.9%" 
                              trend="Stable" 
                              color="blue" 
                            />
                          </>
                        ) : currentUser?.role === 'AgencyManager' ? (
                          <>
                            <DashboardWidget 
                              icon={Briefcase} 
                              label="Active Projects" 
                              value={clients.filter(c => c.stage !== 'live').length.toString()} 
                              trend="On Track" 
                              color="indigo" 
                            />
                            <DashboardWidget 
                              icon={Users} 
                              label="Team Capacity" 
                              value="85%" 
                              trend="-5%" 
                              color="emerald" 
                            />
                            <DashboardWidget 
                              icon={Clock} 
                              label="Avg. Turnaround" 
                              value="4.2 Days" 
                              trend="-0.5d" 
                              color="amber" 
                            />
                            <DashboardWidget 
                              icon={MessageSquare} 
                              label="Pending Feedback" 
                              value="12" 
                              trend="+3" 
                              color="blue" 
                            />
                          </>
                        ) : (
                          <>
                            <DashboardWidget 
                              icon={Users} 
                              label="Your Clients" 
                              value={clients.filter(c => c.assignedEmployees?.includes(currentUser?.id || 0)).length.toString()} 
                              trend="Active" 
                              color="indigo" 
                            />
                            <DashboardWidget 
                              icon={CheckCircle2} 
                              label="Tasks Completed" 
                              value="48" 
                              trend="+12" 
                              color="emerald" 
                            />
                            <DashboardWidget 
                              icon={Star} 
                              label="Client Rating" 
                              value="4.9/5" 
                              trend="+0.1" 
                              color="amber" 
                            />
                            <DashboardWidget 
                              icon={Zap} 
                              label="Efficiency" 
                              value="94%" 
                              trend="+2%" 
                              color="blue" 
                            />
                          </>
                        )}
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {currentUser?.role === 'Founder' ? (
                          <>
                            {/* Operator Performance */}
                            <div className="glass-card p-8 rounded-3xl">
                              <h3 className="text-xl font-medium mb-8">Operator Performance</h3>
                              <div className="space-y-6">
                                {[
                                  { name: 'Sarah Jenkins', role: 'Agency Manager', clients: 12, rating: 4.9 },
                                  { name: 'Michael Chen', role: 'Agency Manager', clients: 8, rating: 4.7 },
                                  { name: 'Emma Wilson', role: 'Agency Manager', clients: 15, rating: 4.8 }
                                ].map((op, i) => (
                                  <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                                    <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                                        {op.name.charAt(0)}
                                      </div>
                                      <div>
                                        <div className="text-sm font-medium">{op.name}</div>
                                        <div className="text-[10px] text-slate-500 uppercase tracking-widest">{op.role}</div>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-sm font-bold text-emerald-400">{op.rating} ★</div>
                                      <div className="text-[10px] text-slate-500">{op.clients} Clients</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Top Revenue Clients */}
                            <div className="glass-card p-8 rounded-3xl">
                              <h3 className="text-xl font-medium mb-8">Top Revenue Clients</h3>
                              <div className="space-y-4">
                                {clients.slice(0, 4).map((client) => (
                                  <div key={client.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                                        {client.name.charAt(0)}
                                      </div>
                                      <div>
                                        <div className="text-sm font-medium">{client.name}</div>
                                        <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500">{client.stage}</div>
                                      </div>
                                    </div>
                                    <div className="text-sm font-bold text-indigo-400">£2,450/mo</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        ) : currentUser?.role === 'AgencyManager' ? (
                          <>
                            {/* Pipeline Status */}
                            <div className="glass-card p-8 rounded-3xl">
                              <h3 className="text-xl font-medium mb-8">Pipeline Status</h3>
                              <div className="space-y-6">
                                {[
                                  { stage: 'Discovery', count: 5, color: 'bg-indigo-500' },
                                  { stage: 'Onboarding', count: 3, color: 'bg-blue-500' },
                                  { stage: 'Design', count: 8, color: 'bg-purple-500' },
                                  { stage: 'Development', count: 12, color: 'bg-cyan-500' },
                                  { stage: 'Live', count: 45, color: 'bg-emerald-500' }
                                ].map((s, i) => (
                                  <div key={i} className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                      <span className="text-slate-400">{s.stage}</span>
                                      <span className="font-bold">{s.count}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                      <div 
                                        className={`h-full ${s.color} transition-all duration-1000`} 
                                        style={{ width: `${(s.count / 73) * 100}%` }}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Team Workload */}
                            <div className="glass-card p-8 rounded-3xl">
                              <h3 className="text-xl font-medium mb-8">Team Workload</h3>
                              <div className="space-y-4">
                                {users.filter(u => u.role === 'AgencyEmployee').slice(0, 4).map((user) => (
                                  <div key={user.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                                    <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                                        {user.name.charAt(0)}
                                      </div>
                                      <div>
                                        <div className="text-sm font-medium">{user.name}</div>
                                        <div className="text-[10px] text-slate-500">4 Active Clients</div>
                                      </div>
                                    </div>
                                    <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded-full uppercase tracking-widest">
                                      Available
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            {/* Task List */}
                            <div className="glass-card p-8 rounded-3xl">
                              <h3 className="text-xl font-medium mb-8">Your Tasks</h3>
                              <div className="space-y-4">
                                {[
                                  { task: 'Review Design Feedback', client: 'Acme Corp', priority: 'High' },
                                  { task: 'Update Staging Environment', client: 'Global Tech', priority: 'Medium' },
                                  { task: 'Prepare Onboarding Docs', client: 'Nexus Solutions', priority: 'Low' }
                                ].map((t, i) => (
                                  <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all">
                                    <div className="flex items-center gap-4">
                                      <div className={`w-2 h-2 rounded-full ${
                                        t.priority === 'High' ? 'bg-red-500' :
                                        t.priority === 'Medium' ? 'bg-amber-500' : 'bg-blue-500'
                                      }`} />
                                      <div>
                                        <div className="text-sm font-medium">{t.task}</div>
                                        <div className="text-[10px] text-slate-500">{t.client}</div>
                                      </div>
                                    </div>
                                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                      <CheckCircle2 className="w-4 h-4 text-slate-400" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Upcoming Deadlines */}
                            <div className="glass-card p-8 rounded-3xl">
                              <h3 className="text-xl font-medium mb-8">Upcoming Deadlines</h3>
                              <div className="space-y-4">
                                {[
                                  { item: 'Design V2 Approval', date: 'Mar 26', status: 'Pending' },
                                  { item: 'Beta Launch', date: 'Mar 28', status: 'On Track' },
                                  { item: 'Client Sync', date: 'Mar 30', status: 'Scheduled' }
                                ].map((d, i) => (
                                  <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                                    <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 rounded-xl bg-slate-500/10 flex flex-col items-center justify-center text-[10px] font-bold">
                                        <span className="text-indigo-400">{d.date.split(' ')[0]}</span>
                                        <span>{d.date.split(' ')[1]}</span>
                                      </div>
                                      <div className="text-sm font-medium">{d.item}</div>
                                    </div>
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{d.status}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {portalView === 'client-management' && (
                    <motion.div
                      key="client-management"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-10 max-w-6xl mx-auto w-full"
                    >
                      <div className="flex items-center justify-between mb-10">
                        <div>
                          <h2 className="text-3xl font-semibold mb-2">Client Management</h2>
                          <p className="text-slate-500">Configure client profiles and feature access.</p>
                        </div>
                        <button 
                          onClick={() => setPortalView('admin-dashboard')}
                          className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          Back to Dashboard
                        </button>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        <div className="lg:col-span-1 space-y-4">
                          {clients.map(client => (
                            <button
                              key={client.id}
                              onClick={() => setSelectedClientId(client.id)}
                              className={`w-full p-4 rounded-2xl text-left transition-all ${
                                selectedClientId === client.id 
                                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                                  : 'glass-card hover:bg-white/5 text-slate-400'
                              }`}
                            >
                              <div className="font-medium">{client.name}</div>
                              <div className="text-[10px] uppercase tracking-widest mt-1 opacity-60">{client.stage}</div>
                            </button>
                          ))}
                          <button 
                            onClick={handleAddClient}
                            className="w-full p-4 rounded-2xl border border-dashed border-white/10 text-slate-500 hover:text-white hover:border-white/20 transition-all text-sm flex items-center justify-center gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Add Client
                          </button>
                        </div>

                        <div className="lg:col-span-3">
                          {managedClient ? (
                            <div className="space-y-8">
                              <div className="glass-card p-8 rounded-3xl">
                                <div className="flex items-center justify-between mb-8">
                                  <h3 className="text-xl font-medium">Client Profile: {managedClient.name}</h3>
                                  <button 
                                    onClick={() => handleImpersonate(managedClient.id)}
                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl flex items-center gap-2 transition-colors text-sm"
                                  >
                                    <Monitor className="w-4 h-4" />
                                    Impersonate View
                                  </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                  <div className="space-y-6">
                                    <div>
                                      <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2 block">Current Stage</label>
                                      <div className="flex flex-wrap gap-2">
                                        {(['discovery', 'design', 'development', 'live'] as ClientStage[]).map(stage => (
                                          <button
                                            key={stage}
                                            onClick={() => handleUpdateClientStage(managedClient.id, stage)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                              managedClient.stage === stage 
                                                ? 'bg-indigo-600 text-white' 
                                                : 'bg-white/5 text-slate-500 hover:bg-white/10'
                                            }`}
                                          >
                                            {stage.charAt(0).toUpperCase() + stage.slice(1)}
                                          </button>
                                        ))}
                                      </div>
                                    </div>

                                    <div>
                                      <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2 block">Feature Permissions</label>
                                      <div className="space-y-2">
                                        {['dashboard', 'crm', 'website', 'analytics', 'support', 'onboarding', 'collaboration', 'aqua-ai', 'workspaces', 'company', 'data-hub', 'your-plan'].map(perm => (
                                          <label key={perm} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                                            <input 
                                              type="checkbox" 
                                              checked={managedClient.permissions.includes(perm as any)}
                                              onChange={(e) => {
                                                const newPerms = e.target.checked 
                                                  ? [...managedClient.permissions, perm as any]
                                                  : managedClient.permissions.filter(p => p !== perm);
                                                setClients(prev => prev.map(c => c.id === managedClient.id ? { ...c, permissions: newPerms } : c));
                                              }}
                                              className="w-4 h-4 rounded border-white/10 bg-white/5 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <span className="text-sm capitalize">{perm.replace('-', ' ')}</span>
                                          </label>
                                        ))}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="space-y-6">
                                    <div>
                                      <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2 block">Discovery Status</label>
                                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <div className="flex items-center justify-between mb-2">
                                          <span className="text-sm">Questions Answered</span>
                                          <span className="text-sm font-medium text-indigo-400">
                                            {Object.keys(managedClient.discoveryAnswers || {}).length} / 12
                                          </span>
                                        </div>
                                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                          <div 
                                            className="h-full bg-indigo-500" 
                                            style={{ width: `${(Object.keys(managedClient.discoveryAnswers || {}).length / 12) * 100}%` }}
                                          />
                                        </div>
                                      </div>
                                    </div>

                                    <div>
                                      <div className="flex items-center justify-between mb-2">
                                        <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Client Resources</label>
                                        <button 
                                          onClick={() => {
                                            const name = prompt('Resource Name:');
                                            if (!name) return;
                                            const newResource = { name, url: '#', type: 'document' };
                                            setClients(prev => prev.map(c => c.id === managedClient.id ? { ...c, resources: [...c.resources, newResource] } : c));
                                            addLog('Client Update', `Uploaded resource ${name} for ${managedClient.name}`, 'action', managedClient.id);
                                          }}
                                          className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold uppercase tracking-widest"
                                        >
                                          + Upload
                                        </button>
                                      </div>
                                      <div className="space-y-2 mb-6">
                                        {managedClient.resources.length === 0 ? (
                                          <p className="text-xs text-slate-600 italic">No resources uploaded yet.</p>
                                        ) : (
                                          managedClient.resources.map((res, i) => (
                                            <div key={res.name} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                                              <span className="text-sm truncate mr-2">{res.name}</span>
                                              <Download className="w-4 h-4 text-slate-500" />
                                            </div>
                                          ))
                                        )}
                                      </div>

                                      <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2 block">Assigned Employees</label>
                                      <div className="space-y-2">
                                        {users.filter(u => u.role === 'AgencyEmployee').map(employee => (
                                          <label key={employee.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                                            <input 
                                              type="checkbox" 
                                              checked={managedClient.assignedEmployees?.includes(employee.id)}
                                              onChange={(e) => {
                                                const currentAssigned = managedClient.assignedEmployees || [];
                                                const newAssigned = e.target.checked 
                                                  ? [...currentAssigned, employee.id]
                                                  : currentAssigned.filter(id => id !== employee.id);
                                                setClients(prev => prev.map(c => c.id === managedClient.id ? { ...c, assignedEmployees: newAssigned } : c));
                                                addLog('Client Update', `Assigned ${employee.name} to ${managedClient.name}`, 'action', managedClient.id);
                                              }}
                                              className="w-4 h-4 rounded border-white/10 bg-white/5 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <div className="flex items-center gap-2">
                                              <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-[8px] font-bold text-indigo-400">
                                                {employee.avatar || employee.name.charAt(0)}
                                              </div>
                                              <span className="text-sm">{employee.name}</span>
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
                            <div className="h-full flex flex-col items-center justify-center glass-card rounded-3xl p-12 text-center">
                              <Users className="w-12 h-12 text-slate-700 mb-4" />
                              <h3 className="text-xl font-medium mb-2">Select a Client</h3>
                              <p className="text-sm text-slate-500 max-w-xs">
                                Choose a client from the list on the left to manage their profile, stage, and permissions.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {portalView === 'dashboard' && (
                    <motion.div
                      key="dashboard"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-10 max-w-6xl mx-auto w-full"
                    >
                      <div className="flex items-center justify-between mb-10">
                        <div>
                          <h1 className="text-3xl font-semibold mb-2">Dashboard Overview</h1>
                          <p className="text-slate-500">Welcome back, {userProfile.name}. Here's what's happening today.</p>
                        </div>
                        <div className="flex gap-3">
                          {currentUser?.role === 'ClientOwner' && (
                            <button 
                              onClick={() => setShowAddUserModal(true)}
                              className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 transition-all active:scale-[0.98] flex items-center gap-2"
                            >
                              <Users className="w-4 h-4" />
                              Manage Team
                            </button>
                          )}
                          <div className="px-4 py-2 glass-card rounded-xl flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-xs font-medium">Live Traffic</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        <div className="glass-card p-6 rounded-3xl">
                          <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-indigo-500/20 rounded-lg">
                              <Users className="w-5 h-5 text-indigo-400" />
                            </div>
                            <span className="text-xs text-emerald-400 font-medium">+12%</span>
                          </div>
                          <div className="text-2xl font-bold mb-1">2,845</div>
                          <div className="text-xs text-slate-500 uppercase tracking-widest font-bold">Total Users</div>
                        </div>
                        <div className="glass-card p-6 rounded-3xl">
                          <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-cyan-500/20 rounded-lg">
                              <Globe className="w-5 h-5 text-cyan-400" />
                            </div>
                            <span className="text-xs text-emerald-400 font-medium">+5.2%</span>
                          </div>
                          <div className="text-2xl font-bold mb-1">45.2k</div>
                          <div className="text-xs text-slate-500 uppercase tracking-widest font-bold">Page Views</div>
                        </div>
                        <div className="glass-card p-6 rounded-3xl">
                          <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-purple-500/20 rounded-lg">
                              <Zap className="w-5 h-5 text-purple-400" />
                            </div>
                            <span className="text-xs text-red-400 font-medium">-2%</span>
                          </div>
                          <div className="text-2xl font-bold mb-1">1.2s</div>
                          <div className="text-xs text-slate-500 uppercase tracking-widest font-bold">Avg. Load Time</div>
                        </div>
                      </div>

                      <div className="glass-card p-8 rounded-[2.5rem] mb-10">
                        <div className="flex items-center justify-between mb-8">
                          <h3 className="text-lg font-medium">Growth Analytics</h3>
                          <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs outline-none">
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                          </select>
                        </div>
                        <div className="h-[300px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dashboardData}>
                              <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                              <XAxis 
                                dataKey="name" 
                                stroke="#64748b" 
                                fontSize={10} 
                                tickLine={false} 
                                axisLine={false} 
                                dy={10}
                              />
                              <YAxis 
                                stroke="#64748b" 
                                fontSize={10} 
                                tickLine={false} 
                                axisLine={false} 
                                tickFormatter={(value) => `${value}`}
                              />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: '#0f172a', 
                                  border: '1px solid rgba(255,255,255,0.1)',
                                  borderRadius: '12px',
                                  fontSize: '12px'
                                }}
                              />
                              <Area 
                                type="monotone" 
                                dataKey="value" 
                                stroke="#6366f1" 
                                strokeWidth={3}
                                fillOpacity={1} 
                                fill="url(#colorValue)" 
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {portalView === 'aqua-ai' && (
                  <motion.div
                    key="aqua-ai"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="h-full w-full flex flex-col relative"
                  >
                    {/* Subtle Aqua Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none z-0" />

                    {/* Chat Header */}
                    <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20 backdrop-blur-md z-10">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center">
                          <Sparkles className="w-6 h-6 text-cyan-400" />
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold tracking-tight">Aqua AI</h2>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">System Online</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 hover:bg-white/5 rounded-lg text-slate-400 transition-colors">
                          <Zap className="w-5 h-5" />
                        </button>
                        <button className="p-2 hover:bg-white/5 rounded-lg text-slate-400 transition-colors">
                          <Settings className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar z-10">
                      {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] p-4 rounded-2xl ${
                            msg.role === 'user' 
                              ? 'bg-indigo-600/20 border border-indigo-500/30 rounded-tr-none' 
                              : 'glass-card border-cyan-500/20 rounded-tl-none'
                          }`}>
                            <p className="text-sm leading-relaxed">
                              {msg.text}
                            </p>
                            <span className={`text-[10px] mt-2 block ${msg.role === 'user' ? 'text-indigo-400/60' : 'text-slate-500'}`}>
                              {msg.time}
                            </span>
                          </div>
                        </div>
                      ))}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Quick Actions */}
                    <div className="px-8 py-4 flex gap-3 overflow-x-auto custom-scrollbar no-scrollbar z-10">
                      <button 
                        onClick={() => setInputMessage("Analyze CRM Data")}
                        className="whitespace-nowrap px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-slate-400 transition-all"
                      >
                        Analyze CRM Data
                      </button>
                      <button 
                        onClick={() => setInputMessage("Check Billing Status")}
                        className="whitespace-nowrap px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-slate-400 transition-all"
                      >
                        Check Billing Status
                      </button>
                      <button 
                        onClick={() => handleViewChange('updates')}
                        className="whitespace-nowrap px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-slate-400 transition-all"
                      >
                        Planned Updates
                      </button>
                      <button 
                        onClick={() => handleViewChange('support')}
                        className="whitespace-nowrap px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-slate-400 transition-all"
                      >
                        Support Hub
                      </button>
                    </div>

                    {/* Input Area */}
                    <div className="p-8 pt-0 z-10">
                      <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-1000"></div>
                        <form 
                          onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                          className="relative flex items-center bg-black/40 border border-white/10 rounded-2xl p-2 backdrop-blur-xl"
                        >
                          <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder="Ask Aqua AI anything..."
                            className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-sm placeholder:text-slate-600"
                          />
                          <button 
                            type="submit"
                            className="w-10 h-10 bg-cyan-600 hover:bg-cyan-500 rounded-xl flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-cyan-500/20"
                          >
                            <Send className="w-5 h-5 text-white" />
                          </button>
                        </form>
                      </div>
                      <p className="text-[10px] text-slate-600 text-center mt-4 tracking-wide uppercase">
                        Aqua AI is trained on your company data. Check important info.
                      </p>
                    </div>
                  </motion.div>
                )}


                {portalView === 'resources' && (
                  <motion.div
                    key="resources"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="h-full w-full p-10 overflow-y-auto custom-scrollbar"
                  >
                    <div className="flex items-center justify-between mb-10">
                      <div>
                        <h2 className="text-3xl font-semibold mb-2">Resources</h2>
                        <p className="text-slate-500">Training materials, documentation, and helpful guides.</p>
                      </div>
                      <button 
                        onClick={() => handleViewChange('support')}
                        className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Help
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[
                        { title: 'Getting Started Guide', category: 'Basics', icon: BookOpen, description: 'Learn the fundamentals of navigating and using the portal.' },
                        { title: 'CRM Best Practices', category: 'Training', icon: Users, description: 'Optimize your workflow with our recommended CRM strategies.' },
                        { title: 'Security Protocols', category: 'Compliance', icon: Shield, description: 'Understand how we protect your data and privacy.' },
                        { title: 'API Documentation', category: 'Technical', icon: Zap, description: 'Detailed technical guides for integrating with our systems.' },
                        { title: 'Brand Guidelines', category: 'Marketing', icon: Globe, description: 'Assets and rules for using our company branding.' },
                        { title: 'Video Tutorials', category: 'Multimedia', icon: Play, description: 'Step-by-step video walkthroughs of key features.' }
                      ].map((resource, i) => (
                        <div key={i} className="glass-card p-6 rounded-3xl hover:bg-white/5 transition-all group cursor-pointer border border-white/5 hover:border-indigo-500/30">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <resource.icon className="w-6 h-6 text-indigo-400" />
                          </div>
                          <div className="text-[10px] uppercase tracking-widest font-bold text-indigo-400/60 mb-1">{resource.category}</div>
                          <h3 className="text-lg font-medium mb-2">{resource.title}</h3>
                          <p className="text-xs text-slate-500 leading-relaxed mb-4">{resource.description}</p>
                          <div className="flex items-center gap-2 text-xs font-medium text-indigo-400 group-hover:translate-x-1 transition-transform">
                            View Resource
                            <ChevronRight className="w-3 h-3" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {portalView === 'discover' && (
                  <motion.div
                    key="discover"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="h-full flex flex-col items-center justify-center p-10"
                  >
                    <Globe className="w-16 h-16 text-indigo-400 mb-6" />
                    <h1 className="text-4xl font-light tracking-widest text-white uppercase mb-4">Discover My Company</h1>
                    <p className="text-slate-500 mb-8">Internal insights and structure.</p>
                    <button 
                      onClick={() => handleViewChange('company')}
                      className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Company Hub
                    </button>
                  </motion.div>
                )}

                {portalView === 'crm' && (
                  <motion.div
                    key="crm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full w-full p-6 flex flex-col"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <button 
                        onClick={() => handleViewChange('workspaces')}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Workspaces
                      </button>
                    </div>
                    <div className="flex-1 w-full rounded-3xl glass-card overflow-hidden flex flex-col">
                      <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Users className="w-5 h-5 text-indigo-400" />
                          <h2 className="text-lg font-medium">CRM Portal</h2>
                        </div>
                        <div className="text-xs text-slate-500 uppercase tracking-widest">Secure Connection</div>
                      </div>
                      <div className="flex-1 bg-black/40 flex items-center justify-center text-slate-500 italic">
                        <div className="text-center p-10">
                          <div className="relative w-24 h-24 mx-auto mb-8">
                            <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-2xl animate-pulse"></div>
                            <Users className="relative w-full h-full text-indigo-400/40" />
                          </div>
                          <h3 className="text-xl font-medium text-white not-italic mb-2">CRM Interface</h3>
                          <p className="max-w-xs mx-auto mb-8">Your customer relationship management tools are being synchronized with the portal.</p>
                          <button 
                            onClick={() => alert('Opening CRM in new tab...')}
                            className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-white transition-all flex items-center gap-2 mx-auto"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Open CRM External
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {portalView === 'website' && (
                  <motion.div
                    key="website"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full w-full p-6 flex flex-col gap-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <button 
                          onClick={() => handleViewChange('workspaces')}
                          className="p-2 hover:bg-white/5 rounded-lg text-slate-400 transition-colors"
                        >
                          <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-3">
                          <Globe className="w-6 h-6 text-indigo-400" />
                          <h2 className="text-2xl font-semibold tracking-tight">Website Editor</h2>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => alert('Report generation started...')}
                          className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
                        >
                          <FileText className="w-4 h-4" />
                          Run a report
                        </button>
                        <button 
                          onClick={() => handleViewChange('dashboard')}
                          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
                        >
                          <BarChart3 className="w-4 h-4" />
                          Analytics dashboard
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 rounded-3xl glass-card overflow-hidden flex flex-col">
                      <div className="flex-1 bg-black/40 flex items-center justify-center text-slate-500 italic">
                        <div className="text-center p-10">
                          <div className="relative w-24 h-24 mx-auto mb-8">
                            <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-2xl animate-pulse"></div>
                            <Globe className="relative w-full h-full text-cyan-400/40" />
                          </div>
                          <h3 className="text-xl font-medium text-white not-italic mb-2">Website Editor</h3>
                          <p className="max-w-xs mx-auto mb-8">The visual editor is preparing your workspace. This usually takes a few seconds.</p>
                          <div className="flex gap-4 justify-center">
                            <button 
                              onClick={() => alert('Launching editor...')}
                              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-indigo-600/20"
                            >
                              Launch Editor
                            </button>
                            <button 
                              onClick={() => handleExportWebsite()}
                              className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-white transition-all"
                            >
                              Download Backup
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {portalView === 'logs' && (
                  <motion.div
                    key="logs"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="h-full w-full p-10 overflow-y-auto"
                  >
                    <div className="flex items-center justify-between mb-10">
                      <div>
                        <h2 className="text-3xl font-semibold tracking-tight mb-2">Activity Logs</h2>
                        <p className="text-slate-400">Monitor system activity and user actions.</p>
                      </div>
                      <div className="flex gap-4">
                        <select className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-indigo-500 transition-colors text-white">
                          <option value="all">All Types</option>
                          <option value="auth">Authentication</option>
                          <option value="impersonation">Impersonation</option>
                          <option value="action">Actions</option>
                          <option value="system">System</option>
                        </select>
                        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-medium transition-colors">
                          Export Logs
                        </button>
                      </div>
                    </div>

                    <div className="glass-card rounded-3xl overflow-hidden border border-white/5">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-white/5 bg-white/5">
                              <th className="p-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Timestamp</th>
                              <th className="p-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">User</th>
                              <th className="p-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Action</th>
                              <th className="p-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Details</th>
                              <th className="p-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Type</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {(isAgencyAdmin ? activityLogs : activityLogs.filter(l => l.clientId === currentUser?.clientId || l.userId === currentUser?.id)).map((log) => (
                              <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                                <td className="p-4 text-sm text-slate-400 font-mono whitespace-nowrap">
                                  {new Date(log.timestamp).toLocaleString()}
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px] font-bold text-indigo-400">
                                      {log.userName.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <span className="text-sm font-medium whitespace-nowrap">{log.userName}</span>
                                  </div>
                                </td>
                                <td className="p-4 text-sm font-medium whitespace-nowrap">{log.action}</td>
                                <td className="p-4 text-sm text-slate-400 min-w-[300px]">{log.details}</td>
                                <td className="p-4">
                                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    log.type === 'auth' ? 'bg-blue-500/10 text-blue-400' :
                                    log.type === 'impersonation' ? 'bg-purple-500/10 text-purple-400' :
                                    log.type === 'action' ? 'bg-green-500/10 text-green-400' :
                                    'bg-slate-500/10 text-slate-400'
                                  }`}>
                                    {log.type}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </motion.div>
                )}




                {portalView === 'your-plan' && (
                  <motion.div
                    key="your-plan"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="h-full w-full p-10 overflow-y-auto custom-scrollbar"
                  >
                    <div className="flex items-center justify-between mb-10">
                      <h2 className="text-3xl font-semibold">Your Plan</h2>
                      <button 
                        onClick={() => handleViewChange('dashboard')}
                        className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                      </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                      <div className="lg:col-span-1 glass-card p-8 rounded-3xl bg-indigo-600/10 border-indigo-500/20">
                        <div className="text-slate-400 text-sm mb-2">Next Payment Due</div>
                        <div className="text-4xl font-bold mb-4">£249.00</div>
                        <div className="flex items-center gap-2 text-indigo-400 font-medium">
                          <Calendar className="w-4 h-4" />
                          April 15, 2026
                        </div>
                      </div>

                      <div className="lg:col-span-2 glass-card p-8 rounded-3xl flex items-center justify-between">
                        <div>
                          <div className="text-slate-400 text-sm mb-2">Current Plan</div>
                          <div className="text-2xl font-semibold">Premium Enterprise</div>
                        </div>
                        <button className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors font-medium">
                          Manage Plan
                        </button>
                      </div>
                    </div>

                    <div className="glass-card rounded-3xl overflow-hidden">
                      <div className="p-6 border-b border-white/5">
                        <h3 className="font-medium">Payment History</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="text-slate-500 text-xs uppercase tracking-widest border-b border-white/5">
                              <th className="px-8 py-4 font-semibold">Invoice</th>
                              <th className="px-8 py-4 font-semibold">Date</th>
                              <th className="px-8 py-4 font-semibold">Amount</th>
                              <th className="px-8 py-4 font-semibold">Status</th>
                              <th className="px-8 py-4 font-semibold text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {[
                              { id: 'INV-001', date: 'Mar 15, 2026', amount: '£249.00', status: 'Paid' },
                              { id: 'INV-002', date: 'Feb 15, 2026', amount: '£249.00', status: 'Paid' },
                              { id: 'INV-003', date: 'Jan 15, 2026', amount: '£249.00', status: 'Paid' }
                            ].map(inv => (
                              <tr key={inv.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-8 py-4 font-medium">{inv.id}</td>
                                <td className="px-8 py-4 text-slate-400">{inv.date}</td>
                                <td className="px-8 py-4">{inv.amount}</td>
                                <td className="px-8 py-4">
                                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded-full uppercase tracking-widest">
                                    {inv.status}
                                  </span>
                                </td>
                                <td className="px-8 py-4 text-right">
                                  <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-indigo-400">
                                    <Download className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </motion.div>
                )}

                {portalView === 'employee-management' && (
                  <EmployeeManagementView 
                    onAddUser={() => setShowAddUserModal(true)} 
                    onDeleteUser={handleDeleteUser} 
                  />
                )}

                {portalView === 'employee-profile' && (
                  <motion.div
                    key="employee-profile"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="h-full w-full p-10 overflow-y-auto custom-scrollbar"
                  >
                    <div className="max-w-4xl mx-auto">
                      <div className="flex items-center gap-8 mb-12">
                        <div className="w-24 h-24 rounded-[2rem] bg-indigo-600 text-white flex items-center justify-center text-4xl font-bold shadow-2xl shadow-indigo-600/30">
                          {userProfile.avatar}
                        </div>
                        <div>
                          <h2 className="text-4xl font-semibold mb-2">{userProfile.name}</h2>
                          <div className="flex items-center gap-4 text-slate-400">
                            <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {userProfile.email}</span>
                            <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4" /> {currentUser?.role}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="glass-card p-8 rounded-[2.5rem] space-y-6">
                          <h3 className="text-xl font-medium flex items-center gap-2">
                             <User className="w-5 h-5 text-indigo-400" />
                             General Information
                          </h3>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Full Name</label>
                              <input 
                                type="text"
                                value={userProfile.name}
                                onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-indigo-500 transition-all"
                                disabled={!isEditingProfile}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Bio / Role Description</label>
                              <textarea 
                                rows={3}
                                value={currentUser?.bio || ''}
                                onChange={(e) => setUsers(users.map(u => u.id === currentUser?.id ? { ...u, bio: e.target.value } : u))}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-indigo-500 transition-all resize-none"
                                disabled={!isEditingProfile}
                                placeholder="Describe your role and impact..."
                              />
                            </div>
                          </div>
                        </div>

                        <div className="glass-card p-8 rounded-[2.5rem] space-y-6">
                          <h3 className="text-xl font-medium flex items-center gap-2">
                             <Clock className="w-5 h-5 text-emerald-400" />
                             Availability
                          </h3>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Working Hours</label>
                              <div className="relative">
                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input 
                                  type="text"
                                  value={currentUser?.workingHours || '9:00 AM - 5:00 PM'}
                                  onChange={(e) => setUsers(users.map(u => u.id === currentUser?.id ? { ...u, workingHours: e.target.value } : u))}
                                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-indigo-500 transition-all"
                                  disabled={!isEditingProfile}
                                  placeholder="e.g. Mon-Fri, 9-5"
                                />
                              </div>
                            </div>
                            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                              <div className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-1">Status</div>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-sm font-medium">Currently Online</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 flex justify-end gap-4">
                        {isEditingProfile ? (
                          <>
                            <button 
                              onClick={() => setIsEditingProfile(false)}
                              className="px-8 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-semibold transition-all"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={() => {
                                setIsEditingProfile(false);
                                addLog('Profile Updated', 'User updated their profile information', 'action');
                              }}
                              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/20"
                            >
                              Save Changes
                            </button>
                          </>
                        ) : (
                          <button 
                            onClick={() => setIsEditingProfile(true)}
                            className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-semibold transition-all flex items-center gap-2"
                          >
                            <Settings2 className="w-4 h-4" />
                            Edit Profile
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {portalView === 'agency-communicate' && (
                  <motion.div
                    key="agency-communicate"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex h-full w-full overflow-hidden"
                  >
                    {/* Channel Sidebar */}
                    <div className="w-64 border-r border-white/5 bg-white/[0.02] flex flex-col">
                      <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <h3 className="font-semibold">Channels</h3>
                        <PlusCircle className="w-4 h-4 text-slate-500 cursor-pointer hover:text-white" />
                      </div>
                      <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {['general', 'design', 'development', 'client-feedback'].map(channel => (
                          <div key={channel} className={`px-4 py-2 rounded-xl text-sm cursor-pointer transition-all ${channel === 'general' ? 'bg-indigo-600/20 text-indigo-400 font-medium' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'}`}>
                            # {channel}
                          </div>
                        ))}
                        <div className="pt-6 pb-2 text-[10px] uppercase tracking-widest font-bold text-slate-600 px-4">Direct Messages</div>
                        {users.filter(u => u.id !== currentUser?.id).map(u => (
                          <div key={u.id} className="px-4 py-2 rounded-xl text-sm cursor-pointer text-slate-500 hover:bg-white/5 hover:text-slate-300 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            {u.name}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 flex flex-col">
                      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold"># general</h3>
                          <span className="text-xs text-slate-500">Company-wide announcements and talk</span>
                        </div>
                        <div className="flex items-center gap-4 text-slate-400">
                          <Users className="w-4 h-4 cursor-pointer hover:text-white" />
                          <Settings className="w-4 h-4 cursor-pointer hover:text-white" />
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                        {agencyMessages.map(msg => {
                          const sender = users.find(u => u.id === msg.senderId);
                          return (
                            <div key={msg.id} className="flex gap-4 group">
                              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold shrink-0">
                                {sender?.avatar}
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                  <span className="font-semibold text-sm">{sender?.name}</span>
                                  <span className="text-[10px] text-slate-600">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <p className="text-sm text-slate-300 leading-relaxed font-light">{msg.text}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="p-6">
                        <div className="relative">
                          <input 
                            type="text"
                            placeholder="Message #general"
                            className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-indigo-500 transition-all placeholder:text-slate-600"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && e.currentTarget.value) {
                                setAgencyMessages([...agencyMessages, { 
                                  id: Date.now().toString(), 
                                  senderId: currentUser?.id || 1, 
                                  text: e.currentTarget.value, 
                                  timestamp: new Date().toISOString() 
                                }]);
                                e.currentTarget.value = '';
                              }
                            }}
                          />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-slate-500">
                            <PlusCircle className="w-5 h-5 cursor-pointer hover:text-white" />
                            <MessageCircle className="w-5 h-5 cursor-pointer hover:text-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {portalView === 'support-tickets' && (
                  <motion.div
                    key="support-tickets"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="h-full w-full p-10 overflow-y-auto custom-scrollbar"
                  >
                    <div className="flex items-center justify-between mb-10">
                      <div>
                        <h2 className="text-3xl font-semibold">Support Tickets</h2>
                        <p className="text-slate-400">Track and manage client requests and internal issues.</p>
                      </div>
                      <button 
                        onClick={() => setShowTicketModal(true)}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-50 text-white font-semibold rounded-xl transition-all flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        New Ticket
                      </button>
                    </div>

                    <div className="glass-card rounded-3xl overflow-hidden">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="text-slate-500 text-xs uppercase tracking-widest border-b border-white/5">
                            <th className="px-8 py-4 font-semibold">ID</th>
                            <th className="px-8 py-4 font-semibold">Ticket Details</th>
                            <th className="px-8 py-4 font-semibold">Type</th>
                            <th className="px-8 py-4 font-semibold">Status</th>
                            <th className="px-8 py-4 font-semibold text-right">Created By</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {tickets.map(ticket => (
                            <tr key={ticket.id} className="hover:bg-white/5 transition-colors">
                              <td className="px-8 py-4 font-medium text-indigo-400">{ticket.id}</td>
                              <td className="px-8 py-4">
                                <div className="font-medium">{ticket.title}</div>
                                <div className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${
                                  ticket.priority === 'High' ? 'text-red-400' : 
                                  ticket.priority === 'Medium' ? 'text-amber-400' : 'text-indigo-400'
                                }`}>
                                  {ticket.priority} Priority
                                </div>
                              </td>
                              <td className="px-8 py-4">
                                <span className={`px-3 py-1 text-[9px] font-bold rounded-full uppercase tracking-widest border ${
                                  ticket.type === 'client' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-slate-500/10 text-slate-400 border-white/5'
                                }`}>
                                  {ticket.type}
                                </span>
                              </td>
                              <td className="px-8 py-4">
                                <span className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-widest ${
                                  ticket.status === 'Open' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'
                                }`}>
                                  {ticket.status}
                                </span>
                              </td>
                              <td className="px-8 py-4 text-right">
                                <div className="text-sm font-medium">{ticket.creator}</div>
                                <div className="text-[10px] text-slate-500">{new Date(ticket.createdAt).toLocaleDateString()}</div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}

                {portalView === 'project-hub' && (
                  <motion.div
                    key="project-hub"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="h-full w-full p-10 overflow-y-auto custom-scrollbar"
                  >
                    <div className="flex items-center justify-between mb-10">
                      <div>
                        <h2 className="text-3xl font-semibold">Project Hub</h2>
                        <p className="text-slate-400">Strategic oversight of all agency & client initiatives.</p>
                      </div>
                      <button 
                        onClick={() => setShowNewProjectModal(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-600/20"
                      >
                        <Plus className="w-5 h-5" />
                        New Project
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {projects.map(project => {
                        const client = clients.find(c => c.id === project.clientId);
                        const tasks = projectTasks.filter(t => t.projectId === project.id);
                        const completedTasks = tasks.filter(t => t.status === 'Done').length;
                        const progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

                        return (
                          <div key={project.id} className="glass-card p-6 rounded-[2.5rem] border border-white/5 hover:border-white/10 transition-all group cursor-pointer" onClick={() => setPortalView('task-board')}>
                            <div className="flex items-start justify-between mb-6">
                              <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400">
                                <Briefcase className="w-6 h-6" />
                              </div>
                              <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${
                                project.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                              }`}>
                                {project.status}
                              </span>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
                            <p className="text-sm text-slate-500 line-clamp-2 mb-6">{project.description}</p>
                            
                            <div className="space-y-4">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-500">Client</span>
                                <span className="text-slate-300 font-medium">{client?.name || 'Internal'}</span>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                  <span>Progress</span>
                                  <span>{Math.round(progress)}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {portalView === 'task-board' && (
                  <motion.div
                    key="task-board"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full w-full p-10 overflow-hidden flex flex-col"
                  >
                    <div className="flex items-center justify-between mb-10 shrink-0">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <button onClick={() => setPortalView('project-hub')} className="p-2 hover:bg-white/5 rounded-xl transition-all">
                            <ArrowLeft className="w-5 h-5 text-slate-400" />
                          </button>
                          <h2 className="text-3xl font-semibold">Active Tasks</h2>
                        </div>
                        <p className="text-slate-400 ml-12">Kanban board for operational execution.</p>
                      </div>
                      <button 
                        onClick={() => setShowNewTaskModal(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl border border-white/10 transition-all active:scale-[0.98]"
                      >
                        <Plus className="w-5 h-5 text-indigo-400" />
                        Create Task
                      </button>
                    </div>

                    <div className="flex-1 flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
                      {(['Backlog', 'In Progress', 'Review', 'Done'] as const).map(status => (
                        <div key={status} className="w-80 shrink-0 flex flex-col">
                          <div className="flex items-center justify-between mb-4 px-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                status === 'Backlog' ? 'bg-slate-500' :
                                status === 'In Progress' ? 'bg-indigo-500' :
                                status === 'Review' ? 'bg-amber-500' : 'bg-emerald-500'
                              }`} />
                              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">{status}</h3>
                            </div>
                            <span className="text-[10px] font-bold text-slate-600 bg-white/5 px-2 py-0.5 rounded-full">
                              {projectTasks.filter(t => t.status === status).length}
                            </span>
                          </div>
                          
                          <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                            {projectTasks.filter(t => t.status === status).map(task => (
                              <motion.div
                                key={task.id}
                                layoutId={task.id}
                                onClick={() => setSelectedTask(task)}
                                className="glass-card p-5 rounded-3xl border border-white/5 hover:border-white/10 transition-all cursor-pointer group"
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-widest ${
                                    task.priority === 'High' ? 'text-rose-400 bg-rose-400/10' :
                                    task.priority === 'Medium' ? 'text-amber-400 bg-amber-400/10' : 'text-indigo-400 bg-indigo-400/10'
                                  }`}>
                                    {task.priority}
                                  </span>
                                  <div className="flex -space-x-2">
                                    {task.assigneeId && (
                                      <div className="w-6 h-6 rounded-full bg-indigo-600 border border-slate-900 flex items-center justify-center text-[10px] font-bold text-white uppercase transform group-hover:scale-110 transition-transform">
                                        {users.find(u => u.id === task.assigneeId)?.avatar}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <h4 className="text-sm font-semibold mb-2 group-hover:text-indigo-400 transition-colors">{task.title}</h4>
                                <div className="flex items-center gap-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                  <div className="flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    {task.steps.filter(s => s.completed).length}/{task.steps.length}
                                  </div>
                                  {task.attachments.length > 0 && (
                                    <div className="flex items-center gap-1">
                                      <Link2 className="w-3 h-3" />
                                      {task.attachments.length}
                                    </div>
                                  )}
                                  {task.dueDate && (
                                    <div className="flex items-center gap-1 ml-auto">
                                      <Calendar className="w-3 h-3" />
                                      {new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {portalView === 'ai-sessions' && (
                  <motion.div
                    key="ai-sessions"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="h-full w-full p-10 overflow-y-auto custom-scrollbar"
                  >
                    <div className="flex items-center justify-between mb-10">
                      <div>
                        <h2 className="text-3xl font-semibold">AI Session Monitor</h2>
                        <p className="text-slate-400">View and analyze all Aqua AI interactions across the platform.</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-medium border border-white/5 transition-all">
                          Export All Sessions
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                      <DashboardWidget icon={Zap} label="Total AI Calls" value="1,284" trend="+12%" color="indigo" />
                      <DashboardWidget icon={Clock} label="Avg Response Time" value="1.2s" trend="-5%" color="emerald" />
                      <DashboardWidget icon={MessageSquare} label="Active Sessions" value="42" trend="+8%" color="amber" />
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium mb-6">Recent Sessions</h3>
                      {aiSessions.map(session => (
                        <div key={session.id} className="glass-card p-6 rounded-3xl space-y-4">
                          <div className="flex items-center justify-between border-b border-white/5 pb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">
                                {session.userName.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div>
                                <div className="font-semibold">{session.userName}</div>
                                <div className="text-[10px] text-slate-500 uppercase tracking-widest">{session.id}</div>
                              </div>
                            </div>
                            <span className="text-xs text-slate-500">{session.interactions.length} Interactions</span>
                          </div>
                          <div className="space-y-3">
                            {session.interactions.map((int, i) => (
                              <div key={i} className="p-4 bg-white/[0.02] rounded-2xl border border-white/5 space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Prompt</div>
                                  <div className="text-[10px] text-slate-600">{new Date(int.timestamp).toLocaleTimeString()}</div>
                                </div>
                                <p className="text-sm text-slate-400 italic">"{int.prompt}"</p>
                                <div className="pt-2 border-t border-white/5">
                                  <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">AI Response</div>
                                  <p className="text-sm text-slate-300 line-clamp-2">{int.response}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}



                {portalView === 'agency-clients' && (
                  <motion.div
                    key="agency-clients"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="h-full w-full p-10 overflow-y-auto custom-scrollbar"
                  >
                    <div className="flex items-center justify-between mb-10">
                      <div>
                        <h2 className="text-3xl font-semibold mb-2">Clients Under Control</h2>
                        <p className="text-slate-400">View and impersonate clients to manage their workspaces and logs.</p>
                      </div>
                      <button 
                        onClick={() => setShowAddClientModal(true)}
                        className="flex items-center gap-2 px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
                      >
                        <PlusCircle className="w-5 h-5" />
                        Onboard Client
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {clients.map(client => (
                        <div key={client.id} className="glass-card p-8 rounded-[2.5rem] border border-white/5 hover:border-white/10 transition-all group">
                          <div className="flex items-start justify-between mb-8">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center">
                                <Building2 className="w-8 h-8" />
                              </div>
                              <div>
                                <h3 className="text-xl font-semibold mb-1">{client.name}</h3>
                                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">{client.stage} Phase</p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4 mb-8">
                            <div className="flex items-center justify-between text-sm py-2 border-b border-white/5">
                              <span className="text-slate-500">Authorized Access</span>
                              <span className="text-slate-300">{client.permissions.length} Modules</span>
                            </div>
                            <div className="flex items-center justify-between text-sm py-2">
                              <span className="text-slate-500">Contact</span>
                              <span className="text-slate-300">{client.email}</span>
                            </div>
                          </div>

                          <div className="flex gap-3 mt-auto">
                            <button
                              onClick={() => handleImpersonate(client.id)}
                              className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-amber-400 font-bold transition-all flex items-center justify-center gap-2 group-hover:bg-amber-600 group-hover:text-white"
                            >
                              <Building2 className="w-4 h-4" />
                              View Workspace
                            </button>
                            <button
                              onClick={() => {
                                const owner = users.find(u => u.clientId === client.id && u.role === 'ClientOwner');
                                if (owner) {
                                  setImpersonatedUserEmail(owner.email);
                                  setPortalView('dashboard');
                                  addLog('Impersonation', `Started impersonating ${owner.name} (Owner of ${client.name})`, 'impersonation');
                                } else {
                                  alert(`No owner account found for ${client.name}. Please create one first.`);
                                }
                              }}
                              className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-indigo-400 font-bold transition-all flex items-center justify-center gap-2 group-hover:bg-indigo-600 group-hover:text-white"
                            >
                              <UserCheck className="w-4 h-4" />
                              Impersonate Owner
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {portalView === 'agency-hub' && (
                  <motion.div
                    key="agency-hub"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full w-full p-10 overflow-y-auto custom-scrollbar"
                  >
                    <div className="flex items-center justify-between mb-10">
                      <div>
                        <h2 className="text-3xl font-semibold">Agency Internal CRM</h2>
                        <p className="text-slate-400">Unified command center for agency operations.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                      <DashboardWidget icon={Users} label="Active Team" value={users.length.toString()} trend="+2" color="indigo" />
                      <DashboardWidget icon={Ticket} label="Open Tickets" value={tickets.filter(t => t.status === 'Open').length.toString()} trend="-1" color="emerald" />
                      <DashboardWidget icon={MessageSquare} label="Unread Comms" value="12" trend="+5" color="amber" />
                      <DashboardWidget icon={Zap} label="AI Sessions (24h)" value={aiSessions.length.toString()} trend="+8%" color="indigo" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Team Overview Mini-Module */}
                      <div className="glass-card p-6 rounded-3xl">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="font-semibold">Team Presence</h3>
                          <button onClick={() => setPortalView('employee-management')} className="text-xs text-indigo-400 hover:text-indigo-300">View All</button>
                        </div>
                        <div className="space-y-4">
                          {users.slice(0, 4).map(u => (
                            <div key={u.id} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-2xl">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                                  {u.avatar}
                                </div>
                                <span className="text-sm font-medium">{u.name}</span>
                              </div>
                              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Online</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Recent AI Interactions Mini-Module */}
                      <div className="glass-card p-6 rounded-3xl">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="font-semibold">Live AI Stream</h3>
                          <button onClick={() => setPortalView('ai-sessions')} className="text-xs text-indigo-400 hover:text-indigo-300">Auditor</button>
                        </div>
                        <div className="space-y-4">
                          {aiSessions.slice(0, 2).map((session, i) => (
                            <div key={session.id} className="p-4 bg-white/[0.02] rounded-2xl space-y-2">
                              <div className="flex items-center justify-between text-[10px] text-slate-500">
                                <span>{session.userName}</span>
                                <span>Just now</span>
                              </div>
                              <p className="text-xs text-slate-300 line-clamp-1 italic">"{session.interactions[0].prompt}"</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {portalView === 'founder-todos' && (
                  <motion.div
                    key="founder-todos"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="h-full w-full p-10 overflow-y-auto custom-scrollbar"
                  >
                    <div className="max-w-4xl mx-auto">
                      <div className="flex items-center justify-between mb-12">
                        <div>
                          <h2 className="text-4xl font-bold tracking-tight mb-2">My Task Center</h2>
                          <p className="text-slate-400">Founder oversight and strategic priorities.</p>
                        </div>
                        <button 
                          onClick={() => {
                            const text = prompt('Task description:');
                            if (text) setTodos([...todos, { id: Date.now().toString(), text, completed: false, priority: 'Medium', category: 'General' }]);
                          }}
                          className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20"
                        >
                          <Plus className="w-6 h-6" />
                        </button>
                      </div>

                      <div className="space-y-8">
                        {['High', 'Medium', 'Low'].map(priority => (
                          <div key={priority} className="space-y-4">
                            <h3 className={`text-xs font-bold uppercase tracking-[0.2em] px-2 ${
                              priority === 'High' ? 'text-rose-400' : priority === 'Medium' ? 'text-amber-400' : 'text-indigo-400'
                            }`}>
                              {priority} Priority
                            </h3>
                            <div className="space-y-3">
                              {todos.filter(t => t.priority === priority).map(todo => (
                                <motion.div 
                                  key={todo.id}
                                  layout
                                  className={`glass-card p-6 rounded-3xl flex items-center gap-6 group transition-all ${todo.completed ? 'opacity-50' : ''}`}
                                >
                                  <button 
                                    onClick={() => setTodos(todos.map(t => t.id === todo.id ? { ...t, completed: !t.completed } : t))}
                                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                                      todo.completed ? 'bg-indigo-600 border-indigo-600' : 'border-white/10 hover:border-indigo-500'
                                    }`}
                                  >
                                    {todo.completed && <CheckSquare className="w-4 h-4 text-white" />}
                                  </button>
                                  <div className="flex-1">
                                    <p className={`text-lg font-medium transition-all ${todo.completed ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                                      {todo.text}
                                    </p>
                                    <div className="flex items-center gap-3 mt-1">
                                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-500 font-bold uppercase tracking-widest">{todo.category}</span>
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {portalView === 'global-activity' && (
                  <motion.div
                    key="global-activity"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full w-full p-10 overflow-y-auto custom-scrollbar"
                  >
                    <div className="max-w-5xl mx-auto">
                      <div className="mb-12">
                        <h2 className="text-3xl font-semibold mb-2">Platform Activity Monitor</h2>
                        <p className="text-slate-400">Real-time audit log of all events across the agency.</p>
                      </div>

                      <div className="glass-card rounded-[32px] overflow-hidden">
                        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                          <span className="text-sm font-medium">Global Event Stream</span>
                          <div className="flex gap-2">
                             <div className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Updates Enabled</div>
                          </div>
                        </div>
                        <div className="divide-y divide-white/5">
                          {activityLogs.map(log => (
                            <div key={log.id} className="p-6 flex items-center gap-6 hover:bg-white/[0.01] transition-colors">
                              <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center shrink-0">
                                <Activity className="w-5 h-5" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-semibold">{log.userName}</span>
                                  <span className="text-xs text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <p className="text-sm text-slate-300">{log.action}</p>
                                  <span className="w-1 h-1 rounded-full bg-slate-600" />
                                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{log.module}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {portalView === 'global-settings' && (
                  <motion.div
                    key="global-settings"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="h-full w-full p-10 overflow-y-auto custom-scrollbar"
                  >
                    <div className="max-w-4xl mx-auto">
                      <div className="mb-12">
                        <h2 className="text-3xl font-semibold mb-2">Global System Settings</h2>
                        <p className="text-slate-400">Platform-wide configurations and agency branding.</p>
                      </div>

                      <div className="space-y-6">
                        <div className="glass-card p-8 rounded-[32px] space-y-6">
                          <h3 className="text-lg font-medium">Agency Identity</h3>
                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Agency Name</label>
                              <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-all font-light" defaultValue="Aqua Agency" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Primary Color</label>
                              <div className="flex gap-3">
                                <div className="w-12 h-12 rounded-xl bg-indigo-600 cursor-pointer border-2 border-white ring-offset-2 ring-offset-black" />
                                <div className="w-12 h-12 rounded-xl bg-emerald-600 cursor-pointer border-2 border-transparent" />
                                <div className="w-12 h-12 rounded-xl bg-rose-600 cursor-pointer border-2 border-transparent" />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="glass-card p-8 rounded-[32px] space-y-6">
                          <h3 className="text-lg font-medium">Security & Compliance</h3>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                              <div>
                                <p className="font-medium text-sm">Strict AI Monitoring</p>
                                <p className="text-xs text-slate-500">Record all AI interactions for audit purposes.</p>
                              </div>
                              <div className="w-12 h-6 bg-indigo-600 rounded-full relative">
                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-md" />
                              </div>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-white/5 opacity-50">
                              <div>
                                <p className="font-medium text-sm">Session Timeout</p>
                                <p className="text-xs text-slate-500">Auto logout after 30 minutes of inactivity.</p>
                              </div>
                              <div className="w-12 h-6 bg-slate-700 rounded-full relative">
                                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-md" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {portalView === 'feature-request' && (
                  <motion.div
                    key="feature-request"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="h-full w-full p-10 flex flex-col items-center justify-center max-w-2xl mx-auto"
                  >
                    <AnimatePresence mode="wait">
                      {!feedbackSubmitted ? (
                        <motion.div
                          key="form"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="w-full flex flex-col items-center"
                        >
                          <div className="w-20 h-20 rounded-3xl bg-indigo-600/20 flex items-center justify-center mb-8">
                            <Lightbulb className="w-10 h-10 text-indigo-400" />
                          </div>
                          <h2 className="text-4xl font-semibold mb-4 text-center">Submit a Feature</h2>
                          <p className="text-slate-400 text-center mb-10">Help us shape the future of the portal. Share your ideas and suggestions with our product team.</p>
                          
                          <div className="w-full space-y-6">
                            <div className="space-y-2">
                              <label className="text-[11px] uppercase tracking-widest font-semibold text-slate-500 ml-1">Feature Title</label>
                              <input
                                type="text"
                                placeholder="e.g., Dark mode for editor"
                                className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600 text-white"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[11px] uppercase tracking-widest font-semibold text-slate-500 ml-1">Description</label>
                              <textarea
                                rows={4}
                                placeholder="Tell us more about how this feature would help you..."
                                className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600 resize-none text-white"
                              />
                            </div>
                            <div className="flex gap-4">
                              <button 
                                onClick={() => handleViewChange('support')}
                                className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-xl font-semibold transition-all"
                              >
                                Cancel
                              </button>
                              <button 
                                onClick={() => {
                                  setFeedbackSubmitted(true);
                                  setTimeout(() => {
                                    setFeedbackSubmitted(false);
                                    handleViewChange('support');
                                  }, 3000);
                                }}
                                className="flex-2 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-indigo-600/20"
                              >
                                Submit Proposal
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="success"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="text-center"
                        >
                          <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-8 mx-auto">
                            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                          </div>
                          <h2 className="text-4xl font-semibold mb-4">Thank you!</h2>
                          <p className="text-slate-400 max-w-sm mx-auto">Your feedback has been received. We'll review your request and get back to you as soon as possible.</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </main>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add User Modal */}
      <AnimatePresence>
        <AddClientModal 
          isOpen={showAddClientModal}
          onClose={() => setShowAddClientModal(false)}
          newClientForm={newClientForm}
          setNewClientForm={setNewClientForm}
          handleAddClient={handleAddClient}
        />

        <AddUserModal
          isOpen={showAddUserModal}
          onClose={() => { setShowAddUserModal(false); setSelectedUserToEdit(null); }}
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
          onOpenAddRole={() => setShowAddRoleModal(true)}
          onEditUser={(user) => {
            setSelectedUserToEdit(user);
            setNewUser({
              name: user.name,
              email: user.email,
              role: user.role,
              permissions: user.permissions,
              avatar: user.avatar,
              clientId: user.clientId
            });
            setShowAddUserModal(true);
          }}
          onDeleteUser={handleDeleteUser}
          onDeleteRole={(roleId) => {
            setAgencies(prev => prev.map(a => 
              a.id === activeAgencyId ? { ...a, roles: a.roles.filter(r => r.id !== roleId) } : a
            ));
            addLog('Role Deleted', `Role was removed`, 'action');
          }}
          onExportData={handleExportData}
          onExportWebsite={handleExportWebsite}
          exporting={exporting}
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
          hasPermission={hasPermission}
        />

        <AddRoleModal
          isOpen={showAddRoleModal}
          onClose={() => setShowAddRoleModal(false)}
          newRoleForm={newRoleForm}
          setNewRoleForm={setNewRoleForm}
          handleCreateRole={handleCreateRole}
        />
      </AnimatePresence>
    </div>
    </AppProvider>
  );
}

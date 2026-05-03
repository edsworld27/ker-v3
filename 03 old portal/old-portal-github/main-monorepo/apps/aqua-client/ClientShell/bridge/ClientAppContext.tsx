"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { 
  AppUser, Step, PortalView, PortalTier, Agency, Client, LogEntry, AppNotification, ClientStage
} from '@ClientShell/bridge/types';

export interface AppContextType {
  // ── Core Data ─────────────────────────────────────────────────────────────
  currentUser: AppUser | undefined;
  users: AppUser[];
  setUsers: (valOrUpdater: any) => void;
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  activeAgencyId: string;
  setActiveAgencyId: React.Dispatch<React.SetStateAction<string>>;
  currentAgency: Agency;
  agencyConfig: any;
  setAgencyConfig: (valOrUpdater: any) => void;
  portalTier: PortalTier;
  setPortalTier: React.Dispatch<React.SetStateAction<PortalTier>>;
  enabledSuiteIds: string[];
  activeClient: Client | null;
  setActiveClient: React.Dispatch<React.SetStateAction<Client | null>>;
  toggleSuite: (suiteId: string, clientId?: string) => void;

  // ── Shell & Navigation ───────────────────────────────────────────────────
  step: Step;
  setStep: React.Dispatch<React.SetStateAction<Step>>;
  portalView: PortalView | string;
  setPortalView: React.Dispatch<React.SetStateAction<PortalView | string>>;
  handleViewChange: (viewId: string) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  sidebarStack: any[];
  pushSidebarLevel: (title: string, items: any[], icon?: any) => void;
  popSidebarLevel: () => void;
  appLogo: string;
  setAppLogo: React.Dispatch<React.SetStateAction<string>>;
  
  // ── UI States ─────────────────────────────────────────────────────────────
  isDropdownOpen: boolean;
  setIsDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  dropdownRef: React.RefObject<HTMLDivElement>;
  activePortalTheme: string;
  setActivePortalTheme: React.Dispatch<React.SetStateAction<string>>;

  // ── Handlers & Utils ─────────────────────────────────────────────────────
  addLog: (action: string, details: string, type?: any, clientId?: string) => void;
  addAuditLog: (action: string, details: string, module: string, clientId?: string) => void;
  sendNotification: (userId: number, title: string, message: string, type?: any) => void;
  handleLogout: () => void;
  handleGenericAction: (action: string, details?: string) => void;
  maskPII: (text: string, type?: string) => string;
  savePersistedState: () => void;
  
  // ── CRM & Hub Handlers ──────────────────────────────────────────────────
  handleUpdateClientStage: (clientId: string, stage: ClientStage | string) => void;
  handleEditClient: (client: any) => void;
  handleProvisionClient: (clientId: string) => Promise<void>;
  handleUploadClientResource: (clientId: string, resource: { name: string; url: string; type: string }) => void;
  handleAssignEmployeeToClient: (clientId: string, employeeId: number, isChecked: boolean) => void;
  handleImpersonate: (clientId: string) => void;

  // ── Auth & Impersonation ────────────────────────────────────────────────
  impersonatedUserEmail: string | null;
  setImpersonatedUserEmail: React.Dispatch<React.SetStateAction<string | null>>;
  impersonatingClientId: string | null;
  setImpersonatingClientId: React.Dispatch<React.SetStateAction<string | null>>;
  mfaVerified: boolean;
  setMfaVerified: React.Dispatch<React.SetStateAction<boolean>>;
  loginPortalType: 'agency' | 'client';
  setLoginPortalType: React.Dispatch<React.SetStateAction<'agency' | 'client'>>;
  handleStopImpersonating: () => void;

  // ── Global Infrastructure Data ──────────────────────────────────────────
  activityLogs: LogEntry[];
  notifications: AppNotification[];
  integrations: any[];
  
  // ── Shared Bridge Variables (The "Discovery & Pull" Hub) ─────────────────
  projects: any[];
  setProjects: React.Dispatch<React.SetStateAction<any[]>>;
  tasks: any[];
  setTasks: React.Dispatch<React.SetStateAction<any[]>>;
  projectTasks: any[];
  setProjectTasks: React.Dispatch<React.SetStateAction<any[]>>;
  deals: any[];
  setDeals: React.Dispatch<React.SetStateAction<any[]>>;
  tickets: any[];
  setTickets: React.Dispatch<React.SetStateAction<any[]>>;
  payrollRecords: any[];
  setPayrollRecords: React.Dispatch<React.SetStateAction<any[]>>;
  invoices: any[];
  setInvoices: React.Dispatch<React.SetStateAction<any[]>>;
  todos: any[];
  setTodos: React.Dispatch<React.SetStateAction<any[]>>;
  ydiAllowances: any[];
  setYdiAllowances: React.Dispatch<React.SetStateAction<any[]>>;
  conversations: any[];
  setConversations: React.Dispatch<React.SetStateAction<any[]>>;
  setSailGifts: any[];
  setSetSailGifts: React.Dispatch<React.SetStateAction<any[]>>;
  affiliateAccounts: any[];
  setAffiliateAccounts: React.Dispatch<React.SetStateAction<any[]>>;
  approvalRequests: any[];
  setApprovalRequests: React.Dispatch<React.SetStateAction<any[]>>;
  riskAssessments: any[];
  setRiskAssessments: React.Dispatch<React.SetStateAction<any[]>>;
  sops: any[];
  setSops: React.Dispatch<React.SetStateAction<any[]>>;
  productionQueueGroup: any;
  setProductionQueueGroup: React.Dispatch<React.SetStateAction<any>>;
  shipmentsGroup: any;
  setShipmentsGroup: React.Dispatch<React.SetStateAction<any>>;
  inventoryGroup: any;
  setInventoryGroup: React.Dispatch<React.SetStateAction<any>>;
  strategicProjections: any;
  setStrategicProjections: React.Dispatch<React.SetStateAction<any>>;
  
  // ── Helpers ──────────────────────────────────────────────────────────────
  isAgencyRole: boolean;
  isAgencyAdmin: boolean;
  canCurrentUserImpersonate: boolean;
  hasPermission: (view: string) => boolean;
  roleConfig: any;
  viewTitleLabel: string;
  userProfile: AppUser | undefined;
  
  // ── Deployment Modes ─────────────────────────────────────────────────────
  designMode: boolean;
  setDesignMode: React.Dispatch<React.SetStateAction<boolean>>;
  portalMode: 'demo' | 'user';
  setPortalMode: React.Dispatch<React.SetStateAction<'demo' | 'user'>>;
  handleCompleteSetup: () => void;
  handleLogin: (email: string, pass: string) => Promise<void>;
  handleSignup: (name: string, email: string) => void;
  handleVerifyMfa: (pin: string) => void;
  currentUserEmail: string;
  authError: string;
  appMode: any;
  setAppMode: React.Dispatch<React.SetStateAction<any>>;
  expandedItems: string[];
  setExpandedItems: React.Dispatch<React.SetStateAction<string[]>>;
  handleToggle: (id: string) => void;
  agencyMessages: any[];
  setAgencyMessages: React.Dispatch<React.SetStateAction<any[]>>;

  // UI & Ref Refs
  setSelectedTask?: React.Dispatch<React.SetStateAction<any | null>>;
  setNotifications?: React.Dispatch<React.SetStateAction<any[]>>;
  isLoginMode?: boolean;
  toggleAuthMode?: () => void;
  username?: string;
  setUsername?: React.Dispatch<React.SetStateAction<string>>;
  password?: string;
  setPassword?: React.Dispatch<React.SetStateAction<string>>;
  setAuthError?: React.Dispatch<React.SetStateAction<string>>;
  label?: (key: string) => string;
  teamHealth?: any[];
  courseEnrollments?: any[];
  jobPostings?: any[];
  adminStats?: any;
  handleUpsertObjective?: (obj: any) => void;
  handleDeleteObjective?: (id: string) => void;
  objectives?: any[];
  boardMeetingsGroup?: any;
  stakeholderStatements?: any[];
  dataProtectionRecords?: any[];
  legalDocuments?: any[];
  insurancePolicies?: any[];
  setShowNewProjectModal?: (show: boolean) => void;
  hardwareAssets?: any[];
  itInfrastructure?: any[];
  networkLogs?: any[];
  softwareLicenses?: any[];
  aiSessions?: any[];
  setIntegrations?: React.Dispatch<React.SetStateAction<any[]>>;
  savedApiKeys?: any[];
  setSavedApiKeys?: React.Dispatch<React.SetStateAction<any[]>>;
  webhooks?: any[];
  setWebhooks?: React.Dispatch<React.SetStateAction<any[]>>;
  customPages?: any[];
  handleDeleteUser?: (userId: number) => void;
  handleUpdateClientSettings?: (clientId: string, settings: any) => void;
  handleAddClientUser?: (clientId: string, user: any) => void;
  handleRemoveClientUser?: (clientId: string, userId: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode, value: AppContextType }> = ({ children, value }) => {
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

const noop = () => { /* no-op fallback */ };
const arrayNoop = () => [];
const asyncNoop = async () => { /* no-op */ };

/**
 * Permissive default value used when no AppProvider wraps the consumer.
 * Returned instead of throwing so the host shell's plugin renderer can
 * mount Client components without forcing every host route to mount the
 * full AppProvider tree. Consumers that need real values should still be
 * wrapped in <AppProvider value={...}> from ClientApp.
 */
const defaultAppContext: AppContextType = new Proxy({} as AppContextType, {
  get(_target, prop) {
    const key = String(prop);
    if (key.startsWith('handle') || key.startsWith('add') || key.startsWith('send') || key.startsWith('toggle') || key.startsWith('save') || key.startsWith('set') || key === 'pushSidebarLevel' || key === 'popSidebarLevel') {
      // Async handler names get an async no-op so `await ctx.handleX()` works.
      if (key === 'handleProvisionClient' || key === 'handleLogin') return asyncNoop;
      return noop;
    }
    if (key === 'hasPermission' || key === 'maskPII') return () => true;
    if (key === 'users' || key === 'clients' || key === 'projects' || key === 'tasks' || key === 'projectTasks' || key === 'deals' || key === 'tickets' || key === 'invoices' || key === 'todos' || key === 'notifications' || key === 'activityLogs' || key === 'integrations' || key === 'agencyMessages' || key === 'enabledSuiteIds' || key === 'sidebarStack' || key === 'expandedItems') {
      return arrayNoop();
    }
    if (key === 'sidebarCollapsed' || key === 'isDropdownOpen' || key === 'mfaVerified' || key === 'designMode' || key === 'isAgencyRole' || key === 'isAgencyAdmin' || key === 'canCurrentUserImpersonate') return false;
    if (key === 'step') return 'portal';
    if (key === 'portalView') return '';
    if (key === 'portalMode') return 'demo';
    if (key === 'loginPortalType') return 'agency';
    if (key === 'portalTier') return 'agency';
    if (key === 'activeAgencyId') return 'demo-agency';
    if (key === 'currentAgency') return { id: 'demo-agency', name: 'Demo Agency' };
    if (key === 'agencyConfig') return {};
    if (key === 'authError') return '';
    if (key === 'currentUserEmail') return '';
    if (key === 'appLogo') return '';
    if (key === 'activePortalTheme') return 'dark';
    if (key === 'roleConfig') return {};
    if (key === 'viewTitleLabel') return '';
    return undefined;
  },
});

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  return context ?? defaultAppContext;
};

import { useState, useEffect } from 'react';
import {
  AppUser, Client, LogEntry, AppNotification, Step, PortalTier, Agency, ClientStage, BridgeSession
} from '@RevenueShell/bridge/types';
import {
  initialUsers, initialClients, initialActivityLogs, initialNotifications, initialIntegrations,
  initialProjects, initialProjectTasks, initialTickets, initialDeals,
  initialTodos, initialPayrollRecords, initialInvoices, initialYdiAllowances, initialSetSailGifts,
  initialConversations
} from '@RevenueShell/bridge/data/RevenuemockData';
import { loadSeedData } from '@RevenueShell/bridge/data/Revenuedb';
import { initialMasterConfig } from '@RevenueShell/bridge/config/RevenuemasterConfig';
import { BridgeProvisioning } from '@RevenueShell/bridge/Revenueprovisioning';
import { agencyConfig as defaultAgencyConfig } from '@RevenueShell/bridge/config/RevenueagencyConfig';
import { useSyncStore } from '@RevenueShell/hooks/RevenueuseSyncStore';
import { BridgeAPI } from '@RevenueShell/bridge/Revenueapi';

/**
 * useRevenueCore — The Central Data Kernel
 * 
 * This hook owns all primary application state and handles synchronization.
 * Specific business logic (e.g., Client CRM, Design Mode) has been moved to 
 * specialized hooks in the Templates directory to maintain a lean App Shell.
 */
export function useRevenueCore(persisted: any) {
  const [step, setStep] = useState<Step>(persisted?.setupComplete ? 'login' : 'welcome');
  const [appMode, setAppMode] = useState<any>('operations');
  const [portalTier, setPortalTier] = useState<PortalTier>(persisted?.portalTier ?? 'agency');
  const [designMode, setDesignMode] = useState<boolean>(false);
  const [masterConfig, setMasterConfig] = useState<any>(
    persisted?.masterConfig?.agency ? persisted.masterConfig : initialMasterConfig
  );

  const [activeAgencyId, setActiveAgencyId] = useState<string>(persisted?.activeAgencyId || 'aqua-main');
  
  // Auto-Sync Hook
  const { syncToDatabase } = useSyncStore(activeAgencyId);

  /**
   * Helper to notify the host shell of state changes if running in an iframe.
   */
  const notifyHost = (key: string, value: any) => {
    if (typeof window !== 'undefined' && window.parent !== window) {
      import('@aqua/bridge/postMessage').then(m => {
        m.sendBridgeMessage(window.parent, 'BRIDGE_STATE_UPDATED', { key, value }, 'aqua-client');
      });
    }
  };

  const [agencies, setAgencies] = useState<Agency[]>(persisted?.agencies || []);
  const [activeTemplate, setActiveTemplate] = useState<any>(null);
  const [activeClient, setActiveClient] = useState<Client | null>(null);
  const [customSidebarLinks, setCustomSidebarLinks] = useState<any[]>([]);
  const [customPages, setCustomPages] = useState<any[]>([]);

  // Core Data (Shared across many contexts)
  const [users, setUsersInternal] = useState<AppUser[]>(persisted?.users ?? initialUsers);
  const setUsers = (valOrUpdater: any) => {
    setUsersInternal((prev: any) => {
      const nextVal = typeof valOrUpdater === 'function' ? valOrUpdater(prev) : valOrUpdater;
      syncToDatabase('users', nextVal);
      notifyHost('users', nextVal);
      return nextVal;
    });
  };

  const [clients, setClientsInternal] = useState<Client[]>(persisted?.clients ?? initialClients);
  const setClients = (valOrUpdater: any) => {
    setClientsInternal((prev: any) => {
      const nextVal = typeof valOrUpdater === 'function' ? valOrUpdater(prev) : valOrUpdater;
      syncToDatabase('clients', nextVal);
      notifyHost('clients', nextVal);
      return nextVal;
    });
  };

  const [activityLogs, setActivityLogs] = useState<LogEntry[]>(initialActivityLogs);
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);
  const [integrations, setIntegrations] = useState<any[]>(initialIntegrations);
  const [projects, setProjects] = useState<any[]>(initialProjects);
  const [projectTasks, setProjectTasks] = useState<any[]>(initialProjectTasks);
  const [tickets, setTickets] = useState<any[]>(initialTickets);
  const [deals, setDeals] = useState<any[]>(initialDeals);
  const [todos, setTodos] = useState<any[]>(initialTodos);
  const [payrollRecords, setPayrollRecords] = useState<any[]>(initialPayrollRecords);
  const [invoices, setInvoices] = useState<any[]>(initialInvoices);
  const [ydiAllowances, setYdiAllowances] = useState<any[]>(initialYdiAllowances);
  const [setSailGifts, setSetSailGifts] = useState<any[]>(initialSetSailGifts);
  const [affiliateAccounts, setAffiliateAccounts] = useState<any[]>([]);
  const [approvalRequests, setApprovalRequests] = useState<any[]>([]);
  const [riskAssessments, setRiskAssessments] = useState<any[]>([]);
  const [sops, setSops] = useState<any[]>([]);
  const [productionQueueGroup, setProductionQueueGroup] = useState<any>({ open: [], inProgress: [], completed: [] });
  const [shipmentsGroup, setShipmentsGroup] = useState<any>({ outgoing: [], incoming: [], completed: [] });
  const [inventoryGroup, setInventoryGroup] = useState<any>({ inStock: [], outOfStock: [], reorder: [] });
  const [strategicProjections, setStrategicProjections] = useState<any>({ monthly: [], quarterly: [], yearly: [] });
  const [conversations, setConversations] = useState<any[]>(initialConversations);
  
  // Shared Infrastructure Settings
  const [agencyConfig, setAgencyConfigInternal] = useState<any>(persisted?.agencyConfig || defaultAgencyConfig);
  const setAgencyConfig = (valOrUpdater: any) => {
    setAgencyConfigInternal((prev: any) => {
      const nextVal = typeof valOrUpdater === 'function' ? valOrUpdater(prev) : valOrUpdater;
      syncToDatabase('agencyConfig', nextVal);
      notifyHost('agencyConfig', nextVal);
      return nextVal;
    });
  };


  const [confirmationConfig, setConfirmationConfig] = useState<any>(null);
  const [agencyMessages, setAgencyMessages] = useState<any[]>([]);
  const [userThemes, setUserThemes] = useState<any[]>([]);

  // ── Micro-App Toggling State ───────────────────────────────────────────────
  // Always merge the canonical default list with any persisted customisations so
  // that new suite IDs added to agencyConfig.ts are never blocked by stale localStorage.
  const [enabledSuiteIds, setEnabledSuiteIds] = useState<string[]>(() => {
    const defaultIds: string[] = defaultAgencyConfig.enabledSuiteIds ?? [];
    const persistedIds: string[] = persisted?.enabledSuiteIds ?? [];
    return Array.from(new Set([...defaultIds, ...persistedIds]));
  });

  const toggleSuite = (suiteId: string, clientId?: string) => {
    const targetClientId = clientId || activeClient?.id;

    if (targetClientId) {
      setClients(prev => {
        const next = prev.map(c => {
          if (c.id === targetClientId) {
            const nextSuites = c.enabledSuiteIds.includes(suiteId)
              ? c.enabledSuiteIds.filter(id => id !== suiteId)
              : [...c.enabledSuiteIds, suiteId];
            addLog('System', `${c.enabledSuiteIds.includes(suiteId) ? 'Disabled' : 'Enabled'} suite [${suiteId}] for client: ${c.name}`, 'action', c.id);
            return { ...c, enabledSuiteIds: nextSuites };
          }
          return c;
        });
        return next;
      });
    } else {
      setEnabledSuiteIds(prev => {
        const next = prev.includes(suiteId) 
          ? prev.filter(id => id !== suiteId)
          : [...prev, suiteId];
        
        addLog('System', `${prev.includes(suiteId) ? 'Disabled' : 'Enabled'} global suite: ${suiteId}`, 'action');
        return next;
      });
    }
  };

  const [currentUserEmail, setCurrentUserEmail] = useState<string>(persisted?.currentUserEmail || '');

  // ── Bridge Session ────────────────────────────────────────────────────────
  // The BridgeSession is the authoritative state after login.
  // It drives: who the user is, what agency they belong to, which suites they can access.
  const [bridgeSession, setBridgeSession] = useState<BridgeSession | null>(
    persisted?.bridgeSession ?? null
  );

  /**
   * Called by useRevenueAuth immediately after a successful login,
   * OR by the EmbedPage when receiving a session from the Host Shell.
   * 
   * Pushes the full session into app state so everything downstream
   * reacts to the real user identity and permissions.
   */
  const onSessionEstablished = (session: BridgeSession) => {
    setBridgeSession(session);
    setActiveAgencyId(session.agency.id);
    
    // Auto-transition to portal step for iframed apps
    if (session) {
      setStep('portal');
    }

    // Session's enabledSuiteIds drives suite access — '*' means all suites
    if (session.enabledSuiteIds && session.enabledSuiteIds[0] !== '*') {
      setEnabledSuiteIds(prev => Array.from(new Set([...prev, ...session.enabledSuiteIds])));
    }
    
    // Sync initial data from Bridge for this agency
    BridgeAPI.getInitialState(session.agency.id).then(response => {
      if (response.success && response.state?.initialData) {
        const { users: u, clients: c, activityLogs: al, notifications: n } = response.state.initialData;
        if (u?.length)  setUsers(u);
        if (c?.length)  setClients(c);
        if (al?.length) setActivityLogs(al);
        if (n?.length)  setNotifications(n);
        addLog('Bridge', `Session established for ${session.user.email} (${session.agency.name})`, 'system');
      }
    });
  };

  // Core Logging Helpers (Kept in shell as they are cross-cutting)
  const addLog = (action: string, details: string, type: any = 'system', clientId?: string) => {
    const newLog: LogEntry = { 
      id: Date.now().toString(), 
      timestamp: new Date().toISOString(), 
      userId: 0, // Resolved at useRevenueLogic level 
      userName: 'System', 
      action, 
      details, 
      type 
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  const addAuditLog = (action: string, details: string, module: string, clientId?: string) => {
    return addLog(`AUDIT: ${action}`, `[${module}] ${details}`, 'system', clientId);
  };

  const sendNotification = (userId: number, title: string, message: string, type: any = 'info') => {
    const nextVal = [{ 
      id: `n-${Date.now()}`, 
      userId, title, 
      message, type, 
      read: false, 
      createdAt: new Date().toISOString() 
    }, ...notifications];

    setNotifications(nextVal);
    notifyHost('notifications', nextVal);
  };

  useEffect(() => {
    // Only load seed data if the state is currently empty.
    // This allows persisted state from localStorage to take priority.
    if (users.length === 0 || clients.length === 0) {
      loadSeedData().then(seed => {
        if (seed.users.length > 0) setUsers(seed.users);
        if (seed.clients.length > 0) setClients(seed.clients);
        if (seed.activityLogs.length > 0) setActivityLogs(seed.activityLogs);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run-once seed load on mount; setters are stable
  }, []);

  const handleLogout = () => {
    setCurrentUserEmail('');
    setStep('login');
    addLog('Auth', 'User logged out', 'info');
  };

  /**
   * Handles incoming state updates from the Bridge (Micro-Frontend context).
   * Updates local state without triggering an infinite sync loop.
   */
  const handleExternalStateUpdate = (key: string, value: any) => {
    switch (key) {
      case 'agencyConfig': setAgencyConfigInternal(value); break;
      case 'users': setUsersInternal(value); break;
      case 'clients': setClients(value); break;
      case 'enabledSuiteIds': setEnabledSuiteIds(value); break;
      case 'activeClient': setActiveClient(value); break;
      case 'bridgeSession': setBridgeSession(value); break;
      case 'notifications': setNotifications(value); break;
      default: console.warn(`[Bridge] Unhandled external sync key: ${key}`);
    }
  };

  const maskPII = (text: string, type?: string): string => {
    if (!text) return '';
    if (type === 'email') {
      const atIdx = text.indexOf('@');
      if (atIdx < 0) return text.replace(/.(?=.{4})/g, '*');
      const local = text.slice(0, atIdx);
      const domain = text.slice(atIdx);
      const visible = Math.min(2, local.length);
      return `${local.slice(0, visible)}${'*'.repeat(Math.max(local.length - visible, 2))}${domain}`;
    }
    if (type === 'phone') {
      return text.replace(/\d(?=\d{4})/g, '*');
    }
    if (text.length <= 4) return '****';
    return `${text.slice(0, 2)}${'*'.repeat(text.length - 4)}${text.slice(-2)}`;
  };

  return {
    step, setStep,
    appMode, setAppMode,
    portalTier, setPortalTier,
    designMode, setDesignMode,
    masterConfig, setMasterConfig,
    users, setUsers,
    clients, setClients,
    activityLogs, setActivityLogs,
    notifications, setNotifications,
    integrations, setIntegrations,
    projects, setProjects,
    projectTasks, setProjectTasks,
    tasks: projectTasks,
    setTasks: setProjectTasks,
    tickets, setTickets,
    deals, setDeals,
    todos, setTodos,
    payrollRecords, setPayrollRecords,
    invoices, setInvoices,
    ydiAllowances, setYdiAllowances,
    setSailGifts, setSetSailGifts,
    affiliateAccounts, setAffiliateAccounts,
    approvalRequests, setApprovalRequests,
    riskAssessments, setRiskAssessments,
    sops, setSops,
    productionQueueGroup, setProductionQueueGroup,
    shipmentsGroup, setShipmentsGroup,
    inventoryGroup, setInventoryGroup,
    strategicProjections, setStrategicProjections,
    conversations, setConversations,
    addLog,
    addAuditLog,
    sendNotification,
    
    // CRM Hub Handlers
    handleUpdateClientStage: (clientId: string, stage: ClientStage | string) => {
      setClients(prev => prev.map(c => c.id === clientId ? { ...c, stage: stage as ClientStage } : c));
      addLog('CRM', `Updated client ${clientId} stage to ${stage}`, 'action');
      if (stage === 'live') {
        sendNotification(0, 'System Alert', `Client ${clientId} is now LIVE. Ready for CMS Provisioning.`, 'info');
      }
    },
    handleProvisionClient: async (clientId: string) => {
      const client = clients.find(c => c.id === clientId);
      if (!client) return;

      try {
        addLog('Provisioning', `Starting CMS setup for ${client.name}`, 'info');
        const result = await BridgeProvisioning.provisionClientInCMS(client);
        
        if (result.success) {
          setClients(prev => prev.map(c => c.id === clientId ? { ...c, cmsProvisioned: true } : c));
          addLog('Provisioning', `Successfully provisioned CMS for ${client.name}`, 'success');
          sendNotification(0, 'Provisioning Success', `${client.name} is now connected to AQUA CMS.`, 'success');
        }
      } catch (err: any) {
        addLog('Provisioning', `Failed to provision CMS: ${err.message}`, 'error');
        sendNotification(0, 'Provisioning Error', err.message, 'error');
      }
    },
    handleEditClient: (client: any) => {
      setActiveClient(client);
    },
    handleUploadClientResource: (clientId: string, resource: { name: string; url: string; type: string }) => {
      setClients(prev => prev.map(c =>
        c.id === clientId ? { ...c, resources: [...(c.resources || []), resource] } : c
      ));
      addLog('CRM', `Uploaded resource for client ${clientId}`, 'action');
    },
    handleAssignEmployeeToClient: (clientId: string, employeeId: number, isChecked: boolean) => {
      setClients(prev => prev.map(c =>
        c.id === clientId
          ? { ...c, assignedEmployees: isChecked
              ? [...(c.assignedEmployees || []), employeeId]
              : (c.assignedEmployees || []).filter((id: number) => id !== employeeId) }
          : c
      ));
      addLog('CRM', `${isChecked ? 'Assigned' : 'Unassigned'} employee ${employeeId} for client ${clientId}`, 'action');
    },
    handleImpersonate: (clientId: string) => {
      // This will be overridden in useRevenueLogic with actual auth/shell logic, 
      // but provided here for initial state consistency.
    },
    
    activeAgencyId, setActiveAgencyId,
    agencies, setAgencies,
    activeTemplate, setActiveTemplate,
    activeClient, setActiveClient,
    customSidebarLinks, setCustomSidebarLinks,
    customPages, setCustomPages,
    agencyConfig, setAgencyConfig,
    confirmationConfig, setConfirmationConfig,
    agencyMessages, setAgencyMessages,
    userThemes, setUserThemes,
    maskPII,
    enabledSuiteIds, setEnabledSuiteIds,
    handleLogout,
    handleExternalStateUpdate,
    toggleSuite,
    setCurrentUserEmail,
    currentUserEmail,
    bridgeSession,
    onSessionEstablished,
    // Expose current agency from session (falls back to local default)
    currentAgency: bridgeSession?.agency ?? { id: activeAgencyId, name: 'Aqua Agency', isConfigured: true },
    adminStats: { 
      totalUsers: (users || []).length, 
      activeClients: (clients || []).length,
    },
  };
}

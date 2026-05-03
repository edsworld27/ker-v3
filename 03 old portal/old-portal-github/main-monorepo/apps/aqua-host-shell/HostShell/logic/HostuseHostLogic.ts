import { useState, useRef } from 'react';
import { useHostCore } from '@HostShell/logic/HostuseHostCore';
import { useHostAuth } from '@HostShell/logic/HostuseHostAuth';
import { useHostShellLogic } from '@HostShell/logic/HostuseHostShellLogic';

// --- MOCK STUBS FOR TEMPLATE LOGIC ---
const useClientLogicStub = (_clients: any, _setClients: any, _addLog: any) => ({
  handleUpdateClientStage: () => {}, handleEditClient: () => {}, handleUploadClientResource: () => {},
  handleUpdateClientSettings: () => {}, handleAddClientUser: () => {}, handleRemoveClientUser: () => {}
});
const useDesignLogicStub = (_addLog: any) => ({
  handleSaveLayout: () => {}, handleDeleteLayout: () => {}, handleSaveCustomPage: () => {}
});
const useSetupLogicStub = (_setStep: any, _addLog: any) => ({
  handleCompleteSetup: () => {}
});
const useUserLogicStub = (_setUsers: any, _addLog: any) => ({
  handleDeleteUser: () => {}
});

const LS_KEY = 'aqua_portal_state';

function loadPersistedState() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

/**
 * useHostLogic (The Facade Orchestrator)
 * 
 * This version is STUBBED to allow the HostApp Shell to boot without templates.
 */
export function useHostLogic() {
  const persisted = loadPersistedState();
  const [portalMode, setHostPortalModeInternal] = useState<'demo' | 'user'>(persisted?.portalMode ?? 'user');

  // 1. Core Logic (Data persistence, global records)
  const core = useHostCore(persisted);
  const {
    users, setUsers, clients, setClients, addLog,
    sendNotification, setCurrentUserEmail, setStep,
    agencyConfig, setAgencyConfig, setActivityLogs,
    setNotifications, currentUserEmail,
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
    handleUpdateClientStage, handleEditClient,
    handleUploadClientResource, handleAssignEmployeeToClient,
    onSessionEstablished, bridgeSession,
  } = core;

  // 2. Auth Logic (Identity, Impersonation)
  // Note: savePersistedState is defined later in this function but we forward-ref it
  const savePersistedStateRef = useRef<() => void>(() => {});
  const auth = useHostAuth(persisted, {
    users,
    currentUserEmail,
    addLog,
    sendNotification,
    setCurrentUserEmail,
    onSessionEstablished,
    setStep,
    savePersistedState: () => savePersistedStateRef.current()
  });
  const { currentUser } = auth;

  // 3. Shell Logic (Navigation, UI Layout)
  const shell = useHostShellLogic(persisted, { addLog });

  // 4. Domain Logic (STUBBED)
  const clientLogic = useClientLogicStub(clients, setClients, addLog);
  const designLogic = useDesignLogicStub(addLog);
  const setupLogic = useSetupLogicStub(setStep, addLog);
  const userLogic = useUserLogicStub(setUsers, addLog);

  // ── Demo Mode Engine ──────────────────────────────────────────────────────
  const setDemoState = () => {
    import('@HostShell/bridge/demo/HostdemoState').then(module => {
      const { DEMO_SESSION, DEMO_INITIAL_DATA } = module;
      // Use Bridge's DEMO_SESSION as the authoritative session
      core.onSessionEstablished(DEMO_SESSION);
      core.setUsers(DEMO_INITIAL_DATA.users);
      core.setClients(DEMO_INITIAL_DATA.clients);
      core.setActivityLogs(DEMO_INITIAL_DATA.activityLogs);
      core.setNotifications(DEMO_INITIAL_DATA.notifications);
      core.setCurrentUserEmail(DEMO_SESSION.user.email);
      addLog('System', 'Initialized Demo Experience (Bridge DEMO_SESSION)', 'info');
    });
  };

  const setHostPortalMode = (mode: 'demo' | 'user') => {
    setHostPortalModeInternal(mode);
    if (mode === 'demo') {
      setDemoState();
    }
  };

  // ── Missing HostContext members ────────────────────────────────────────────
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const handleToggle = (id: string) => {
    setExpandedItems(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleImpersonate = (clientId: string) => {
    auth.setImpersonatingClientId(clientId);
    shell.handleViewChange('dashboard');
    addLog('Impersonation', `Started impersonating client: ${clientId}`, 'system');
  };

  // currentAgency: Bridge session is the most authoritative source.
  // Falls back to agencies list, then agencyConfig identity.
  const currentAgency = core.bridgeSession?.agency
    ?? core.agencies.find((a: any) => a.id === core.activeAgencyId)
    ?? { id: core.activeAgencyId, name: core.agencyConfig?.identity?.name || 'HostAqua Agency', logo: core.agencyConfig?.identity?.logo || '', isConfigured: true };

  // ── Persisted State Save ──────────────────────────────────────────────────
  const savePersistedState = () => {
    try {
      const snapshot = {
        portalMode,
        currentUserEmail: core.currentUserEmail,
        bridgeSession: core.bridgeSession,
        portalView: shell.portalView,
        sidebarCollapsed: shell.sidebarCollapsed,
        enabledSuiteIds: core.enabledSuiteIds,
        agencyConfig: core.agencyConfig,
        setupComplete: true,
      };
      localStorage.setItem(LS_KEY, JSON.stringify(snapshot));
    } catch { /* ignore */ }
  };
  // Keep ref in sync so useHostAuth can call it
  savePersistedStateRef.current = savePersistedState;

  // ── Perspective Helpers ───────────────────────────────────────────────────
  const roleId = currentUser?.customRoleId || currentUser?.role || 'AgencyEmployee';
  const roleConfig = agencyConfig?.roles?.[roleId];

  const isAgencyRole = roleConfig?.isInternalStaff || false;
  const isAgencyAdmin = roleConfig?.canManageUsers || false;
  const canCurrentUserImpersonate = roleConfig?.canImpersonate || false;

  const viewTitleLabel = (shell.portalView || 'Dashboard')
    .split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  const hasPermission = (view: string) => {
    if (portalMode === 'demo') return true;
    
    // Resolve the effective user's role configuration
    const roleId = currentUser?.customRoleId || currentUser?.role || 'AgencyEmployee';
    const roleConfig = agencyConfig?.roles?.[roleId];

    if (!roleConfig) return false;

    // 1. Super-Admin / Founder Override
    if (roleConfig.isFounder) return true;

    // 2. Explicit Allowed Views check
    if (roleConfig.allowedViews === '*') return true;
    if (Array.isArray(roleConfig.allowedViews)) {
      return roleConfig.allowedViews.includes(view);
    }

    return false;
  };

  const handleGenericAction = (action: string, details?: string) => {
    addLog(action, details || action, 'action');
  };

  return {
    ...core,
    ...auth,
    ...shell,
    ...clientLogic,
    ...designLogic,
    ...setupLogic,
    ...userLogic,
    hasPermission,
    currentUser,
    userProfile: currentUser,
    isAgencyRole,
    isAgencyAdmin,
    canCurrentUserImpersonate,
    roleConfig,
    viewTitleLabel,
    activeClient: core.clients.find((c: any) => c.id === auth.impersonatingClientId) || null,
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
    handleUpdateClientStage,
    handleEditClient,
    handleUploadClientResource,
    handleAssignEmployeeToClient,
    portalMode,
    setHostPortalMode,
    activityLogs: core.activityLogs,
    notifications: core.notifications,
    integrations: core.integrations,
    // Explicitly surface missing context members
    currentAgency,
    expandedItems,
    setExpandedItems,
    handleToggle,
    handleImpersonate,
    savePersistedState,
    handleGenericAction,
    handleLogout: () => {
      auth.setImpersonatedUserEmail(null);
      auth.setImpersonatingClientId(null);
      core.handleLogout();
    }
  };
}

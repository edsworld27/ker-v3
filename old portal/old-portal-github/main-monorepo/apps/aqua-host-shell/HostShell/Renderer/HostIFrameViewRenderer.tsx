'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useHostContext } from '@HostShell/bridge/HostContext';
import { 
  sendBridgeMessage, 
  onBridgeMessage, 
  BridgeAuthPayload, 
  BridgeThemePayload 
} from '@aqua/bridge/postMessage';

/**
 * APP_VIEW_MAP
 * 
 * Maps every view ID in the sidebar to the micro-frontend app
 * that owns it. The host shell uses this to determine which 
 * iframe to render for each view.
 */
const APP_VIEW_MAP: Record<string, { app: string; port: number }> = {
  // ── Micro-HostApp Roots (Full Suite Access) ─────────────────────────────────
  'app-client':          { app: 'aqua-client', port: 3002 },
  'app-crm':             { app: 'aqua-crm', port: 3003 },
  'app-operations':      { app: 'aqua-operations', port: 3004 },

  // ── Client HostApp (port 3002) ─────────────────────────────────────────────
  'agency-clients':      { app: 'aqua-client', port: 3002 },
  'phases-hub':          { app: 'aqua-client', port: 3002 },
  'client-resources':    { app: 'aqua-client', port: 3002 },
  'client-dashboard':    { app: 'aqua-client', port: 3002 },
  'portal':              { app: 'aqua-client', port: 3002 },
  'onboarding':          { app: 'aqua-client', port: 3002 },
  'support':             { app: 'aqua-client', port: 3002 },
  'WebStudioDashboard':  { app: 'aqua-client', port: 3002 },
  'WebsiteAnalytics':    { app: 'aqua-client', port: 3002 },
  'PayloadEditor':       { app: 'aqua-client', port: 3002 },

  // ── CRM HostApp (port 3003) ────────────────────────────────────────────────
  'crm-dashboard':       { app: 'aqua-crm', port: 3003 },

  // ── Operations HostApp (port 3004) ─────────────────────────────────────────
  'dashboard':           { app: 'aqua-operations', port: 3004 },
  'template-hub':        { app: 'aqua-operations', port: 3004 },
  'staff-portal':        { app: 'aqua-operations', port: 3004 },
  'employee-hub':        { app: 'aqua-operations', port: 3004 },
  'hr-suite':            { app: 'aqua-operations', port: 3004 },
  'payroll-suite':       { app: 'aqua-operations', port: 3004 },
  'finance-suite':       { app: 'aqua-operations', port: 3004 },
  'revenue-suite':       { app: 'aqua-operations', port: 3004 },
  'operations-suite':    { app: 'aqua-operations', port: 3004 },
  'project-hub':         { app: 'aqua-operations', port: 3004 },
  'incubator':           { app: 'aqua-operations', port: 3004 },
  'founder-hub':         { app: 'aqua-operations', port: 3004 },
  'support-suite':       { app: 'aqua-operations', port: 3004 },
  'global-settings':     { app: 'aqua-operations', port: 3004 },
  'integrations':        { app: 'aqua-operations', port: 3004 },
  'bridge-control':      { app: 'aqua-operations', port: 3004 },
  'agency-configurator': { app: 'aqua-operations', port: 3004 },
  'agency-builder':      { app: 'aqua-operations', port: 3004 },
  'all-users':           { app: 'aqua-operations', port: 3004 },
  'system-hub':          { app: 'aqua-operations', port: 3004 },
  'control-center':      { app: 'aqua-operations', port: 3004 },
};

/**
 * Resolve the iframe URL for a given view ID.
 * Intelligently routes between apps using environment variables in production,
 * falling back to local development ports.
 */
function getEmbedUrl(viewId: string): string {
  const mapping = APP_VIEW_MAP[viewId];
  const app = mapping?.app || 'aqua-operations';
  const defaultPort = mapping?.port || 3004;

  // 1. Check for App-specific Env Var
  // e.g. NEXT_PUBLIC_CLIENT_URL, NEXT_PUBLIC_CRM_URL, NEXT_PUBLIC_OPS_URL
  const envKey = `NEXT_PUBLIC_${app.split('-')[1].toUpperCase()}_URL`;
  const envUrl = process.env[envKey];

  if (envUrl) {
    return `${envUrl}/embed/${viewId}`;
  }

  // 2. Fallback to Localhost Dev Port
  return `http://localhost:${defaultPort}/embed/${viewId}`;
}

interface IFrameViewRendererProps {
  viewId: string;
}

/**
 * IFrameViewRenderer — The Heart of the Micro-Frontend Shell.
 * 
 * Renders the target app inside a seamless, borderless iframe.
 * On load, it sends the host's auth state, theme, and active client
 * to the embedded app via the Bridge postMessage protocol.
 */
export const IFrameViewRenderer: React.FC<IFrameViewRendererProps> = ({ viewId }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  const {
    currentUser,
    agencyConfig,
    activeClient,
    impersonatingClientId,
    handleViewChange,
  } = useHostContext();

  const embedUrl = getEmbedUrl(viewId);

  // Send auth + theme to the iframe once it's signaled readiness
  useEffect(() => {
    if (!isReady || !iframeRef.current?.contentWindow) return;

    const iframe = iframeRef.current.contentWindow;

    // 1. Send Auth
    const authPayload: BridgeAuthPayload = {
      user: {
        id: String(currentUser?.id ?? ''),
        email: currentUser?.email || '',
        name: currentUser?.name || '',
        role: currentUser?.role || '',
        customRoleId: currentUser?.customRoleId,
      },
      permissions: {
        allowedViews: '*',
        isFounder: true,
        isInternalStaff: true,
        canImpersonate: true,
      },
      activeClient: activeClient ? {
        id: activeClient.id,
        name: activeClient.name,
        stage: activeClient.stage,
        enabledSuiteIds: activeClient.enabledSuiteIds || [],
      } : null,
      impersonatingClientId,
    };
    sendBridgeMessage(iframe, 'BRIDGE_AUTH', authPayload, 'aqua-host');

    // 2. Send Theme
    const themePayload: BridgeThemePayload = {
      primaryColor: agencyConfig?.identity?.primaryColor || '#6366f1',
      secondaryColor: agencyConfig?.identity?.secondaryColor || '#10b981',
      bgBase: '#0a0a0b',
      textPrimary: '#ffffff',
      fontFamily: agencyConfig?.identity?.fontFamily || 'Inter, sans-serif',
    };
    sendBridgeMessage(iframe, 'BRIDGE_THEME', themePayload, 'aqua-host');
  }, [isReady, currentUser, agencyConfig, activeClient, impersonatingClientId]);

  // Listen for navigation requests and readiness from embedded apps
  useEffect(() => {
    return onBridgeMessage((msg) => {
      if (msg.type === 'BRIDGE_READY') {
        setIsReady(true);
      }
      if (msg.type === 'BRIDGE_NAVIGATE') {
        handleViewChange(msg.payload.viewId);
      }
      if (msg.type === 'BRIDGE_STATE_UPDATED') {
        const { key, value } = msg.payload;
        (useHostContext as any)().handleExternalStateUpdate(key, value);
      }
    }, ['BRIDGE_READY', 'BRIDGE_NAVIGATE', 'BRIDGE_STATE_UPDATED']);
  }, [handleViewChange]);

  return (
    <div className="relative w-full h-full">
      {/* Loading State */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0c]/80 z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-7 h-7 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-medium text-slate-400">
              Loading {APP_VIEW_MAP[viewId]?.app || viewId}…
            </span>
          </div>
        </div>
      )}

      {/* The Iframe */}
      <iframe
        ref={iframeRef}
        src={embedUrl}
        className="w-full h-full border-none"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        allow="clipboard-read; clipboard-write"
        style={{ 
          colorScheme: 'dark',
          background: 'transparent',
        }}
      />
    </div>
  );
};

export { APP_VIEW_MAP, getEmbedUrl };

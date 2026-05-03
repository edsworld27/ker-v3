'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useAppContext } from '@OpsHubShell/bridge/OpsHubAppContext';
import { 
  sendBridgeMessage, 
  onBridgeMessage, 
  BridgeAuthPayload, 
  BridgeThemePayload 
} from '@aqua/bridge/postMessage';

/**
 * APP_VIEW_MAP (Operations Sub-App Mapping)
 * 
 * Maps internal operations views to their specific micro-frontend apps.
 */
const APP_VIEW_MAP: Record<string, { app: string; port: number }> = {
  // People/HR (Port 3005)
  'hr-suite':            { app: 'aqua-ops-people', port: 3005 },
  'payroll-suite':       { app: 'aqua-ops-people', port: 3005 },
  'staff-portal':        { app: 'aqua-ops-people', port: 3005 },
  'employee-hub':        { app: 'aqua-ops-people', port: 3005 },
  
  // Finance (Port 3006)
  'finance-suite':       { app: 'aqua-ops-finance', port: 3006 },
  'billing-suite':       { app: 'aqua-ops-finance', port: 3006 },
  
  // Revenue/Sales (Port 3007)
  'revenue-suite':       { app: 'aqua-ops-revenue', port: 3007 },
  'sales-dashboard':     { app: 'aqua-ops-revenue', port: 3007 },
};

function getEmbedUrl(viewId: string): string {
  const mapping = APP_VIEW_MAP[viewId];
  if (!mapping) return '';
  
  const app = mapping.app;
  const defaultPort = mapping.port;

  // Check for app-specific env var (e.g. NEXT_PUBLIC_PEOPLE_URL)
  const envSuffix = app.split('-').pop()?.toUpperCase();
  const envUrl = process.env[`NEXT_PUBLIC_${envSuffix}_URL`];

  if (envUrl) {
    return `${envUrl}/embed/${viewId}`;
  }

  return `http://localhost:${defaultPort}/embed/${viewId}`;
}

interface IFrameViewRendererProps {
  viewId: string;
}

/**
 * IFrameViewRenderer (Operations Hub)
 * 
 * Orchestrates the sub-iframes for HR, Finance, and Revenue.
 * It passes through authentication and theme state from the parent 
 * (Host Shell) down to the child micro-apps.
 */
export const IFrameViewRenderer: React.FC<IFrameViewRendererProps> = ({ viewId }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isReady, setIsReady] = useState(false);
  
  const ctx = useAppContext();
  const embedUrl = getEmbedUrl(viewId);

  // Sync Auth + Theme to Sub-App
  useEffect(() => {
    if (!isReady || !iframeRef.current?.contentWindow) return;

    const iframe = iframeRef.current.contentWindow;

    // 1. Pass Auth (Reconstructed from our context, which came from 3001)
    const authPayload: BridgeAuthPayload = {
      user: {
        id: String(ctx.currentUser?.id ?? ''),
        email: ctx.currentUser?.email || '',
        name: ctx.currentUser?.name || '',
        role: ctx.currentUser?.role || '',
        customRoleId: ctx.currentUser?.customRoleId,
      },
      permissions: {
        allowedViews: '*',
        isFounder: true,
        isInternalStaff: true,
        canImpersonate: true,
      },
      activeClient: ctx.activeClient ? {
        id: ctx.activeClient.id,
        name: ctx.activeClient.name,
        stage: ctx.activeClient.stage,
        enabledSuiteIds: ctx.activeClient.enabledSuiteIds || [],
      } : null,
      impersonatingClientId: ctx.impersonatingClientId,
    };
    sendBridgeMessage(iframe, 'BRIDGE_AUTH', authPayload, 'aqua-operations');

    // 2. Pass Theme
    const themePayload: BridgeThemePayload = {
      primaryColor: '#6366f1', // Fallback defaults
      secondaryColor: '#10b981',
      bgBase: '#0a0a0b',
      textPrimary: '#ffffff',
      fontFamily: 'Inter, sans-serif',
    };
    sendBridgeMessage(iframe, 'BRIDGE_THEME', themePayload, 'aqua-operations');
  }, [isReady, ctx.currentUser, ctx.activeClient, ctx.impersonatingClientId]);

  // Listen for children
  useEffect(() => {
    return onBridgeMessage((msg) => {
      if (msg.type === 'BRIDGE_READY') {
        setIsReady(true);
      }
      if (msg.type === 'BRIDGE_NAVIGATE') {
         // Recursive Navigation: Operations Hub notifies its parent (Host Shell) 
         // that a global view change is requested.
         if (typeof window !== 'undefined' && window.parent !== window) {
           sendBridgeMessage(window.parent, 'BRIDGE_NAVIGATE', msg.payload, 'aqua-operations');
         }
      }
    }, ['BRIDGE_READY', 'BRIDGE_NAVIGATE']);
  }, []);

  if (!embedUrl) return null;

  return (
    <div className="relative w-full h-full min-h-[600px]">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0c]/80 z-10 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="w-7 h-7 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-medium text-slate-400">
              Initializing {viewId}…
            </span>
          </div>
        </div>
      )}

      <iframe
        ref={iframeRef}
        src={embedUrl}
        className="w-full h-full border-none rounded-2xl md:rounded-[2rem] overflow-hidden shadow-2xl"
        onLoad={() => setIsLoaded(true)}
        allow="clipboard-read; clipboard-write"
        style={{ colorScheme: 'dark' }}
      />
    </div>
  );
};

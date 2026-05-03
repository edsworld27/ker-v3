'use client';

import { useEffect, useState } from 'react';
import { HostProvider } from '@HostShell/bridge/HostContext';
// Initialize Bridge
import { useHostLogic } from '@HostShell/logic/HostuseHostLogic';
import { HostFrame } from '@HostShell/AppFrame/HostAppFrame';
import { HostBridgeHub } from '@HostShell/bridge/HostBridgeHub';

interface HostHostAppProps {
  mode?: 'demo' | 'user';
  initialView?: string;
}

/**
 * HostHostApp — The Global Orchestrator Entry Point.
 * 
 * This is the 'Iframe Master'. It coordinates the authentication and 
 * view state across all isolated micro-apps (Client, CRM, Operations).
 */
export default function HostApp({ mode: initialMode = 'user', initialView }: HostHostAppProps) {
  const logic = useHostLogic();

  // Host shell is always ready — no templates to load
  const [templatesReady] = useState(true);

  const {
    step, setStep,
    portalView, setHostPortalView,
    agencyConfig,
    currentUser,
    handleLogout,
    portalMode,
    setHostPortalMode,
    handleViewChange,
  } = logic;

  // Listen for cross-suite navigation requests dispatched by plugin views
  // (e.g. the Operations overview cards). Plugins can't import the host
  // context directly, so they fire a global `aqua:nav` CustomEvent and we
  // route it through handleViewChange here.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onNav = (e: Event) => {
      const detail = (e as CustomEvent<{ viewId?: string }>).detail;
      if (detail?.viewId && handleViewChange) {
        handleViewChange(detail.viewId);
      }
    };
    window.addEventListener('aqua:nav', onNav);
    return () => window.removeEventListener('aqua:nav', onNav);
  }, [handleViewChange]);

  // Sync initial mode
  useEffect(() => {
    if (initialMode && initialMode !== portalMode) {
      setHostPortalMode(initialMode);
    }
  }, [initialMode, portalMode, setHostPortalMode]);

  // ── Mode Synchronization ──────────────────────────────────────────────────
  useEffect(() => {
    if (portalMode === 'demo' && templatesReady) {
      // In demo mode, we force the user into the portal step immediately
      if (step !== 'portal') {
        setStep('portal');
      }
      if (initialView && initialView !== portalView) {
        setHostPortalView(initialView);
      }
    }
  }, [portalMode, initialView, portalView, setHostPortalView, setStep, step, templatesReady]);

  // ── Theme Synchronization (Host-Specific Variables) ─────────────────────────
  useEffect(() => {
    const root = document.documentElement;
    if (agencyConfig?.identity) {
      root.style.setProperty('--host-widget-primary-color-1', agencyConfig.identity.primaryColor || '#4f46e5');
      root.style.setProperty('--host-secondary-color', agencyConfig.identity.secondaryColor || '#10b981');
    }
  }, [agencyConfig?.identity]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const hostContextValue = {
    ...logic,
  };

  // ── Render Strategy ────────────────────────────────────────────────────────
  return (
    <HostProvider value={hostContextValue as any}>
      <HostBridgeHub>
        <HostFrame portalMode={portalMode} />
      </HostBridgeHub>
    </HostProvider>
  );
}

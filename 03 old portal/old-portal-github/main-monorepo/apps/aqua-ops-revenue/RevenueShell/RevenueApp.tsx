'use client';

import { useEffect, useState } from 'react';
import { RevenueProvider } from '@RevenueShell/bridge/RevenueContext';
// Initialize Bridge
import { useRevenueLogic } from '@RevenueShell/logic/RevenueuseRevenueLogic';
import { RevenueFrame } from '@RevenueShell/AppFrame/RevenueAppFrame';
import { RevenueBridgeHub } from '@RevenueShell/bridge/RevenueBridgeHub';

interface AppProps {
  mode?: 'demo' | 'user';
  initialView?: string;
}

/**
 * App — The Root Entry Point of the Aqua Portal Shell.
 * 
 * Responsibilities:
 * 1. Initialize global application logic (Core, Auth, Shell).
 * 2. Handle Entry Modes (Demo vs User).
 * 3. Provide the RevenueContext to all downstream components.
 * 4. Sync global theme variables (CSS custom properties).
 */
export default function App({ mode: initialMode = 'user', initialView }: AppProps) {
  const logic = useRevenueLogic();

  const [templatesReady, setTemplatesReady] = useState(false);

  // Initialize Template Registry once on startup (async — lazy chunks)
  useEffect(() => {
    import('@RevenueShell/RevenueTemplates/Revenueindex')
      .then(m => m.registerRevenueApp())
      .then(() => setTemplatesReady(true))
      .catch(err => {
        console.error('[App] Template initialization error:', err);
        setTemplatesReady(true); // Proceed anyway to show shell fallback
      });
  }, []);

  const {
    step, setStep,
    portalView, setPortalView,
    agencyConfig,
    currentUser,
    handleLogout,
    portalMode,
    setPortalMode,
  } = logic;

  // Sync initial mode
  useEffect(() => {
    if (initialMode && initialMode !== portalMode) {
      setPortalMode(initialMode);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to parent prop changes; portalMode is the target, not a trigger
  }, [initialMode]);

  // ── Mode Synchronization ──────────────────────────────────────────────────
  useEffect(() => {
    if (portalMode === 'demo' && templatesReady) {
      // In demo mode, we force the user into the portal step immediately
      if (step !== 'portal') {
        setStep('portal');
      }
      if (initialView && initialView !== portalView) {
        setPortalView(initialView);
      }
    }
  }, [portalMode, initialView, portalView, setPortalView, setStep, step, templatesReady]);

  // ── Theme Synchronization ──────────────────────────────────────────────────
  useEffect(() => {
    const root = document.documentElement;
    if (agencyConfig?.identity) {
      root.style.setProperty('--revenue-widget-primary-color-1', agencyConfig.identity.primaryColor || '#4f46e5');
      root.style.setProperty('--revenue-secondary-color', agencyConfig.identity.secondaryColor || '#10b981');
    }
  }, [agencyConfig?.identity]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const appContextValue = {
    ...logic,
  };

  // ── Render Strategy ────────────────────────────────────────────────────────
  // If we are in 'user' mode and not logged in (and not in setup), 
  // the RevenueFrame will internally render the Auth views based on the 'step' state.
  
  return (
    <RevenueProvider value={appContextValue as any}>
      <RevenueBridgeHub>
        <RevenueFrame portalMode={portalMode} />
      </RevenueBridgeHub>
    </RevenueProvider>
  );
}

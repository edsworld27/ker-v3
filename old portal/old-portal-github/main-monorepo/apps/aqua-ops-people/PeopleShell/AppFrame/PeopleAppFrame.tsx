/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, ReactNode, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Building2 } from 'lucide-react';
import { usePeopleContext } from '@PeopleShell/bridge/PeopleContext';
import { PeopleSidebarContent } from '../Sidebar/PeopleSidebarContent';
import { DynamicViewRenderer } from '../Renderer/PeopleDynamicViewRenderer';
import { ModalManager } from '@PeopleShell/components/PeopleModalManager';
import { SmartRegistry } from '@PeopleShell/components/PeopleSmartRegistry';
import { PeopleRegistration } from '@PeopleShell/bridge/PeopleRegistration';

// Core Auth Views (Hardcoded in Shell for reliability)
import { WelcomeScreen } from '../components/Auth/PeopleWelcomeScreen';
import { LoginView } from '../components/Auth/PeopleLoginView';
import { SecurityCheckView } from '../components/Auth/PeopleSecurityCheckView';

// ── ViewErrorBoundary ─────────────────────────────────────────────────────────
class ViewErrorBoundary extends Component<{ viewId: string; registryTick: number; children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidUpdate(prev: { viewId: string; registryTick: number }) {
    // Reset on view change or when new templates register (resolves race-condition context errors)
    if (prev.viewId !== this.props.viewId || prev.registryTick !== this.props.registryTick) {
      this.setState({ error: null });
    }
  }
  render() {
    if (this.state.error) {
      const err = this.state.error as Error;
      return (
        <div className="flex flex-col items-center justify-center p-16 text-center">
          <p className="text-xl font-bold text-[var(--people-widget-error)] mb-2">Something went wrong in this view</p>
          <p className="text-sm text-[var(--people-widget-text-muted)] mb-4 font-mono">{err.message}</p>
          <button onClick={() => this.setState({ error: null })} className="px-4 py-2 bg-white/10 rounded-[var(--radius-button)] text-sm">Try again</button>
        </div>
      );
    }
    return this.props.children;
  }
}

interface PeopleFrameProps {
  portalMode: 'demo' | 'user';
}

/**
 * PeopleFrame — The Structural Host
 * 
 * This component handles the high-level layout transitions.
 * Entry views (Login, Welcome) are baked into the shell for immediate availability.
 * Domain views are resolved via the Bridge.
 */
export const PeopleFrame: React.FC<PeopleFrameProps> = ({ portalMode }) => {
  // Track PeopleRegistration updates so ViewErrorBoundary auto-resets on template load
  const [registryTick, setRegistryTick] = useState(0);
  useEffect(() => PeopleRegistration.subscribe(() => setRegistryTick(t => t + 1)), []);

  const {
    step,
    portalView,
    mfaVerified,
    currentUser,
    loginPortalType,
    handleCompleteSetup,
    handleLogin,
    handleSignup,
    authError,
    appMode,
    setAppMode,
    isAgencyRole,
    impersonatingClientId,
    impersonatedUserEmail,
    setImpersonatedUserEmail,
    userProfile,
    addLog,
    handleViewChange,
    clients,
    handleStopImpersonating,
  } = usePeopleContext();

  // Resolve remaining shell-specific components via Bridge
  const AgencySetupView = SmartRegistry['AgencySetupView'] || (() => <div className="p-8 text-center">Setup Module Missing</div>);
  const DesignModeInspector = SmartRegistry['DesignModeInspector'] || (() => null);

  return (
    <div className={`relative flex min-h-screen overflow-hidden transition-colors duration-1000 ${step === 'portal' ? 'bg-black' : 'bg-[#0f172a]'}`}>
      <AnimatePresence mode="wait">
        {step === 'welcome' && (
          <motion.div key="welcome" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
            <WelcomeScreen />
          </motion.div>
        )}
        
        {step === 'login' && (
          <LoginView 
            type={loginPortalType} 
            key="login" 
            onLogin={handleLogin} 
            onSignUp={handleSignup} 
            loginError={authError} 
          />
        )}

        {step === 'security' && (
          <SecurityCheckView key="security" />
        )}

        {step === 'setup-wizard' && (
          <motion.div key="setup-wizard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full flex items-center justify-center">
            <AgencySetupView onComplete={handleCompleteSetup} />
          </motion.div>
        )}

        {step === 'portal' && (mfaVerified || portalMode === 'demo') && (
          <motion.div
            key="portal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex w-full h-screen text-white"
          >
            <PeopleSidebarContent />

            <main className="flex-1 overflow-hidden relative bg-black/40 flex flex-col">
              {/* Impersonation banners */}
              {impersonatedUserEmail && (
                <div className="shrink-0 h-10 backdrop-blur-md flex items-center justify-between px-8 text-white z-50"
                     style={{ backgroundColor: 'color-mix(in srgb, var(--people-widget-primary-color-1) 90%, transparent)' }}>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                    <ShieldCheck className="w-4 h-4" />
                    Viewing as {currentUser?.name} ({currentUser?.role})
                  </div>
                  <button
                    onClick={() => {
                      setImpersonatedUserEmail(null);
                      handleViewChange('dashboard');
                      addLog('Impersonation Stopped', `Returned to ${userProfile?.name}'s account`, 'system');
                    }}
                    className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all"
                  >
                    Switch back to my profile
                  </button>
                </div>
              )}

              {impersonatingClientId && !impersonatedUserEmail && (
                <div className="shrink-0 h-10 bg-amber-600/90 backdrop-blur-md flex items-center justify-between px-8 text-white z-50">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                    <Building2 className="w-4 h-4" />
                    Viewing {clients.find(c => c.id === impersonatingClientId)?.name} Workspace
                  </div>
                  <button
                    onClick={handleStopImpersonating}
                    className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all"
                  >
                    Return to Agency Hub
                  </button>
                </div>
              )}

              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <AnimatePresence mode="wait">
                  <ViewErrorBoundary viewId={portalView} registryTick={registryTick} key={portalView}>
                    <DynamicViewRenderer viewId={portalView} key={portalView} />
                  </ViewErrorBoundary>
                </AnimatePresence>
              </div>
            </main>
          </motion.div>
        )}
      </AnimatePresence>

      <ModalManager />
      {step === 'portal' && <DesignModeInspector currentRole={currentUser?.customRoleId || currentUser?.role || ''} />}
    </div>
  );
};

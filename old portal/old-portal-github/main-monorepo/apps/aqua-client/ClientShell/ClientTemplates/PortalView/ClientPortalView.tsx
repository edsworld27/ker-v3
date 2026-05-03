import React, { useRef, useState } from 'react';
import { Fingerprint, Bell, Terminal, Layout as LayoutIcon, Settings } from 'lucide-react';
import { Page, PageHeader, Card, Button, Badge, Avatar } from '@aqua/bridge/ui/kit';
import { usePortalLogic } from './logic/ClientusePortalLogic';
import { DiscoveryClientDashboard } from './components/ClientDiscoveryClientDashboard';
import { DesignClientDashboard } from './components/ClientDesignClientDashboard';
import { DevelopmentClientDashboard } from './components/ClientDevelopmentClientDashboard';
import { OnboardingClientDashboard } from './components/ClientOnboardingClientDashboard';
import { LiveClientDashboard } from './components/ClientLiveClientDashboard';

const PortalView: React.FC = () => {
  const {
    currentUser,
    activeClient,
    isImpersonating,
    handleStopView,
  } = usePortalLogic();

  const [viewMode, setViewMode] = useState<'client' | 'dev'>('client');
  const editorRef = useRef<HTMLDivElement>(null);

  const scrollToEditor = () => {
    editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const toggleViewMode = () => {
    setViewMode(prev => (prev === 'client' ? 'dev' : 'client'));
    setTimeout(scrollToEditor, 100);
  };

  const openNotifications = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('aqua:open-modal', { detail: { name: 'NotificationsModal' } }));
    }
  };

  const openSettings = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('aqua:nav', { detail: { viewId: 'global-settings' } }));
    }
  };

  return (
    <Page>
      {isImpersonating ? (
        <div className="mb-6">
          <Card padding="md" className="border-indigo-500/30 bg-indigo-500/[0.04]">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-300 shrink-0">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <div>
                  <Badge tone="indigo">Impersonating</Badge>
                  <h2 className="text-base font-semibold text-white mt-1.5">
                    Viewing {activeClient?.name || 'Anonymous Entity'} workspace
                  </h2>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleStopView}>
                Stop viewing
              </Button>
            </div>
          </Card>
        </div>
      ) : null}

      <PageHeader
        eyebrow="Client portal"
        title="Command Matrix"
        subtitle="Strategic mission control and operational telemetry across every active client engagement."
        actions={
          <>
            <Button
              variant="primary"
              icon={viewMode === 'client' ? LayoutIcon : Terminal}
              onClick={toggleViewMode}
            >
              {viewMode === 'client' ? 'Focus studio' : 'Focus dev'}
            </Button>
            <Button variant="ghost" icon={Bell} onClick={openNotifications} aria-label="Notifications" />
            <Button variant="ghost" icon={Settings} onClick={openSettings} aria-label="Settings" />
          </>
        }
      />

      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-xs text-emerald-400 font-medium">Sync online</span>
        </div>
        <div className="w-px h-3 bg-white/10" />
        <div className="flex -space-x-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="ring-2 ring-[#0a0a0c] rounded-full">
              <Avatar name={currentUser?.name ?? `User ${i}`} size="sm" />
            </div>
          ))}
          <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-medium text-slate-400 ring-2 ring-[#0a0a0c]">
            +12
          </div>
        </div>
      </div>

      <div ref={editorRef}>
        <section className="space-y-6">
          {activeClient?.stage === 'discovery' && <DiscoveryClientDashboard />}
          {activeClient?.stage === 'design' && <DesignClientDashboard />}
          {activeClient?.stage === 'development' && <DevelopmentClientDashboard />}
          {activeClient?.stage === 'onboarding' && <OnboardingClientDashboard />}
          {(activeClient?.stage === 'live' || !activeClient?.stage) && <LiveClientDashboard />}
        </section>
      </div>
    </Page>
  );
};

export default PortalView;

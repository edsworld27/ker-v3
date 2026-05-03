'use client';
import React from 'react';
import { Code, Rocket, GitPullRequest, TerminalSquare, AlertCircle, Play } from 'lucide-react';
import { Page, Card, Section, Button } from '@aqua/bridge/ui/kit';
import { useAppContext } from '@ClientShell/bridge/ClientAppContext';

export const DevelopmentPhaseView: React.FC = () => {
  const { handleImpersonate, handleViewChange } = useAppContext();

  return (
    <Page>
      <header className="flex items-center gap-4 mb-8 pb-8 border-b border-white/5">
        <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-300">
          <Code className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500 font-medium mb-1">Lifecycle phase</div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">Development</h1>
          <p className="text-sm text-slate-400 mt-1">Engineering and execution.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Section title="Active build" description="Current sprint progress.">
            <Card padding="none">
              <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-blue-500/[0.04]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-300">
                    <Play className="w-4 h-4 fill-current" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Sprint 4 · Routing engine</h4>
                    <p className="text-[11px] text-blue-300 mt-0.5">Ends in 3 days</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-semibold text-white tabular-nums">75%</div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 mt-0.5">Velocity good</div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-2 mb-1">
                    <GitPullRequest className="w-4 h-4 text-emerald-300" />
                    <h5 className="text-sm font-medium text-white">3 PRs merged</h5>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">Authentication and CMS payload bridge completed.</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="w-4 h-4 text-amber-300" />
                    <h5 className="text-sm font-medium text-white">QA initiated</h5>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">Automated end-to-end tests running on staging.</p>
                </div>
              </div>
            </Card>
          </Section>

          <Section title="Client sandbox" description="Generate share links for the staging environment.">
            <Card padding="md">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-300 shrink-0">
                    <TerminalSquare className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-white">Staging environment</h4>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">staging.clientdomain.com</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Generate link</Button>
              </div>
            </Card>
          </Section>
        </div>

        <Card padding="md" className="border-blue-500/20 self-start">
          <div className="flex flex-col items-center text-center">
            <div className="w-11 h-11 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-300 mb-3">
              <Rocket className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1.5">Simulate client view</h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Switch roles to view the portal exactly as the client sees it during active construction.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleImpersonate('client-3')}
              className="w-full mb-2"
            >
              Impersonate demo
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewChange('phases-hub')}
              className="w-full"
            >
              Back to hub
            </Button>
          </div>
        </Card>
      </div>
    </Page>
  );
};

export default DevelopmentPhaseView;

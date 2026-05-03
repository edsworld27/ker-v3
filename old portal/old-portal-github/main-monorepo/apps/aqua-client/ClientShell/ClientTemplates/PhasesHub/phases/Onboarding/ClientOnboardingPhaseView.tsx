'use client';
import React from 'react';
import { UserCheck, Rocket, BookOpen, Key, CheckCircle, Mail } from 'lucide-react';
import { Page, Card, Section, Button, Badge } from '@aqua/bridge/ui/kit';
import { useAppContext } from '@ClientShell/bridge/ClientAppContext';

export const OnboardingPhaseView: React.FC = () => {
  const { handleImpersonate, handleViewChange } = useAppContext();

  return (
    <Page>
      <header className="flex items-center gap-4 mb-8 pb-8 border-b border-white/5">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-300">
          <UserCheck className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500 font-medium mb-1">Lifecycle phase</div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">Onboarding</h1>
          <p className="text-sm text-slate-400 mt-1">Handoff and activation.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Section title="Handoff deliverables" description="Required signoffs before live launch.">
            <Card padding="sm">
              <ul className="divide-y divide-white/5 -mx-2">
                <li className="px-2 py-3 flex items-center justify-between gap-3 bg-emerald-500/[0.06] -mx-2 sm:mx-0 sm:rounded-xl">
                  <div className="flex items-center gap-3 min-w-0 px-2">
                    <CheckCircle className="w-5 h-5 text-emerald-300 shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-white">Final source code transfer</h4>
                      <p className="text-[11px] text-emerald-200/80 mt-0.5">GitHub repository ownership transferred.</p>
                    </div>
                  </div>
                  <Badge tone="success">Verified</Badge>
                </li>
                <li className="px-2 py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-5 h-5 rounded-full border-2 border-white/20 shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-white">Deploy production environment</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Awaiting final DNS propagation from client.</p>
                    </div>
                  </div>
                  <Badge tone="warning">Pending DNS</Badge>
                </li>
                <li className="px-2 py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-5 h-5 rounded-full border-2 border-white/20 shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-white">Sign-off delivery document</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Send final sign-off to stakeholders.</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" icon={Mail}>Send request</Button>
                </li>
              </ul>
            </Card>
          </Section>

          <Section title="Client empowerment" description="Training docs + admin handoff.">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Card padding="md" interactive>
                <div className="flex flex-col items-center text-center gap-2 py-2">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-300">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-semibold text-white">Training docs</h4>
                  <p className="text-[11px] text-slate-400">2 of 4 uploaded</p>
                </div>
              </Card>
              <Card padding="md" interactive>
                <div className="flex flex-col items-center text-center gap-2 py-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-300">
                    <Key className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-semibold text-white">Admin credentials</h4>
                  <p className="text-[11px] text-slate-400">Ready for vault</p>
                </div>
              </Card>
            </div>
          </Section>
        </div>

        <Card padding="md" className="border-emerald-500/20 self-start">
          <div className="flex flex-col items-center text-center">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-300 mb-3">
              <Rocket className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1.5">Simulate client view</h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Switch roles to view the portal exactly as the client sees it during the Onboarding phase.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleImpersonate('client-4')}
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

export default OnboardingPhaseView;

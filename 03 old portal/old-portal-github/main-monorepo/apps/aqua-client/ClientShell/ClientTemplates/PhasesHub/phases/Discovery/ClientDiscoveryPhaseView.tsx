'use client';
import React from 'react';
import { Compass, Rocket, FileText, Video, UploadCloud, ChevronRight } from 'lucide-react';
import { Page, Card, Section, Button, Badge } from '@aqua/bridge/ui/kit';
import { useAppContext } from '@ClientShell/bridge/ClientAppContext';

export const DiscoveryPhaseView: React.FC = () => {
  const { handleImpersonate, handleViewChange } = useAppContext();

  return (
    <Page>
      <header className="flex items-center gap-4 mb-8 pb-8 border-b border-white/5">
        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-300">
          <Compass className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500 font-medium mb-1">Lifecycle phase</div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">Discovery</h1>
          <p className="text-sm text-slate-400 mt-1">Strategic alignment and intake.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Section title="Client intake" description="Forms collected from the client during scoping.">
            <Card padding="sm">
              <ul className="divide-y divide-white/5 -mx-2">
                <li className="px-2 py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-300 shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-medium text-white">Initial discovery questionnaire</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Submitted 2 days ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge tone="success">Completed</Badge>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </div>
                </li>
                <li className="px-2 py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/5 flex items-center justify-center text-slate-400 shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-medium text-white">Technical requirements form</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Awaiting client input</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge tone="warning">Pending</Badge>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </div>
                </li>
              </ul>
            </Card>
          </Section>

          <Section title="Strategy assets" description="Recordings, transcripts, and SOW drafts.">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Card padding="md" interactive>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-300 shrink-0">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Kickoff call recording</h4>
                    <p className="text-xs text-slate-400 mt-1">45 min video &amp; transcript</p>
                  </div>
                </div>
              </Card>
              <Card padding="md" interactive className="border-dashed">
                <div className="flex flex-col items-center justify-center text-center gap-2 py-3">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-slate-400">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-medium text-white">Upload scope of work</h4>
                  <p className="text-[11px] text-slate-500">PDF, DOCX · max 10 MB</p>
                </div>
              </Card>
            </div>
          </Section>
        </div>

        <Card padding="md" className="border-indigo-500/20 self-start">
          <div className="flex flex-col items-center text-center">
            <div className="w-11 h-11 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-300 mb-3">
              <Rocket className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1.5">Simulate client view</h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Switch roles to view the portal exactly as the client sees it during Discovery.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleImpersonate('client-1')}
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

export default DiscoveryPhaseView;

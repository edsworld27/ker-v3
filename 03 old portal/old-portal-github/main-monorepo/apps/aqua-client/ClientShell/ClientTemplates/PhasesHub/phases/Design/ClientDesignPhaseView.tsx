'use client';
import React from 'react';
import { Palette, Rocket, PenTool, Eye, CheckSquare, UploadCloud } from 'lucide-react';
import { Page, Card, Section, Button, Badge } from '@aqua/bridge/ui/kit';
import { useAppContext } from '@ClientShell/bridge/ClientAppContext';

export const DesignPhaseView: React.FC = () => {
  const { handleImpersonate, handleViewChange } = useAppContext();

  return (
    <Page>
      <header className="flex items-center gap-4 mb-8 pb-8 border-b border-white/5">
        <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-300">
          <Palette className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500 font-medium mb-1">Lifecycle phase</div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">Design</h1>
          <p className="text-sm text-slate-400 mt-1">Creative production and review.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Section title="Prototyping &amp; layouts" description="Latest canvas pinned for review.">
            <Card padding="md">
              <div className="relative h-56 rounded-xl overflow-hidden bg-white/[0.02] border border-white/5 group flex items-center justify-center mb-4">
                <PenTool className="w-10 h-10 text-slate-600 group-hover:text-pink-300 transition-colors" />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                  <Button variant="primary" size="sm" icon={Eye}>Open canvas</Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white">Portal v2 main app shell</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Last updated 3 hours ago</p>
                </div>
                <Badge tone="indigo">In review</Badge>
              </div>
            </Card>
          </Section>

          <Section title="Creative assets" description="Brand guidelines and pending approvals.">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Card padding="md" interactive>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-slate-300 shrink-0">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Brand guidelines</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Upload PDF</p>
                  </div>
                </div>
              </Card>
              <Card padding="md" interactive>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-300 shrink-0">
                    <CheckSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Design approvals</h4>
                    <p className="text-[11px] text-amber-300 mt-0.5">2 pending</p>
                  </div>
                </div>
              </Card>
            </div>
          </Section>
        </div>

        <Card padding="md" className="border-pink-500/20 self-start">
          <div className="flex flex-col items-center text-center">
            <div className="w-11 h-11 rounded-xl bg-pink-500/15 border border-pink-500/25 flex items-center justify-center text-pink-300 mb-3">
              <Rocket className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1.5">Simulate client view</h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Switch roles to view the portal exactly as the client sees it during Design iteration.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleImpersonate('client-2')}
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

export default DesignPhaseView;

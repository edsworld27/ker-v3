'use client';
import React, { useRef, useState } from 'react';
import { ShieldCheck, Zap, Database, Terminal, Monitor, ExternalLink } from 'lucide-react';
import { Button, KpiCard } from '@aqua/bridge/ui/kit';
import { EliteSuccessRepository, StrategicLiaisonUplink } from './ClientSharedWidgets';
import { WebStudioView } from '../../WebStudio/ClientWebStudioView';
import { useAppContext } from '@ClientShell/bridge/ClientAppContext';

export const LiveClientDashboard: React.FC = () => {
  const { currentUser } = useAppContext();
  const [viewMode, setViewMode] = useState<'client' | 'dev'>('client');
  const editorRef = useRef<HTMLDivElement>(null);

  const cmsUrl = `/api/users/magic-login?email=${encodeURIComponent(currentUser?.email || '')}&secret=development-secret-key-aqua-cms`;

  const toggleViewMode = () => {
    setViewMode(prev => (prev === 'client' ? 'dev' : 'client'));
    setTimeout(() => {
      editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <div className="space-y-6">
      <section ref={editorRef} className="scroll-mt-12 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-300">
              {viewMode === 'client' ? <Monitor className="w-5 h-5" /> : <Terminal className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                {viewMode === 'client' ? 'Web Studio' : 'Advanced operations'}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {viewMode === 'client'
                  ? 'High-fidelity content management interface'
                  : 'Raw deployment protocols synced 1:1'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'dev' ? 'primary' : 'outline'}
              size="sm"
              icon={Terminal}
              onClick={toggleViewMode}
            >
              {viewMode === 'dev' ? 'Exit dev mode' : 'Dev mode'}
            </Button>
            <a href={cmsUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm" icon={ExternalLink}>
                Full screen
              </Button>
            </a>
          </div>
        </div>

        <div
          className={`overflow-hidden transition-colors duration-300 rounded-2xl border ${
            viewMode === 'client'
              ? 'border-white/5 bg-white shadow-2xl'
              : 'border-cyan-500/15 bg-black shadow-[0_0_60px_rgba(6,182,212,0.08)]'
          }`}
        >
          {viewMode === 'client' ? (
            <div className="min-h-[800px] w-full">
              <WebStudioView />
            </div>
          ) : (
            <iframe
              src={cmsUrl}
              className="w-full h-[800px] border-none"
              title="AQUA CMS Live Editor"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            />
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <KpiCard label="Server health" value="100%" delta="Nominal" trend="up" icon={ShieldCheck} />
            <KpiCard label="Monthly traffic" value="24.5k" delta="+12%" trend="up" icon={Zap} />
            <KpiCard label="Storage used" value="14 GB" delta="of 50 GB" icon={Database} />
          </div>

          <EliteSuccessRepository />
        </div>

        <div>
          <StrategicLiaisonUplink />
        </div>
      </div>
    </div>
  );
};

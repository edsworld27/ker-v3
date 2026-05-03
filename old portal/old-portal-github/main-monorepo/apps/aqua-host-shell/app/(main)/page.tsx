'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { bootstrapBridge, type PluginBootResult } from '@HostShell/bridge/HostBridgeBootstrap';

const HostApp = dynamic(() => import('../../HostShell/HostApp'), { ssr: false });

export default function RootPage() {
  const [ready, setReady] = useState(false);
  const [results, setResults] = useState<PluginBootResult[]>([]);

  useEffect(() => {
    bootstrapBridge()
      .then((res) => {
        setResults(res);
        setReady(true);
      })
      .catch((err) => {
        console.error('[RootPage] bootstrapBridge fatal:', err);
        setReady(true);
      });
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-7 h-7 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium text-slate-400">Booting Aqua Portal…</span>
        </div>
      </div>
    );
  }

  const failed = results.filter((r) => !r.ok);

  return (
    <>
      {failed.length > 0 && (
        <div className="fixed top-0 left-0 right-0 z-[9999] bg-amber-500/90 backdrop-blur-md text-white px-6 py-2.5 text-xs border-b border-amber-400/30">
          <div className="flex items-start gap-3 max-w-screen-xl mx-auto">
            <span className="font-medium shrink-0">
              {failed.length} plugin{failed.length === 1 ? '' : 's'} failed to load
            </span>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-amber-50/90">
              {failed.map((r) => (
                <span key={r.id} title={r.error}>
                  <span className="font-semibold">{r.id}</span>: {r.error?.slice(0, 80) || 'unknown error'}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
      <HostApp />
    </>
  );
}

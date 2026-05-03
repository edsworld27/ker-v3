'use client';
import React from 'react';
import { FileText, Compass, Cloud } from 'lucide-react';
import { Card, Button } from '@aqua/bridge/ui/kit';
import { EliteSuccessRepository, StrategicLiaisonUplink } from './ClientSharedWidgets';

export const DiscoveryClientDashboard: React.FC = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div className="lg:col-span-2 space-y-6">
      <Card padding="lg" className="border-indigo-500/25 bg-gradient-to-br from-indigo-500/[0.06] to-transparent">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-300 shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-indigo-300 font-medium">Initiating strategy matrix</div>
            <h4 className="text-xl font-semibold text-white mt-0.5">Discovery phase</h4>
          </div>
        </div>
        <p className="text-sm text-slate-300 max-w-lg leading-relaxed mb-5">
          Welcome to your portal. We&apos;re calibrating your digital footprint — please complete the high-priority intake nodes below to authorize commencement of the Design phase.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" size="sm">Launch kickoff video</Button>
          <Button variant="outline" size="sm">Review SOW</Button>
        </div>
      </Card>

      <Card padding="none">
        <div className="px-5 py-3 border-b border-white/5 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <h3 className="text-sm font-semibold text-white">Pending client actions</h3>
        </div>
        <ul className="divide-y divide-white/5">
          <li className="px-5 py-4 flex items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-300 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-white">Brand DNA questionnaire</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Est. 15 min</p>
              </div>
            </div>
            <Button variant="primary" size="sm">Begin</Button>
          </li>
          <li className="px-5 py-4 flex items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/5 flex items-center justify-center text-slate-400 shrink-0">
                <Cloud className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-white">Asset dropzone</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Upload logos, media, spreadsheets</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Open</Button>
          </li>
        </ul>
      </Card>

      <EliteSuccessRepository />
    </div>

    <div>
      <StrategicLiaisonUplink />
    </div>
  </div>
);

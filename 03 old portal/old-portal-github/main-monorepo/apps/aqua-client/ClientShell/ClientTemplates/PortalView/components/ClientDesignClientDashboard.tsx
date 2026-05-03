'use client';
import React from 'react';
import { Palette, PenTool, CheckCircle, XCircle } from 'lucide-react';
import { Card, Button, Badge } from '@aqua/bridge/ui/kit';
import { EliteSuccessRepository, StrategicLiaisonUplink } from './ClientSharedWidgets';

export const DesignClientDashboard: React.FC = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div className="lg:col-span-2 space-y-6">
      <Card padding="lg" className="border-pink-500/25 bg-gradient-to-br from-pink-500/[0.06] to-transparent">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-pink-500/15 border border-pink-500/25 flex items-center justify-center text-pink-300 shrink-0">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-pink-300 font-medium">UX/UI prototype review</div>
            <h4 className="text-xl font-semibold text-white mt-0.5">Design phase</h4>
          </div>
        </div>
        <p className="text-sm text-slate-300 max-w-lg leading-relaxed">
          Our creative directives have been rendered. Please review the high-fidelity mockups below — direct feedback into the canvas nodes to authorize engineering handoff.
        </p>
      </Card>

      <Card padding="none">
        <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
            <h3 className="text-sm font-semibold text-white">Active prototype canvas</h3>
          </div>
          <Badge tone="indigo">Revision 2</Badge>
        </div>

        <div className="p-3">
          <div className="relative w-full h-72 rounded-xl overflow-hidden bg-white/[0.02] border border-white/5 group flex items-center justify-center">
            <PenTool className="w-12 h-12 text-slate-600 group-hover:text-pink-300 transition-colors duration-300" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
              <Button variant="primary" size="sm">Open interactive preview</Button>
            </div>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-white/5 flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={CheckCircle} className="text-emerald-300 border-emerald-500/25 bg-emerald-500/10 hover:bg-emerald-500/15">
            Approve layout
          </Button>
          <Button variant="danger" size="sm" icon={XCircle}>Request changes</Button>
        </div>
      </Card>

      <EliteSuccessRepository />
    </div>

    <div>
      <StrategicLiaisonUplink />
    </div>
  </div>
);

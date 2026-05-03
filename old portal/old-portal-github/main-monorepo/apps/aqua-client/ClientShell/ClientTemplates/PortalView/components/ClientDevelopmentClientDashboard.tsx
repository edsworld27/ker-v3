'use client';
import React from 'react';
import { Code, TerminalSquare, GitCommit } from 'lucide-react';
import { Card } from '@aqua/bridge/ui/kit';
import {
  TacticalExecutionMatrix,
  EliteSuccessRepository,
  StrategicLiaisonUplink,
} from './ClientSharedWidgets';
import { usePortalLogic } from '../logic/ClientusePortalLogic';

export const DevelopmentClientDashboard: React.FC = () => {
  const { onboardingTasks } = usePortalLogic();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card padding="lg" className="border-blue-500/25 bg-gradient-to-br from-blue-500/[0.06] to-transparent">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-300 shrink-0">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-blue-300 font-medium">Engineering execution</div>
              <h4 className="text-xl font-semibold text-white mt-0.5">Development</h4>
            </div>
          </div>
          <p className="text-sm text-slate-300 max-w-lg leading-relaxed">
            Core deployment sequence initiated. Your platform is undergoing active engineering — monitor live sprint velocity and access secure staging environments below.
          </p>
        </Card>

        <Card padding="none">
          <div className="px-5 py-3 border-b border-white/5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            <h3 className="text-sm font-semibold text-white">Active server nodes</h3>
          </div>
          <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Card padding="md" interactive>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-300 shrink-0">
                  <TerminalSquare className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-white">Staging environment</h4>
                  <p className="text-[11px] text-blue-300 font-mono mt-0.5 truncate">staging.client-node.app</p>
                </div>
              </div>
            </Card>
            <Card padding="md" interactive>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-300 shrink-0">
                  <GitCommit className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Commit history</h4>
                  <p className="text-[11px] text-violet-300 font-mono mt-0.5">Last push 2h ago</p>
                </div>
              </div>
            </Card>
          </div>
        </Card>

        <TacticalExecutionMatrix onboardingTasks={onboardingTasks} />
        <EliteSuccessRepository />
      </div>

      <div>
        <StrategicLiaisonUplink />
      </div>
    </div>
  );
};

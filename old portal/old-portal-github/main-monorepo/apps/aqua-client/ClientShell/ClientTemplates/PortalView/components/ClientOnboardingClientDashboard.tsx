'use client';
import React from 'react';
import { UserCheck, Key, GraduationCap, ArrowRight } from 'lucide-react';
import { Card, Button } from '@aqua/bridge/ui/kit';
import { TacticalExecutionMatrix, StrategicLiaisonUplink } from './ClientSharedWidgets';
import { usePortalLogic } from '../logic/ClientusePortalLogic';

export const OnboardingClientDashboard: React.FC = () => {
  const { onboardingTasks } = usePortalLogic();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card padding="lg" className="border-emerald-500/25 bg-gradient-to-br from-emerald-500/[0.06] to-transparent">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-300 shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-emerald-300 font-medium">Handoff &amp; activation</div>
              <h4 className="text-xl font-semibold text-white mt-0.5">Onboarding</h4>
            </div>
          </div>
          <p className="text-sm text-slate-300 max-w-lg leading-relaxed">
            Welcome to your new platform. All engineering phases are complete — extract your secure credentials from the vault and review the attached training modules.
          </p>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Card padding="md" interactive>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-300 mb-3">
              <Key className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Secure vault</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Extract admin credentials and database keys.
            </p>
            <Button variant="ghost" size="sm" iconRight={ArrowRight} className="text-amber-300 hover:text-amber-200">
              Authenticate access
            </Button>
          </Card>

          <Card padding="md" interactive>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-300 mb-3">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Platform training</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Master your new administrative CMS backend.
            </p>
            <Button variant="ghost" size="sm" iconRight={ArrowRight} className="text-indigo-300 hover:text-indigo-200">
              Watch tutorials
            </Button>
          </Card>
        </div>

        <TacticalExecutionMatrix onboardingTasks={onboardingTasks} />
      </div>

      <div>
        <StrategicLiaisonUplink />
      </div>
    </div>
  );
};

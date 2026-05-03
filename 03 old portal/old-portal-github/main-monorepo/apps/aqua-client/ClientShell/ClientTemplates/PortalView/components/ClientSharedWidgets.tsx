'use client';
import React from 'react';
import {
  Layers,
  CheckCircle,
  Circle,
  Award,
  ArrowRight,
  MessageSquare,
  Radio,
  Settings,
} from 'lucide-react';
import { Card, Button, Badge, Avatar } from '@aqua/bridge/ui/kit';

interface OnboardingTask {
  task: string;
  status: 'Completed' | string;
}

export const TacticalExecutionMatrix: React.FC<{ onboardingTasks: OnboardingTask[] }> = ({
  onboardingTasks,
}) => (
  <Card padding="none">
    <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-300">
          <Layers className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-base font-semibold text-white">Tactical execution matrix</h4>
          <p className="text-xs text-slate-400 mt-0.5">Authorized delivery threads and resource deployment status.</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        <span className="text-xs text-slate-400">{onboardingTasks.length} live threads</span>
      </div>
    </div>

    <ul className="divide-y divide-white/5">
      {onboardingTasks.map((t, i) => {
        const done = t.status === 'Completed';
        return (
          <li key={i} className="flex items-center justify-between gap-3 px-6 py-3 hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                  done
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                    : 'bg-white/[0.04] border-white/5 text-slate-500'
                }`}
              >
                {done ? <CheckCircle className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <span className="text-sm font-medium text-white truncate block">{t.task}</span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">Operational integrity: high</span>
              </div>
            </div>
            <Badge tone={done ? 'success' : 'neutral'}>{t.status}</Badge>
          </li>
        );
      })}
      {onboardingTasks.length === 0 ? (
        <li className="text-center text-xs text-slate-500 py-10">No active threads.</li>
      ) : null}
    </ul>
  </Card>
);

export const EliteSuccessRepository: React.FC = () => (
  <Card padding="lg" className="border-indigo-500/30 bg-gradient-to-br from-indigo-600/[0.10] to-indigo-900/[0.10]">
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-white/[0.06] border border-white/15 flex items-center justify-center text-white shrink-0">
          <Award className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-lg font-semibold text-white">Elite success repository</h4>
          <p className="text-sm text-slate-300 max-w-md mt-1 leading-relaxed">
            Exclusive playbooks and strategic assets curated to accelerate every growth vector.
          </p>
        </div>
      </div>
      <Button variant="secondary" iconRight={ArrowRight}>
        Access repository
      </Button>
    </div>
  </Card>
);

export const StrategicLiaisonUplink: React.FC = () => (
  <div className="space-y-6">
    <Card padding="md">
      <div className="pb-4 mb-4 border-b border-white/5">
        <Badge tone="indigo">Strategic liaison</Badge>
        <h4 className="text-base font-semibold text-white mt-2">Communication link</h4>
      </div>

      <div className="flex items-center gap-3 mb-5">
        <div className="relative shrink-0">
          <Avatar name="Success Ops" size="lg" />
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0e0e10]" />
        </div>
        <div>
          <div className="text-sm font-semibold text-white">Success Ops</div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Online
            </span>
            <span className="text-[11px] text-slate-500">· avg. response &lt; 2m</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Button variant="primary" icon={MessageSquare} className="w-full">
          Start a chat
        </Button>
        <Button variant="outline" icon={Radio} className="w-full">
          Reserve boardroom
        </Button>
      </div>
    </Card>

    <Card padding="md">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/5 flex items-center justify-center text-slate-400">
          <Settings className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Workspace control</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Manage your digital footprint and aesthetics.</p>
        </div>
      </div>
      <Button variant="outline" iconRight={ArrowRight} className="w-full">
        Open settings
      </Button>
    </Card>

    <Card padding="md">
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-xs text-white font-medium">All systems nominal</span>
        </div>
        <span className="text-[11px] text-slate-500">Matrix v10.0</span>
      </div>
    </Card>
  </div>
);

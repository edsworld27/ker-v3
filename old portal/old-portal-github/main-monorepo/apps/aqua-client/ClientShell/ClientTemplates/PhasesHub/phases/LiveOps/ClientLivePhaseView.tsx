'use client';
import React from 'react';
import { Activity, Rocket, TrendingUp, ShieldCheck, Zap, Database, AlertTriangle } from 'lucide-react';
import { Page, Card, Section, Button, Badge } from '@aqua/bridge/ui/kit';
import { useAppContext } from '@ClientShell/bridge/ClientAppContext';

interface HealthStatProps {
  icon: React.ComponentType<{ className?: string }>;
  iconClass: string;
  label: string;
  value: string;
  sub: React.ReactNode;
}

const HealthStat: React.FC<HealthStatProps> = ({ icon: Icon, iconClass, label, value, sub }) => (
  <Card padding="md">
    <div className="flex items-center gap-2 mb-3">
      <Icon className={`w-4 h-4 ${iconClass}`} />
      <h3 className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">{label}</h3>
    </div>
    <div className="text-2xl font-semibold text-white tabular-nums">{value}</div>
    <p className="text-[11px] mt-1.5 text-slate-400">{sub}</p>
  </Card>
);

export const LivePhaseView: React.FC = () => {
  const { handleImpersonate, handleViewChange } = useAppContext();

  return (
    <Page>
      <header className="flex items-center gap-4 mb-8 pb-8 border-b border-white/5">
        <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-300">
          <Activity className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500 font-medium mb-1">Lifecycle phase</div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">Live ops</h1>
          <p className="text-sm text-slate-400 mt-1">Production monitoring and growth.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <HealthStat
              icon={ShieldCheck}
              iconClass="text-cyan-300"
              label="Health"
              value="100%"
              sub={<span className="text-cyan-300">All systems nominal</span>}
            />
            <HealthStat
              icon={Zap}
              iconClass="text-amber-300"
              label="Traffic"
              value="24.5k"
              sub={
                <span className="inline-flex items-center gap-1 text-emerald-400">
                  <TrendingUp className="w-3 h-3" /> +12% this week
                </span>
              }
            />
            <HealthStat
              icon={Database}
              iconClass="text-violet-300"
              label="Storage"
              value="14 GB"
              sub={<span className="text-slate-500">of 50 GB quota</span>}
            />
          </div>

          <Section
            title="Maintenance log"
            description="Recent automated checks and required actions."
            actions={<Button variant="ghost" size="sm">Run diagnostic</Button>}
          >
            <Card padding="none">
              <ul className="divide-y divide-white/5">
                <li className="flex items-center gap-3 px-4 py-3 bg-white/[0.02]">
                  <Activity className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="flex-1 text-sm text-slate-200">System backup completed</span>
                  <span className="text-[11px] text-slate-500 font-mono">2h ago</span>
                </li>
                <li className="flex items-center gap-3 px-4 py-3">
                  <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0" />
                  <span className="flex-1 text-sm text-slate-200">Plugin update required (SEO)</span>
                  <Button variant="outline" size="sm">Update</Button>
                </li>
                <li className="flex items-center gap-3 px-4 py-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span className="flex-1 text-sm text-slate-400">SSL certificate auto-renewed</span>
                  <Badge tone="success">5d ago</Badge>
                </li>
              </ul>
            </Card>
          </Section>
        </div>

        <Card padding="md" className="border-cyan-500/20 self-start">
          <div className="flex flex-col items-center text-center">
            <div className="w-11 h-11 rounded-xl bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center text-cyan-300 mb-3">
              <Rocket className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1.5">Simulate client view</h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Switch roles to view the portal exactly as the client sees it during Live Operations.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleImpersonate('client-5')}
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

export default LivePhaseView;

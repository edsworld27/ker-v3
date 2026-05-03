import React from 'react';
import { motion } from 'motion/react';
import { Compass, Lightbulb, Target, Clock } from 'lucide-react';
import { DashboardWidget } from '../DashboardWidget';

const DiscoveryDashboardView: React.FC = () => {
  return (
    <motion.div
      key="discovery-dashboard"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-10 max-w-6xl mx-auto w-full"
    >
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-3xl font-semibold mb-2">Discovery Dashboard</h2>
          <p className="text-slate-500">Defining the vision and requirements for your project.</p>
        </div>
        <div className="flex items-center gap-2 text-amber-400 font-medium bg-amber-400/10 px-4 py-2 rounded-xl border border-amber-400/20">
          <Compass className="w-5 h-5" />
          Discovery Phase
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <DashboardWidget icon={Lightbulb} label="Ideas Captured" value="24" trend="+8" color="amber" />
        <DashboardWidget icon={Target} label="Goals Defined" value="6 Core" trend="Aligned" color="indigo" />
        <DashboardWidget icon={Clock} label="Phase Completion" value="80%" trend="Near End" color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="glass-card p-8 rounded-3xl">
            <h3 className="text-xl font-medium mb-6">Core Project Goals</h3>
            <div className="space-y-4">
              {[
                'Increase conversion rate by 25% within 6 months',
                'Modernize brand identity for a younger demographic',
                'Implement a seamless multi-channel checkout process',
                'Reduce page load times to under 1.5 seconds'
              ].map((goal, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="mt-1 w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-xs font-bold">
                    {i + 1}
                  </div>
                  <span className="text-sm text-slate-200">{goal}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="glass-card p-8 rounded-3xl">
            <h3 className="text-xl font-medium mb-6">Discovery Insights</h3>
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2">Top Competitor</div>
                <div className="text-sm font-medium">Nexus Digital Systems</div>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Target Audience</div>
                <div className="text-sm font-medium">Gen Z Tech Enthusiasts</div>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">Key Value Prop</div>
                <div className="text-sm font-medium">AI-Driven Personalization</div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
};

export default DiscoveryDashboardView;

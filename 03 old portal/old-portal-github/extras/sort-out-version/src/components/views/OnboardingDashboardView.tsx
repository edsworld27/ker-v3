import React from 'react';
import { motion } from 'motion/react';
import { Zap, CheckCircle2, FileText, Users, Check } from 'lucide-react';
import { DashboardWidget } from '../DashboardWidget';

const OnboardingDashboardView: React.FC = () => {
  return (
    <motion.div
      key="onboarding-dashboard"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-10 max-w-6xl mx-auto w-full"
    >
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-3xl font-semibold mb-2">Onboarding Dashboard</h2>
          <p className="text-slate-500">Welcome to the agency! Let's get your project started.</p>
        </div>
        <div className="flex items-center gap-2 text-indigo-400 font-medium bg-indigo-400/10 px-4 py-2 rounded-xl border border-indigo-400/20">
          <Zap className="w-5 h-5" />
          Setup Phase
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <DashboardWidget icon={CheckCircle2} label="Setup Progress" value="45%" trend="+15%" color="indigo" />
        <DashboardWidget icon={FileText} label="Docs Signed" value="3/4" trend="Pending 1" color="emerald" />
        <DashboardWidget icon={Users} label="Team Assigned" value="5 Members" trend="Active" color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="glass-card p-8 rounded-3xl">
            <h3 className="text-xl font-medium mb-6">Onboarding Checklist</h3>
            <div className="space-y-4">
              {[
                { task: 'Sign Service Agreement', status: 'Completed' },
                { task: 'Complete Discovery Questionnaire', status: 'Completed' },
                { task: 'Schedule Kickoff Call', status: 'In Progress' },
                { task: 'Upload Brand Assets', status: 'Pending' }
              ].map((t, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      t.status === 'Completed' ? 'bg-emerald-500 border-emerald-500' : 'border-white/20'
                    }`}>
                      {t.status === 'Completed' && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className={`text-sm font-medium ${t.status === 'Completed' ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
                      {t.task}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${
                    t.status === 'Completed' ? 'text-emerald-400' :
                    t.status === 'In Progress' ? 'text-amber-400' : 'text-slate-500'
                  }`}>
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="glass-card p-8 rounded-3xl">
            <h3 className="text-xl font-medium mb-6">Your Success Team</h3>
            <div className="space-y-6">
              {[
                { name: 'Sarah Jenkins', role: 'Account Manager', contact: 'sarah@agency.com' },
                { name: 'Michael Chen', role: 'Project Lead', contact: 'michael@agency.com' }
              ].map((m, i) => (
                <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                      {m.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{m.name}</div>
                      <div className="text-[10px] text-slate-500">{m.role}</div>
                    </div>
                  </div>
                  <a href={`mailto:${m.contact}`} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors block text-center py-2 bg-white/5 rounded-xl">
                    Contact {m.name.split(' ')[0]}
                  </a>
                </div>
              ))}
            </div>
          </section>

          <div className="p-8 rounded-3xl bg-indigo-600/10 border border-indigo-500/20">
            <h4 className="font-semibold mb-2">Need Help?</h4>
            <p className="text-sm text-slate-400 mb-4">Our support team is available 24/7 to assist you with onboarding.</p>
            <button className="w-full py-3 bg-indigo-600 rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all">Contact Support</button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default OnboardingDashboardView;

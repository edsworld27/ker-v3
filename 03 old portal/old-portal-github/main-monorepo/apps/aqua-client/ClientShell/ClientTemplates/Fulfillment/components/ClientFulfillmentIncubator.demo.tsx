import React from 'react';
import { 
  Rocket, BarChart3, Globe, 
  Zap, Activity, Target, Sparkles,
  ArrowUpRight, ShieldCheck
} from 'lucide-react';

const GrowthMetric = ({ label, value, trend, color, icon: Icon }: any) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-3 group hover:border-white/20 transition-all cursor-pointer">
    <div className="flex items-center justify-between">
      <div className={`p-2 rounded-xl bg-${color}-500/10 text-${color}-400 group-hover:scale-110 transition-transform`}>
        <Icon size={18} />
      </div>
      <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
        <ArrowUpRight size={10} /> {trend}
      </div>
    </div>
    <div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">{label}</div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
    </div>
  </div>
);

export const FulfillmentIncubatorDemo: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Incubator Pulse Hero */}
      <div className="relative p-10 rounded-[3rem] bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-white/10 overflow-hidden group">
        <div className="absolute top-[-50px] right-[-50px] w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-100px] left-[-100px] w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px]" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-[10px] font-bold text-indigo-300 uppercase tracking-wider mb-6">
              <Sparkles size={10} /> Neural Growth Engine Active
            </div>
            <h2 className="text-4xl font-bold text-white tracking-tight leading-tight mb-4">
              Growth <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-400">Incubator Pulse</span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-8">
              Predictive audience orchestration and content fulfillment. Leveraging AI-driven virality modeling to scale client assets across 12+ social channels.
            </p>
            <div className="flex gap-4">
               <button className="px-8 py-3 bg-emerald-500 text-black text-sm font-bold rounded-2xl hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20">
                 Launch New Campaign
               </button>
               <button className="px-8 py-3 bg-white/5 border border-white/10 text-white text-sm font-bold rounded-2xl hover:bg-white/10 transition-all">
                 Configure Automations
               </button>
            </div>
          </div>

          {/* Viral Trajectory Mini Chart */}
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] w-full lg:w-auto">
             <div className="flex items-center justify-between mb-8">
                <div>
                   <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Viral Potential</div>
                   <div className="text-2xl font-bold text-white">84.2 <span className="text-xs text-indigo-400">Score</span></div>
                </div>
                <Zap className="text-indigo-400 w-6 h-6 animate-pulse" />
             </div>
             
             <div className="flex items-end gap-2 h-32 px-2">
                {[30, 45, 60, 40, 85, 100, 70, 50, 90].map((h, i) => (
                  <div 
                    key={i} 
                    className="flex-1 bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-full transition-all duration-1000" 
                    style={{ height: `${h}%`, transitionDelay: `${i * 100}ms` }} 
                  />
                ))}
             </div>
             <div className="mt-4 flex justify-between text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                <span>Phase 1</span>
                <span>Hyper-Growth</span>
             </div>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <GrowthMetric label="Active Reach" value="1.2M" trend="24%" color="indigo" icon={Globe} />
        <GrowthMetric label="Conversion" value="4.8%" trend="1.2%" color="emerald" icon={Target} />
        <GrowthMetric label="Ads Spend" value="£12.4k" trend="£2.1k" color="blue" icon={BarChart3} />
        <GrowthMetric label="Fulfillment" value="98.4%" trend="0.5%" color="purple" icon={ShieldCheck} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heatmap Section */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden h-[450px]">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-bold text-white uppercase tracking-tight">Viral Opportunity Heatmap</h3>
              <p className="text-sm text-slate-500">Peak engagement hours vs. Platform resonance.</p>
            </div>
            <Activity className="text-emerald-400 w-5 h-5" />
          </div>

          <div className="grid grid-cols-12 gap-1 h-64 bg-white/5 rounded-2xl p-4">
            {Array.from({ length: 96 }).map((_, i) => {
              const weight = Math.random();
              return (
                <div 
                  key={i} 
                  className="rounded-[2px] transition-all hover:scale-125 cursor-help"
                  style={{ 
                    backgroundColor: weight > 0.8 ? '#4f46e5' : weight > 0.5 ? '#6366f1' : weight > 0.2 ? '#1e1b4b' : '#020617',
                    opacity: 0.8
                  }} 
                />
              );
            })}
          </div>

          <div className="mt-8 flex items-center justify-between text-[10px] font-bold text-slate-600 uppercase tracking-widest">
             <span>00:00 (Global)</span>
             <span>12:00 (Peak Reach)</span>
             <span>23:59</span>
          </div>
        </div>

        {/* Content Pipeline / Orders */}
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 flex flex-col h-[450px]">
           <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
             <Rocket className="text-indigo-400 w-6 h-6" /> Production Queue
           </h3>

           <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
             {[
               { client: 'Acme Corp', project: 'TikTok Viral Hook v2', status: 'In Render', color: 'indigo' },
               { client: 'TechFlow', project: 'LinkedIn Newsletter Bulk', status: 'Ready', color: 'emerald' },
               { client: 'Stellar Ltd', project: 'Google Ads Scaler', status: 'Optimizing', color: 'blue' },
               { client: 'Global Mkt', project: 'Mailing List Cleanup', status: 'Processing', color: 'purple' },
               { client: 'Cyberdyne', project: 'Quarterly OS Update', status: 'Pending', color: 'rose' },
             ].map((item, i) => (
               <div key={i} className="group cursor-pointer">
                 <div className="flex items-center justify-between mb-1">
                   <span className="text-[10px] font-bold text-slate-500 uppercase">{item.client}</span>
                   <span className={`text-[9px] font-bold text-${item.color}-400 bg-${item.color}-500/10 px-2 py-0.5 rounded`}>{item.status}</span>
                 </div>
                 <div className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">
                    {item.project}
                 </div>
               </div>
             ))}
           </div>

           <button className="w-full mt-8 py-4 bg-white text-black rounded-2xl text-xs font-bold hover:bg-slate-200 transition-all shadow-xl">
              Open Full Studio
           </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { motion } from 'motion/react';
import { Globe, Users, FileText, ArrowLeft, Download } from 'lucide-react';

interface DataHubViewProps {
  handleViewChange: (view: any) => void;
}

export const DataHubView: React.FC<DataHubViewProps> = ({ handleViewChange }) => {
  return (
    <motion.div
      key="data-hub"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-10 max-w-6xl mx-auto w-full"
    >
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-3xl font-semibold mb-2">Data Hub</h2>
          <p className="text-slate-500">All information we know about your company, transparently shared.</p>
        </div>
        <button 
          onClick={() => handleViewChange('dashboard')}
          className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="glass-card p-8 rounded-3xl">
            <h3 className="text-xl font-medium mb-6 flex items-center gap-3">
              <Globe className="w-5 h-5 text-indigo-400" />
              Discovery Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-white/5 rounded-2xl">
                <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-1">Origin</div>
                <p className="text-sm">Referral from Partner Network</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl">
                <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-1">Primary Goal</div>
                <p className="text-sm">Digital Transformation & Scalability</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl md:col-span-2">
                <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-1">Key Challenges</div>
                <ul className="list-disc list-inside text-sm space-y-1 text-slate-300">
                  <li>Legacy systems hindering growth</li>
                  <li>Inconsistent brand identity across platforms</li>
                  <li>Lack of centralized data management</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="glass-card p-8 rounded-3xl">
            <h3 className="text-xl font-medium mb-6 flex items-center gap-3">
              <Users className="w-5 h-5 text-indigo-400" />
              Stakeholder Map
            </h3>
            <div className="space-y-4">
              {[
                { name: 'Sarah Jenkins', role: 'CEO', influence: 'High', interest: 'High' },
                { name: 'David Chen', role: 'CTO', influence: 'High', interest: 'Medium' },
                { name: 'Emily Rodriguez', role: 'Marketing Dir.', influence: 'Medium', interest: 'High' }
              ].map((person, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div>
                    <div className="font-medium">{person.name}</div>
                    <div className="text-xs text-slate-500">{person.role}</div>
                  </div>
                  <div className="flex gap-4 text-xs">
                    <div>
                      <span className="text-slate-500">Influence:</span> <span className={person.influence === 'High' ? 'text-emerald-400' : 'text-amber-400'}>{person.influence}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Interest:</span> <span className={person.interest === 'High' ? 'text-emerald-400' : 'text-amber-400'}>{person.interest}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="glass-card p-8 rounded-3xl">
            <h3 className="text-lg font-medium mb-6 flex items-center gap-3">
              <FileText className="w-5 h-5 text-indigo-400" />
              Shared Documents
            </h3>
            <div className="space-y-3">
              {['Initial_Brief.pdf', 'Brand_Guidelines_v2.pdf', 'Q3_Financials_Summary.xlsx', 'Competitor_Analysis.docx'].map((file, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:border-indigo-500/30 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FileText className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors flex-shrink-0" />
                    <span className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors truncate">{file}</span>
                  </div>
                  <Download className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                </div>
              ))}
            </div>
          </section>

          <div className="p-8 rounded-3xl bg-indigo-600/10 border border-indigo-500/20">
            <h4 className="font-semibold mb-2">Transparency First</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              We believe in absolute transparency. All data we collect and documents we share are available here for your review at any time.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

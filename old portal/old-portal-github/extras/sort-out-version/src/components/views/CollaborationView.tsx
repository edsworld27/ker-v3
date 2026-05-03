import React from 'react';
import { motion } from 'motion/react';
import { MessageSquarePlus, Layout, CheckCircle, Circle, Play } from 'lucide-react';

const CollaborationView: React.FC = () => {
  return (
    <motion.div
      key="collaboration"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-10 max-w-6xl mx-auto w-full"
    >
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-3xl font-semibold mb-2">Collaboration Center</h2>
          <p className="text-slate-500">Review designs, share ideas, and track project progress.</p>
        </div>
        <div className="flex items-center gap-2 text-indigo-400 font-medium">
          <MessageSquarePlus className="w-5 h-5" />
          Active Project
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="glass-card p-8 rounded-3xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-medium">Design Concepts</h3>
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-[10px] font-bold uppercase tracking-widest">In Review</span>
            </div>
            <div className="aspect-video bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                <button className="px-4 py-2 bg-indigo-600 rounded-xl text-sm font-medium">View Full Screen</button>
              </div>
              <Layout className="w-12 h-12 text-slate-700" />
              <p className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-8 text-xs text-slate-600">Homepage Concept v1.2</p>
            </div>
            <div className="mt-6 flex gap-4">
              <button className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-sm font-medium transition-all">Request Changes</button>
              <button className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-2xl text-sm font-medium transition-all">Approve Design</button>
            </div>
          </section>

          <section className="glass-card p-8 rounded-3xl">
            <h3 className="text-xl font-medium mb-6">Project Timeline</h3>
            <div className="space-y-6">
              {[
                { stage: 'Discovery', status: 'completed', date: 'Mar 10' },
                { stage: 'Wireframing', status: 'completed', date: 'Mar 15' },
                { stage: 'UI Design', status: 'current', date: 'Mar 24' },
                { stage: 'Development', status: 'pending', date: 'Apr 05' },
                { stage: 'Launch', status: 'pending', date: 'Apr 20' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    item.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                    item.status === 'current' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/50' :
                    'bg-white/5 text-slate-600'
                  }`}>
                    {item.status === 'completed' ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`font-medium ${item.status === 'pending' ? 'text-slate-600' : 'text-white'}`}>{item.stage}</span>
                      <span className="text-xs text-slate-500">{item.date}</span>
                    </div>
                    {item.status === 'current' && (
                      <div className="w-full h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-indigo-500 w-2/3" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="glass-card p-8 rounded-3xl flex flex-col h-[500px]">
            <h3 className="text-xl font-medium mb-6">Project Chat</h3>
            <div className="flex-1 overflow-y-auto space-y-4 mb-6 custom-scrollbar pr-2">
              <div className="bg-white/5 rounded-2xl p-4">
                <div className="text-[10px] font-bold text-indigo-400 mb-1 uppercase tracking-widest">Edward (Admin)</div>
                <p className="text-sm">I've uploaded the latest homepage concept. Let me know what you think about the color palette!</p>
              </div>
              <div className="bg-indigo-600/20 rounded-2xl p-4 ml-4">
                <div className="text-[10px] font-bold text-white mb-1 uppercase tracking-widest">You</div>
                <p className="text-sm">Looks great! Can we try a slightly darker shade for the header?</p>
              </div>
            </div>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Type a message..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-4 pr-12 text-sm outline-none focus:border-indigo-500/50 transition-colors"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-indigo-400 hover:text-indigo-300 transition-colors">
                <Play className="w-4 h-4" />
              </button>
            </div>
          </section>

          <div className="p-8 rounded-3xl bg-indigo-600/10 border border-indigo-500/20">
            <h4 className="font-semibold mb-2">Need a quick sync?</h4>
            <p className="text-sm text-slate-400 mb-4">Schedule a 15-min call with your project manager.</p>
            <button className="w-full py-3 bg-indigo-600 rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all">Book Call</button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CollaborationView;

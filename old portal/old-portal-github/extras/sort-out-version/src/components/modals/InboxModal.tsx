import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Bell, Clock, ArrowRight } from 'lucide-react';

interface InboxModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InboxModal({ isOpen, onClose }: InboxModalProps) {
  const [activeTab, setActiveTab] = useState<'notifications' | 'updates'>('notifications');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-md h-full bg-slate-900 border-l border-white/10 shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/20 shrink-0">
            <h2 className="text-xl font-semibold text-white">Inbox</h2>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/10 bg-black/10 shrink-0">
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'notifications' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Bell className="w-4 h-4" />
              Notifications
            </button>
            <button
              onClick={() => setActiveTab('updates')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'updates' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Clock className="w-4 h-4" />
              Updates
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            {activeTab === 'notifications' && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50">
                <Bell className="w-12 h-12 text-slate-400" />
                <div>
                  <h3 className="text-lg font-medium text-white">No new notifications</h3>
                  <p className="text-sm text-slate-400">You're all caught up!</p>
                </div>
              </div>
            )}

            {activeTab === 'updates' && (
              <div className="space-y-6">
                {[
                  { title: 'AI Integration', date: 'Q2 2026', desc: 'Advanced AI capabilities for the website editor.' },
                  { title: 'Mobile App', date: 'Q3 2026', desc: 'Native iOS and Android portal apps.' },
                  { title: 'Advanced Analytics', date: 'Q4 2026', desc: 'Deep dive into your user behavior and metrics.' }
                ].map((update, i) => (
                  <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/10 group hover:border-indigo-500/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-white">{update.title}</h3>
                      <span className="text-[10px] px-2 py-1 bg-indigo-500/20 text-indigo-400 rounded-full font-bold uppercase tracking-widest">{update.date}</span>
                    </div>
                    <p className="text-sm text-slate-400 mb-4">{update.desc}</p>
                    <button className="text-xs text-indigo-400 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                      Read More <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

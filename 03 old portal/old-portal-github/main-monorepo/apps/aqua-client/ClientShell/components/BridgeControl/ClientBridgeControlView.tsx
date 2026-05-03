import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Layers, 
  ToggleLeft, 
  ToggleRight, 
  Database,
  Cpu,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAppContext } from '@ClientShell/bridge/ClientAppContext';
import { SUITE_METADATA } from '@ClientShell/bridge/ClientSuiteRegistry';
import { BridgeRegistry } from '@ClientShell/bridge/ClientRegistration';

export function BridgeControlView() {
  const { 
    enabledSuiteIds, 
    toggleSuite, 
    portalMode, 
    currentUserEmail,
    users 
  } = useAppContext();

  // Force re-render when BridgeRegistry updates
  const [, setTick] = useState(0);
  useEffect(() => {
    return BridgeRegistry.subscribe(() => setTick(t => t + 1));
  }, []);

  const registeredIds = BridgeRegistry.getRegisteredIds();

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Zap className="text-amber-400" /> Bridge Control Hub
          </h1>
          <p className="text-slate-400 mt-2">Scale and toggle business suites across the entire application.</p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
           <Database className="w-4 h-4 text-emerald-400" />
           <span className="text-xs font-mono uppercase tracking-widest">{portalMode} Context Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* SUITE TOGGLER */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#1e1e2d] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                <Layers className="w-4 h-4" /> Available Business Suites
              </h2>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full uppercase">
                {SUITE_METADATA.all.length} Modules Discovery
              </span>
            </div>
            
            <div className="divide-y divide-white/5">
              {SUITE_METADATA.all.map((suite) => {
                const isEnabled = enabledSuiteIds.includes(suite.id);
                const isRegistered = registeredIds.includes(suite.id);

                return (
                  <div key={suite.id} className="p-6 flex items-center justify-between group hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl transition-all ${isEnabled ? 'bg-amber-500/10 text-amber-400' : 'bg-white/5 text-slate-500 opacity-50'}`}>
                        <suite.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white group-hover:text-amber-400 transition-colors">{suite.label}</h3>
                        <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-medium">ID: {suite.id}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex flex-col items-end gap-1">
                         <span className={`text-[10px] uppercase font-bold tracking-tighter flex items-center gap-1 ${isRegistered ? 'text-emerald-500' : 'text-slate-600'}`}>
                            {isRegistered ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                            {isRegistered ? 'Registered' : 'Disconnected'}
                         </span>
                      </div>

                      <button 
                        onClick={() => toggleSuite(suite.id)}
                        className={`transition-all ${isEnabled ? 'text-amber-400 scale-110' : 'text-slate-700 hover:text-slate-500'}`}
                      >
                        {isEnabled ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* BRIDGE DIAGNOSTICS */}
        <div className="space-y-6">
          <div className="bg-[#1e1e2d] border border-white/5 rounded-2xl p-6 shadow-xl">
             <h2 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 mb-6">
                <Cpu className="w-4 h-4 text-blue-400" /> User Diagnostics
             </h2>
             
             <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                   <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Authenticated Account</p>
                   <p className="text-sm font-mono text-emerald-400">{currentUserEmail}</p>
                </div>

                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                   <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Bridge Registry Pool</p>
                   <p className="text-2xl font-bold text-white">{registeredIds.length} <span className="text-xs font-normal text-slate-500">active components</span></p>
                </div>

                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                   <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Total Users Managed</p>
                   <p className="text-2xl font-bold text-white">{users.length} <span className="text-xs font-normal text-slate-500">records in bridge</span></p>
                </div>
             </div>
             
             <div className="mt-8 pt-8 border-t border-white/5">
                <button className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border border-white/10">
                   Force Hydration Sync
                </button>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}

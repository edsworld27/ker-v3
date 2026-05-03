import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Building2, Upload, ChevronRight, ChevronLeft, ShieldCheck, Star, User, CheckSquare, Plus } from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme';
import { useRoleConfig } from '../../../hooks/useRoleConfig';

interface AgencySetupViewProps {
  onComplete: () => void;
}

export const AgencySetupView: React.FC<AgencySetupViewProps> = ({ onComplete }) => {
  const [setupStep, setSetupStep] = useState(1);
  const [newAgencyForm, setNewAgencyForm] = useState({
    name: '',
    primaryColor: '#6366f1',
    logo: ''
  });
  const theme = useTheme();
  const { label } = useRoleConfig();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl glass-card rounded-[2.5rem] p-12 overflow-hidden shadow-2xl border border-white/10 mx-auto mt-10"
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                 style={theme.primaryBgStyle}>
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Agency Configuration</h1>
              <p className="text-slate-500 text-sm font-medium">Step {setupStep} of 3</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
          {/* ... setup steps content ... */}
          {setupStep === 1 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl font-bold mb-3 tracking-tight">Identity & Spirit</h2>
                <p className="text-slate-400 text-lg">Let's give your agency a name and a face.</p>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 ml-1">Agency Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Acme Digital HQ"
                  value={newAgencyForm.name}
                  onChange={(e) => setNewAgencyForm({...newAgencyForm, name: e.target.value})}
                  className="w-full px-4 py-5 bg-white/5 border border-white/10 rounded-2xl outline-none transition-all text-white text-xl font-semibold focus-within-primary"
                  style={{ '--tw-ring-color': 'var(--color-primary)' } as React.CSSProperties}
                />
              </div>
            </div>
          )}
          {/* ... other steps ... */}
        </div>

        <div className="mt-12 flex gap-5">
          {setupStep > 1 && (
            <button onClick={() => setSetupStep(setupStep - 1)} className="px-10 py-5 bg-white/5 hover:bg-white/10 rounded-2xl font-bold text-slate-400 transition-all">Back</button>
          )}
          <button 
            onClick={() => {
              if (setupStep < 3) setSetupStep(setupStep + 1);
              else onComplete();
            }}
            className="flex-1 py-5 text-white font-bold rounded-2xl transition-all"
            style={theme.primaryBgStyle}
          >
            {setupStep === 3 ? 'Deploy Agency Environment' : 'Continue'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

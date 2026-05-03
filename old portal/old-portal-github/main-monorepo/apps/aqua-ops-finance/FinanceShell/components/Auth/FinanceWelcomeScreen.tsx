import React from 'react';
import { motion } from 'motion/react';
import { Zap, Play, ArrowRight, User, Briefcase } from 'lucide-react';
import { useFinanceContext } from '@FinanceShell/bridge/FinanceContext';
import { Step } from '@FinanceShell/bridge/types';

export function WelcomeScreen() {
  const { setStep, users, handleLogin, agencyConfig, setLoginPortalType, setPortalMode } = useFinanceContext();
  const primaryColor = agencyConfig?.identity?.primaryColor || '#4f46e5';

  const onDemo = async () => {
    setPortalMode('demo');
    await handleLogin('demo@aqua.portal', 'demo');
  };

  const onSetup = () => {
    setStep('setup-wizard' as Step);
  };

  const onAgencyLogin = () => {
    setLoginPortalType('agency');
    setStep('login');
  };

  const onClientLogin = () => {
    setLoginPortalType('client');
    setStep('login');
  };

  const OptionCard = ({ icon: Icon, title, description, actionLabel, onClick, color }) => (
    <button
      onClick={onClick}
      className="group glass-card rounded-[var(--radius-button)] p-6 border border-[var(--finance-border-color)] text-left hover:border-[var(--finance-primary-color)]/50 bg-[var(--finance-surface-color-glass)]/5 transition-all duration-200 hover:scale-[1.02] flex flex-col"
    >
      <div className="w-10 h-10 rounded-[var(--radius-button)] flex items-center justify-center mb-4 border border-[var(--finance-border-color)]"
           style={{ backgroundColor: color || 'var(--finance-surface-color)' }}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <h3 className="font-bold text-[var(--finance-text-color)] mb-1">{title}</h3>
      <p className="text-[var(--finance-text-color-muted)] text-sm leading-relaxed flex-grow">
        {description}
      </p>
      <div className="mt-4 flex items-center gap-1 text-xs font-semibold"
           style={{ color: color || 'var(--finance-primary-color)' }}>
        {actionLabel} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
      </div>
    </button>
  );

  return (
    <div className="flex items-center justify-center w-full min-h-screen relative z-10 px-6 bg-[var(--finance-bg-color)]" data-design-static="true">
      <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 50% 30%, ${primaryColor}22 0%, var(--finance-bg-color) 60%)` }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-4xl text-center"
      >
        <div className="w-16 h-16 rounded-[var(--radius-button)] flex items-center justify-center mx-auto mb-8 shadow-xl border border-[var(--finance-border-color)]"
             style={{ backgroundColor: primaryColor, boxShadow: `0 20px 40px ${primaryColor}40` }}>
          <Zap className="w-9 h-9 text-white" />
        </div>

        <h1 className="text-4xl font-bold mb-3 tracking-tight text-[var(--finance-text-color)]">Welcome to Aqua Portal</h1>
        <p className="text-[var(--finance-text-color-muted)] mb-12 text-lg">
          The white-label client portal platform for modern agencies.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <OptionCard 
            icon={User}
            title="Agency Login"
            description="Sign in to manage your agency operations, team, and clients."
            actionLabel="Enter Portal"
            onClick={onAgencyLogin}
            color={primaryColor}
          />
          <OptionCard 
            icon={Briefcase}
            title="Client Login"
            description="Access your client portal to view projects, and collaborate."
            actionLabel="Access Your Portal"
            onClick={onClientLogin}
            color="#3b82f6"
          />
          <OptionCard 
            icon={Zap}
            title="Set Up My Agency"
            description="Start fresh, brand your portal, and create your admin account."
            actionLabel="Begin Setup"
            onClick={onSetup}
            color="#10b981"
          />
          <OptionCard 
            icon={Play}
            title="Explore Demo"
            description="Tour a pre-built portal with mock clients, projects, and data."
            actionLabel="View Demo"
            onClick={onDemo}
            color="#8b5cf6"
          />
        </div>

        <p className="text-[10px] text-[var(--finance-text-color-muted)] mt-10 uppercase tracking-widest">
          Aqua Portal v9 — Omega Architecture
        </p>
      </motion.div>
    </div>
  );
}

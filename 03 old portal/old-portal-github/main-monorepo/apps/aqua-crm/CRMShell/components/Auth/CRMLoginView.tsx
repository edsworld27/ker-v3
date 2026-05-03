import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, ArrowRight, Mail, Lock, User, Zap, ExternalLink } from 'lucide-react';
import { useAppContext } from '@CRMShell/bridge/CRMAppContext';

interface LoginViewProps {
  onLogin: (email: string, password: string) => void;
  onSignUp: (name: string, email: string) => void;
  loginError?: string;
}

export function LoginView({ onLogin, onSignUp, loginError, type = 'agency' }: LoginViewProps & { type?: 'agency' | 'client' }) {
  const { setLoginPortalType } = useAppContext();
  const isClient = type === 'client';
  const [mode, setMode] = useState<'landing' | 'login' | 'signup'>(isClient ? 'login' : 'landing');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const demoLogin = () => {
    onLogin('founder@aquadigital.io', 'demo');
  };

  return (
    <div className="flex items-center justify-center w-full min-h-screen relative z-[100] px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.1),transparent_50%)]" />

      <AnimatePresence mode="wait">
        {mode === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative w-full max-w-md glass-card rounded-[2.5rem] p-10 shadow-2xl border border-[var(--crm-widget-border)] text-center"
          >
            <div className="w-14 h-14 rounded-[var(--radius-button)] flex items-center justify-center mx-auto mb-6 shadow-lg"
                 style={{ backgroundColor: 'var(--people-widget-primary-color-1)' }}>
              <ShieldCheck className="w-8 h-8 text-[var(--crm-widget-text)]" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Aqua Portal</h1>
            <p className="text-[var(--crm-widget-text-muted)] text-sm mb-10">The agency command center platform</p>

            <div className="space-y-3">
              <button
                onClick={() => setMode('login')}
                className="w-full py-3.5 rounded-[var(--radius-button)] font-semibold transition-all flex items-center justify-center gap-2 text-[var(--crm-widget-text)] hover:brightness-110 shadow-lg shadow-[var(--people-widget-primary-color-1)]/20"
                style={{ backgroundColor: 'var(--people-widget-primary-color-1)' }}
              >
                <Mail className="w-4 h-4" />
                Sign In
              </button>
              <button
                onClick={() => setMode('signup')}
                className="w-full py-3.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-[var(--radius-button)] font-semibold transition-all flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4" />
                Create Agency Account
              </button>
              
              <div className="pt-2">
                <button
                  onClick={demoLogin}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/20 rounded-[var(--radius-button)] font-bold text-amber-200 transition-all flex items-center justify-center gap-2 group"
                >
                  <Zap className="w-4 h-4 text-amber-400 group-hover:scale-125 transition-transform" />
                  One-Click Demo
                </button>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5">
              <button
                onClick={() => setLoginPortalType('client')}
                className="w-full py-2.5 rounded-[var(--radius-button)] text-xs font-semibold text-[var(--crm-widget-text-muted)] hover:text-[var(--crm-widget-text)] transition-all flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Switch to Client Portal Login
              </button>
            </div>
          </motion.div>
        )}

        {mode === 'login' && (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative w-full max-w-md glass-card rounded-[2.5rem] p-10 shadow-2xl border border-[var(--crm-widget-border)]"
          >
            {!isClient && (
              <button
                onClick={() => setMode('landing')}
                className="text-xs text-[var(--crm-widget-text-muted)] hover:text-[var(--crm-widget-text)] mb-8 flex items-center gap-1 transition-colors"
              >
                ← Back
              </button>
            )}
            <h2 className="text-2xl font-bold mb-1">{isClient ? 'Log in to Portal' : 'Welcome back'}</h2>
            <p className="text-[var(--crm-widget-text-muted)] text-sm mb-8">
              {isClient ? 'Secure access for clients & teams' : 'Sign in to your agency command center'}
            </p>

            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--crm-widget-text-muted)]" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-[var(--crm-widget-surface-1-glass)] border border-[var(--crm-widget-border)] rounded-[var(--radius-button)] px-4 py-3 pl-11 text-sm text-[var(--crm-widget-text)] placeholder-[var(--crm-widget-text-muted)] focus:outline-none focus:border-[var(--people-widget-primary-color-1)] transition-colors"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--crm-widget-text-muted)]" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && onLogin(email, password)}
                  className="w-full bg-[var(--crm-widget-surface-1-glass)] border border-[var(--crm-widget-border)] rounded-[var(--radius-button)] px-4 py-3 pl-11 text-sm text-[var(--crm-widget-text)] placeholder-[var(--crm-widget-text-muted)] focus:outline-none focus:border-[var(--people-widget-primary-color-1)] transition-colors"
                />
              </div>

              {loginError && (
                <p className="text-[var(--crm-widget-error)] text-xs px-1">{loginError}</p>
              )}

              <button
                onClick={() => onLogin(email, password)}
                className="w-full py-3.5 rounded-[var(--radius-button)] font-semibold transition-all flex items-center justify-center gap-2 text-[var(--crm-widget-text)] mt-2"
                style={{ backgroundColor: 'var(--people-widget-primary-color-1)' }}
              >
                Sign In <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {!isClient && (
              <p className="text-center text-xs text-[var(--crm-widget-text-muted)] mt-6">
                No account?{' '}
                <button onClick={() => setMode('signup')} className="text-[var(--crm-widget-text)] hover:text-[var(--crm-widget-text)] transition-colors underline">
                  Create one
                </button>
              </p>
            )}
            
            {isClient && (
              <div className="mt-8 pt-6 border-t border-white/5 text-center">
                <button
                  onClick={() => setLoginPortalType('agency')}
                  className="text-xs text-[var(--crm-widget-text-muted)] hover:text-[var(--crm-widget-text)] transition-all"
                >
                  Return to Agency Platform
                </button>
              </div>
            )}
          </motion.div>
        )}

        {mode === 'signup' && (
          <motion.div
            key="signup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative w-full max-w-md glass-card rounded-[2.5rem] p-10 shadow-2xl border border-[var(--crm-widget-border)]"
          >
            <button
              onClick={() => setMode('landing')}
              className="text-xs text-[var(--crm-widget-text-muted)] hover:text-[var(--crm-widget-text)] mb-8 flex items-center gap-1 transition-colors"
            >
              ← Back
            </button>
            <div className="flex items-center gap-3 mb-1">
              <Zap className="w-5 h-5" style={{ color: 'var(--people-widget-primary-color-1)' }} />
              <h2 className="text-2xl font-bold">Create your agency</h2>
            </div>
            <p className="text-[var(--crm-widget-text-muted)] text-sm mb-8">You'll configure your portal in the next step</p>

            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--crm-widget-text-muted)]" />
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-[var(--crm-widget-surface-1-glass)] border border-[var(--crm-widget-border)] rounded-[var(--radius-button)] px-4 py-3 pl-11 text-sm text-[var(--crm-widget-text)] placeholder-[var(--crm-widget-text-muted)] focus:outline-none focus:border-[var(--people-widget-primary-color-1)] transition-colors"
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--crm-widget-text-muted)]" />
                <input
                  type="email"
                  placeholder="Work email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && name && email && onSignUp(name, email)}
                  className="w-full bg-[var(--crm-widget-surface-1-glass)] border border-[var(--crm-widget-border)] rounded-[var(--radius-button)] px-4 py-3 pl-11 text-sm text-[var(--crm-widget-text)] placeholder-[var(--crm-widget-text-muted)] focus:outline-none focus:border-[var(--people-widget-primary-color-1)] transition-colors"
                />
              </div>

              <button
                onClick={() => name && email && onSignUp(name, email)}
                disabled={!name || !email}
                className="w-full py-3.5 rounded-[var(--radius-button)] font-semibold transition-all flex items-center justify-center gap-2 text-[var(--crm-widget-text)] mt-2 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: 'var(--people-widget-primary-color-1)' }}
              >
                Continue to Setup <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <p className="text-center text-xs text-[var(--crm-widget-text-muted)] mt-6">
              Already have an account?{' '}
              <button onClick={() => setMode('login')} className="text-[var(--crm-widget-text)] hover:text-[var(--crm-widget-text)] transition-colors underline">
                Sign in
              </button>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

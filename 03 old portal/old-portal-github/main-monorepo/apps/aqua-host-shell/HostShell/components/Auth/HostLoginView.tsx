import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Terminal, ArrowRight, Mail, Lock, User, Zap, ExternalLink } from 'lucide-react';
import { useHostContext } from '@HostShell/bridge/HostContext';

interface LoginViewProps {
  onLogin: (email: string, password: string) => void;
  onSignUp: (name: string, email: string) => void;
  loginError?: string;
}

export function LoginView({ onLogin, onSignUp, loginError, type = 'agency' }: LoginViewProps & { type?: 'agency' | 'client' }) {
  const { setLoginHostPortalType, setAppMode, setHostPortalMode } = useHostContext();
  const isClient = type === 'client';
  const [mode, setMode] = useState<'landing' | 'login' | 'signup'>(isClient ? 'login' : 'landing');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const demoLogin = () => {
    onLogin('demo', 'demo');
  };

  const handleDevAccess = () => {
    setAppMode('dev');
    setHostPortalMode('user');
    onLogin('demo', 'demo');
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
            className="relative w-full max-w-md glass-card rounded-[2.5rem] p-10 shadow-2xl border border-[var(--host-border-color)] text-center"
          >
            <div className="w-14 h-14 rounded-[var(--radius-button)] flex items-center justify-center mx-auto mb-6 shadow-lg"
                 style={{ backgroundColor: 'var(--host-widget-primary-color-1)' }}>
              <ShieldCheck className="w-8 h-8 text-[var(--host-text-color)]" />
            </div>
            <h1 className="text-3xl font-bold mb-2">HostAqua HostPortal</h1>
            <p className="text-[var(--host-text-color-muted)] text-sm mb-10">The agency command center platform</p>

            <div className="space-y-3">
              <button
                onClick={() => setMode('login')}
                className="w-full py-3.5 rounded-[var(--radius-button)] font-semibold transition-all flex items-center justify-center gap-2 text-[var(--host-text-color)] hover:brightness-110 shadow-lg shadow-[var(--host-widget-primary-color-1)]/20"
                style={{ backgroundColor: 'var(--host-widget-primary-color-1)' }}
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

            <div className="mt-8 pt-6 border-t border-white/5 flex flex-col gap-2">
              <button
                onClick={() => setLoginHostPortalType('client')}
                className="w-full py-2.5 rounded-[var(--radius-button)] text-xs font-semibold text-[var(--host-text-color-muted)] hover:text-[var(--host-text-color)] transition-all flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Switch to Client HostPortal Login
              </button>
              <button
                onClick={handleDevAccess}
                className="w-full py-2 rounded-[var(--radius-button)] text-[11px] font-mono text-white/20 hover:text-white/50 hover:bg-white/5 transition-all flex items-center justify-center gap-1.5"
              >
                <Terminal className="w-3 h-3" />
                Admin access
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
            className="relative w-full max-w-md glass-card rounded-[2.5rem] p-10 shadow-2xl border border-[var(--host-border-color)]"
          >
            {!isClient && (
              <button
                onClick={() => setMode('landing')}
                className="text-xs text-[var(--host-text-color-muted)] hover:text-[var(--host-text-color)] mb-8 flex items-center gap-1 transition-colors"
              >
                ← Back
              </button>
            )}
            <h2 className="text-2xl font-bold mb-1">{isClient ? 'Log in to HostPortal' : 'Welcome back'}</h2>
            <p className="text-[var(--host-text-color-muted)] text-sm mb-8">
              {isClient ? 'Secure access for clients & teams' : 'Sign in to your agency command center'}
            </p>

            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--host-text-color-muted)]" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-[var(--host-surface-color-glass)] border border-[var(--host-border-color)] rounded-[var(--radius-button)] px-4 py-3 pl-11 text-sm text-[var(--host-text-color)] placeholder-[var(--host-text-color-muted)] focus:outline-none focus:border-[var(--host-widget-primary-color-1)] transition-colors"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--host-text-color-muted)]" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && onLogin(email, password)}
                  className="w-full bg-[var(--host-surface-color-glass)] border border-[var(--host-border-color)] rounded-[var(--radius-button)] px-4 py-3 pl-11 text-sm text-[var(--host-text-color)] placeholder-[var(--host-text-color-muted)] focus:outline-none focus:border-[var(--host-widget-primary-color-1)] transition-colors"
                />
              </div>

              {loginError && (
                <p className="text-[var(--host-widget-error)] text-xs px-1">{loginError}</p>
              )}

              <button
                onClick={() => onLogin(email, password)}
                className="w-full py-3.5 rounded-[var(--radius-button)] font-semibold transition-all flex items-center justify-center gap-2 text-[var(--host-text-color)] mt-2"
                style={{ backgroundColor: 'var(--host-widget-primary-color-1)' }}
              >
                Sign In <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {!isClient && (
              <p className="text-center text-xs text-[var(--host-text-color-muted)] mt-6">
                No account?{' '}
                <button onClick={() => setMode('signup')} className="text-[var(--host-text-color)] hover:text-[var(--host-text-color)] transition-colors underline">
                  Create one
                </button>
              </p>
            )}
            
            {isClient && (
              <div className="mt-8 pt-6 border-t border-white/5 text-center">
                <button
                  onClick={() => setLoginHostPortalType('agency')}
                  className="text-xs text-[var(--host-text-color-muted)] hover:text-[var(--host-text-color)] transition-all"
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
            className="relative w-full max-w-md glass-card rounded-[2.5rem] p-10 shadow-2xl border border-[var(--host-border-color)]"
          >
            <button
              onClick={() => setMode('landing')}
              className="text-xs text-[var(--host-text-color-muted)] hover:text-[var(--host-text-color)] mb-8 flex items-center gap-1 transition-colors"
            >
              ← Back
            </button>
            <div className="flex items-center gap-3 mb-1">
              <Zap className="w-5 h-5" style={{ color: 'var(--host-widget-primary-color-1)' }} />
              <h2 className="text-2xl font-bold">Create your agency</h2>
            </div>
            <p className="text-[var(--host-text-color-muted)] text-sm mb-8">You'll configure your portal in the next step</p>

            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--host-text-color-muted)]" />
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-[var(--host-surface-color-glass)] border border-[var(--host-border-color)] rounded-[var(--radius-button)] px-4 py-3 pl-11 text-sm text-[var(--host-text-color)] placeholder-[var(--host-text-color-muted)] focus:outline-none focus:border-[var(--host-widget-primary-color-1)] transition-colors"
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--host-text-color-muted)]" />
                <input
                  type="email"
                  placeholder="Work email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && name && email && onSignUp(name, email)}
                  className="w-full bg-[var(--host-surface-color-glass)] border border-[var(--host-border-color)] rounded-[var(--radius-button)] px-4 py-3 pl-11 text-sm text-[var(--host-text-color)] placeholder-[var(--host-text-color-muted)] focus:outline-none focus:border-[var(--host-widget-primary-color-1)] transition-colors"
                />
              </div>

              <button
                onClick={() => name && email && onSignUp(name, email)}
                disabled={!name || !email}
                className="w-full py-3.5 rounded-[var(--radius-button)] font-semibold transition-all flex items-center justify-center gap-2 text-[var(--host-text-color)] mt-2 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: 'var(--host-widget-primary-color-1)' }}
              >
                Continue to Setup <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <p className="text-center text-xs text-[var(--host-text-color-muted)] mt-6">
              Already have an account?{' '}
              <button onClick={() => setMode('login')} className="text-[var(--host-text-color)] hover:text-[var(--host-text-color)] transition-colors underline">
                Sign in
              </button>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

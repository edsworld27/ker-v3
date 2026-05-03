import React from 'react';
import { motion } from 'motion/react';

interface LoginViewProps {
  onQuickLogin: (name: string, email: string, avatar: string) => void;
}

export function LoginView({ onQuickLogin }: LoginViewProps) {
  return (
    <div className="flex items-center justify-center w-full min-h-screen relative z-[100] px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.1),transparent_50%)]" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md glass-card rounded-[2.5rem] p-10 shadow-2xl border border-white/10 text-center"
      >
        <h1 className="text-3xl font-bold mb-8">Aqua CRM</h1>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onQuickLogin('Founder', 'edwardhallam07@gmail.com', 'FO')}
            className="w-full py-3 bg-[var(--color-primary)] hover:brightness-110 rounded-xl font-bold transition-all text-sm"
          >
            Login as Founder
          </button>
          <button
            onClick={() => onQuickLogin('Client', 'contact@acme.com', 'CL')}
            className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-all text-sm"
          >
            Login as Client
          </button>
          <button
            onClick={() => onQuickLogin('Operator', 'operator@example.com', 'OP')}
            className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-all text-sm"
          >
            Login as Operator
          </button>
          <button
            onClick={() => onQuickLogin('Employee', 'sarah@example.com', 'EM')}
            className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-all text-sm"
          >
            Login as Employee
          </button>
        </div>
      </motion.div>
    </div>
  );
}

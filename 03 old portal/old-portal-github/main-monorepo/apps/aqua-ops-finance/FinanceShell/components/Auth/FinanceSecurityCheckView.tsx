import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, RotateCcw, ArrowRight } from 'lucide-react';
import { useFinanceContext } from '@FinanceShell/bridge/FinanceContext';

export const SecurityCheckView: React.FC = () => {
  const { handleVerifyMfa, currentUser } = useFinanceContext();
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);

    // Auto-focus next
    if (value && index < 5) {
      const nextInput = document.getElementById(`pin-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      const prevInput = document.getElementById(`pin-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = () => {
    const fullPin = pin.join('');
    if (fullPin.length === 6) {
       // Support '123456' for mock testing
       if (fullPin === '123456') {
         handleVerifyMfa(fullPin);
       } else {
         setError(true);
         setTimeout(() => setError(false), 2000);
       }
    }
  };

  const handleResend = () => {
    setTimer(30);
    setPin(['', '', '', '', '', '']);
  };

  return (
    <div className="min-h-screen bg-[var(--finance-bg-color)] flex items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--finance-primary-color)]/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--finance-primary-color)]/5 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-md w-full glass-card p-10 rounded-[var(--radius-card-lg)] border border-[var(--finance-border-color)] relative z-10 text-center"
      >
        <div className="w-20 h-20 bg-[var(--finance-primary-color)]/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-[var(--finance-primary-color)]/20 shadow-[0_0_30px_rgba(var(--finance-primary-color-rgb),0.1)]">
           <Shield className="w-10 h-10 text-[var(--finance-primary-color)]" />
        </div>

        <h1 className="text-3xl font-bold text-[var(--finance-text-color)] mb-2 tracking-tight">Security Check</h1>
        <p className="text-[var(--finance-text-color-muted)] text-sm mb-10 leading-relaxed">
          We've sent a 6-digit verification code to <br />
          <span className="text-[var(--finance-text-color)] font-medium">{currentUser?.email}</span>
        </p>

        <div className="flex justify-between gap-2 mb-8">
          {pin.map((digit, i) => (
            <input
              key={i}
              id={`pin-${i}`}
              data-design-static="true"
              type="text"
              inputMode="numeric"
              value={digit}
              onChange={(e) => handleInput(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`w-12 h-16 bg-[var(--finance-surface-color-glass)]/5 border rounded-xl text-center text-2xl font-bold text-[var(--finance-text-color)] transition-all focus:outline-none focus:ring-2 focus:ring-[var(--finance-primary-color)]/50 ${
                error ? 'border-[var(--finance-widget-error)]/50 bg-[var(--finance-widget-error)]/5' : 'border-[var(--finance-border-color)] focus:border-[var(--finance-primary-color)]/50'
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={pin.join('').length < 6}
          className="w-full py-4 bg-[var(--finance-primary-color)] text-white rounded-2xl font-bold text-lg shadow-[0_10px_30px_rgba(var(--finance-primary-color-rgb),0.3)] hover:translate-y-[-2px] transition-all disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none flex items-center justify-center gap-2 group"
        >
          Verify Identity
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        <div className="mt-8 flex items-center justify-between text-xs font-bold uppercase tracking-widest">
           <div className="text-[var(--finance-text-color-muted)] flex items-center gap-2">
             <RotateCcw className="w-3 h-3" />
             Expiring in {timer}s
           </div>
           
           {timer === 0 ? (
             <button onClick={handleResend} className="text-[var(--finance-primary-color)] hover:underline">
               Resend Code
             </button>
           ) : (
             <span className="text-[var(--finance-text-color-muted)]/50">Resend Code</span>
           )}
        </div>

        <div className="mt-10 pt-8 border-t border-[var(--finance-border-color)] flex items-center justify-center gap-2 text-[var(--finance-text-color-muted)]/20">
          <Lock className="w-3 h-3" />
          <span className="text-[10px] font-bold tracking-widest uppercase">E2EE Secured Session</span>
        </div>
      </motion.div>
    </div>
  );
};

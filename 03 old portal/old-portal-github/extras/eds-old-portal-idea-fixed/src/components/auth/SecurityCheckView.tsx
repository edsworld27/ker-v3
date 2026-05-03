import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck } from 'lucide-react';

interface SecurityCheckViewProps {
  code: string[];
  setCode: (code: string[]) => void;
  onVerify: () => void;
  onBack: () => void;
}

export function SecurityCheckView({ code, setCode, onVerify, onBack }: SecurityCheckViewProps) {
  const codeRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    if (value && index < 3) {
      codeRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      codeRefs[index - 1].current?.focus();
    }
  };

  return (
    <div className="flex items-center justify-center w-full p-4">
      <motion.div
        key="security"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-card w-full max-w-md p-6 md:p-10 rounded-2xl md:rounded-[32px] shadow-2xl z-10"
      >
        <div className="text-center mb-8 md:mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-[var(--color-primary)]/20 mb-4 md:mb-6">
            <ShieldCheck className="w-7 h-7 md:w-8 md:h-8 text-[var(--color-primary)]" />
          </div>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-2">Security Check</h2>
          <p className="text-xs md:text-sm text-slate-400">We've sent a 4-digit code to your email.</p>
        </div>

        <div className="flex justify-center gap-2 md:gap-4 mb-8 md:mb-10">
          {code.map((digit, i) => (
            <input
              key={i}
              ref={codeRefs[i]}
              type="text"
              maxLength={1}
              value={digit}
              onChange={e => handleCodeChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              className="w-12 h-16 md:w-16 md:h-20 text-center text-2xl md:text-3xl font-bold bg-black/20 border border-white/10 rounded-xl md:rounded-2xl outline-none focus:border-[var(--color-primary)] transition-colors text-white"
            />
          ))}
        </div>

        <button
          onClick={onVerify}
          className="w-full py-3 md:py-4 bg-[var(--color-primary)] hover:brightness-110 text-white font-semibold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm md:text-base"
        >
          Verify Identity
          <ShieldCheck className="w-4 h-4 md:w-5 md:h-5" />
        </button>

        <button
          onClick={onBack}
          className="w-full mt-4 py-2 text-slate-500 hover:text-slate-300 text-xs md:text-sm transition-colors"
        >
          Back to login
        </button>
      </motion.div>
    </div>
  );
}

"use client";

// Setup wizard modal — runs the plugin's declared `setup` steps
// before finalising an install. Plugins like E-commerce (Stripe keys),
// Email (Resend API key), Repo (GitHub token) need credentials first;
// without this modal those plugins would install with empty config and
// silently fail at runtime.
//
// Usage: <SetupWizardModal plugin={p} onCancel={…} onComplete={answers => installPlugin(...)} />

import { useState } from "react";

interface SetupField {
  id: string; label: string;
  type: "text" | "password" | "url" | "email" | "select" | "boolean" | "textarea";
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  helpText?: string;
}

interface SetupStep {
  id: string;
  title: string;
  description: string;
  fields: SetupField[];
  optional?: boolean;
}

interface ApiPlugin {
  id: string;
  name: string;
  setup: SetupStep[];
}

interface Props {
  plugin: ApiPlugin;
  onCancel: () => void;
  onComplete: (answers: Record<string, string>) => Promise<void> | void;
}

export default function SetupWizardModal({ plugin, onCancel, onComplete }: Props) {
  const steps = plugin.setup ?? [];
  const [stepIdx, setStepIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const step = steps[stepIdx];
  const isLast = stepIdx === steps.length - 1;

  function setField(id: string, value: string) {
    setAnswers(prev => ({ ...prev, [id]: value }));
  }

  function validateStep(): string | null {
    if (step.optional) return null;
    for (const field of step.fields) {
      if (field.required && !answers[field.id]?.trim()) {
        return `${field.label} is required.`;
      }
    }
    return null;
  }

  async function next() {
    const v = validateStep();
    if (v) { setError(v); return; }
    setError(null);
    if (isLast) {
      setSubmitting(true);
      try {
        await onComplete(answers);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        setSubmitting(false);
      }
    } else {
      setStepIdx(stepIdx + 1);
    }
  }

  function back() {
    setError(null);
    if (stepIdx > 0) setStepIdx(stepIdx - 1);
  }

  function skip() {
    setError(null);
    if (isLast) {
      void onComplete(answers);
    } else {
      setStepIdx(stepIdx + 1);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-cyan-400/20 bg-[#0a0e1a] shadow-2xl overflow-hidden">
        <header className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <div>
            <p className="text-[10px] tracking-[0.32em] uppercase text-cyan-400">Set up {plugin.name}</p>
            <p className="text-[11px] text-brand-cream/45 mt-0.5">
              Step {stepIdx + 1} of {steps.length}
              {step.optional && <span className="ml-2 text-amber-300/70">Optional</span>}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-brand-cream/50 hover:text-brand-cream text-lg leading-none"
            aria-label="Cancel setup"
          >
            ×
          </button>
        </header>

        <div className="p-5 space-y-4">
          <div>
            <h2 className="font-display text-xl text-brand-cream mb-1">{step.title}</h2>
            <p className="text-[12px] text-brand-cream/55 leading-relaxed">{step.description}</p>
          </div>

          <div className="space-y-3">
            {step.fields.map(field => (
              <div key={field.id} className="space-y-1">
                <label className="text-[11px] text-brand-cream/75 font-medium block">
                  {field.label}
                  {field.required && <span className="text-cyan-400 ml-1">*</span>}
                </label>
                {field.helpText && (
                  <p className="text-[10px] text-brand-cream/40">{field.helpText}</p>
                )}
                {field.type === "select" ? (
                  <select
                    value={answers[field.id] ?? ""}
                    onChange={e => setField(field.id, e.target.value)}
                    className={INPUT_CLASS}
                  >
                    <option value="">Select…</option>
                    {field.options?.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                ) : field.type === "textarea" ? (
                  <textarea
                    value={answers[field.id] ?? ""}
                    onChange={e => setField(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    rows={4}
                    className={INPUT_CLASS}
                  />
                ) : field.type === "boolean" ? (
                  <input
                    type="checkbox"
                    checked={answers[field.id] === "true"}
                    onChange={e => setField(field.id, e.target.checked ? "true" : "false")}
                    className="w-4 h-4 accent-cyan-400"
                  />
                ) : (
                  <input
                    type={field.type === "password" ? "password" : "text"}
                    value={answers[field.id] ?? ""}
                    onChange={e => setField(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    className={INPUT_CLASS}
                  />
                )}
              </div>
            ))}
          </div>

          {error && (
            <p className="text-[11px] text-red-300">{error}</p>
          )}
        </div>

        <footer className="px-5 py-4 border-t border-white/5 flex items-center justify-between gap-2">
          <div>
            {stepIdx > 0 && (
              <button
                type="button"
                onClick={back}
                disabled={submitting}
                className="text-[11px] text-brand-cream/55 hover:text-brand-cream transition-colors disabled:opacity-40"
              >
                ← Back
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {step.optional && (
              <button
                type="button"
                onClick={skip}
                disabled={submitting}
                className="text-[11px] text-brand-cream/55 hover:text-brand-cream transition-colors disabled:opacity-40"
              >
                Skip
              </button>
            )}
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="px-3 py-1.5 rounded-md text-[11px] text-brand-cream/65 hover:text-brand-cream transition-colors disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={next}
              disabled={submitting}
              className="px-3 py-1.5 rounded-md text-[11px] font-medium bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 border border-cyan-400/20 transition-colors disabled:opacity-40"
            >
              {submitting ? "Installing…" : isLast ? "Finish & install" : "Next →"}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

const INPUT_CLASS = "w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-[12px] text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-cyan-400/40";

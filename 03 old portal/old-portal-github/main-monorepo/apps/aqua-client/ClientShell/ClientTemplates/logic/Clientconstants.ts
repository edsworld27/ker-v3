export const CLIENT_STAGES = [
  { id: 'discovery',   label: 'Discovery',   color: 'bg-[var(--client-widget-primary-color-1)]', hex: '#6366f1' },
  { id: 'onboarding',  label: 'Onboarding',  color: 'bg-[var(--client-widget-info)]',    hex: '#3b82f6' },
  { id: 'design',      label: 'Design',      color: 'bg-[var(--client-widget-info)]',    hex: '#8b5cf6' },
  { id: 'development', label: 'Development', color: 'bg-[var(--client-widget-info)]',   hex: '#06b6d4' },
  { id: 'live',        label: 'Live',        color: 'bg-[var(--client-widget-success)]',hex: '#10b981' },
] as const;

export type ClientStageId = typeof CLIENT_STAGES[number]['id'];

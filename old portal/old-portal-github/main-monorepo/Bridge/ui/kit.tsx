/**
 * @aqua/bridge/ui/kit — Unified UI primitives for all hubs.
 *
 * Replaces the per-app component sets (CRMButton, FinanceCard,
 * RevenueSelect, etc.) with one cohesive vocabulary. Every Aqua hub
 * imports from here so the visual language stays consistent.
 *
 * Self-contained: no lucide-react, no motion, no Tailwind plugins.
 * Each consumer app passes their own icon components (via the `icon`
 * prop of Button/KpiCard/EmptyState) when it wants iconography.
 *
 * Design language:
 *   - Surfaces: subtle white/5 fills with white/10 borders (dark base)
 *   - Radius: 12px / 16px (rounded-xl / rounded-2xl). No 3rem absurd radii.
 *   - Typography: font-semibold for titles, font-medium for labels.
 *   - Accents: indigo for actions, semantic colors for state.
 *   - Spacing: 4 / 6 / 8 / 12 multiples.
 *
 * Usage: `import { Button, Card, KpiCard, ... } from '@aqua/bridge/ui/kit';`
 */
'use client';

import React, { ReactNode, ComponentType, ReactElement, useEffect } from 'react';

// ── Local icons (inline SVG, zero deps) ─────────────────────────────────────

const CloseIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
    <path d="M5 5l10 10M15 5L5 15" />
  </svg>
);

// ── Page chrome ─────────────────────────────────────────────────────────────

export const Page: React.FC<{ children: ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`min-h-screen bg-[#0a0a0c] text-slate-100 ${className}`}>
    <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8 sm:py-10">{children}</div>
  </div>
);

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  eyebrow?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actions, eyebrow }) => (
  <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-8 border-b border-white/5 mb-8">
    <div className="min-w-0">
      {eyebrow ? <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500 font-medium mb-2">{eyebrow}</div> : null}
      <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">{title}</h1>
      {subtitle ? <p className="text-sm text-slate-400 mt-1.5 max-w-2xl leading-relaxed">{subtitle}</p> : null}
    </div>
    {actions ? <div className="flex items-center gap-2 shrink-0">{actions}</div> : null}
  </header>
);

// ── Cards ───────────────────────────────────────────────────────────────────

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
  interactive?: boolean;
}

const padCls = { none: '', sm: 'p-4', md: 'p-6', lg: 'p-8' };

export const Card: React.FC<CardProps> = ({ children, className = '', padding = 'md', onClick, interactive }) => {
  const base = `bg-white/[0.03] border border-white/5 rounded-2xl ${padCls[padding]}`;
  const interactiveCls = onClick || interactive
    ? 'hover:bg-white/[0.06] hover:border-white/10 transition-colors cursor-pointer'
    : '';
  if (onClick) {
    return (
      <button onClick={onClick} className={`${base} ${interactiveCls} text-left w-full ${className}`}>
        {children}
      </button>
    );
  }
  return <div className={`${base} ${interactiveCls} ${className}`}>{children}</div>;
};

interface KpiCardProps {
  label: string;
  value: ReactNode;
  delta?: string;
  trend?: 'up' | 'down' | 'flat';
  icon?: ComponentType<{ className?: string }>;
}

export const KpiCard: React.FC<KpiCardProps> = ({ label, value, delta, trend = 'flat', icon: Icon }) => {
  const trendColor = trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-rose-400' : 'text-slate-400';
  return (
    <Card padding="md">
      <div className="flex items-start justify-between mb-4">
        {Icon ? (
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Icon className="w-4 h-4 text-indigo-300" />
          </div>
        ) : <span />}
        {delta ? <span className={`text-xs font-medium ${trendColor}`}>{delta}</span> : null}
      </div>
      <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1.5">{label}</div>
      <div className="text-2xl font-semibold text-white tabular-nums">{value}</div>
    </Card>
  );
};

// ── Buttons ─────────────────────────────────────────────────────────────────

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ComponentType<{ className?: string }>;
  iconRight?: ComponentType<{ className?: string }>;
  loading?: boolean;
  children?: ReactNode;
}

const btnVariant: Record<ButtonVariant, string> = {
  primary: 'bg-indigo-500 hover:bg-indigo-400 text-white border-transparent disabled:bg-indigo-500/40',
  secondary: 'bg-white/[0.06] hover:bg-white/[0.12] text-white border-white/10',
  ghost: 'bg-transparent hover:bg-white/[0.06] text-slate-300 hover:text-white border-transparent',
  danger: 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 hover:text-rose-200 border-rose-500/20',
  outline: 'bg-transparent hover:bg-white/[0.04] text-slate-200 border-white/15 hover:border-white/25',
};

const btnSize: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-lg',
  lg: 'h-12 px-5 text-sm gap-2 rounded-xl',
};

const btnIconSize: Record<ButtonSize, string> = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-4 h-4',
};

export const Button: React.FC<ButtonProps> = (props) => {
  const {
    variant = 'secondary',
    size = 'md',
    icon: Icon,
    iconRight: IconRight,
    loading,
    children,
    className = '',
    disabled,
    ...rest
  } = props;
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-medium border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${btnVariant[variant]} ${btnSize[size]} ${className}`}
    >
      {loading ? (
        <span className={`${btnIconSize[size]} border-2 border-current border-t-transparent rounded-full animate-spin`} />
      ) : Icon ? (
        <Icon className={btnIconSize[size]} />
      ) : null}
      {children ? <span>{children}</span> : null}
      {IconRight ? <IconRight className={btnIconSize[size]} /> : null}
    </button>
  );
};

// ── Form primitives ─────────────────────────────────────────────────────────

const inputBase =
  'w-full px-3 h-10 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-colors disabled:opacity-50';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className = '', ...rest }, ref) => (
    <input ref={ref} {...rest} className={`${inputBase} ${className}`} />
  ),
);
Input.displayName = 'Input';

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className = '', rows = 3, ...rest }, ref) => (
    <textarea ref={ref} rows={rows} {...rest} className={`${inputBase} h-auto py-2 resize-y leading-relaxed ${className}`} />
  ),
);
Textarea.displayName = 'Textarea';

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className = '', children, ...rest }, ref) => (
    <select ref={ref} {...rest} className={`${inputBase} appearance-none pr-8 ${className}`}>
      {children}
    </select>
  ),
);
Select.displayName = 'Select';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: ComponentType<{ className?: string }>;
}

export const SearchInput: React.FC<SearchInputProps> = (props) => {
  const { icon: Icon, className = '', ...rest } = props;
  return (
    <div className="relative">
      {Icon ? <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" /> : null}
      <input {...rest} className={`${inputBase} ${Icon ? 'pl-9' : ''} ${className}`} />
    </div>
  );
};

interface FieldProps {
  label?: string;
  help?: string;
  required?: boolean;
  children: ReactNode;
}

export const Field: React.FC<FieldProps> = ({ label, help, required, children }) => (
  <div className="space-y-1.5">
    {label ? (
      <label className="text-xs text-slate-400 font-medium tracking-wide flex items-center gap-1">
        {label}
        {required ? <span className="text-rose-400">*</span> : null}
      </label>
    ) : null}
    {children}
    {help ? <p className="text-[11px] text-slate-500">{help}</p> : null}
  </div>
);

// ── Modal (CSS animations, no motion lib) ───────────────────────────────────

type ModalSize = 'sm' | 'md' | 'lg' | 'xl';
const modalSize: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-3xl',
};

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: ModalSize;
  footer?: ReactNode;
  children: ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ open, onClose, title, description, size = 'md', footer, children }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }
    return undefined;
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6"
      style={{ animation: 'aqua-fade-in 150ms ease-out' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full ${modalSize[size]} bg-[#0e0e10] border border-white/10 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden`}
        style={{ animation: 'aqua-slide-up 180ms cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        {(title || description) ? (
          <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-white/5">
            <div className="min-w-0">
              {title ? <h3 className="text-base font-semibold text-white">{title}</h3> : null}
              {description ? <p className="text-xs text-slate-400 mt-1">{description}</p> : null}
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors -mr-1 -mt-1 p-1" aria-label="Close">
              <CloseIcon />
            </button>
          </div>
        ) : null}
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">{children}</div>
        {footer ? (
          <div className="flex items-center justify-end gap-2 px-6 py-3 border-t border-white/5 bg-white/[0.02]">{footer}</div>
        ) : null}
      </div>
      <style>{`
        @keyframes aqua-fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes aqua-slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

// ── Badge / pills ───────────────────────────────────────────────────────────

type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'indigo' | 'amber';
const badgeTone: Record<BadgeTone, string> = {
  neutral: 'bg-white/5 text-slate-300 border-white/10',
  success: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  danger:  'bg-rose-500/10 text-rose-300 border-rose-500/20',
  info:    'bg-sky-500/10 text-sky-300 border-sky-500/20',
  indigo:  'bg-indigo-500/15 text-indigo-300 border-indigo-500/25',
  amber:   'bg-amber-500/10 text-amber-300 border-amber-500/20',
};

export const Badge: React.FC<{ tone?: BadgeTone; children: ReactNode; className?: string }> = ({ tone = 'neutral', children, className = '' }) => (
  <span className={`inline-flex items-center px-2 h-5 rounded-md text-[11px] font-medium border ${badgeTone[tone]} ${className}`}>
    {children}
  </span>
);

// ── Empty state ─────────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon?: ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
    {Icon ? (
      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
        <Icon className="w-5 h-5 text-slate-500" />
      </div>
    ) : null}
    <h3 className="text-base font-semibold text-white mb-1">{title}</h3>
    {description ? <p className="text-sm text-slate-400 max-w-sm">{description}</p> : null}
    {action ? <div className="mt-5">{action}</div> : null}
  </div>
);

// ── Section ─────────────────────────────────────────────────────────────────

interface SectionProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export const Section: React.FC<SectionProps> = ({ title, description, actions, children, className = '' }) => (
  <section className={`space-y-4 ${className}`}>
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2 className="text-base font-semibold text-white">{title}</h2>
        {description ? <p className="text-xs text-slate-400 mt-0.5">{description}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
    {children}
  </section>
);

// ── Table ────────────────────────────────────────────────────────────────────

export interface Column<T> {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  align?: 'left' | 'right' | 'center';
  width?: string;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  empty?: ReactElement;
}

export function DataTable<T>(props: DataTableProps<T>): ReactElement {
  const { columns, rows, rowKey, onRowClick, empty } = props;
  if (rows.length === 0 && empty) return empty;
  return (
    <div className="overflow-x-auto rounded-xl border border-white/5">
      <table className="w-full text-sm">
        <thead className="bg-white/[0.02] border-b border-white/5">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={col.width ? { width: col.width } : undefined}
                className={`px-3 py-2.5 text-[11px] font-medium uppercase tracking-wider text-slate-500 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${col.className ?? ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={onRowClick ? 'hover:bg-white/[0.04] cursor-pointer transition-colors' : ''}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-3 py-2.5 text-slate-200 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${col.className ?? ''}`}
                >
                  {col.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Toast ────────────────────────────────────────────────────────────────────

interface ToastProps {
  message: string;
  tone?: BadgeTone;
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, tone = 'success', onClose }) => (
  <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] px-4 py-2.5 rounded-xl border shadow-2xl backdrop-blur-md text-sm font-medium ${badgeTone[tone]}`}>
    <span>{message}</span>
    {onClose ? (
      <button onClick={onClose} className="ml-3 opacity-60 hover:opacity-100 inline-flex items-center" aria-label="Dismiss">
        <CloseIcon className="w-3.5 h-3.5" />
      </button>
    ) : null}
  </div>
);

// ── Avatar ───────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  'from-indigo-500 to-sky-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-pink-500',
  'from-violet-500 to-fuchsia-500',
  'from-sky-500 to-cyan-500',
];

const colorFor = (key: string): string => {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
};

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Avatar: React.FC<AvatarProps> = ({ name, size = 'md' }) => {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
  const sizeCls = size === 'sm' ? 'w-7 h-7 text-[10px]' : size === 'lg' ? 'w-12 h-12 text-base' : 'w-9 h-9 text-xs';
  return (
    <div className={`rounded-full bg-gradient-to-br ${colorFor(name)} text-white font-semibold flex items-center justify-center shrink-0 ${sizeCls}`}>
      {initials}
    </div>
  );
};

'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Zap,
  Search,
  Box,
  Package,
  Filter,
  ShieldCheck,
  Loader2,
  Settings,
  Trash2,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Save,
  Eye,
  EyeOff,
  Lock,
} from 'lucide-react';
import {
  Page,
  PageHeader,
  Card,
  Button,
  SearchInput,
  Modal,
  Field,
  Input,
  Textarea,
  Select,
  Badge,
  EmptyState,
  Toast as KitToast,
} from '@aqua/bridge/ui/kit';
import { useHostContext } from '@HostShell/bridge/HostContext';
import { SUITE_METADATA } from '@HostShell/bridge/HostsuiteRegistry';
import { HostRegistration } from '@HostShell/bridge/HostRegistration';
import type {
  SuiteTemplate,
  PluginCategory,
  PluginConfigField,
  PluginLifecycleContext,
} from '@aqua/bridge/types';

const CATEGORIES: ReadonlyArray<'All' | PluginCategory> = [
  'All', 'Sales', 'Marketing', 'Finance', 'People', 'Operations', 'Content', 'Integrations', 'Analytics', 'Other',
];

type InstallState = 'not-installed' | 'installed' | 'coming-soon';

interface ToastEntry {
  id: string;
  message: string;
  type: 'error' | 'success';
}

function getInstallState(suite: SuiteTemplate, enabledIds: string[]): InstallState {
  const isRegistered = HostRegistration.getRegisteredIds()
    .map(id => id.toLowerCase())
    .includes(suite.id.toLowerCase());
  if (suite.pricing === 'enterprise' && !isRegistered) return 'coming-soon';
  return enabledIds.includes(suite.id) ? 'installed' : 'not-installed';
}

const PRICING_TONE: Record<NonNullable<SuiteTemplate['pricing']>, 'success' | 'indigo' | 'amber'> = {
  free: 'success',
  pro: 'indigo',
  enterprise: 'amber',
};

function categoryFromSuite(suite: SuiteTemplate): PluginCategory {
  if (suite.category) return suite.category;
  const sectionToCategory: Record<string, PluginCategory> = {
    Finance: 'Finance', People: 'People', 'People Hub': 'People',
    Operations: 'Operations', 'Enterprise Hub': 'Operations',
    CMS: 'Content', Experience: 'Content',
    Sales: 'Sales', Marketing: 'Marketing',
    Integrations: 'Integrations', Analytics: 'Analytics',
  };
  return sectionToCategory[suite.section ?? ''] ?? 'Other';
}

function defaultConfigValues(schema?: PluginConfigField[]): Record<string, unknown> {
  if (!schema) return {};
  const out: Record<string, unknown> = {};
  for (const field of schema) {
    if (field.default !== undefined) {
      out[field.key] = field.default;
    } else {
      switch (field.type) {
        case 'string': case 'select': out[field.key] = ''; break;
        case 'number': out[field.key] = 0; break;
        case 'boolean': out[field.key] = false; break;
        case 'multiselect': out[field.key] = []; break;
        case 'json': out[field.key] = ''; break;
      }
    }
  }
  return out;
}

export const TemplateHubView: React.FC = () => {
  const {
    enabledSuiteIds,
    toggleSuite,
    currentUser,
    currentUserEmail,
    addLog,
    activeAgencyId,
  } = useHostContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'All' | PluginCategory>('All');
  const [, setTick] = useState(0);
  const [pendingSuiteIds, setPendingSuiteIds] = useState<Set<string>>(new Set());
  const [configSuiteId, setConfigSuiteId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const toastTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => HostRegistration.subscribe(() => setTick(t => t + 1)), []);

  useEffect(() => {
    const timers = toastTimers.current;
    return () => {
      timers.forEach(t => clearTimeout(t));
      timers.clear();
    };
  }, []);

  const suites = SUITE_METADATA.all as SuiteTemplate[];
  const configSuite = useMemo<SuiteTemplate | null>(() => {
    if (!configSuiteId) return null;
    return suites.find(s => s.id === configSuiteId) ?? null;
  }, [configSuiteId, suites]);

  const filteredSuites = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return suites.filter(suite => {
      const matchesSearch =
        q.length === 0 ||
        suite.label.toLowerCase().includes(q) ||
        suite.id.toLowerCase().includes(q) ||
        (suite.description ?? '').toLowerCase().includes(q);
      const matchesCategory = activeCategory === 'All' || categoryFromSuite(suite) === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [suites, searchQuery, activeCategory]);

  const pushToast = useCallback((message: string, type: ToastEntry['type'] = 'error') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts(prev => [...prev, { id, message, type }]);
    const timer = setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
      toastTimers.current.delete(id);
    }, 3000);
    toastTimers.current.set(id, timer);
  }, []);

  const buildLifecycleContext = useCallback(
    (config: Record<string, unknown> = {}): PluginLifecycleContext => ({
      agencyId: activeAgencyId,
      userId: currentUser?.id,
      config,
    }),
    [activeAgencyId, currentUser?.id],
  );

  const persistSuiteState = useCallback(
    async (suiteId: string, payload: { enabled?: boolean; config?: Record<string, unknown> }) => {
      const res = await fetch('/api/bridge/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agencyId: activeAgencyId, suiteId, ...payload }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    },
    [activeAgencyId],
  );

  const setPending = useCallback((suiteId: string, on: boolean) => {
    setPendingSuiteIds(prev => {
      const next = new Set(prev);
      if (on) next.add(suiteId);
      else next.delete(suiteId);
      return next;
    });
  }, []);

  const handleInstall = useCallback(async (suite: SuiteTemplate) => {
    if (pendingSuiteIds.has(suite.id)) return;
    setPending(suite.id, true);
    toggleSuite(suite.id);
    try {
      await persistSuiteState(suite.id, { enabled: true });
      addLog('Marketplace', `Installed plugin: ${suite.label}`, 'success');
      try { await suite.onInstall?.(buildLifecycleContext()); }
      catch (hookErr) { console.error(`[Marketplace] onInstall hook for ${suite.id} threw`, hookErr); }
    } catch (err) {
      toggleSuite(suite.id);
      pushToast(`Failed to install ${suite.label}`, 'error');
      addLog('Marketplace', `Install failed for ${suite.label}: ${String(err)}`, 'error');
    } finally {
      setPending(suite.id, false);
    }
  }, [pendingSuiteIds, setPending, toggleSuite, persistSuiteState, addLog, buildLifecycleContext, pushToast]);

  const handleUninstall = useCallback(async (suite: SuiteTemplate) => {
    if (pendingSuiteIds.has(suite.id)) return;
    setPending(suite.id, true);
    toggleSuite(suite.id);
    try {
      await persistSuiteState(suite.id, { enabled: false });
      addLog('Marketplace', `Uninstalled plugin: ${suite.label}`, 'info');
      try { await suite.onUninstall?.(buildLifecycleContext()); }
      catch (hookErr) { console.error(`[Marketplace] onUninstall hook for ${suite.id} threw`, hookErr); }
    } catch (err) {
      toggleSuite(suite.id);
      pushToast(`Failed to uninstall ${suite.label}`, 'error');
      addLog('Marketplace', `Uninstall failed for ${suite.label}: ${String(err)}`, 'error');
    } finally {
      setPending(suite.id, false);
    }
  }, [pendingSuiteIds, setPending, toggleSuite, persistSuiteState, addLog, buildLifecycleContext, pushToast]);

  const handleSaveConfig = useCallback(async (suite: SuiteTemplate, newConfig: Record<string, unknown>) => {
    setPending(suite.id, true);
    try {
      await persistSuiteState(suite.id, { config: newConfig });
      addLog('Marketplace', `Updated config for ${suite.label}`, 'success');
      try { await suite.onConfigChange?.(buildLifecycleContext(newConfig), {}, newConfig); }
      catch (hookErr) { console.error(`[Marketplace] onConfigChange hook for ${suite.id} threw`, hookErr); }
      setConfigSuiteId(null);
    } catch (err) {
      pushToast(`Failed to save config for ${suite.label}`, 'error');
      addLog('Marketplace', `Config save failed for ${suite.label}: ${String(err)}`, 'error');
    } finally {
      setPending(suite.id, false);
    }
  }, [setPending, persistSuiteState, addLog, buildLifecycleContext, pushToast]);

  const handleAquaFocusPreset = useCallback(() => {
    const aquaIds = ['clients-hub-suite', 'website-suite'];
    aquaIds.forEach(id => {
      const suite = suites.find(s => s.id === id);
      if (suite && !enabledSuiteIds.includes(id)) {
        void handleInstall(suite);
      }
    });
    addLog('Marketplace', 'Enabled AQUA Client Focus preset', 'info');
  }, [suites, enabledSuiteIds, handleInstall, addLog]);

  return (
    <Page>
      <PageHeader
        eyebrow="Marketplace"
        title="Plugins"
        subtitle={`Browse, install, and configure suites available to your agency. Authorized: ${currentUserEmail}.`}
        actions={
          <>
            <SearchInput
              icon={Search}
              placeholder="Search plugins..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-72 hidden md:block"
            />
            <Button variant="primary" icon={Zap} onClick={handleAquaFocusPreset}>
              AQUA Client preset
            </Button>
          </>
        }
      />

      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 custom-scrollbar whitespace-nowrap">
        <Filter className="w-3.5 h-3.5 text-slate-500 mr-1 shrink-0" />
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`h-8 px-3 rounded-md text-xs font-medium transition-colors border whitespace-nowrap ${
              activeCategory === cat
                ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-200'
                : 'bg-white/[0.03] border-white/5 text-slate-400 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {suites.length === 0 ? (
        <Card padding="lg">
          <EmptyState
            icon={Box}
            title="No plugins available yet"
            description="Once suites are registered with the Bridge, they will appear here as installable plugins."
          />
        </Card>
      ) : filteredSuites.length === 0 ? (
        <Card padding="lg">
          <EmptyState
            icon={Search}
            title="No plugins match your filters"
            description="Try a different search term or category."
            action={
              <Button size="sm" onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}>
                Clear filters
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredSuites.map(suite => (
            <PluginCard
              key={suite.id}
              suite={suite}
              state={getInstallState(suite, enabledSuiteIds)}
              pending={pendingSuiteIds.has(suite.id)}
              onInstall={() => void handleInstall(suite)}
              onUninstall={() => void handleUninstall(suite)}
              onConfigure={() => setConfigSuiteId(suite.id)}
            />
          ))}
        </div>
      )}

      <footer className="mt-12 pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Registry nominal
          </span>
          <span>·</span>
          <span>{suites.length} plugins</span>
          <span>·</span>
          <span className="text-slate-300">{enabledSuiteIds.length} installed</span>
        </div>
        <div className="inline-flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-300" />
          <span>Bridge marketplace v1.0</span>
        </div>
      </footer>

      {configSuite ? (
        <ConfigDrawer
          key={configSuite.id}
          suite={configSuite}
          saving={pendingSuiteIds.has(configSuite.id)}
          onClose={() => setConfigSuiteId(null)}
          onSave={config => void handleSaveConfig(configSuite, config)}
        />
      ) : null}

      <div className="fixed bottom-6 right-6 z-[300] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <KitToast
              tone={t.type === 'error' ? 'danger' : 'success'}
              message={t.message}
              onClose={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
            />
          </div>
        ))}
      </div>
    </Page>
  );
};

export default TemplateHubView;

interface PluginCardProps {
  suite: SuiteTemplate;
  state: InstallState;
  pending: boolean;
  onInstall: () => void;
  onUninstall: () => void;
  onConfigure: () => void;
}

const PluginCard: React.FC<PluginCardProps> = ({ suite, state, pending, onInstall, onUninstall, onConfigure }) => {
  const Icon = suite.icon || Package;
  const subItemCount = suite.subItems?.length ?? 0;
  const category = categoryFromSuite(suite);
  const installed = state === 'installed';
  const comingSoon = state === 'coming-soon';

  return (
    <Card padding="md" className={installed ? 'border-indigo-500/25 bg-indigo-500/[0.02]' : ''}>
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 ${
            installed
              ? 'bg-indigo-500/10 border-indigo-500/25 text-indigo-300'
              : 'bg-white/[0.04] border-white/5 text-slate-400'
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge tone="neutral">{category}</Badge>
          {suite.pricing ? <Badge tone={PRICING_TONE[suite.pricing]}>{suite.pricing}</Badge> : null}
        </div>
      </div>

      <h3 className="text-base font-semibold text-white mb-1.5">{suite.label}</h3>
      {suite.description ? (
        <p className="text-xs text-slate-400 leading-relaxed mb-3 line-clamp-2">{suite.description}</p>
      ) : (
        <p className="text-xs text-slate-600 italic mb-3">No description provided.</p>
      )}

      <div className="flex items-center gap-1.5 mb-4 text-[11px] text-slate-500">
        <Box className="w-3 h-3" />
        <span>{subItemCount} {subItemCount === 1 ? 'view' : 'views'}</span>
      </div>

      <div className="pt-3 border-t border-white/5 flex items-center gap-2">
        {pending ? (
          <Button variant="secondary" size="sm" loading className="flex-1">Working…</Button>
        ) : comingSoon ? (
          <Button variant="outline" size="sm" icon={Lock} disabled className="flex-1 text-amber-300 border-amber-500/25 bg-amber-500/[0.06]">
            Coming soon
          </Button>
        ) : installed ? (
          <>
            <Button variant="secondary" size="sm" icon={Settings} onClick={onConfigure} className="flex-1">
              Configure
            </Button>
            <Button variant="danger" size="sm" icon={Trash2} onClick={onUninstall} aria-label={`Uninstall ${suite.label}`} />
          </>
        ) : (
          <Button variant="primary" size="sm" icon={Plus} onClick={onInstall} className="flex-1">
            Install
          </Button>
        )}
      </div>
    </Card>
  );
};

interface ConfigDrawerProps {
  suite: SuiteTemplate;
  saving: boolean;
  onClose: () => void;
  onSave: (config: Record<string, unknown>) => void;
}

const ConfigDrawer: React.FC<ConfigDrawerProps> = ({ suite, saving, onClose, onSave }) => {
  const schema = suite.configSchema ?? [];
  const [values, setValues] = useState<Record<string, unknown>>(() => defaultConfigValues(schema));
  const [revealedSecrets, setRevealedSecrets] = useState<Record<string, boolean>>({});

  const setValue = useCallback((key: string, val: unknown) => {
    setValues(prev => ({ ...prev, [key]: val }));
  }, []);

  const toggleReveal = useCallback((key: string) => {
    setRevealedSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  return (
    <Modal
      open
      onClose={onClose}
      title={suite.label}
      description="Plugin configuration"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button
            variant="primary"
            icon={saving ? Loader2 : Save}
            onClick={() => onSave(values)}
            disabled={saving || schema.length === 0}
            loading={saving}
          >
            {saving ? 'Saving' : 'Save config'}
          </Button>
        </>
      }
    >
      {schema.length === 0 ? (
        <EmptyState
          icon={Settings}
          title="Nothing to configure"
          description="This plugin has no configurable options — it just works."
        />
      ) : (
        <div className="space-y-4">
          {schema.map(field => (
            <ConfigFieldRenderer
              key={field.key}
              field={field}
              value={values[field.key]}
              revealed={!!revealedSecrets[field.key]}
              onChange={val => setValue(field.key, val)}
              onToggleReveal={() => toggleReveal(field.key)}
            />
          ))}
        </div>
      )}
    </Modal>
  );
};

interface ConfigFieldRendererProps {
  field: PluginConfigField;
  value: unknown;
  revealed: boolean;
  onChange: (val: unknown) => void;
  onToggleReveal: () => void;
}

const ConfigFieldRenderer: React.FC<ConfigFieldRendererProps> = ({ field, value, revealed, onChange, onToggleReveal }) => {
  switch (field.type) {
    case 'string': {
      const strVal = typeof value === 'string' ? value : '';
      const masked = field.secret && !revealed;
      return (
        <Field
          label={field.label + (field.secret ? ' (secret)' : '')}
          required={field.required}
          help={field.description}
        >
          <div className="relative">
            <Input
              type={masked ? 'password' : 'text'}
              value={strVal}
              placeholder={field.placeholder}
              onChange={e => onChange(e.target.value)}
              className={field.secret ? 'pr-10' : ''}
            />
            {field.secret ? (
              <button
                type="button"
                onClick={onToggleReveal}
                aria-label={revealed ? 'Hide value' : 'Reveal value'}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-colors"
              >
                {revealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            ) : null}
          </div>
        </Field>
      );
    }
    case 'number': {
      const numVal = typeof value === 'number' ? value : Number(value ?? 0) || 0;
      return (
        <Field label={field.label} required={field.required} help={field.description}>
          <Input
            type="number"
            value={Number.isFinite(numVal) ? numVal : 0}
            placeholder={field.placeholder}
            onChange={e => {
              const parsed = e.target.value === '' ? 0 : Number(e.target.value);
              onChange(Number.isFinite(parsed) ? parsed : 0);
            }}
          />
        </Field>
      );
    }
    case 'boolean': {
      const boolVal = !!value;
      return (
        <div className="flex items-start justify-between gap-4 bg-white/[0.03] border border-white/5 rounded-xl px-3 py-3">
          <div className="min-w-0">
            <div className="text-xs font-medium text-slate-200">{field.label}</div>
            {field.description ? (
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{field.description}</p>
            ) : null}
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={boolVal}
            onClick={() => onChange(!boolVal)}
            className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${
              boolVal ? 'bg-indigo-500' : 'bg-white/10'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                boolVal ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      );
    }
    case 'select': {
      const strVal = typeof value === 'string' ? value : '';
      return (
        <Field label={field.label} required={field.required} help={field.description}>
          <Select value={strVal} onChange={e => onChange(e.target.value)}>
            <option value="" disabled>{field.placeholder ?? 'Select an option'}</option>
            {(field.options ?? []).map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </Select>
        </Field>
      );
    }
    case 'multiselect': {
      const arrVal = Array.isArray(value) ? (value as string[]) : [];
      const toggleOpt = (opt: string) => {
        if (arrVal.includes(opt)) onChange(arrVal.filter(v => v !== opt));
        else onChange([...arrVal, opt]);
      };
      return (
        <Field label={field.label} required={field.required} help={field.description}>
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-2 space-y-1 max-h-56 overflow-y-auto">
            {(field.options ?? []).length === 0 ? (
              <p className="text-xs text-slate-500 italic px-2 py-1.5">No options available.</p>
            ) : (
              (field.options ?? []).map(opt => {
                const checked = arrVal.includes(opt);
                return (
                  <label
                    key={opt}
                    className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-white/[0.05] cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleOpt(opt)}
                      className="w-3.5 h-3.5 rounded border-white/20 bg-white/5 accent-indigo-500"
                    />
                    <span className="text-sm text-slate-200">{opt}</span>
                  </label>
                );
              })
            )}
          </div>
        </Field>
      );
    }
    case 'json': {
      const strVal = typeof value === 'string' ? value : JSON.stringify(value ?? '', null, 2);
      return (
        <Field label={field.label} required={field.required} help={field.description}>
          <Textarea
            value={strVal}
            onChange={e => onChange(e.target.value)}
            placeholder={field.placeholder ?? '{ }'}
            rows={6}
            className="font-mono text-xs"
          />
        </Field>
      );
    }
    default:
      return null;
  }
};

// Re-exports kept to avoid breaking imports in case anything pulled these helpers
export { CheckCircle2, AlertTriangle };

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Save, Palette, Shield, Zap, Tag, Plus, Trash2, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { useAppContext } from '../../../context/AppContext';
import { useTheme } from '../../../hooks/useTheme';
import { AgencyConfig, RoleConfig, FeatureKey, LabelKey, agencyConfig as defaultConfig } from '../../../config/agencyConfig';

// All views that can be toggled per role
const ALL_VIEWS: { id: string; label: string; group: string }[] = [
  { id: 'dashboard',            label: 'Dashboard',          group: 'Core' },
  { id: 'admin-dashboard',      label: 'Admin Dashboard',    group: 'Core' },
  { id: 'agency-clients',       label: 'Clients',            group: 'Agency' },
  { id: 'client-management',    label: 'Client Management',  group: 'Agency' },
  { id: 'project-hub',          label: 'Projects',           group: 'Agency' },
  { id: 'task-board',           label: 'Task Board',         group: 'Agency' },
  { id: 'employee-management',  label: 'Team',               group: 'Agency' },
  { id: 'agency-communicate',   label: 'Communicate',        group: 'Agency' },
  { id: 'agency-builder',       label: 'App Builder',        group: 'Agency' },
  { id: 'agency-hub',           label: 'Agency Hub',         group: 'Agency' },
  { id: 'logs',                 label: 'Activity Logs',      group: 'Agency' },
  { id: 'support-tickets',      label: 'Support Tickets',    group: 'Agency' },
  { id: 'ai-sessions',          label: 'AI Sessions',        group: 'Agency' },
  { id: 'onboarding',           label: 'Onboarding',         group: 'Client' },
  { id: 'support',              label: 'Support',            group: 'Client' },
  { id: 'resources',            label: 'Resources',          group: 'Client' },
  { id: 'crm',                  label: 'CRM',                group: 'Client' },
  { id: 'website',              label: 'Website',            group: 'Client' },
  { id: 'collaboration',        label: 'Collaboration',      group: 'Client' },
  { id: 'discover',             label: 'Discover',           group: 'Client' },
  { id: 'aqua-ai',              label: 'Aqua AI',            group: 'Client' },
  { id: 'feature-request',      label: 'Feature Requests',   group: 'Client' },
  { id: 'data-hub',             label: 'Data Hub',           group: 'Client' },
  { id: 'founder-todos',        label: 'Founder Todos',      group: 'Founder' },
  { id: 'global-activity',      label: 'Global Activity',    group: 'Founder' },
  { id: 'agency-configurator',  label: 'Configurator',       group: 'Founder' },
];

const FEATURE_LABELS: Record<FeatureKey, string> = {
  crm:               'CRM Module',
  website:           'Website Editor',
  resources:         'Resources',
  aiAssistant:       'AI Assistant',
  collaboration:     'Collaboration',
  featureRequests:   'Feature Requests',
  supportTickets:    'Support Tickets',
  activityLogs:      'Activity Logs',
  employeeManagement:'Employee Management',
  agencyBuilder:     'App Builder',
  analytics:         'Analytics',
};

const LABEL_DESCRIPTIONS: Record<LabelKey, string> = {
  clients:   'Navigation label for clients section',
  projects:  'Navigation label for projects',
  team:      'Label for team/employees section',
  portal:    'Generic word for "portal"',
  dashboard: 'Main dashboard label',
  tasks:     'Label for tasks',
  tickets:   'Label for support tickets',
  resources:   'Label for resources section',
  support:     'Label for support section',
  onboarding:  'Label for onboarding section',
};

type Tab = 'identity' | 'roles' | 'features' | 'labels';

export const AgencyConfiguratorView: React.FC = () => {
  const { agencyConfig, setAgencyConfig } = useAppContext();
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>('identity');
  const [draft, setDraft] = useState<AgencyConfig>(agencyConfig);
  const [expandedRole, setExpandedRole] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setAgencyConfig(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateIdentity = (key: keyof AgencyConfig['identity'], value: string | null) => {
    setDraft(d => ({ ...d, identity: { ...d.identity, [key]: value } }));
  };

  const updateFeature = (key: FeatureKey, value: boolean) => {
    setDraft(d => ({ ...d, features: { ...d.features, [key]: value } }));
  };

  const updateLabel = (key: LabelKey, value: string) => {
    setDraft(d => ({ ...d, labels: { ...d.labels, [key]: value } }));
  };

  const updateRole = (roleId: string, updates: Partial<RoleConfig>) => {
    setDraft(d => ({
      ...d,
      roles: { ...d.roles, [roleId]: { ...d.roles[roleId], ...updates } },
    }));
  };

  const toggleRoleView = (roleId: string, viewId: string) => {
    const current = draft.roles[roleId].allowedViews;
    if (current === '*') {
      // Converting from all-access to specific — start with all minus this one
      const newViews = ALL_VIEWS.map(v => v.id).filter(id => id !== viewId);
      updateRole(roleId, { allowedViews: newViews });
    } else {
      const arr = current as string[];
      const next = arr.includes(viewId)
        ? arr.filter(v => v !== viewId)
        : [...arr, viewId];
      updateRole(roleId, { allowedViews: next });
    }
  };

  const setRoleAllAccess = (roleId: string, allAccess: boolean) => {
    updateRole(roleId, { allowedViews: allAccess ? '*' : [] });
  };

  const addCustomRole = () => {
    const id = `custom-${Date.now()}`;
    const newRole: RoleConfig = {
      displayName: 'New Role',
      accentColor: '#6366f1',
      allowedViews: ['dashboard'],
      canImpersonate: false,
      canManageUsers: false,
      canManageRoles: false,
      canAccessConfigurator: false,
      labelOverrides: {},
      isSystem: false,
    };
    setDraft(d => ({ ...d, roles: { ...d.roles, [id]: newRole } }));
    setExpandedRole(id);
  };

  const deleteRole = (roleId: string) => {
    setDraft(d => {
      const { [roleId]: _, ...rest } = d.roles;
      return { ...d, roles: rest };
    });
    if (expandedRole === roleId) setExpandedRole(null);
  };

  const tabs: { id: Tab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'identity', label: 'Identity & Theme', icon: Palette },
    { id: 'roles',    label: 'Roles & Permissions', icon: Shield },
    { id: 'features', label: 'Feature Flags', icon: Zap },
    { id: 'labels',   label: 'Labels', icon: Tag },
  ];

  const viewGroups = ['Core', 'Agency', 'Client', 'Founder'];

  return (
    <motion.div
      key="agency-configurator"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full w-full overflow-y-auto custom-scrollbar"
    >
      <div className="p-4 md:p-10 max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold">Agency Configurator</h1>
            <p className="text-sm text-slate-400 mt-1">
              Master control for roles, permissions, branding, and features.
            </p>
          </div>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all text-white"
            style={saved ? { backgroundColor: '#059669' } : theme.primaryBgStyle}
          >
            {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? 'Saved' : 'Save Changes'}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-white/10 pb-4 mb-8 overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id ? '' : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            style={activeTab === tab.id ? { backgroundColor: `${theme.primary}33`, color: theme.primary } : undefined}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Identity & Theme ─────────────────────────────────── */}
        {activeTab === 'identity' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-5">
              <h2 className="text-lg font-semibold">Agency Identity</h2>
              <div>
                <label className="text-xs uppercase tracking-widest text-slate-500 mb-1.5 block">Agency Name</label>
                <input
                  type="text"
                  value={draft.identity.name}
                  onChange={e => updateIdentity('name', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[var(--color-primary)] outline-none"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-slate-500 mb-1.5 block">Tagline</label>
                <input
                  type="text"
                  value={draft.identity.tagline}
                  onChange={e => updateIdentity('tagline', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[var(--color-primary)] outline-none"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-slate-500 mb-1.5 block">Logo URL</label>
                <input
                  type="text"
                  value={draft.identity.logo ?? ''}
                  placeholder="https://... or leave blank"
                  onChange={e => updateIdentity('logo', e.target.value || null)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[var(--color-primary)] outline-none"
                />
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-5">
              <h2 className="text-lg font-semibold">Theme Colors</h2>
              <div>
                <label className="text-xs uppercase tracking-widest text-slate-500 mb-1.5 block">Primary Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={draft.identity.primaryColor}
                    onChange={e => updateIdentity('primaryColor', e.target.value)}
                    className="w-12 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={draft.identity.primaryColor}
                    onChange={e => updateIdentity('primaryColor', e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[var(--color-primary)] outline-none font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-slate-500 mb-1.5 block">Secondary Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={draft.identity.secondaryColor}
                    onChange={e => updateIdentity('secondaryColor', e.target.value)}
                    className="w-12 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={draft.identity.secondaryColor}
                    onChange={e => updateIdentity('secondaryColor', e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[var(--color-primary)] outline-none font-mono"
                  />
                </div>
              </div>
              <div className="pt-2">
                <p className="text-xs text-slate-500">Preview</p>
                <div className="flex gap-3 mt-2">
                  <div className="h-10 flex-1 rounded-xl" style={{ backgroundColor: draft.identity.primaryColor }} />
                  <div className="h-10 flex-1 rounded-xl" style={{ backgroundColor: draft.identity.secondaryColor }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Roles & Permissions ──────────────────────────────── */}
        {activeTab === 'roles' && (
          <div className="space-y-4">
            {Object.entries(draft.roles).map(([roleId, role]) => {
              const isExpanded = expandedRole === roleId;
              const isAllAccess = role.allowedViews === '*';
              const allowedSet = new Set(isAllAccess ? ALL_VIEWS.map(v => v.id) : role.allowedViews as string[]);

              return (
                <div key={roleId} className="glass-card rounded-2xl border border-white/10 overflow-hidden">
                  {/* Role Header */}
                  <button
                    onClick={() => setExpandedRole(isExpanded ? null : roleId)}
                    className="w-full flex items-center justify-between p-4 md:p-5 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: role.accentColor }} />
                      <span className="font-medium text-sm md:text-base">{role.displayName}</span>
                      {role.isSystem && (
                        <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 bg-white/5 text-slate-500 rounded-full">system</span>
                      )}
                      <span className="text-xs text-slate-500">
                        {isAllAccess ? 'All views' : `${allowedSet.size} views`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {!role.isSystem && (
                        <button
                          onClick={e => { e.stopPropagation(); deleteRole(roleId); }}
                          className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </button>

                  {/* Role Body */}
                  {isExpanded && (
                    <div className="border-t border-white/10 p-4 md:p-6 space-y-6">

                      {/* Basic fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] uppercase tracking-widest text-slate-500 mb-1.5 block">Display Name</label>
                          <input
                            type="text"
                            value={role.displayName}
                            onChange={e => updateRole(roleId, { displayName: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-[var(--color-primary)] outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase tracking-widest text-slate-500 mb-1.5 block">Accent Color</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={role.accentColor}
                              onChange={e => updateRole(roleId, { accentColor: e.target.value })}
                              className="w-10 h-9 rounded-lg border border-white/10 bg-transparent cursor-pointer"
                            />
                            <input
                              type="text"
                              value={role.accentColor}
                              onChange={e => updateRole(roleId, { accentColor: e.target.value })}
                              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-[var(--color-primary)] outline-none font-mono"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Capabilities */}
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-3">Capabilities</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {([
                            ['canImpersonate',        'Can Impersonate'],
                            ['canManageUsers',        'Manage Users'],
                            ['canManageRoles',        'Manage Roles'],
                            ['canAccessConfigurator', 'Configurator'],
                          ] as [keyof RoleConfig, string][]).map(([key, label]) => (
                            <label key={key} className="flex items-center gap-2 p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors border border-white/5">
                              <input
                                type="checkbox"
                                checked={!!role[key]}
                                onChange={e => updateRole(roleId, { [key]: e.target.checked } as any)}
                                className="w-4 h-4 rounded border-white/20 bg-slate-900 text-[var(--color-primary)] focus:ring-[var(--color-primary)] focus:ring-offset-slate-900"
                              />
                              <span className="text-xs font-medium">{label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* View permissions */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-[10px] uppercase tracking-widest text-slate-500">Allowed Views</p>
                          <label className="flex items-center gap-2 text-xs cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isAllAccess}
                              onChange={e => setRoleAllAccess(roleId, e.target.checked)}
                              className="w-4 h-4 rounded border-white/20 bg-slate-900 text-[var(--color-primary)]"
                            />
                            All access
                          </label>
                        </div>
                        {!isAllAccess && (
                          <div className="space-y-4">
                            {viewGroups.map(group => {
                              const groupViews = ALL_VIEWS.filter(v => v.group === group);
                              return (
                                <div key={group}>
                                  <p className="text-[9px] uppercase tracking-widest text-slate-600 mb-2">{group}</p>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                                    {groupViews.map(view => (
                                      <label key={view.id} className="flex items-center gap-2 p-2.5 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors border border-white/5 text-xs">
                                        <input
                                          type="checkbox"
                                          checked={allowedSet.has(view.id)}
                                          onChange={() => toggleRoleView(roleId, view.id)}
                                          className="w-3.5 h-3.5 rounded border-white/20 bg-slate-900 text-[var(--color-primary)]"
                                        />
                                        {view.label}
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <button
              onClick={addCustomRole}
              className="w-full py-3 border border-dashed border-white/20 rounded-2xl text-slate-400 hover:text-white hover:border-white/40 transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Custom Role
            </button>
          </div>
        )}

        {/* ── Feature Flags ────────────────────────────────────── */}
        {activeTab === 'features' && (
          <div className="glass-card rounded-2xl border border-white/10 divide-y divide-white/10">
            {(Object.entries(draft.features) as [FeatureKey, boolean][]).map(([key, enabled]) => (
              <div key={key} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-sm font-medium">{FEATURE_LABELS[key]}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {enabled ? 'Enabled globally' : 'Disabled globally — hidden for all roles'}
                  </p>
                </div>
                <button
                  onClick={() => updateFeature(key, !enabled)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? '' : 'bg-white/10'}`}
                  style={enabled ? theme.primaryBgStyle : undefined}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── Labels ───────────────────────────────────────────── */}
        {activeTab === 'labels' && (
          <div className="space-y-4">
            <p className="text-sm text-slate-400">
              Change these to rename sections globally across the app. Role-level overrides (set in the Roles tab) take priority over these.
            </p>
            <div className="glass-card rounded-2xl border border-white/10 divide-y divide-white/10">
              {(Object.entries(draft.labels) as [LabelKey, string][]).map(([key, value]) => (
                <div key={key} className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4">
                  <div className="sm:w-48 shrink-0">
                    <p className="text-sm font-medium capitalize">{key}</p>
                    <p className="text-xs text-slate-500">{LABEL_DESCRIPTIONS[key]}</p>
                  </div>
                  <input
                    type="text"
                    value={value}
                    onChange={e => updateLabel(key, e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-[var(--color-primary)] outline-none"
                  />
                  <button
                    onClick={() => updateLabel(key, defaultConfig.labels[key])}
                    className="text-xs text-slate-500 hover:text-white transition-colors shrink-0"
                  >
                    Reset
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </motion.div>
  );
};

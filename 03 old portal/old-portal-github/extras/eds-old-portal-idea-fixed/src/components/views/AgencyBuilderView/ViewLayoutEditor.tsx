import React, { useState } from 'react';
import { Plus, X, ChevronDown, ChevronRight, Settings2, Trash2 } from 'lucide-react';
import { useAppContext } from '../../../context/AppContext';
import { componentMap } from '../../componentMap';
import { useTheme } from '../../../hooks/useTheme';

// Note: do NOT compute Object.keys(componentMap) at module top — it creates a circular
// dependency since componentMap also (transitively) imports this file. Compute lazily.
const getAllComponents = () => Object.keys(componentMap).sort();
const GRID_OPTIONS = ['grid-cols-1', 'grid-cols-2', 'grid-cols-3'];

// Parses a raw string value into string | number | boolean
function parseValue(raw: string): unknown {
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  const n = Number(raw);
  if (raw !== '' && !isNaN(n)) return n;
  return raw;
}

function stringifyValue(val: unknown): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
}

// ── Prop editor for a single component entry ─────────────────────────────────
interface PropEditorProps {
  componentName: string;
  props: Record<string, unknown>;
  onUpdate: (props: Record<string, unknown>) => void;
  onClose: () => void;
}

function PropEditor({ componentName, props, onUpdate, onClose }: PropEditorProps) {
  const [newKey, setNewKey] = useState('');
  const entries = Object.entries(props);

  const setKey = (oldKey: string, newKeyValue: string) => {
    const updated: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(props)) {
      updated[k === oldKey ? newKeyValue : k] = v;
    }
    onUpdate(updated);
  };

  const setValue = (key: string, raw: string) => {
    onUpdate({ ...props, [key]: parseValue(raw) });
  };

  const removeKey = (key: string) => {
    const updated = { ...props };
    delete updated[key];
    onUpdate(updated);
  };

  const addKey = () => {
    const k = newKey.trim();
    if (!k || k in props) return;
    onUpdate({ ...props, [k]: '' });
    setNewKey('');
  };

  return (
    <div className="mt-2 p-3 bg-black/30 rounded-xl border border-white/10 space-y-2">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Settings2 className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-semibold text-slate-300">{componentName} props</span>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {entries.length === 0 && (
        <p className="text-xs text-slate-600 pb-1">No props set. Add a key below to pass props to this component.</p>
      )}

      {entries.map(([key, val]) => (
        <div key={key} className="flex items-center gap-1.5">
          <input
            className="w-28 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-slate-300 font-mono focus:outline-none focus:border-white/20"
            value={key}
            onChange={e => setKey(key, e.target.value)}
            placeholder="key"
          />
          <span className="text-slate-600 text-xs">:</span>
          <input
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-white/20"
            value={stringifyValue(val)}
            onChange={e => setValue(key, e.target.value)}
            placeholder="value"
          />
          <button onClick={() => removeKey(key)} className="text-slate-600 hover:text-red-400 transition-colors shrink-0">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      ))}

      {/* Add new key */}
      <div className="flex items-center gap-1.5 pt-1 border-t border-white/5">
        <input
          className="flex-1 bg-white/5 border border-dashed border-white/10 rounded-lg px-2 py-1 text-xs text-slate-500 font-mono focus:outline-none focus:border-white/20 focus:text-slate-300"
          value={newKey}
          onChange={e => setNewKey(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addKey()}
          placeholder="add prop key…"
        />
        <button
          onClick={addKey}
          disabled={!newKey.trim()}
          className="text-xs px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

// ── Main editor ───────────────────────────────────────────────────────────────
export function ViewLayoutEditor() {
  const { agencyConfig, setAgencyConfig } = useAppContext();
  const theme = useTheme();
  const roleIds = Object.keys(agencyConfig.roles);
  const [selectedRoleId, setSelectedRoleId] = useState(roleIds[0] ?? '');
  const [addingToView, setAddingToView] = useState<string | null>(null);
  const [expandedComponent, setExpandedComponent] = useState<{ viewId: string; index: number } | null>(null);
  const [newViewId, setNewViewId] = useState('');

  const roleConfig = agencyConfig.roles[selectedRoleId];
  const viewLayouts = roleConfig?.viewLayouts ?? {};

  const updateRoleLayouts = (
    updater: (prev: NonNullable<typeof roleConfig.viewLayouts>) => NonNullable<typeof roleConfig.viewLayouts>
  ) => {
    setAgencyConfig(prev => ({
      ...prev,
      roles: {
        ...prev.roles,
        [selectedRoleId]: {
          ...prev.roles[selectedRoleId],
          viewLayouts: updater(prev.roles[selectedRoleId].viewLayouts ?? {}),
        },
      },
    }));
  };

  const handleChangeGrid = (viewId: string, layout: string) => {
    updateRoleLayouts(prev => ({
      ...prev,
      [viewId]: { ...prev[viewId], layout },
    }));
  };

  const handleAddComponent = (viewId: string, componentName: string) => {
    if (!componentName) return;
    updateRoleLayouts(prev => ({
      ...prev,
      [viewId]: {
        layout: prev[viewId]?.layout ?? 'grid-cols-1',
        components: [...(prev[viewId]?.components ?? []), { component: componentName, props: {} }],
      },
    }));
    setAddingToView(null);
  };

  const handleRemoveComponent = (viewId: string, index: number) => {
    if (expandedComponent?.viewId === viewId && expandedComponent?.index === index) {
      setExpandedComponent(null);
    }
    updateRoleLayouts(prev => ({
      ...prev,
      [viewId]: {
        ...prev[viewId],
        components: prev[viewId].components.filter((_, i) => i !== index),
      },
    }));
  };

  const handleUpdateProps = (viewId: string, index: number, props: Record<string, unknown>) => {
    updateRoleLayouts(prev => ({
      ...prev,
      [viewId]: {
        ...prev[viewId],
        components: prev[viewId].components.map((entry, i) =>
          i === index ? { ...entry, props } : entry
        ),
      },
    }));
  };

  const handleAddView = () => {
    const id = newViewId.trim();
    if (!id || viewLayouts[id]) return;
    updateRoleLayouts(prev => ({
      ...prev,
      [id]: { layout: 'grid-cols-1', components: [] },
    }));
    setNewViewId('');
  };

  const handleRemoveView = (viewId: string) => {
    if (expandedComponent?.viewId === viewId) setExpandedComponent(null);
    updateRoleLayouts(prev => {
      const { [viewId]: _, ...rest } = prev;
      return rest;
    });
  };

  const toggleExpanded = (viewId: string, index: number) => {
    const isOpen = expandedComponent?.viewId === viewId && expandedComponent?.index === index;
    setExpandedComponent(isOpen ? null : { viewId, index });
  };

  if (!roleConfig) return null;

  return (
    <div className="space-y-6">

      {/* Role selector */}
      <div className="flex flex-wrap gap-2">
        {roleIds.map(roleId => {
          const rc = agencyConfig.roles[roleId];
          const isActive = roleId === selectedRoleId;
          return (
            <button
              key={roleId}
              onClick={() => { setSelectedRoleId(roleId); setExpandedComponent(null); }}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all border ${
                isActive
                  ? 'text-white border-transparent'
                  : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white'
              }`}
              style={isActive ? { ...theme.primaryBgStyle, borderColor: 'transparent' } : {}}
            >
              {rc.displayName}
            </button>
          );
        })}
      </div>

      {Object.keys(viewLayouts).length === 0 && (
        <p className="text-sm text-slate-500 py-4">
          No view layouts defined for <span className="text-white">{roleConfig.displayName}</span>. Add one below.
        </p>
      )}

      {/* View cards */}
      <div className="space-y-3">
        {Object.entries(viewLayouts).map(([viewId, viewLayout]) => (
          <div key={viewId} className="glass-card rounded-2xl border border-white/5 p-4">

            {/* View header row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm font-semibold text-white">
                  {viewId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </span>
                <span className="text-xs text-slate-600 font-mono">{viewId}</span>

                <div className="relative">
                  <select
                    value={viewLayout.layout}
                    onChange={e => handleChangeGrid(viewId, e.target.value)}
                    className="appearance-none text-xs bg-white/5 border border-white/10 rounded-lg pl-2.5 pr-6 py-1 text-slate-300 cursor-pointer focus:outline-none focus:border-white/20"
                  >
                    {GRID_OPTIONS.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 pointer-events-none" />
                </div>
              </div>

              <button
                onClick={() => handleRemoveView(viewId)}
                className="text-xs text-slate-600 hover:text-red-400 transition-colors"
              >
                Remove
              </button>
            </div>

            {/* Component chips + editors */}
            <div className="space-y-1.5">
              {viewLayout.components.map((entry, i) => {
                const isExpanded = expandedComponent?.viewId === viewId && expandedComponent?.index === i;
                const hasProps = Object.keys(entry.props ?? {}).length > 0;

                return (
                  <div key={i}>
                    {/* Chip row */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleExpanded(viewId, i)}
                        className={`flex items-center gap-1.5 flex-1 min-w-0 px-2.5 py-1.5 rounded-lg border transition-all text-left ${
                          isExpanded
                            ? 'bg-white/10 border-white/20 text-white'
                            : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/8 hover:border-white/15 hover:text-white'
                        }`}
                      >
                        {isExpanded
                          ? <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                          : <ChevronRight className="w-3 h-3 text-slate-500 shrink-0" />
                        }
                        <span className="text-xs font-medium truncate">{entry.component}</span>
                        {hasProps && (
                          <span className="text-[10px] text-slate-500 ml-auto shrink-0">
                            {Object.keys(entry.props ?? {}).length} prop{Object.keys(entry.props ?? {}).length !== 1 ? 's' : ''}
                          </span>
                        )}
                        <Settings2 className="w-3 h-3 text-slate-600 shrink-0 ml-1" />
                      </button>

                      <button
                        onClick={() => handleRemoveComponent(viewId, i)}
                        className="text-slate-600 hover:text-red-400 transition-colors shrink-0 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Inline prop editor */}
                    {isExpanded && (
                      <PropEditor
                        componentName={entry.component}
                        props={(entry.props ?? {}) as Record<string, unknown>}
                        onUpdate={props => handleUpdateProps(viewId, i, props)}
                        onClose={() => setExpandedComponent(null)}
                      />
                    )}
                  </div>
                );
              })}

              {/* Add component */}
              {addingToView === viewId ? (
                <select
                  autoFocus
                  defaultValue=""
                  onChange={e => handleAddComponent(viewId, e.target.value)}
                  onBlur={() => setAddingToView(null)}
                  className="w-full text-xs bg-slate-800 border border-white/20 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-[var(--color-primary)]/50"
                >
                  <option value="" disabled>Pick component…</option>
                  {getAllComponents().map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              ) : (
                <button
                  onClick={() => setAddingToView(viewId)}
                  className="flex items-center gap-1.5 w-full px-2.5 py-1.5 bg-white/3 border border-dashed border-white/10 rounded-lg text-xs text-slate-500 hover:text-slate-300 hover:border-white/20 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Add component
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add view row */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="View ID to add (e.g. dashboard, project-hub)"
          value={newViewId}
          onChange={e => setNewViewId(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAddView()}
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-white/20"
        />
        <button
          onClick={handleAddView}
          disabled={!newViewId.trim() || !!viewLayouts[newViewId.trim()]}
          className="px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={theme.primaryBgStyle}
        >
          Add View
        </button>
      </div>
    </div>
  );
}

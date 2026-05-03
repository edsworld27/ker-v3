import React, { useState } from 'react';
import { LayoutGrid, Plus, Save, Trash2, CheckCircle2, Edit2, Layers, ChevronRight } from 'lucide-react';
import { useAppContext } from '../../../context/AppContext';
import { useRoleConfig } from '../../../hooks/useRoleConfig';
import { useTheme } from '../../../hooks/useTheme';
import { componentMap, WidgetName } from '../../componentMap';

// ── Widget inventory ───────────────────────────────────────────────────────────
// Add new widget keys here as they are registered in componentMap.ts.
const AVAILABLE_WIDGETS: { key: WidgetName; description: string }[] = [
  // Stats / metrics
  // Stats / metrics
    { key: 'ClientStatsWidget',    description: 'Client counts by stage' }, // Renamed
    { key: 'ProjectsStatsWidget',  description: 'Project counts + overall progress' },
    { key: 'TasksStatsWidget',     description: 'Task counts across board columns' },
    { key: 'TicketsStatsWidget',   description: 'Support ticket status summary' },
    { key: 'AdminStatsWidget',     description: 'Top-level system metrics' },
    // Lists
    { key: 'ClientListWidget',     description: 'Basic scrollable client list' },
    { key: 'ClientDirectoryWidget', description: 'Advanced client directory with search/filter' },
    { key: 'ClientActivityWidget', description: 'Client activity and details pane' },
    { key: 'ProjectListWidget',    description: 'Projects with progress bars' },
    { key: 'TaskListWidget',       description: 'Recent tasks with assignees' },
    { key: 'TeamListWidget',       description: 'Team members and their roles' },
    { key: 'AdminActivityWidget',  description: 'Recent system alerts & charts' },
    { key: 'ActivityFeedWidget',   description: 'Live activity log feed' },

  { key: 'AdminActivityWidget',  description: 'Recent system alerts & charts' },
  // Actions & collaboration
  { key: 'QuickActionsWidget',   description: 'One-click modal launchers' },
  { key: 'DashboardWidget',      description: 'Generic metric card' },
  { key: 'ProjectChat',          description: 'Team chat thread' },
  { key: 'ProjectTimeline',      description: 'Project timeline view' },
  { key: 'DesignConcepts',       description: 'Design concept gallery' },
  { key: 'SyncCard',             description: 'Sync status card' },
  { key: 'AIChatbot',            description: 'AI assistant chat' },
];

const GRID_OPTIONS = [
  { value: 'grid-cols-1', label: '1 Column' },
  { value: 'grid-cols-2', label: '2 Columns' },
  { value: 'grid-cols-3', label: '3 Columns' },
];

type Tab = 'build' | 'views';

// ── Widget preview wrapper ─────────────────────────────────────────────────────
function WidgetPreview({ name }: { name: WidgetName }) {
  const Component = componentMap[name];
  if (!Component) return null;
  return (
    <div className="pointer-events-none opacity-75 overflow-hidden max-h-72 rounded-xl">
      <Component />
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export function PageBuilder() {
  const { agencyConfig, setAgencyConfig, addLog } = useAppContext();
  const { allRoles } = useRoleConfig();
  const theme = useTheme();

  const [activeTab, setActiveTab] = useState<Tab>('build');

  // Config bar state
  const [selectedRole, setSelectedRole] = useState(allRoles[0]?.id || 'ClientOwner');
  const [viewId, setViewId]             = useState('custom-view-1');
  const [gridClass, setGridClass]       = useState('grid-cols-2');

  // Canvas state
  const [canvasWidgets, setCanvasWidgets] = useState<WidgetName[]>([]);
  const [saved, setSaved]               = useState(false);

  // ── Build tab handlers ──────────────────────────────────────────────────────
  const handleAddWidget = (widget: WidgetName) => setCanvasWidgets(prev => [...prev, widget]);

  const handleRemoveWidget = (index: number) =>
    setCanvasWidgets(prev => prev.filter((_, i) => i !== index));

  const canSave = viewId.trim().length > 0 && canvasWidgets.length > 0;

  const handleSaveLayout = () => {
    if (!canSave) return;
    setAgencyConfig(prev => ({
      ...prev,
      roles: {
        ...prev.roles,
        [selectedRole]: {
          ...prev.roles[selectedRole],
          viewLayouts: {
            ...prev.roles[selectedRole]?.viewLayouts,
            [viewId]: {
              layout: gridClass,
              components: canvasWidgets.map(w => ({ component: w, props: {} })),
            },
          },
        },
      },
    }));
    addLog('Layout Saved', `Custom view "${viewId}" saved for role "${selectedRole}"`, 'system');
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // ── View Manager handlers ───────────────────────────────────────────────────
  const roleLayouts = agencyConfig.roles[selectedRole]?.viewLayouts ?? {};

  const handleLoadView = (vid: string) => {
    const layout = roleLayouts[vid];
    if (!layout) return;
    setViewId(vid);
    setGridClass(layout.layout);
    setCanvasWidgets(
      layout.components
        .map(c => c.component as WidgetName)
        .filter(k => k in componentMap)
    );
    setActiveTab('build');
  };

  const handleDeleteView = (vid: string) => {
    setAgencyConfig(prev => {
      const layouts = { ...prev.roles[selectedRole]?.viewLayouts };
      delete layouts[vid];
      return {
        ...prev,
        roles: {
          ...prev.roles,
          [selectedRole]: { ...prev.roles[selectedRole], viewLayouts: layouts },
        },
      };
    });
    addLog('Layout Deleted', `Removed view "${vid}" from role "${selectedRole}"`, 'system');
  };

  // ── Shared config bar ───────────────────────────────────────────────────────
  const ConfigBar = (
    <div className="glass-card p-4 md:p-5 rounded-2xl border border-white/10 flex flex-col md:flex-row gap-4 items-start md:items-end justify-between">
      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase tracking-widest text-slate-500">Target Role</label>
          <select
            value={selectedRole}
            onChange={e => setSelectedRole(e.target.value)}
            className="bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-white/30 transition-colors"
          >
            {allRoles.map(r => <option key={r.id} value={r.id}>{r.displayName}</option>)}
          </select>
        </div>

        {activeTab === 'build' && (
          <>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase tracking-widest text-slate-500">View ID (URL path)</label>
              <input
                type="text"
                value={viewId}
                onChange={e => setViewId(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                placeholder="e.g. client-dashboard"
                className="bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-white/30 transition-colors w-44"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase tracking-widest text-slate-500">Grid Layout</label>
              <select
                value={gridClass}
                onChange={e => setGridClass(e.target.value)}
                className="bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-white/30 transition-colors"
              >
                {GRID_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </>
        )}
      </div>

      {activeTab === 'build' && (
        <button
          onClick={handleSaveLayout}
          disabled={!canSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all text-white w-full md:w-auto justify-center disabled:opacity-40 disabled:cursor-not-allowed"
          style={canSave ? theme.primaryBgStyle : {}}
        >
          {saved ? <><CheckCircle2 className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save View</>}
        </button>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full p-4 md:p-6 max-w-[1600px] mx-auto w-full gap-4 md:gap-5">

      {ConfigBar}

      {/* ── Tab bar ─────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 p-1 bg-white/5 rounded-xl w-fit">
        {([['build', 'Build'], ['views', 'Manage Views']] as [Tab, string][]).map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
            style={activeTab === tab ? theme.primaryBgStyle : { color: '#94a3b8' }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Build tab ───────────────────────────────────────────────────────── */}
      {activeTab === 'build' && (
        <div className="flex flex-1 gap-4 md:gap-5 overflow-hidden min-h-0">

          {/* Canvas */}
          <div className="flex-1 bg-black/20 rounded-2xl border border-white/5 p-4 md:p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-4 h-4" style={{ color: theme.primary }} />
              <h3 className="text-sm font-medium">Canvas Preview</h3>
              {canvasWidgets.length > 0 && (
                <span className="ml-auto text-[10px] text-slate-500">
                  {canvasWidgets.length} widget{canvasWidgets.length !== 1 ? 's' : ''} · {GRID_OPTIONS.find(o => o.value === gridClass)?.label}
                </span>
              )}
            </div>

            {canvasWidgets.length === 0 ? (
              <div className="flex-1 min-h-48 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-3 text-slate-500">
                <LayoutGrid className="w-8 h-8 opacity-20" />
                <p className="text-sm">Select widgets from the right panel.</p>
              </div>
            ) : (
              <div className={`grid gap-4 ${gridClass}`}>
                {canvasWidgets.map((widgetName, index) => (
                  <div key={`${widgetName}-${index}`} className="relative group">
                    <WidgetPreview name={widgetName} />
                    <div className="absolute inset-0 border-2 border-transparent group-hover:border-red-500/40 rounded-xl transition-all pointer-events-none" />
                    <button
                      onClick={() => handleRemoveWidget(index)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded-md text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      {widgetName.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Widget inventory */}
          <div className="w-60 md:w-68 glass-card rounded-2xl border border-white/10 p-4 overflow-y-auto custom-scrollbar flex flex-col gap-1.5 shrink-0">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">Widget Library</p>
            {AVAILABLE_WIDGETS.map(({ key, description }) => (
              <button
                key={key}
                onClick={() => handleAddWidget(key)}
                className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-left group w-full"
              >
                <Plus className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-medium leading-tight">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">{description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Views tab ───────────────────────────────────────────────────────── */}
      {activeTab === 'views' && (
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {Object.keys(roleLayouts).length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-500">
              <Layers className="w-10 h-10 opacity-20" />
              <p className="text-sm">No custom views saved for <strong className="text-slate-300">{agencyConfig.roles[selectedRole]?.displayName ?? selectedRole}</strong> yet.</p>
              <button
                onClick={() => setActiveTab('build')}
                className="mt-2 px-4 py-2 rounded-xl text-sm font-medium text-white flex items-center gap-2"
                style={theme.primaryBgStyle}
              >
                <Plus className="w-4 h-4" /> Build one
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(roleLayouts).map(([vid, layout]) => (
                <div key={vid} className="glass-card rounded-2xl border border-white/10 p-5 flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-medium text-sm truncate">{vid}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {layout.components.length} widget{layout.components.length !== 1 ? 's' : ''} · {GRID_OPTIONS.find(o => o.value === layout.layout)?.label ?? layout.layout}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteView(vid)}
                      className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Component pill list */}
                  <div className="flex flex-wrap gap-1.5">
                    {layout.components.map((c, i) => (
                      <span key={i} className="px-2 py-0.5 bg-white/5 rounded-md text-[10px] text-slate-400">
                        {(c.component as string).replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => handleLoadView(vid)}
                    className="mt-auto flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all border border-white/10 hover:bg-white/10 text-slate-300"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit in Builder
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}

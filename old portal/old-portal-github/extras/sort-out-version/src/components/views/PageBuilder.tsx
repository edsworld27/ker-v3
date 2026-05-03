import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Layout, Save } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { CustomPage, DashboardWidgetConfig, WidgetType } from '../../types';

export const PageBuilder: React.FC = () => {
  const { customPages, setCustomPages, addLog } = useAppContext();
  const [editingPage, setEditingPage] = useState<CustomPage | null>(null);

  const handleCreatePage = () => {
    const newPage: CustomPage = {
      id: `page-${Date.now()}`,
      title: 'New Dashboard',
      slug: `page-${Date.now()}`,
      iconName: 'Layout',
      widgets: [],
      roles: ['Founder']
    };
    setCustomPages([...customPages, newPage]);
    setEditingPage(newPage);
  };

  const handleSavePage = () => {
    if (editingPage) {
      setCustomPages(customPages.map(p => p.id === editingPage.id ? editingPage : p));
      addLog('Page Updated', `Updated custom page: ${editingPage.title}`, 'system');
      setEditingPage(null);
    }
  };

  const handleDeletePage = (id: string) => {
    setCustomPages(customPages.filter(p => p.id !== id));
    addLog('Page Deleted', `Deleted custom page`, 'system');
  };

  const handleAddWidget = () => {
    if (!editingPage) return;
    const newWidget: DashboardWidgetConfig = {
      id: `widget-${Date.now()}`,
      type: 'metric',
      title: 'New Metric',
      size: 'small'
    };
    setEditingPage({
      ...editingPage,
      widgets: [...editingPage.widgets, newWidget]
    });
  };

  const handleUpdateWidget = (id: string, updates: Partial<DashboardWidgetConfig>) => {
    if (!editingPage) return;
    setEditingPage({
      ...editingPage,
      widgets: editingPage.widgets.map(w => w.id === id ? { ...w, ...updates } : w)
    });
  };

  const handleRemoveWidget = (id: string) => {
    if (!editingPage) return;
    setEditingPage({
      ...editingPage,
      widgets: editingPage.widgets.filter(w => w.id !== id)
    });
  };

  if (editingPage) {
    return (
      <div className="glass-card p-8 rounded-3xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold flex items-center gap-3">
            <Layout className="w-6 h-6 text-indigo-400" />
            Edit Page: {editingPage.title}
          </h2>
          <div className="flex gap-3">
            <button onClick={() => setEditingPage(null)} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
              Cancel
            </button>
            <button onClick={handleSavePage} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save Page
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="text-xs uppercase tracking-widest text-slate-500 mb-2 block">Page Title</label>
            <input 
              type="text" 
              value={editingPage.title}
              onChange={e => setEditingPage({...editingPage, title: e.target.value})}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-slate-500 mb-2 block">Slug (URL Path)</label>
            <input 
              type="text" 
              value={editingPage.slug}
              onChange={e => setEditingPage({...editingPage, slug: e.target.value})}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-medium">Widgets</h3>
          <button onClick={handleAddWidget} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm flex items-center gap-2 transition-colors">
            <Plus className="w-4 h-4" />
            Add Widget
          </button>
        </div>

        <div className="space-y-4">
          {editingPage.widgets.length === 0 ? (
            <div className="text-center py-8 text-slate-500 border border-dashed border-white/10 rounded-2xl">
              No widgets added yet.
            </div>
          ) : (
            editingPage.widgets.map(widget => (
              <div key={widget.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex gap-4 items-start">
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-slate-500 mb-1 block">Title</label>
                      <input 
                        type="text" 
                        value={widget.title}
                        onChange={e => handleUpdateWidget(widget.id, { title: e.target.value })}
                        className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-slate-500 mb-1 block">Type</label>
                      <select 
                        value={widget.type}
                        onChange={e => handleUpdateWidget(widget.id, { type: e.target.value as WidgetType })}
                        className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="metric">Metric Card</option>
                        <option value="chart">Chart</option>
                        <option value="list">Data List</option>
                        <option value="text">Text Block</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-slate-500 mb-1 block">Size</label>
                      <select 
                        value={widget.size}
                        onChange={e => handleUpdateWidget(widget.id, { size: e.target.value as any })}
                        className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="small">Small (1/4)</option>
                        <option value="medium">Medium (1/2)</option>
                        <option value="large">Large (3/4)</option>
                        <option value="full">Full Width</option>
                      </select>
                    </div>
                  </div>
                  {widget.type === 'text' && (
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-slate-500 mb-1 block">Content</label>
                      <textarea
                        value={widget.content || ''}
                        onChange={e => handleUpdateWidget(widget.id, { content: e.target.value })}
                        rows={3}
                        className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
                        placeholder="Enter text content here..."
                      />
                    </div>
                  )}
                </div>
                <button onClick={() => handleRemoveWidget(widget.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors mt-5">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-8 rounded-3xl">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-semibold flex items-center gap-3">
          <Layout className="w-6 h-6 text-indigo-400" />
          Custom Pages
        </h2>
        <button onClick={handleCreatePage} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Page
        </button>
      </div>

      <div className="space-y-4">
        {customPages.length === 0 ? (
          <div className="text-center py-10 text-slate-500 border border-dashed border-white/10 rounded-2xl">
            No custom pages created yet. Build your first dashboard!
          </div>
        ) : (
          customPages.map(page => (
            <div key={page.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
              <div>
                <div className="font-medium text-white">{page.title}</div>
                <div className="text-xs text-slate-500">/{page.slug} • {page.widgets.length} Widgets</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setEditingPage(page)} className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDeletePage(page.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  BarChart3,
  Image as ImageIcon,
  FileText,
  Settings,
  LogOut,
  Search,
  Bell,
  Plus,
  MoreHorizontal,
  Filter,
  Upload,
  ChevronDown,
  Globe,
  Save,
  Loader2,
} from 'lucide-react';
import {
  Card,
  Button,
  Input,
  Textarea,
  Field,
  Badge,
  Avatar,
  EmptyState,
  SearchInput,
} from '@aqua/bridge/ui/kit';
import { useWebStudio } from './logic/ClientuseWebStudio';

interface WebMedia {
  filename: string;
  filesize: number;
  url?: string;
}

interface WebPage {
  label: string;
  url: string;
}

interface WebConfig {
  agencyName?: string;
  heroHeadline?: string;
  heroSubheadline?: string;
  primaryColor?: string;
  ctaText?: string;
  ctaLink?: string;
  navigation?: WebPage[];
}

const AnalyticsView: React.FC = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {[
        { label: 'Total visitors', value: '124.5K', trend: '+12.5%' },
        { label: 'Avg. session', value: '2m 45s', trend: '+5.2%' },
        { label: 'Bounce rate', value: '42.3%', trend: '-2.1%' },
      ].map((stat, i) => (
        <Card key={i} padding="md">
          <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">{stat.label}</div>
          <div className="flex items-end justify-between">
            <h3 className="text-2xl font-semibold text-white tabular-nums">{stat.value}</h3>
            <span className="text-xs font-medium text-emerald-400">{stat.trend}</span>
          </div>
        </Card>
      ))}
    </div>

    <Card padding="md">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-base font-semibold text-white">Traffic telemetry</h4>
        <Button variant="ghost" size="sm" iconRight={ChevronDown}>Last 30 days</Button>
      </div>
      <div className="h-64 border-b border-l border-white/5 relative">
        <div className="absolute -bottom-5 left-0 right-0 flex justify-between text-[10px] text-slate-500">
          <span>30d ago</span>
          <span>Midpoint</span>
          <span>Today</span>
        </div>
      </div>
    </Card>
  </div>
);

const AssetHubView: React.FC<{ media: WebMedia[] }> = ({ media }) => (
  <div className="space-y-5">
    <div className="flex justify-between items-center">
      <Button variant="outline" size="sm" icon={Filter}>Filter</Button>
      <Button variant="primary" size="sm" icon={Upload}>Upload asset</Button>
    </div>

    {media.length === 0 ? (
      <Card padding="lg">
        <EmptyState
          icon={ImageIcon}
          title="No assets yet"
          description="Upload images, files, and other media to surface them here."
          action={<Button variant="primary" size="sm" icon={Upload}>Upload asset</Button>}
        />
      </Card>
    ) : (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {media.map((asset, i) => (
          <Card key={i} padding="none" interactive className="overflow-hidden group">
            <div className="aspect-square bg-white/[0.02] flex items-center justify-center relative">
              {asset.url ? (
                <img src={asset.url} className="w-full h-full object-cover" alt={asset.filename} />
              ) : (
                <FileText className="w-10 h-10 text-slate-600" strokeWidth={1.5} />
              )}
            </div>
            <div className="p-3 flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-medium text-white truncate">{asset.filename}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{Math.round(asset.filesize / 1024)} KB</p>
              </div>
              <button className="text-slate-500 hover:text-white" aria-label="More">
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>
          </Card>
        ))}
      </div>
    )}
  </div>
);

const PagesView: React.FC<{ config: WebConfig | null }> = ({ config }) => {
  const pages = config?.navigation ?? [];
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2 items-center">
        <SearchInput icon={Search} placeholder="Search pages..." className="w-64" />
        <Button variant="outline" size="sm" icon={Filter}>Status</Button>
        <div className="flex-1" />
        <Button variant="primary" size="sm" icon={Plus}>Create page</Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/5 bg-white/[0.02]">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.02] border-b border-white/5">
            <tr>
              <th className="px-3 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-slate-500">Identity</th>
              <th className="px-3 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-slate-500">URL</th>
              <th className="px-3 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-slate-500">Status</th>
              <th className="px-3 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-slate-500" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {pages.map((row, i) => (
              <tr key={i} className="hover:bg-white/[0.04] transition-colors">
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-300" />
                    <span className="text-white font-medium">{row.label}</span>
                  </div>
                </td>
                <td className="px-3 py-2.5">
                  <code className="text-indigo-300 font-mono text-xs bg-indigo-500/10 px-1.5 py-0.5 rounded">{row.url}</code>
                </td>
                <td className="px-3 py-2.5"><Badge tone="success">Active</Badge></td>
                <td className="px-3 py-2.5 text-right">
                  <button className="text-slate-500 hover:text-white" aria-label="More">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {pages.length === 0 ? (
              <tr><td colSpan={4} className="py-12 text-center text-xs text-slate-500">No pages defined yet.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const EditorView: React.FC<{ config: WebConfig | null; onChange: (next: WebConfig) => void }> = ({
  config,
  onChange,
}) => (
  <div className="space-y-5">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <Card padding="md">
        <div className="flex items-center gap-3 pb-4 mb-4 border-b border-white/5">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-300 text-sm font-semibold">
            H
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Brand &amp; hero</h4>
            <p className="text-xs text-slate-400 mt-0.5">Headline copy and identity.</p>
          </div>
        </div>
        <div className="space-y-3">
          <Field label="Agency name">
            <Input
              value={config?.agencyName ?? ''}
              onChange={e => onChange({ ...config, agencyName: e.target.value })}
            />
          </Field>
          <Field label="Hero headline">
            <Input
              value={config?.heroHeadline ?? ''}
              onChange={e => onChange({ ...config, heroHeadline: e.target.value })}
            />
          </Field>
          <Field label="Hero subtext">
            <Textarea
              rows={4}
              value={config?.heroSubheadline ?? ''}
              onChange={e => onChange({ ...config, heroSubheadline: e.target.value })}
            />
          </Field>
        </div>
      </Card>

      <Card padding="md">
        <div className="flex items-center gap-3 pb-4 mb-4 border-b border-white/5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-300 text-sm font-semibold">
            C
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">CTA &amp; theme</h4>
            <p className="text-xs text-slate-400 mt-0.5">Conversion targets and accent color.</p>
          </div>
        </div>
        <div className="space-y-3">
          <Field label="Primary color">
            <div className="flex gap-2 items-center">
              <div className="w-10 h-10 rounded-lg border border-white/10 p-1 shrink-0">
                <div
                  className="w-full h-full rounded-md"
                  style={{ backgroundColor: config?.primaryColor || '#6366f1' }}
                />
              </div>
              <Input
                value={config?.primaryColor ?? ''}
                onChange={e => onChange({ ...config, primaryColor: e.target.value })}
                placeholder="#6366f1"
              />
            </div>
          </Field>
          <Field label="CTA label">
            <Input
              value={config?.ctaText ?? ''}
              onChange={e => onChange({ ...config, ctaText: e.target.value })}
            />
          </Field>
          <Field label="CTA URL">
            <Input
              value={config?.ctaLink ?? ''}
              onChange={e => onChange({ ...config, ctaLink: e.target.value })}
            />
          </Field>
        </div>
      </Card>
    </div>

    <Card padding="md">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {['Indigo Lead', 'Emerald Build', 'Slate QA'].map(n => (
              <div key={n} className="ring-2 ring-[#0a0a0c] rounded-full">
                <Avatar name={n} size="sm" />
              </div>
            ))}
          </div>
          <span className="text-xs text-slate-400">12 collaborators online</span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-500">Last commit 2m ago</span>
          <span className="w-px h-4 bg-white/10" />
          <Badge tone="success">Nominal</Badge>
        </div>
      </div>
    </Card>
  </div>
);

interface NavItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'Overview' | 'Content' | 'Design';
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Analytics', icon: BarChart3, category: 'Overview' },
  { label: 'Asset Hub', icon: ImageIcon, category: 'Content' },
  { label: 'Pages',     icon: FileText, category: 'Content' },
  { label: 'Editor',    icon: Settings, category: 'Design'  },
];

export const WebStudioView: React.FC<{ initialTab?: string }> = ({ initialTab = 'Analytics' }) => {
  const { config, media, loading, saving, saveConfig } = useWebStudio();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [localConfig, setLocalConfig] = useState<WebConfig | null>(null);

  React.useEffect(() => {
    if (config) setLocalConfig(config as WebConfig);
  }, [config]);

  const handlePublish = async () => {
    if (!localConfig) return;
    const result = await saveConfig(localConfig);
    if (result?.success && typeof window !== 'undefined') {
      window.alert('Saved. Deployment pipeline triggered.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex flex-col items-center justify-center gap-4 text-slate-300">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
        <p className="text-sm font-medium">Synchronizing with the database…</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#0a0a0c] overflow-hidden">
      <aside className="w-64 h-full border-r border-white/5 flex flex-col p-5 shrink-0">
        <div className="mb-8 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center text-white shadow-md">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white">Web Studio</h1>
            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500 font-medium">v10.4</p>
          </div>
        </div>

        <nav className="flex-1 space-y-6">
          {(['Overview', 'Content', 'Design'] as const).map(cat => (
            <div key={cat}>
              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500 font-medium mb-2 px-2">
                {cat}
              </p>
              <div className="space-y-0.5">
                {NAV_ITEMS.filter(i => i.category === cat).map(item => {
                  const Icon = item.icon;
                  const active = activeTab === item.label;
                  return (
                    <button
                      key={item.label}
                      onClick={() => setActiveTab(item.label)}
                      className={`w-full h-9 px-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors ${
                        active
                          ? 'bg-white/[0.05] text-white'
                          : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/5 pt-4">
          <Button variant="ghost" size="sm" icon={LogOut} className="w-full">
            Log out
          </Button>
        </div>
      </aside>

      <main className="flex-1 h-full overflow-y-auto">
        <header className="h-14 border-b border-white/5 px-6 flex items-center justify-between sticky top-0 bg-[#0a0a0c]/85 backdrop-blur-xl z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <h2 className="text-sm font-semibold text-white">{activeTab}</h2>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Active domain: <span className="text-slate-300">nexus-corp.com</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              icon={saving ? Loader2 : Save}
              onClick={handlePublish}
              disabled={saving}
              loading={saving}
            >
              {saving ? 'Syncing…' : 'Deploy changes'}
            </Button>
            <Button variant="ghost" size="sm" icon={Bell} aria-label="Notifications" />
          </div>
        </header>

        <div className="p-6 max-w-6xl mx-auto">
          {activeTab === 'Analytics' ? <AnalyticsView /> : null}
          {activeTab === 'Asset Hub' ? <AssetHubView media={media as WebMedia[]} /> : null}
          {activeTab === 'Pages' ? <PagesView config={localConfig} /> : null}
          {activeTab === 'Editor' ? (
            <EditorView config={localConfig} onChange={next => setLocalConfig(next)} />
          ) : null}
        </div>
      </main>
    </div>
  );
};

/**
 * @aqua/bridge/ui/AppMarketplace — slim kit-styled marketplace shared by all sub-apps.
 *
 * Renders a Page-wrapped grid of suite cards with install/uninstall toggles.
 * Per-app `TemplateHubView` files become 30-line adapters that pass their
 * context-bound props down here.
 *
 * The host shell ships its own richer marketplace at
 * `apps/aqua-host-shell/HostShell/components/TemplateHub/HostTemplateHubView.tsx`
 * which adds configure-drawer + lifecycle hooks. This view covers the
 * legacy multi-port debug mode where each sub-app boots its own portal.
 */
'use client';

import React, { useState } from 'react';
import {
  Page,
  PageHeader,
  Card,
  Button,
  SearchInput,
  Badge,
  EmptyState,
} from './kit';

export interface AppMarketplaceSuite {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
  section?: string;
  category?: string;
  pricing?: 'free' | 'pro' | 'enterprise';
  subItems?: Array<unknown>;
}

interface AppMarketplaceProps {
  suites: AppMarketplaceSuite[];
  enabledSuiteIds: string[];
  onToggle: (suiteId: string) => void;
  appLabel?: string;
  authorizedEmail?: string;
  categories?: string[];
}

const SearchSvg: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const PackageSvg: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
    <path d="m7.5 4.27 9 5.15" />
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="M3.3 7 12 12l8.7-5" />
    <path d="M12 22V12" />
  </svg>
);

const PRICING_TONE: Record<NonNullable<AppMarketplaceSuite['pricing']>, 'success' | 'indigo' | 'amber'> = {
  free: 'success',
  pro: 'indigo',
  enterprise: 'amber',
};

export const AppMarketplace: React.FC<AppMarketplaceProps> = ({
  suites,
  enabledSuiteIds,
  onToggle,
  appLabel = 'Marketplace',
  authorizedEmail,
  categories,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const cats = categories ?? Array.from(
    new Set<string>(['All', ...suites.map(s => s.category ?? s.section ?? 'Other')]),
  );

  const filteredSuites = suites.filter(suite => {
    const haystack = `${suite.label} ${suite.id} ${suite.description ?? ''}`.toLowerCase();
    const matchesSearch = haystack.includes(searchQuery.trim().toLowerCase());
    const matchesCategory =
      activeCategory === 'All' ||
      suite.category === activeCategory ||
      suite.section === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Page>
      <PageHeader
        eyebrow={appLabel}
        title="Plugins"
        subtitle={`Install or remove suites for this workspace.${authorizedEmail ? ` Authorized: ${authorizedEmail}.` : ''}`}
        actions={
          <SearchInput
            icon={SearchSvg}
            placeholder="Search plugins..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-72 hidden md:block"
          />
        }
      />

      {cats.length > 1 ? (
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 custom-scrollbar whitespace-nowrap">
          {cats.map(cat => (
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
      ) : null}

      {suites.length === 0 ? (
        <Card padding="lg">
          <EmptyState
            title="No plugins available"
            description="Once suites are registered with the Bridge, they will appear here."
          />
        </Card>
      ) : filteredSuites.length === 0 ? (
        <Card padding="lg">
          <EmptyState
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
          {filteredSuites.map(suite => {
            const Icon = suite.icon ?? PackageSvg;
            const installed = enabledSuiteIds.includes(suite.id);
            const cat = suite.category ?? suite.section ?? 'Other';
            const subItemCount = suite.subItems?.length ?? 0;
            return (
              <Card key={suite.id} padding="md" className={installed ? 'border-indigo-500/25 bg-indigo-500/[0.02]' : ''}>
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
                    <Badge tone="neutral">{cat}</Badge>
                    {suite.pricing ? <Badge tone={PRICING_TONE[suite.pricing]}>{suite.pricing}</Badge> : null}
                  </div>
                </div>

                <h3 className="text-base font-semibold text-white mb-1.5">{suite.label}</h3>
                {suite.description ? (
                  <p className="text-xs text-slate-400 leading-relaxed mb-3 line-clamp-2">{suite.description}</p>
                ) : (
                  <p className="text-xs text-slate-600 italic mb-3">No description provided.</p>
                )}

                {subItemCount > 0 ? (
                  <div className="text-[11px] text-slate-500 mb-4">
                    {subItemCount} {subItemCount === 1 ? 'view' : 'views'}
                  </div>
                ) : null}

                <div className="pt-3 border-t border-white/5">
                  {installed ? (
                    <Button variant="danger" size="sm" onClick={() => onToggle(suite.id)} className="w-full">
                      Uninstall
                    </Button>
                  ) : (
                    <Button variant="primary" size="sm" onClick={() => onToggle(suite.id)} className="w-full">
                      Install
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </Page>
  );
};

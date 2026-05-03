import React from 'react';
import {
  UserPlus,
  Target,
  MoreHorizontal,
  Search,
  Filter,
  BarChart3,
  Flame,
} from 'lucide-react';
import {
  Page,
  PageHeader,
  Card,
  KpiCard,
  Button,
  SearchInput,
  Badge,
  Avatar,
  EmptyState,
} from '@aqua/bridge/ui/kit';
import { useCRMLeadLogic } from './logic/useCRMLeadLogic';

export const CRMLeadManagementView: React.FC = () => {
  const { leads, searchQuery, setSearchQuery } = useCRMLeadLogic();

  return (
    <Page>
      <PageHeader
        eyebrow="CRM"
        title="Leads"
        subtitle="Precision lead orchestration and conversion intelligence."
        actions={
          <>
            <SearchInput
              icon={Search}
              placeholder="Search prospects..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-72 hidden md:block"
            />
            <Button variant="primary" icon={UserPlus}>
              Add prospect
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <KpiCard label="Conversion velocity" value="4.2 days" icon={BarChart3} />
        <KpiCard label="Hot pipelines" value="12" delta="active" trend="up" icon={Flame} />
        <KpiCard label="Efficiency index" value="94.8%" trend="up" icon={Target} />
      </div>

      <Card padding="md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white">Active growth pipeline</h2>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" icon={Filter} aria-label="Filter" />
            <Button variant="ghost" size="sm">Visual board</Button>
          </div>
        </div>

        {leads.length === 0 ? (
          <EmptyState
            icon={Target}
            title="No prospects in this view"
            description={searchQuery ? 'Try clearing the search to see your full pipeline.' : 'Add your first prospect to get started.'}
            action={
              searchQuery ? (
                <Button size="sm" onClick={() => setSearchQuery('')}>Clear search</Button>
              ) : (
                <Button variant="primary" size="sm" icon={UserPlus}>Add prospect</Button>
              )
            }
          />
        ) : (
          <ul className="divide-y divide-white/5 -mx-2">
            {leads.map((lead, i) => (
              <li
                key={i}
                className="px-2 py-3 flex items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={lead.name} size="md" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-white truncate">{lead.name}</span>
                      <Badge tone={lead.priority === 'High' ? 'warning' : 'neutral'}>
                        {lead.priority}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {lead.company} <span className="opacity-50">·</span> {lead.value} prediction
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="hidden md:block w-32">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Engagement</div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500" style={{ width: `${lead.engagement}%` }} />
                    </div>
                  </div>
                  <div className="flex -space-x-1.5">
                    {['Owner A', 'Owner B'].map(n => (
                      <div key={n} className="ring-2 ring-[#0a0a0c] rounded-full">
                        <Avatar name={n} size="sm" />
                      </div>
                    ))}
                  </div>
                  <Button variant="ghost" size="sm" icon={MoreHorizontal} aria-label="More actions" />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </Page>
  );
};

import React, { useMemo, useState } from 'react';
import { Eye, UserPlus, CheckCheck, ChevronDown } from 'lucide-react';
import {
  Page,
  PageHeader,
  Card,
  Button,
  Select,
  Badge,
  Avatar,
} from '@aqua/bridge/ui/kit';
import {
  INBOX_HEADING,
  INBOX_SUBHEAD,
  SOURCE_ICONS,
  type InboundLead,
  type LeadStatus,
} from './CrmInboxWidget.ui';
import { revenueStore, useLeads, type Lead, type LeadStage } from '../../store/revenueStore';

const REPS = [
  { value: '', label: 'Unassigned' },
  { value: 'u1', label: 'Maya Patel' },
  { value: 'u2', label: 'Jordan Reyes' },
  { value: 'u3', label: "Sam O'Connor" },
  { value: 'u4', label: 'Tomas Berg' },
] as const;

const STAGE_OPTIONS = [
  { value: 'New', label: 'New' },
  { value: 'Contacted', label: 'Contacted' },
  { value: 'Qualified', label: 'Qualified' },
  { value: 'Disqualified', label: 'Disqualified' },
] as const;

const STATUS_TONE: Record<LeadStatus, 'info' | 'warning' | 'success' | 'danger'> = {
  New: 'info',
  Contacted: 'warning',
  Qualified: 'success',
  Disqualified: 'danger',
};

const initialsFor = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0]?.toUpperCase() ?? '').join('');

const relativeTimestamp = (iso: string): string => {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 2) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const lookupSource = (s: string): keyof typeof SOURCE_ICONS => {
  const known = ['Web Form', 'Cold Email', 'Referral', 'LinkedIn', 'Inbound Call', 'Webinar'];
  return (known.includes(s) ? s : 'Web Form') as keyof typeof SOURCE_ICONS;
};

const adaptLead = (l: Lead, readSet: Set<string>): InboundLead => ({
  id: l.id,
  name: l.name,
  company: l.company,
  source: lookupSource(l.source),
  timestamp: relativeTimestamp(l.receivedAt),
  status: l.stage as LeadStatus,
  initials: initialsFor(l.name),
  avatarColor: '',
  unread: !readSet.has(l.id) && l.stage === 'New',
  message: l.notes ?? `${l.source} inquiry from ${l.company}`,
});

export const CrmInboxWidget: React.FC = () => {
  const storeLeads = useLeads();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set());

  const leads = useMemo(
    () => storeLeads.map(l => adaptLead(l, readIds)),
    [storeLeads, readIds],
  );

  const unreadCount = useMemo(() => leads.filter(l => l.unread).length, [leads]);

  const markRead = (id: string) =>
    setReadIds(cur => {
      const next = new Set(cur);
      next.add(id);
      return next;
    });

  const handleAssign = (id: string, repValue: string) => {
    revenueStore.assignLead(id, repValue || undefined);
  };

  const handleStageChange = (id: string, stage: LeadStage) => {
    revenueStore.setLeadStage(id, stage);
    if (stage !== 'New') markRead(id);
  };

  const markAllRead = () => {
    setReadIds(new Set(storeLeads.map(l => l.id)));
  };

  const getAssignment = (id: string): string =>
    storeLeads.find(l => l.id === id)?.assigneeId ?? '';

  return (
    <Page>
      <PageHeader
        eyebrow="Sales"
        title={INBOX_HEADING}
        subtitle={INBOX_SUBHEAD}
        actions={
          <>
            <Badge tone={unreadCount > 0 ? 'indigo' : 'neutral'}>
              {unreadCount} unread
            </Badge>
            <Button variant="outline" size="sm" icon={CheckCheck} onClick={markAllRead}>
              Mark all read
            </Button>
          </>
        }
      />

      <Card padding="none">
        <ul className="divide-y divide-white/5">
          {leads.map(lead => {
            const SourceIcon = SOURCE_ICONS[lead.source];
            const isActive = activeId === lead.id;
            return (
              <li key={lead.id} className="hover:bg-white/[0.02] transition-colors">
                <button
                  type="button"
                  onClick={() => setActiveId(isActive ? null : lead.id)}
                  className="w-full text-left px-4 py-3 flex items-start gap-3"
                >
                  <div className="relative shrink-0">
                    <Avatar name={lead.name} size="md" />
                    {lead.unread ? (
                      <span
                        className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0a0a0c]"
                        style={{ backgroundColor: 'var(--revenue-widget-primary-color-1)' }}
                      />
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`font-medium text-sm truncate ${lead.unread ? 'text-white' : 'text-slate-300'}`}>
                        {lead.name}
                      </span>
                      <span className="text-[11px] text-slate-500 truncate">
                        · {lead.company}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <SourceIcon className="w-3 h-3" />
                      <span>{lead.source}</span>
                      <span>·</span>
                      <span>{lead.timestamp}</span>
                    </div>
                  </div>
                  <Badge tone={STATUS_TONE[lead.status]}>{lead.status}</Badge>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-500 shrink-0 transition-transform ${isActive ? 'rotate-180' : ''}`}
                  />
                </button>

                {isActive ? (
                  <div className="px-4 pb-4">
                    <div className="ml-12 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <p className="text-sm text-slate-200 mb-3 leading-relaxed">{lead.message}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Eye}
                          onClick={() => markRead(lead.id)}
                        >
                          Mark as read
                        </Button>
                        <div className="flex items-center gap-2 ml-auto" onClick={e => e.stopPropagation()}>
                          <Select
                            value={lead.status}
                            onChange={e => handleStageChange(lead.id, e.target.value as LeadStage)}
                            className="w-32 h-8 text-xs"
                          >
                            {STAGE_OPTIONS.map(o => (
                              <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                          </Select>
                          <UserPlus className="w-3.5 h-3.5 text-slate-500" />
                          <Select
                            value={getAssignment(lead.id)}
                            onChange={e => handleAssign(lead.id, e.target.value)}
                            className="w-40 h-8 text-xs"
                          >
                            {REPS.map(r => (
                              <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </Card>
    </Page>
  );
};

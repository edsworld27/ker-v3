import React, { useMemo, useState } from 'react';
import { Page, PageHeader, Card, Select, Field, Badge, Avatar } from '@aqua/bridge/ui/kit';
import {
  TIMELINE_HEADING,
  TIMELINE_SUBHEAD,
  ACTIVITY_ICONS,
  ACTIVITY_ACCENTS,
  type TimelineLead,
  type TimelineEntry,
} from './LeadTimelineWidget.ui';

const LEADS: TimelineLead[] = [
  { id: 'lead-helios',    name: 'Ethan Brooks',    company: 'Helios Manufacturing',   stage: 'Proposal',     initials: 'EB', avatarColor: 'bg-sky-500'     },
  { id: 'lead-vertex',    name: 'Felix Aaronson',  company: 'Vertex Aerospace',       stage: 'Negotiation',  initials: 'FA', avatarColor: 'bg-amber-500'   },
  { id: 'lead-northwind', name: 'Daniela Ortega',  company: 'Northwind Logistics',    stage: 'Closed Won',   initials: 'DO', avatarColor: 'bg-emerald-500' },
  { id: 'lead-cobalt',    name: 'Sophia Lin',      company: 'Cobalt Software Group',  stage: 'Qualified',    initials: 'SL', avatarColor: 'bg-rose-500'    },
  { id: 'lead-lumen',     name: 'Hannah Reyes',    company: 'Lumen Health Partners',  stage: 'Closed Won',   initials: 'HR', avatarColor: 'bg-violet-500'  },
];

const ENTRIES: TimelineEntry[] = [
  { id: 'h1', leadId: 'lead-helios', kind: 'email',    actor: 'Priya Banerjee', verb: 'sent intro email',         timestamp: '2026-04-12 09:14', note: 'Followed up on inbound web form. Attached AQUA capabilities deck.' },
  { id: 'h2', leadId: 'lead-helios', kind: 'call',     actor: 'Priya Banerjee', verb: 'discovery call (32 min)',  timestamp: '2026-04-15 11:00', note: 'Spoke with Ops Director. Plant rebrand + new ERP marketing portal.' },
  { id: 'h3', leadId: 'lead-helios', kind: 'status',   actor: 'System',         verb: 'moved to Qualified',       timestamp: '2026-04-15 11:42' },
  { id: 'h4', leadId: 'lead-helios', kind: 'meeting',  actor: 'Priya Banerjee', verb: 'on-site visit',            timestamp: '2026-04-22 14:00', note: 'Toured the Akron plant. Met with VP Marketing + CFO.' },
  { id: 'h5', leadId: 'lead-helios', kind: 'proposal', actor: 'Priya Banerjee', verb: 'sent proposal v1',         timestamp: '2026-04-28 16:08', note: '$112,500 — Website Build + Hosting (12mo).' },
  { id: 'h6', leadId: 'lead-helios', kind: 'status',   actor: 'System',         verb: 'moved to Proposal',        timestamp: '2026-04-28 16:09' },

  { id: 'v1', leadId: 'lead-vertex', kind: 'email',    actor: 'Marcus Hale',    verb: 'referral intro email',     timestamp: '2026-04-08 10:00', note: 'Warm intro from Sequoia partner.' },
  { id: 'v2', leadId: 'lead-vertex', kind: 'call',     actor: 'Marcus Hale',    verb: 'exec briefing',            timestamp: '2026-04-10 13:30', note: 'CMO + VP of Innovation joined. Strong fit for strategy sprint.' },
  { id: 'v3', leadId: 'lead-vertex', kind: 'meeting',  actor: 'Priya Banerjee', verb: 'workshop scoping',         timestamp: '2026-04-17 09:00', note: 'Scoped 6-week sprint with SOW outline.' },
  { id: 'v4', leadId: 'lead-vertex', kind: 'proposal', actor: 'Priya Banerjee', verb: 'sent proposal',            timestamp: '2026-04-20 15:45', note: '$156,800 — Strategy Sprint, Enterprise tier.' },
  { id: 'v5', leadId: 'lead-vertex', kind: 'call',     actor: 'Marcus Hale',    verb: 'pricing negotiation call', timestamp: '2026-04-26 11:00', note: 'Ask: 8% volume discount in exchange for case-study rights.' },
  { id: 'v6', leadId: 'lead-vertex', kind: 'status',   actor: 'System',         verb: 'moved to Negotiation',     timestamp: '2026-04-26 11:31' },

  { id: 'n1', leadId: 'lead-northwind', kind: 'email',    actor: 'Marcus Hale', verb: 'inbound web form ack',     timestamp: '2026-03-28 10:14' },
  { id: 'n2', leadId: 'lead-northwind', kind: 'call',     actor: 'Marcus Hale', verb: 'qualification call',       timestamp: '2026-03-30 13:00', note: 'CEO + Marketing Lead — confirmed budget $80–90K.' },
  { id: 'n3', leadId: 'lead-northwind', kind: 'meeting',  actor: 'Marcus Hale', verb: 'creative kickoff',         timestamp: '2026-04-08 10:30' },
  { id: 'n4', leadId: 'lead-northwind', kind: 'proposal', actor: 'Marcus Hale', verb: 'final proposal sent',      timestamp: '2026-04-22 14:00', note: '$84,200 — Brand Refresh Phase 1.' },
  { id: 'n5', leadId: 'lead-northwind', kind: 'status',   actor: 'System',      verb: 'moved to Closed Won',      timestamp: '2026-04-30 09:18', note: 'Contract signed. Kickoff scheduled May 6.' },

  { id: 'c1', leadId: 'lead-cobalt', kind: 'email',  actor: 'Sasha Owens', verb: 'replied to web form',  timestamp: '2026-04-29 08:30' },
  { id: 'c2', leadId: 'lead-cobalt', kind: 'call',   actor: 'Sasha Owens', verb: 'discovery call',       timestamp: '2026-04-30 11:00', note: 'B2B SaaS site — needs SEO sprint + content engine.' },
  { id: 'c3', leadId: 'lead-cobalt', kind: 'status', actor: 'System',      verb: 'moved to Qualified',   timestamp: '2026-04-30 11:50' },

  { id: 'lm1', leadId: 'lead-lumen', kind: 'meeting',  actor: 'Jordan Iverson', verb: 'webinar attendance',  timestamp: '2026-04-02 13:00', note: 'Joined launch playbook webinar.' },
  { id: 'lm2', leadId: 'lead-lumen', kind: 'email',    actor: 'Jordan Iverson', verb: 'follow-up sequence',  timestamp: '2026-04-05 09:00' },
  { id: 'lm3', leadId: 'lead-lumen', kind: 'call',     actor: 'Jordan Iverson', verb: 'demo call',           timestamp: '2026-04-10 15:30' },
  { id: 'lm4', leadId: 'lead-lumen', kind: 'proposal', actor: 'Jordan Iverson', verb: 'sent proposal',       timestamp: '2026-04-19 16:00', note: '$64,750 — Q3 product launch campaign.' },
  { id: 'lm5', leadId: 'lead-lumen', kind: 'status',   actor: 'System',         verb: 'moved to Closed Won', timestamp: '2026-04-24 12:08' },
];

export const LeadTimelineWidget: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string>(LEADS[0].id);

  const selectedLead = useMemo(
    () => LEADS.find(l => l.id === selectedId) ?? LEADS[0],
    [selectedId],
  );

  const entries = useMemo(
    () =>
      ENTRIES.filter(e => e.leadId === selectedId).sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      ),
    [selectedId],
  );

  return (
    <Page>
      <PageHeader
        eyebrow="Sales"
        title={TIMELINE_HEADING}
        subtitle={TIMELINE_SUBHEAD}
      />

      <Card padding="md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 pb-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <Avatar name={selectedLead.name} size="lg" />
            <div className="min-w-0">
              <div className="text-base font-semibold text-white">{selectedLead.name}</div>
              <div className="text-sm text-slate-400 truncate">{selectedLead.company}</div>
            </div>
            <Badge tone="indigo">{selectedLead.stage}</Badge>
          </div>
          <div className="md:w-72">
            <Field label="Select lead">
              <Select value={selectedId} onChange={e => setSelectedId(e.target.value)}>
                {LEADS.map(l => (
                  <option key={l.id} value={l.id}>{l.name} — {l.company}</option>
                ))}
              </Select>
            </Field>
          </div>
        </div>

        <div className="relative pl-6">
          <div className="absolute left-2 top-0 bottom-0 w-px bg-white/5" />
          <ul className="space-y-5">
            {entries.map(entry => {
              const Icon = ACTIVITY_ICONS[entry.kind];
              return (
                <li key={entry.id} className="relative">
                  <span
                    className={`absolute -left-[19px] top-1 w-6 h-6 rounded-full border flex items-center justify-center ${ACTIVITY_ACCENTS[entry.kind]}`}
                  >
                    <Icon className="w-3 h-3" />
                  </span>
                  <div className="ml-4">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-sm text-slate-200">
                        <span className="font-semibold text-white">{entry.actor}</span>{' '}
                        <span className="text-slate-400">{entry.verb}</span>
                      </p>
                      <span className="text-[11px] text-slate-500 tabular-nums shrink-0">
                        {entry.timestamp}
                      </span>
                    </div>
                    {entry.note ? (
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{entry.note}</p>
                    ) : null}
                  </div>
                </li>
              );
            })}
            {entries.length === 0 ? (
              <li className="text-center text-xs text-slate-500 py-10">
                No activity recorded for this lead yet.
              </li>
            ) : null}
          </ul>
        </div>
      </Card>
    </Page>
  );
};

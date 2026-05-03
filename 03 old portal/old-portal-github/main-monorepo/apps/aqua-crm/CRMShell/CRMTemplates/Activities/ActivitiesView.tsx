import React from 'react';
import { Mail, PhoneCall, Users, StickyNote, Plus, Activity as ActivityIcon } from 'lucide-react';
import {
  Page,
  PageHeader,
  Card,
  Button,
  Select,
  Modal,
  Field,
  Textarea,
  Badge,
  EmptyState,
  Avatar,
} from '@aqua/bridge/ui/kit';
import { useActivitiesLogic } from './logic/useActivitiesLogic';
import {
  ACTIVITY_FILTER_OPTIONS,
  type ActivityEntry,
  type ActivityFilter,
} from './logic/mockData';
import { CRM_OWNERS } from '../store/crmStore';

const ICONS: Record<ActivityEntry['type'], React.ComponentType<{ className?: string }>> = {
  call: PhoneCall,
  email: Mail,
  meeting: Users,
  note: StickyNote,
};

const ICON_TONE: Record<ActivityEntry['type'], string> = {
  call: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20',
  email: 'text-sky-300 bg-sky-500/10 border-sky-500/20',
  meeting: 'text-indigo-300 bg-indigo-500/10 border-indigo-500/20',
  note: 'text-amber-300 bg-amber-500/10 border-amber-500/20',
};

const formatRelative = (iso: string): string => {
  const d = new Date(iso);
  const now = new Date('2026-05-02T23:59:00Z').getTime();
  const diffMs = now - d.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 60) return `${Math.max(1, minutes)}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const TimelineItem: React.FC<{ activity: ActivityEntry }> = ({ activity }) => {
  const Icon = ICONS[activity.type];
  return (
    <div className="relative pl-12 pr-4 py-4 group hover:bg-white/[0.02] transition-colors">
      <div className={`absolute left-3.5 top-5 w-7 h-7 rounded-xl border flex items-center justify-center ${ICON_TONE[activity.type]}`}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Avatar name={activity.actor.name} size="sm" />
            <span className="text-sm text-white">
              <span className="font-semibold">{activity.actor.name}</span>{' '}
              <span className="text-slate-400">{activity.verb}</span>{' '}
              <span className="font-medium">{activity.target}</span>
            </span>
          </div>
          {activity.note ? (
            <p className="text-sm text-slate-300 leading-relaxed pl-9">{activity.note}</p>
          ) : null}
        </div>
        <div className="text-[11px] text-slate-500 tabular-nums whitespace-nowrap pt-1">
          {formatRelative(activity.timestamp)}
        </div>
      </div>
    </div>
  );
};

const TYPE_OPTIONS: ReadonlyArray<{ id: 'note' | 'call' | 'email' | 'meeting'; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'note', label: 'Note', icon: StickyNote },
  { id: 'call', label: 'Call', icon: PhoneCall },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'meeting', label: 'Meeting', icon: Users },
];

export const ActivitiesView: React.FC = () => {
  const {
    activities, filter, setFilter, counts, totalCount,
    composeOpen, openCompose, closeCompose, draft, updateDraft, submitDraft, draftValid, dealOptions,
  } = useActivitiesLogic();

  return (
    <Page>
      <PageHeader
        eyebrow="CRM"
        title="Activities"
        subtitle="Cross-deal feed of every call, email, meeting, and note."
        actions={
          <>
            <Select
              value={filter}
              onChange={e => setFilter(e.target.value as ActivityFilter)}
              className="w-44"
            >
              {ACTIVITY_FILTER_OPTIONS.map(opt => (
                <option key={opt.id} value={opt.id}>
                  {opt.label} ({counts[opt.id]})
                </option>
              ))}
            </Select>
            <Button variant="primary" icon={Plus} onClick={openCompose}>
              Log activity
            </Button>
          </>
        }
      />

      <div className="flex items-center gap-2 mb-4">
        <Badge tone="neutral">{activities.length} of {totalCount}</Badge>
        {filter !== 'all' ? <Badge tone="indigo">filtered: {filter}</Badge> : null}
      </div>

      {activities.length === 0 ? (
        <Card padding="lg">
          <EmptyState
            icon={ActivityIcon}
            title="No activities yet"
            description={filter === 'all'
              ? 'Log your first call, email, meeting, or note to start the timeline.'
              : `No ${filter} activities in the feed yet.`}
            action={<Button variant="primary" size="sm" icon={Plus} onClick={openCompose}>Log activity</Button>}
          />
        </Card>
      ) : (
        <Card padding="none">
          <div className="relative divide-y divide-white/5">
            <div className="absolute left-7 top-4 bottom-4 w-px bg-white/5" aria-hidden />
            {activities.map(activity => (
              <TimelineItem key={activity.id} activity={activity} />
            ))}
          </div>
        </Card>
      )}

      <Modal
        open={composeOpen}
        onClose={closeCompose}
        title="Log activity"
        description="Adds an entry to the cross-deal feed."
        footer={
          <>
            <Button variant="ghost" onClick={closeCompose}>Cancel</Button>
            <Button variant="primary" disabled={!draftValid} onClick={submitDraft}>Log activity</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Type">
            <div className="grid grid-cols-4 gap-2">
              {TYPE_OPTIONS.map(t => {
                const Icon = t.icon;
                const active = draft.type === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => updateDraft({ type: t.id })}
                    className={`flex flex-col items-center gap-1.5 px-3 py-3 border rounded-lg text-xs font-medium transition-colors ${
                      active
                        ? 'border-indigo-400/50 bg-indigo-500/15 text-white'
                        : 'border-white/10 bg-white/[0.03] text-slate-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </Field>
          <Field label="Summary" required>
            <Textarea
              autoFocus
              rows={3}
              value={draft.summary}
              onChange={e => updateDraft({ summary: e.target.value })}
              placeholder="Followed up on proposal — they want to push to next quarter."
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Actor">
              <Select value={draft.actor} onChange={e => updateDraft({ actor: e.target.value })}>
                {CRM_OWNERS.map(o => <option key={o.id} value={o.name}>{o.name}</option>)}
              </Select>
            </Field>
            <Field label="Linked deal">
              <Select value={draft.dealId} onChange={e => updateDraft({ dealId: e.target.value })}>
                <option value="">None</option>
                {dealOptions.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
              </Select>
            </Field>
          </div>
        </div>
      </Modal>
    </Page>
  );
};

export default ActivitiesView;

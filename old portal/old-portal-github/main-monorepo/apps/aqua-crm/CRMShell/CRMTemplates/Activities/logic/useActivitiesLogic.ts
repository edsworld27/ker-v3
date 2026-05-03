import { useCallback, useMemo, useState } from 'react';
import {
  crmStore,
  useCRMStore,
  CRM_OWNERS,
  type CRMActivity,
  type CRMActivityType,
} from '../../store/crmStore';
import {
  type ActivityEntry,
  type ActivityFilter,
  type ActivityType,
} from './mockData';

const VERB_BY_TYPE: Record<ActivityType, string> = {
  call: 'logged a call with',
  email: 'sent an email to',
  meeting: 'met with',
  note: 'noted',
};

function avatarColorFor(actor: string): string {
  let hash = 0;
  for (let i = 0; i < actor.length; i++) hash = (hash * 31 + actor.charCodeAt(i)) | 0;
  const colors = [
    'from-amber-500 to-orange-600',
    'from-sky-500 to-indigo-600',
    'from-emerald-500 to-teal-600',
    'from-fuchsia-500 to-pink-600',
    'from-violet-500 to-indigo-600',
  ];
  return colors[Math.abs(hash) % colors.length];
}

function initialsFor(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0]?.toUpperCase() ?? '')
    .join('');
}

const STORE_TYPE_TO_VIEW: Record<CRMActivityType, ActivityType> = {
  call: 'call',
  email: 'email',
  meeting: 'meeting',
  note: 'note',
  task: 'note',
};

export interface ActivityComposeDraft {
  type: CRMActivityType;
  summary: string;
  actor: string;
  dealId: string;
}

export interface UseActivitiesLogicResult {
  activities: ActivityEntry[];
  filter: ActivityFilter;
  setFilter: (f: ActivityFilter) => void;
  counts: Record<ActivityFilter, number>;
  totalCount: number;
  // compose
  composeOpen: boolean;
  openCompose: () => void;
  closeCompose: () => void;
  draft: ActivityComposeDraft;
  updateDraft: (patch: Partial<ActivityComposeDraft>) => void;
  submitDraft: () => void;
  draftValid: boolean;
  dealOptions: Array<{ id: string; label: string }>;
  deleteActivity: (id: string) => void;
}

export const useActivitiesLogic = (): UseActivitiesLogicResult => {
  const [filter, setFilter] = useState<ActivityFilter>('all');
  const [composeOpen, setComposeOpen] = useState(false);
  const [draft, setDraft] = useState<ActivityComposeDraft>({
    type: 'note',
    summary: '',
    actor: CRM_OWNERS[0].name,
    dealId: '',
  });

  const allActivities = useCRMStore<ActivityEntry[]>(s =>
    s.activities
      .slice()
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .map((a: CRMActivity): ActivityEntry => {
        const linkedDeal = s.deals.find(d => d.id === a.dealId);
        const linkedContact = s.contacts.find(c => c.id === a.contactId);
        const target = linkedDeal?.name ?? linkedContact?.name ?? 'the team';
        const type = STORE_TYPE_TO_VIEW[a.type];
        return {
          id: a.id,
          type,
          actor: {
            name: a.actor,
            initials: initialsFor(a.actor),
            color: avatarColorFor(a.actor),
          },
          verb: VERB_BY_TYPE[type],
          target,
          dealId: a.dealId,
          contactId: a.contactId,
          timestamp: a.timestamp,
          note: a.summary,
        };
      }),
  );

  const dealOptions = useCRMStore(s => s.deals.map(d => ({ id: d.id, label: `${d.name} — ${d.company}` })));

  const counts = useMemo<Record<ActivityFilter, number>>(
    () => ({
      all: allActivities.length,
      call: allActivities.filter(a => a.type === 'call').length,
      email: allActivities.filter(a => a.type === 'email').length,
      meeting: allActivities.filter(a => a.type === 'meeting').length,
      note: allActivities.filter(a => a.type === 'note').length,
    }),
    [allActivities],
  );

  const activities = useMemo<ActivityEntry[]>(
    () => (filter === 'all' ? allActivities : allActivities.filter(a => a.type === filter)),
    [filter, allActivities],
  );

  const openCompose = useCallback(() => {
    setDraft({ type: 'note', summary: '', actor: CRM_OWNERS[0].name, dealId: '' });
    setComposeOpen(true);
  }, []);

  const closeCompose = useCallback(() => setComposeOpen(false), []);

  const updateDraft = useCallback((patch: Partial<ActivityComposeDraft>) => {
    setDraft(prev => ({ ...prev, ...patch }));
  }, []);

  const draftValid = draft.summary.trim().length > 0;

  const submitDraft = useCallback(() => {
    if (!draftValid) return;
    const dealRef = draft.dealId.trim() || undefined;
    crmStore.createActivity({
      type: draft.type,
      summary: draft.summary.trim(),
      actor: draft.actor,
      dealId: dealRef,
    });
    setComposeOpen(false);
  }, [draft, draftValid]);

  const deleteActivity = useCallback((id: string) => {
    crmStore.deleteActivity(id);
  }, []);

  return {
    activities,
    filter,
    setFilter,
    counts,
    totalCount: allActivities.length,
    composeOpen,
    openCompose,
    closeCompose,
    draft,
    updateDraft,
    submitDraft,
    draftValid,
    dealOptions,
    deleteActivity,
  };
};

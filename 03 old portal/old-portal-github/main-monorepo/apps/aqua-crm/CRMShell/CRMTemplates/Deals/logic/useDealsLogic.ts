import { useCallback, useMemo, useState } from 'react';
import {
  crmStore,
  useCRMStore,
  CRM_OWNERS,
  DEAL_STAGES,
  type CRMDeal,
  type DealStage,
} from '../../store/crmStore';
import {
  type DealActivity,
  type DealContact,
  type DealFilter,
  type DealRecord,
  type DealSortKey,
} from './mockData';

export type SortDirection = 'asc' | 'desc';

export interface UseDealsLogicResult {
  deals: DealRecord[];
  filter: DealFilter;
  setFilter: (f: DealFilter) => void;
  sortKey: DealSortKey;
  sortDirection: SortDirection;
  toggleSort: (key: DealSortKey) => void;
  selectedDeal: DealRecord | null;
  selectDeal: (id: string | null) => void;
  counts: Record<DealFilter, number>;
  // CRUD
  createDeal: (input: { name: string; company: string; value: number; stage: DealStage; ownerId: string; expectedClose: string }) => void;
  updateDeal: (id: string, patch: Partial<CRMDeal>) => void;
  deleteDeal: (id: string) => void;
}

const matchesFilter = (deal: DealRecord, filter: DealFilter): boolean => {
  switch (filter) {
    case 'all': return true;
    case 'open': return deal.stage !== 'Closed Won' && deal.stage !== 'Closed Lost';
    case 'closed-won': return deal.stage === 'Closed Won';
    case 'closed-lost': return deal.stage === 'Closed Lost';
    default: return true;
  }
};

const ACTIVITY_TYPE_MAP: Record<string, DealActivity['type']> = {
  call: 'call',
  email: 'email',
  meeting: 'meeting',
  note: 'note',
  task: 'note',
};

/**
 * Adapt a CRMDeal + linked contact + linked activities into the legacy
 * DealRecord shape the DealsView UI expects. Pure projection — no copy.
 */
function buildDealRecord(
  deal: CRMDeal,
  allContacts: ReturnType<typeof crmStore.getState>['contacts'],
  allActivities: ReturnType<typeof crmStore.getState>['activities'],
): DealRecord {
  const linkedActivities = allActivities.filter(a => a.dealId === deal.id);
  const lastActivity = linkedActivities[0]?.timestamp ?? deal.updatedAt;
  const contact = allContacts.find(c => c.id === deal.contactId);
  const fallbackContact: DealContact = {
    name: contact?.name ?? '—',
    title: contact?.title ?? '',
    email: contact?.email ?? '',
    phone: contact?.phone ?? '',
  };
  return {
    id: deal.id,
    name: deal.name,
    stage: deal.stage,
    value: deal.value,
    owner: deal.owner.name,
    expectedClose: deal.expectedClose,
    lastActivity,
    notes: deal.notes ?? '',
    contact: fallbackContact,
    activities: linkedActivities.slice(0, 8).map(a => ({
      id: a.id,
      type: ACTIVITY_TYPE_MAP[a.type] ?? 'note',
      actor: a.actor,
      summary: a.summary,
      timestamp: a.timestamp,
    })),
  };
}

export const useDealsLogic = (): UseDealsLogicResult => {
  const records = useCRMStore(s =>
    s.deals.map(d => buildDealRecord(d, s.contacts, s.activities)),
  );

  const [filter, setFilter] = useState<DealFilter>('all');
  const [sortKey, setSortKey] = useState<DealSortKey>('lastActivity');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filteredAndSorted = useMemo(() => {
    const filtered = records.filter(d => matchesFilter(d, filter));
    const sorted = [...filtered].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      let cmp = 0;
      if (typeof av === 'number' && typeof bv === 'number') {
        cmp = av - bv;
      } else {
        cmp = String(av).localeCompare(String(bv));
      }
      return sortDirection === 'asc' ? cmp : -cmp;
    });
    return sorted;
  }, [records, filter, sortKey, sortDirection]);

  const counts = useMemo<Record<DealFilter, number>>(
    () => ({
      all: records.length,
      open: records.filter(d => matchesFilter(d, 'open')).length,
      'closed-won': records.filter(d => matchesFilter(d, 'closed-won')).length,
      'closed-lost': records.filter(d => matchesFilter(d, 'closed-lost')).length,
    }),
    [records],
  );

  const toggleSort = useCallback((key: DealSortKey) => {
    setSortKey(prev => {
      if (prev === key) {
        setSortDirection(d => (d === 'asc' ? 'desc' : 'asc'));
        return prev;
      }
      setSortDirection('asc');
      return key;
    });
  }, []);

  const selectDeal = useCallback((id: string | null) => setSelectedId(id), []);

  const selectedDeal = useMemo(
    () => filteredAndSorted.find(d => d.id === selectedId) ?? null,
    [filteredAndSorted, selectedId],
  );

  const createDeal: UseDealsLogicResult['createDeal'] = useCallback((input) => {
    const owner = CRM_OWNERS.find(o => o.id === input.ownerId) ?? CRM_OWNERS[0];
    const deal = crmStore.createDeal({
      name: input.name,
      company: input.company,
      value: input.value,
      stage: input.stage,
      owner,
      expectedClose: input.expectedClose,
      probability:
        input.stage === 'Closed Won' ? 100 :
        input.stage === 'Closed Lost' ? 0 :
        input.stage === 'Negotiation' ? 75 :
        input.stage === 'Proposal' ? 60 :
        input.stage === 'Qualified' ? 45 : 25,
    });
    crmStore.createActivity({
      type: 'note',
      actor: 'Deals',
      summary: `Created deal "${deal.name}" for ${deal.company}`,
      dealId: deal.id,
    });
  }, []);

  const updateDeal: UseDealsLogicResult['updateDeal'] = useCallback((id, patch) => {
    crmStore.updateDeal(id, patch);
  }, []);

  const deleteDeal: UseDealsLogicResult['deleteDeal'] = useCallback((id) => {
    crmStore.deleteDeal(id);
    setSelectedId(prev => (prev === id ? null : prev));
  }, []);

  return {
    deals: filteredAndSorted,
    filter,
    setFilter,
    sortKey,
    sortDirection,
    toggleSort,
    selectedDeal,
    selectDeal,
    counts,
    createDeal,
    updateDeal,
    deleteDeal,
  };
};

export { DEAL_STAGES, CRM_OWNERS };

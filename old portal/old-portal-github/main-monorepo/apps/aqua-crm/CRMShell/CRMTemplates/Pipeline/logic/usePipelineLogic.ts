import { useCallback, useMemo, useState } from 'react';
import {
  crmStore,
  useCRMDeals,
  DEAL_STAGES,
  CRM_OWNERS,
  type CRMDeal,
  type DealStage,
} from '../../store/crmStore';

// Re-exports kept so existing imports (PipelineView.tsx, mockData.ts) still resolve
export type { DealStage as PipelineStage } from '../../store/crmStore';
export type PipelineDeal = CRMDeal;

export interface PipelineColumn {
  stage: DealStage;
  deals: CRMDeal[];
  totalValue: number;
  weightedValue: number;
}

export interface NewDealDraft {
  name: string;
  company: string;
  value: string;
  stage: DealStage;
  ownerId: string;
  expectedClose: string;
}

const blankDraft = (): NewDealDraft => ({
  name: '',
  company: '',
  value: '',
  stage: 'Lead',
  ownerId: CRM_OWNERS[0].id,
  expectedClose: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10),
});

export interface UsePipelineLogicResult {
  columns: PipelineColumn[];
  totalValue: number;
  totalWeighted: number;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  draggedDealId: string | null;
  onDragStart: (dealId: string) => void;
  onDragEnd: () => void;
  onDropOnStage: (stage: DealStage) => void;
  onCreateDeal: () => void;
  // New-deal modal state
  modalOpen: boolean;
  closeModal: () => void;
  draft: NewDealDraft;
  updateDraft: (patch: Partial<NewDealDraft>) => void;
  submitDraft: () => void;
  draftValid: boolean;
}

export const usePipelineLogic = (): UsePipelineLogicResult => {
  const deals = useCRMDeals();
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState<NewDealDraft>(blankDraft());

  const filteredDeals = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return deals;
    return deals.filter(
      d =>
        d.name.toLowerCase().includes(q) ||
        d.company.toLowerCase().includes(q) ||
        d.owner.name.toLowerCase().includes(q),
    );
  }, [deals, searchQuery]);

  const columns = useMemo<PipelineColumn[]>(
    () =>
      DEAL_STAGES.map(stage => {
        const stageDeals = filteredDeals.filter(d => d.stage === stage);
        const totalValue = stageDeals.reduce((s, d) => s + d.value, 0);
        const weightedValue = stageDeals.reduce(
          (s, d) => s + (d.value * d.probability) / 100,
          0,
        );
        return { stage, deals: stageDeals, totalValue, weightedValue };
      }),
    [filteredDeals],
  );

  const totalValue = useMemo(
    () => filteredDeals.reduce((s, d) => s + d.value, 0),
    [filteredDeals],
  );

  const totalWeighted = useMemo(
    () =>
      filteredDeals.reduce((s, d) => s + (d.value * d.probability) / 100, 0),
    [filteredDeals],
  );

  const onDragStart = useCallback((dealId: string) => {
    setDraggedDealId(dealId);
  }, []);

  const onDragEnd = useCallback(() => {
    setDraggedDealId(null);
  }, []);

  const onDropOnStage = useCallback(
    (stage: DealStage) => {
      if (!draggedDealId) return;
      crmStore.setDealStage(draggedDealId, stage);
      crmStore.createActivity({
        type: 'note',
        actor: 'Pipeline',
        summary: `Moved deal to ${stage}`,
        dealId: draggedDealId,
      });
      setDraggedDealId(null);
    },
    [draggedDealId],
  );

  const onCreateDeal = useCallback(() => {
    setDraft(blankDraft());
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  const updateDraft = useCallback((patch: Partial<NewDealDraft>) => {
    setDraft(prev => ({ ...prev, ...patch }));
  }, []);

  const draftValid = draft.name.trim().length > 0 && draft.company.trim().length > 0 && Number(draft.value) > 0;

  const submitDraft = useCallback(() => {
    if (!draftValid) return;
    const owner = CRM_OWNERS.find(o => o.id === draft.ownerId) ?? CRM_OWNERS[0];
    const created = crmStore.createDeal({
      name: draft.name.trim(),
      company: draft.company.trim(),
      value: Number(draft.value),
      stage: draft.stage,
      owner,
      expectedClose: draft.expectedClose,
      probability:
        draft.stage === 'Closed Won' ? 100 :
        draft.stage === 'Closed Lost' ? 0 :
        draft.stage === 'Negotiation' ? 75 :
        draft.stage === 'Proposal' ? 60 :
        draft.stage === 'Qualified' ? 45 : 25,
    });
    crmStore.createActivity({
      type: 'note',
      actor: 'Pipeline',
      summary: `Created deal "${created.name}" for ${created.company}`,
      dealId: created.id,
    });
    setModalOpen(false);
  }, [draft, draftValid]);

  return {
    columns,
    totalValue,
    totalWeighted,
    searchQuery,
    setSearchQuery,
    draggedDealId,
    onDragStart,
    onDragEnd,
    onDropOnStage,
    onCreateDeal,
    modalOpen,
    closeModal,
    draft,
    updateDraft,
    submitDraft,
    draftValid,
  };
};

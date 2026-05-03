import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Briefcase,
  DollarSign,
  Plus,
  Search,
  TrendingUp,
  Layers,
} from 'lucide-react';
import {
  Page,
  PageHeader,
  KpiCard,
  Card,
  Button,
  SearchInput,
  Modal,
  Field,
  Input,
  Select,
  Badge,
  EmptyState,
} from '@aqua/bridge/ui/kit';
import { usePipelineLogic, type PipelineColumn, type PipelineDeal } from './logic/usePipelineLogic';
import { CRM_OWNERS, DEAL_STAGES } from '../store/crmStore';

const formatCurrency = (n: number): string =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2)}M` : n >= 1_000 ? `$${(n / 1_000).toFixed(1)}k` : `$${n}`;

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

interface PipelineCardProps {
  deal: PipelineDeal;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
}

const PipelineCard: React.FC<PipelineCardProps> = ({ deal, onDragStart, onDragEnd }) => (
  <motion.div
    layout
    layoutId={`pipeline-card-${deal.id}`}
    draggable
    onDragStart={() => onDragStart(deal.id)}
    onDragEnd={onDragEnd}
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -6 }}
    transition={{ duration: 0.18 }}
    className="bg-white/[0.04] border border-white/10 rounded-xl p-3 cursor-grab active:cursor-grabbing hover:bg-white/[0.08] hover:border-white/15 transition-colors"
  >
    <div className="flex items-start justify-between gap-2 mb-2">
      <div className="min-w-0">
        <div className="text-sm font-medium text-white truncate">{deal.name}</div>
        <div className="text-[11px] text-slate-500 truncate">{deal.company}</div>
      </div>
      <Badge tone="indigo">{deal.probability}%</Badge>
    </div>
    <div className="flex items-center justify-between text-xs">
      <span className="font-semibold text-white tabular-nums">{formatCurrency(deal.value)}</span>
      <span className="text-slate-500">{formatDate(deal.expectedClose)}</span>
    </div>
    {deal.tags.length > 0 && (
      <div className="flex flex-wrap gap-1 mt-2">
        {deal.tags.slice(0, 3).map(t => (
          <span key={t} className="text-[10px] px-1.5 h-4 inline-flex items-center bg-white/5 text-slate-400 rounded">{t}</span>
        ))}
      </div>
    )}
  </motion.div>
);

interface ColumnViewProps {
  column: PipelineColumn;
  isDropTarget: boolean;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
}

const PipelineColumnView: React.FC<ColumnViewProps> = ({ column, isDropTarget, onDragStart, onDragEnd, onDragOver, onDrop }) => (
  <div
    onDragOver={onDragOver}
    onDrop={onDrop}
    className={`flex flex-col bg-white/[0.02] border rounded-xl transition-colors ${
      isDropTarget ? 'border-indigo-400/30 bg-indigo-500/5' : 'border-white/5'
    }`}
  >
    <div className="px-3 pt-3 pb-2 border-b border-white/5">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <Layers className="w-3 h-3 text-slate-500" />
          <span className="text-xs font-semibold text-white">{column.stage}</span>
        </div>
        <span className="text-[10px] tabular-nums text-slate-500 bg-white/5 px-1.5 h-4 rounded inline-flex items-center">
          {column.deals.length}
        </span>
      </div>
      <div className="flex items-center justify-between text-[11px] text-slate-500 tabular-nums">
        <span>{formatCurrency(column.totalValue)} total</span>
        <span>{formatCurrency(column.weightedValue)} wtd</span>
      </div>
    </div>
    <div className="flex flex-col gap-2 p-2 min-h-[200px]">
      <AnimatePresence>
        {column.deals.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-[11px] text-slate-600 italic py-8">
            Drop a deal here
          </div>
        ) : (
          column.deals.map(deal => (
            <PipelineCard key={deal.id} deal={deal} onDragStart={onDragStart} onDragEnd={onDragEnd} />
          ))
        )}
      </AnimatePresence>
    </div>
  </div>
);

export const PipelineView: React.FC = () => {
  const {
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
  } = usePipelineLogic();

  const totalDeals = columns.reduce((s, c) => s + c.deals.length, 0);

  return (
    <Page>
      <PageHeader
        eyebrow="CRM"
        title="Pipeline"
        subtitle="Drag deals between stages to update their position. Every move logs an activity."
        actions={
          <>
            <SearchInput
              icon={Search}
              placeholder="Search deals, companies, owners..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-72 hidden md:block"
            />
            <Button variant="primary" icon={Plus} onClick={onCreateDeal}>
              New deal
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-3 gap-3 mb-6">
        <KpiCard label="Open deals" value={totalDeals} icon={Briefcase} />
        <KpiCard label="Total pipeline" value={formatCurrency(totalValue)} icon={DollarSign} />
        <KpiCard label="Weighted forecast" value={formatCurrency(totalWeighted)} icon={TrendingUp} />
      </div>

      {totalDeals === 0 ? (
        <Card padding="lg">
          <EmptyState
            icon={Briefcase}
            title="No deals match your search"
            description={searchQuery ? 'Try clearing the filter to see your full pipeline.' : 'Create your first deal to get started.'}
            action={searchQuery
              ? <Button size="sm" onClick={() => setSearchQuery('')}>Clear search</Button>
              : <Button variant="primary" size="sm" icon={Plus} onClick={onCreateDeal}>New deal</Button>}
          />
        </Card>
      ) : (
        <div className="overflow-x-auto -mx-2 px-2">
          <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(240px, 1fr))` }}>
            {columns.map(column => (
              <PipelineColumnView
                key={column.stage}
                column={column}
                isDropTarget={draggedDealId !== null}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onDragOver={e => e.preventDefault()}
                onDrop={() => onDropOnStage(column.stage)}
              />
            ))}
          </div>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title="New deal"
        description="Adds a deal to the pipeline."
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>Cancel</Button>
            <Button variant="primary" disabled={!draftValid} onClick={submitDraft}>Create deal</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Deal name" required>
            <Input autoFocus value={draft.name} onChange={e => updateDraft({ name: e.target.value })} placeholder="Brand Refresh — Q3 Launch" />
          </Field>
          <Field label="Company" required>
            <Input value={draft.company} onChange={e => updateDraft({ company: e.target.value })} placeholder="Northwind Logistics" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Value (USD)" required>
              <Input type="number" min="0" value={draft.value} onChange={e => updateDraft({ value: e.target.value })} placeholder="50000" />
            </Field>
            <Field label="Stage">
              <Select value={draft.stage} onChange={e => updateDraft({ stage: e.target.value as any })}>
                {DEAL_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Owner">
              <Select value={draft.ownerId} onChange={e => updateDraft({ ownerId: e.target.value })}>
                {CRM_OWNERS.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </Select>
            </Field>
            <Field label="Expected close">
              <Input type="date" value={draft.expectedClose} onChange={e => updateDraft({ expectedClose: e.target.value })} />
            </Field>
          </div>
        </div>
      </Modal>
    </Page>
  );
};

export default PipelineView;

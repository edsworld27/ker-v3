import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Mail,
  Phone,
  Calendar,
  PhoneCall,
  Users,
  StickyNote,
  Plus,
  Trash2,
  Briefcase,
} from 'lucide-react';
import {
  Page,
  PageHeader,
  Card,
  Button,
  Input,
  Select,
  Textarea,
  Field,
  Modal,
  Badge,
  EmptyState,
} from '@aqua/bridge/ui/kit';
import { useDealsLogic, DEAL_STAGES, CRM_OWNERS } from './logic/useDealsLogic';
import {
  DEAL_FILTER_OPTIONS,
  type DealActivity,
  type DealRecord,
  type DealSortKey,
} from './logic/mockData';
import type { DealStage } from '../store/crmStore';

const formatCurrency = (n: number): string =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2)}M` : `$${n.toLocaleString('en-US')}`;

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatTimestamp = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const stageTone = (stage: DealStage): 'success' | 'danger' | 'info' | 'indigo' | 'amber' | 'neutral' => {
  if (stage === 'Closed Won') return 'success';
  if (stage === 'Closed Lost') return 'danger';
  if (stage === 'Negotiation') return 'indigo';
  if (stage === 'Proposal') return 'info';
  if (stage === 'Qualified') return 'amber';
  return 'neutral';
};

const ActivityIcon: React.FC<{ type: DealActivity['type'] }> = ({ type }) => {
  if (type === 'call') return <PhoneCall className="w-3 h-3" />;
  if (type === 'email') return <Mail className="w-3 h-3" />;
  if (type === 'meeting') return <Users className="w-3 h-3" />;
  return <StickyNote className="w-3 h-3" />;
};

interface SortableHeaderProps {
  label: string;
  sortKey: DealSortKey;
  activeKey: DealSortKey;
  direction: 'asc' | 'desc';
  onSort: (key: DealSortKey) => void;
  align?: 'left' | 'right';
}

const SortableHeader: React.FC<SortableHeaderProps> = ({ label, sortKey, activeKey, direction, onSort, align = 'left' }) => {
  const isActive = sortKey === activeKey;
  return (
    <th
      onClick={() => onSort(sortKey)}
      className={`px-3 py-2.5 text-[11px] font-medium uppercase tracking-wider text-slate-500 hover:text-slate-300 transition-colors cursor-pointer select-none ${align === 'right' ? 'text-right' : 'text-left'}`}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {isActive ? (direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
      </span>
    </th>
  );
};

const DealDetail: React.FC<{
  deal: DealRecord;
  onClose: () => void;
  onDelete: () => void;
  onEditStage: (stage: DealStage) => void;
  onEditValue: (value: number) => void;
  onEditNotes: (notes: string) => void;
}> = ({ deal, onClose, onDelete, onEditStage, onEditValue, onEditNotes }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    transition={{ duration: 0.2 }}
  >
    <Card padding="md" className="space-y-5 sticky top-4">
      <div>
        <div className="text-xs text-slate-500 uppercase tracking-wider mb-1.5">Deal</div>
        <h2 className="text-base font-semibold text-white mb-2">{deal.name}</h2>
        <Select value={deal.stage} onChange={e => onEditStage(e.target.value as DealStage)} className="text-xs">
          {DEAL_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
        </Select>
      </div>

      <div>
        <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Key metrics</div>
        <div className="grid grid-cols-2 gap-2">
          <Card padding="sm" className="!p-2.5">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Value</div>
            <Input type="number" min="0" value={deal.value} onChange={e => onEditValue(Number(e.target.value) || 0)} className="text-sm font-semibold !h-7 !px-2" />
          </Card>
          <Card padding="sm" className="!p-2.5">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Owner</div>
            <div className="text-sm text-white font-medium truncate">{deal.owner}</div>
          </Card>
          <Card padding="sm" className="!p-2.5">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Close</div>
            <div className="text-sm text-white">{formatDate(deal.expectedClose)}</div>
          </Card>
          <Card padding="sm" className="!p-2.5">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Last activity</div>
            <div className="text-sm text-white">{formatDate(deal.lastActivity)}</div>
          </Card>
        </div>
      </div>

      <div>
        <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Notes</div>
        <Textarea
          value={deal.notes}
          onChange={e => onEditNotes(e.target.value)}
          placeholder="Add notes about this deal..."
          rows={3}
        />
      </div>

      {deal.activities.length > 0 && (
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Recent activities</div>
          <div className="space-y-2">
            {deal.activities.slice(0, 4).map(a => (
              <div key={a.id} className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 shrink-0">
                  <ActivityIcon type={a.type} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-white font-medium">{a.actor}</div>
                  <div className="text-xs text-slate-400 leading-relaxed">{a.summary}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{formatTimestamp(a.timestamp)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {deal.contact.name !== '—' && (
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Primary contact</div>
          <div className="text-sm text-white font-medium">{deal.contact.name}</div>
          <div className="text-xs text-slate-500">{deal.contact.title}</div>
          <div className="flex flex-col gap-1 mt-2 text-xs">
            {deal.contact.email && (
              <div className="text-slate-400 inline-flex items-center gap-1.5">
                <Mail className="w-3 h-3" /> <span className="truncate">{deal.contact.email}</span>
              </div>
            )}
            {deal.contact.phone && (
              <div className="text-slate-400 inline-flex items-center gap-1.5">
                <Phone className="w-3 h-3" /> {deal.contact.phone}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-between pt-3 border-t border-white/5">
        <Button
          variant="danger"
          size="sm"
          icon={Trash2}
          onClick={() => {
            if (typeof window !== 'undefined' && window.confirm(`Delete "${deal.name}"?`)) onDelete();
          }}
        >
          Delete
        </Button>
        <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
      </div>
    </Card>
  </motion.div>
);

export const DealsView: React.FC = () => {
  const {
    deals,
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
  } = useDealsLogic();

  const [createOpen, setCreateOpen] = useState(false);
  const [draft, setDraft] = useState({
    name: '',
    company: '',
    value: '',
    stage: 'Lead' as DealStage,
    ownerId: CRM_OWNERS[0].id,
    expectedClose: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10),
  });
  const draftValid = draft.name.trim().length > 0 && draft.company.trim().length > 0 && Number(draft.value) > 0;
  const submit = () => {
    if (!draftValid) return;
    createDeal({
      name: draft.name.trim(),
      company: draft.company.trim(),
      value: Number(draft.value),
      stage: draft.stage,
      ownerId: draft.ownerId,
      expectedClose: draft.expectedClose,
    });
    setCreateOpen(false);
    setDraft({
      name: '', company: '', value: '', stage: 'Lead',
      ownerId: CRM_OWNERS[0].id,
      expectedClose: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10),
    });
  };

  return (
    <Page>
      <PageHeader
        eyebrow="CRM"
        title="Deals"
        subtitle="Sortable index of every active and historical deal."
        actions={
          <Button variant="primary" icon={Plus} onClick={() => setCreateOpen(true)}>
            New deal
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {DEAL_FILTER_OPTIONS.map(opt => (
          <button
            key={opt.id}
            onClick={() => setFilter(opt.id)}
            className={`inline-flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-medium border transition-colors ${
              filter === opt.id
                ? 'bg-indigo-500/15 text-white border-indigo-500/30'
                : 'bg-white/[0.03] text-slate-400 hover:text-white border-white/10 hover:border-white/20'
            }`}
          >
            {opt.label}
            <span className={`text-[10px] tabular-nums px-1 h-4 rounded inline-flex items-center ${
              filter === opt.id ? 'bg-indigo-500/30 text-indigo-200' : 'bg-white/10 text-slate-400'
            }`}>{counts[opt.id]}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {deals.length === 0 ? (
            <Card padding="lg">
              <EmptyState
                icon={Briefcase}
                title="No deals in this filter"
                description="Try a different filter or create a new deal."
                action={<Button variant="primary" size="sm" icon={Plus} onClick={() => setCreateOpen(true)}>New deal</Button>}
              />
            </Card>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-white/5">
              <table className="w-full text-sm">
                <thead className="bg-white/[0.02] border-b border-white/5">
                  <tr>
                    <SortableHeader label="Name" sortKey="name" activeKey={sortKey} direction={sortDirection} onSort={toggleSort} />
                    <SortableHeader label="Stage" sortKey="stage" activeKey={sortKey} direction={sortDirection} onSort={toggleSort} />
                    <SortableHeader label="Value" sortKey="value" activeKey={sortKey} direction={sortDirection} onSort={toggleSort} align="right" />
                    <SortableHeader label="Owner" sortKey="owner" activeKey={sortKey} direction={sortDirection} onSort={toggleSort} />
                    <SortableHeader label="Close" sortKey="expectedClose" activeKey={sortKey} direction={sortDirection} onSort={toggleSort} />
                    <SortableHeader label="Last activity" sortKey="lastActivity" activeKey={sortKey} direction={sortDirection} onSort={toggleSort} />
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {deals.map(deal => (
                    <tr
                      key={deal.id}
                      onClick={() => selectDeal(deal.id)}
                      className={`hover:bg-white/[0.04] cursor-pointer transition-colors ${selectedDeal?.id === deal.id ? 'bg-indigo-500/10' : ''}`}
                    >
                      <td className="px-3 py-2.5 font-medium text-white">{deal.name}</td>
                      <td className="px-3 py-2.5"><Badge tone={stageTone(deal.stage)}>{deal.stage}</Badge></td>
                      <td className="px-3 py-2.5 text-right font-semibold text-white tabular-nums">{formatCurrency(deal.value)}</td>
                      <td className="px-3 py-2.5 text-slate-400">{deal.owner}</td>
                      <td className="px-3 py-2.5 text-slate-400 inline-flex items-center gap-1.5"><Calendar className="w-3 h-3" />{formatDate(deal.expectedClose)}</td>
                      <td className="px-3 py-2.5 text-slate-500">{formatDate(deal.lastActivity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div>
          <AnimatePresence mode="wait">
            {selectedDeal ? (
              <DealDetail
                key={selectedDeal.id}
                deal={selectedDeal}
                onClose={() => selectDeal(null)}
                onDelete={() => deleteDeal(selectedDeal.id)}
                onEditStage={stage => updateDeal(selectedDeal.id, { stage })}
                onEditValue={value => updateDeal(selectedDeal.id, { value })}
                onEditNotes={notes => updateDeal(selectedDeal.id, { notes })}
              />
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Card padding="lg">
                  <EmptyState
                    title="Select a deal"
                    description="Click a row to view details, edit fields, and see recent activity."
                  />
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New deal"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button variant="primary" disabled={!draftValid} onClick={submit}>Create deal</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Deal name" required>
            <Input autoFocus value={draft.name} onChange={e => setDraft(d => ({ ...d, name: e.target.value }))} placeholder="Brand Refresh — Q3 Launch" />
          </Field>
          <Field label="Company" required>
            <Input value={draft.company} onChange={e => setDraft(d => ({ ...d, company: e.target.value }))} placeholder="Northwind Logistics" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Value (USD)" required>
              <Input type="number" min="0" value={draft.value} onChange={e => setDraft(d => ({ ...d, value: e.target.value }))} placeholder="50000" />
            </Field>
            <Field label="Stage">
              <Select value={draft.stage} onChange={e => setDraft(d => ({ ...d, stage: e.target.value as DealStage }))}>
                {DEAL_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Owner">
              <Select value={draft.ownerId} onChange={e => setDraft(d => ({ ...d, ownerId: e.target.value }))}>
                {CRM_OWNERS.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </Select>
            </Field>
            <Field label="Expected close">
              <Input type="date" value={draft.expectedClose} onChange={e => setDraft(d => ({ ...d, expectedClose: e.target.value }))} />
            </Field>
          </div>
        </div>
      </Modal>
    </Page>
  );
};

export default DealsView;

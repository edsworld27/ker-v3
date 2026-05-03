'use client';

import React, { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2, Megaphone } from 'lucide-react';
import {
  Page,
  PageHeader,
  Card,
  Button,
  Modal,
  Field,
  Input,
  Select,
  Badge,
  EmptyState,
} from '@aqua/bridge/ui/kit';
import {
  revenueStore,
  useCampaigns,
  type CampaignChannel,
  type CampaignStatus,
} from '../../store/revenueStore';

type SortKey = 'name' | 'channel' | 'budget' | 'spend' | 'conversions' | 'roi';

const CHANNELS: CampaignChannel[] = ['Paid Social', 'Paid Search', 'Email', 'Referral', 'Video', 'PR + Direct', 'SEO', 'Display'];
const STATUSES: CampaignStatus[] = ['Active', 'Paused', 'Completed', 'Draft'];

const formatCurrency = (n: number): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
const formatNumber = (n: number): string => new Intl.NumberFormat('en-US').format(n);

const STATUS_TONE: Record<CampaignStatus, 'success' | 'warning' | 'neutral' | 'info'> = {
  Active: 'success',
  Paused: 'warning',
  Draft: 'neutral',
  Completed: 'info',
};

export const CampaignList: React.FC = () => {
  const campaigns = useCampaigns();

  const [sortKey, setSortKey] = useState<SortKey>('spend');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [editId, setEditId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [draft, setDraft] = useState({
    name: '',
    channel: 'Paid Social' as CampaignChannel,
    budget: '',
    status: 'Active' as CampaignStatus,
  });
  const draftValid = draft.name.trim().length > 0 && Number(draft.budget) > 0;

  const submit = () => {
    if (!draftValid) return;
    revenueStore.createCampaign({
      name: draft.name.trim(),
      channel: draft.channel,
      budget: Number(draft.budget),
      status: draft.status,
    });
    setDraft({ name: '', channel: 'Paid Social', budget: '', status: 'Active' });
    setCreateOpen(false);
  };

  const editing = editId ? campaigns.find(c => c.id === editId) ?? null : null;

  const sorted = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...campaigns].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }, [campaigns, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
  };

  const SortHeader: React.FC<{ k: SortKey; label: string; align?: 'left' | 'right' }> = ({ k, label, align = 'left' }) => (
    <th
      onClick={() => handleSort(k)}
      className={`px-3 py-2.5 text-[11px] font-medium uppercase tracking-wider cursor-pointer select-none ${
        sortKey === k ? 'text-white' : 'text-slate-500 hover:text-slate-300'
      } ${align === 'right' ? 'text-right' : 'text-left'}`}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {sortKey === k ? (
          sortDir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
        ) : null}
      </span>
    </th>
  );

  return (
    <Page>
      <PageHeader
        eyebrow="Marketing"
        title="Campaigns"
        subtitle="Active, paused, and recently completed marketing campaigns."
        actions={
          <Button variant="primary" icon={Plus} onClick={() => setCreateOpen(true)}>
            New campaign
          </Button>
        }
      />

      <div className="flex items-center gap-2 mb-4">
        <Badge tone="neutral">{sorted.length} campaigns</Badge>
        <Badge tone="success">{campaigns.filter(c => c.status === 'Active').length} active</Badge>
      </div>

      {sorted.length === 0 ? (
        <Card padding="lg">
          <EmptyState
            icon={Megaphone}
            title="No campaigns yet"
            description="Spin up your first campaign to track budget, spend, and ROI."
            action={<Button variant="primary" size="sm" icon={Plus} onClick={() => setCreateOpen(true)}>New campaign</Button>}
          />
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/5 bg-white/[0.02]">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.02] border-b border-white/5">
              <tr>
                <SortHeader k="name" label="Campaign" />
                <SortHeader k="channel" label="Channel" />
                <SortHeader k="budget" label="Budget" align="right" />
                <SortHeader k="spend" label="Spend" align="right" />
                <SortHeader k="conversions" label="Conversions" align="right" />
                <SortHeader k="roi" label="ROI" align="right" />
                <th className="px-3 py-2.5 text-[11px] font-medium uppercase tracking-wider text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sorted.map(c => (
                <tr
                  key={c.id}
                  onClick={() => setEditId(c.id)}
                  className="hover:bg-white/[0.04] cursor-pointer transition-colors"
                >
                  <td className="px-3 py-2.5 text-white font-medium">{c.name}</td>
                  <td className="px-3 py-2.5 text-slate-400">{c.channel}</td>
                  <td className="px-3 py-2.5 text-right text-slate-200 tabular-nums">{formatCurrency(c.budget)}</td>
                  <td className="px-3 py-2.5 text-right text-slate-200 tabular-nums">{formatCurrency(c.spend)}</td>
                  <td className="px-3 py-2.5 text-right text-slate-200 tabular-nums">{formatNumber(c.conversions)}</td>
                  <td className="px-3 py-2.5 text-right text-white font-semibold tabular-nums">{c.roi.toFixed(1)}x</td>
                  <td className="px-3 py-2.5"><Badge tone={STATUS_TONE[c.status]}>{c.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New campaign"
        description="Track budget, spend, and ROI from launch."
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button variant="primary" disabled={!draftValid} onClick={submit}>Create campaign</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Name" required>
            <Input
              autoFocus
              value={draft.name}
              onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
              placeholder="Q3 Brand Lift — Europe"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Channel">
              <Select value={draft.channel} onChange={e => setDraft(d => ({ ...d, channel: e.target.value as CampaignChannel }))}>
                {CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
            </Field>
            <Field label="Budget (USD)" required>
              <Input
                type="number"
                min="0"
                value={draft.budget}
                onChange={e => setDraft(d => ({ ...d, budget: e.target.value }))}
                placeholder="20000"
              />
            </Field>
          </div>
          <Field label="Status">
            <Select value={draft.status} onChange={e => setDraft(d => ({ ...d, status: e.target.value as CampaignStatus }))}>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
          </Field>
        </div>
      </Modal>

      <Modal
        open={editing !== null}
        onClose={() => setEditId(null)}
        title={editing?.name ?? 'Edit campaign'}
        size="lg"
        footer={
          editing ? (
            <div className="flex w-full items-center justify-between">
              <Button
                variant="danger"
                size="sm"
                icon={Trash2}
                onClick={() => {
                  if (typeof window !== 'undefined' && window.confirm(`Delete "${editing.name}"?`)) {
                    revenueStore.deleteCampaign(editing.id);
                    setEditId(null);
                  }
                }}
              >
                Delete campaign
              </Button>
              <Button variant="primary" onClick={() => setEditId(null)}>Done</Button>
            </div>
          ) : null
        }
      >
        {editing ? (
          <div className="space-y-4">
            <Field label="Name">
              <Input value={editing.name} onChange={e => revenueStore.updateCampaign(editing.id, { name: e.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Channel">
                <Select
                  value={editing.channel}
                  onChange={e => revenueStore.updateCampaign(editing.id, { channel: e.target.value as CampaignChannel })}
                >
                  {CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
                </Select>
              </Field>
              <Field label="Status">
                <Select
                  value={editing.status}
                  onChange={e => revenueStore.updateCampaign(editing.id, { status: e.target.value as CampaignStatus })}
                >
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </Select>
              </Field>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Budget">
                <Input
                  type="number"
                  value={editing.budget}
                  onChange={e => revenueStore.updateCampaign(editing.id, { budget: Number(e.target.value) || 0 })}
                />
              </Field>
              <Field label="Spend">
                <Input
                  type="number"
                  value={editing.spend}
                  onChange={e => revenueStore.updateCampaign(editing.id, { spend: Number(e.target.value) || 0 })}
                />
              </Field>
              <Field label="Conversions">
                <Input
                  type="number"
                  value={editing.conversions}
                  onChange={e => revenueStore.updateCampaign(editing.id, { conversions: Number(e.target.value) || 0 })}
                />
              </Field>
            </div>
            <Field label="ROI (x)">
              <Input
                type="number"
                step="0.1"
                value={editing.roi}
                onChange={e => revenueStore.updateCampaign(editing.id, { roi: Number(e.target.value) || 0 })}
              />
            </Field>
          </div>
        ) : null}
      </Modal>
    </Page>
  );
};

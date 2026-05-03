import React, { useState } from 'react';
import {
  Search,
  Download,
  Plus,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react';
import {
  Page,
  PageHeader,
  Section,
  Card,
  KpiCard,
  Button,
  Input,
  Select,
  SearchInput,
  Field,
  Modal,
  Badge,
  DataTable,
  EmptyState,
  type Column,
} from '@aqua/bridge/ui/kit';
import { useFinanceDashboardLogic } from './logic/useFinanceDashboardLogic';
import { type TxStatus, type TxType } from '../store/financeStore';

const TX_TYPES: TxType[] = ['Settlement', 'Credit', 'Payment', 'Payout', 'Fee'];
const TX_STATUSES: TxStatus[] = ['completed', 'processing', 'pending', 'failed'];

const statusTone = (s: string) => {
  const lower = s.toLowerCase();
  if (lower === 'completed') return 'success' as const;
  if (lower === 'processing') return 'info' as const;
  if (lower === 'pending') return 'warning' as const;
  if (lower === 'failed') return 'danger' as const;
  return 'neutral' as const;
};

export const FinanceDashboardView: React.FC = () => {
  const {
    statistics,
    recentTransactions,
    allRows,
    upcomingPayouts,
    partners,
    searchQuery,
    setSearchQuery,
    statementsOpen, setStatementsOpen,
    splitsOpen, setSplitsOpen,
    newTxOpen, setNewTxOpen,
    onDownload,
    onViewAllStatements,
    onReviewSplits,
    onNewTransaction,
    createTransaction,
    updateSplit,
  } = useFinanceDashboardLogic();

  const [draft, setDraft] = useState({
    description: '',
    type: 'Credit' as TxType,
    amount: '',
    status: 'completed' as TxStatus,
    date: new Date().toISOString().slice(0, 10),
    partnerId: '',
  });
  const draftValid = draft.description.trim().length > 0 && Number(draft.amount) !== 0;

  const submit = () => {
    if (!draftValid) return;
    createTransaction({
      description: draft.description.trim(),
      type: draft.type,
      amount: Number(draft.amount),
      status: draft.status,
      date: draft.date,
      partnerId: draft.partnerId || undefined,
    });
    setDraft({ description: '', type: 'Credit', amount: '', status: 'completed', date: new Date().toISOString().slice(0, 10), partnerId: '' });
    setNewTxOpen(false);
  };

  const totalSplit = partners.reduce((s, p) => s + p.splitPercent, 0);

  type Row = typeof recentTransactions[number];
  const txColumns: Column<Row>[] = [
    { key: 'id', header: 'ID', cell: r => <span className="font-mono text-xs text-slate-500">{r.id}</span>, width: '120px' },
    { key: 'date', header: 'Date', cell: r => r.date, width: '140px' },
    { key: 'desc', header: 'Description', cell: r => <span className="font-medium text-white">{r.description}</span> },
    { key: 'type', header: 'Type', cell: r => <Badge tone="neutral">{r.type}</Badge>, width: '120px' },
    { key: 'amount', header: 'Amount', align: 'right', cell: r => <span className={`font-semibold tabular-nums ${r.amount.startsWith('+') ? 'text-emerald-300' : 'text-rose-300'}`}>{r.amount}</span>, width: '120px' },
    { key: 'status', header: 'Status', cell: r => <Badge tone={statusTone(r.status)}>{r.status.toLowerCase()}</Badge>, width: '120px' },
  ];

  return (
    <Page>
      <PageHeader
        eyebrow="Finance"
        title="Finance Hub"
        subtitle="Live revenue, settlements, and partner payouts. All values reflect the local store and persist across sessions."
        actions={
          <>
            <SearchInput
              icon={Search}
              placeholder="Search ledgers..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-72 hidden md:block"
            />
            <Button variant="secondary" icon={Download} onClick={onDownload} title="Download CSV">
              CSV
            </Button>
            <Button variant="primary" icon={Plus} onClick={onNewTransaction}>
              New transaction
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {statistics.map((s, i) => (
          <KpiCard
            key={i}
            label={s.label}
            value={s.value}
            delta={s.change}
            trend={s.trend === 'up' ? 'up' : s.trend === 'down' ? 'down' : 'flat'}
            icon={s.icon}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Section
            title="Recent settlements"
            description={`${allRows.length} transaction${allRows.length === 1 ? '' : 's'} on file`}
            actions={
              <Button variant="ghost" size="sm" iconRight={ArrowUpRight} onClick={onViewAllStatements}>
                View all
              </Button>
            }
          >
            {recentTransactions.length === 0 ? (
              <Card padding="lg">
                <EmptyState
                  title="No transactions match your search"
                  description={`Try clearing the filter to see all ${allRows.length} ledger entries.`}
                  action={searchQuery ? <Button size="sm" onClick={() => setSearchQuery('')}>Clear search</Button> : undefined}
                />
              </Card>
            ) : (
              <DataTable
                columns={txColumns}
                rows={recentTransactions}
                rowKey={r => r.id}
                empty={<EmptyState title="No transactions yet" />}
              />
            )}
          </Section>
        </div>

        <div className="space-y-4">
          <Card padding="md">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Partner splits</div>
                <div className="text-lg font-semibold text-white">{partners.length} partners</div>
              </div>
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-indigo-300" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              {totalSplit === 100
                ? 'Distribution is fully allocated. Edit any partner to rebalance.'
                : `Currently ${totalSplit}% allocated — adjust to balance to 100%.`}
            </p>
            <Button variant="primary" size="sm" onClick={onReviewSplits} className="w-full">
              Review splits
            </Button>
          </Card>

          <Card padding="md">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-3">Upcoming payouts</div>
            {upcomingPayouts.length === 0 ? (
              <p className="text-sm text-slate-500">None scheduled.</p>
            ) : (
              <div className="space-y-2.5">
                {upcomingPayouts.map(p => (
                  <div key={p.id} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white font-medium truncate">{p.partnerName}</div>
                      <div className="text-[11px] text-slate-500">{p.scheduledFor}</div>
                    </div>
                    <span className="text-sm font-semibold text-white tabular-nums">{p.amount}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* New transaction modal */}
      <Modal
        open={newTxOpen}
        onClose={() => setNewTxOpen(false)}
        title="New transaction"
        description="Records a credit, payment, settlement, or fee against the ledger."
        footer={
          <>
            <Button variant="ghost" onClick={() => setNewTxOpen(false)}>Cancel</Button>
            <Button variant="primary" disabled={!draftValid} onClick={submit}>Save transaction</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Description" required>
            <Input autoFocus value={draft.description} onChange={e => setDraft(d => ({ ...d, description: e.target.value }))} placeholder="Q2 retainer — Northwind" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Type">
              <Select value={draft.type} onChange={e => setDraft(d => ({ ...d, type: e.target.value as TxType }))}>
                {TX_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </Select>
            </Field>
            <Field label="Amount (signed)" required help="Negative for outbound, positive for inbound">
              <Input type="number" value={draft.amount} onChange={e => setDraft(d => ({ ...d, amount: e.target.value }))} placeholder="-12400 or 5000" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Status">
              <Select value={draft.status} onChange={e => setDraft(d => ({ ...d, status: e.target.value as TxStatus }))}>
                {TX_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </Select>
            </Field>
            <Field label="Date">
              <Input type="date" value={draft.date} onChange={e => setDraft(d => ({ ...d, date: e.target.value }))} />
            </Field>
          </div>
          <Field label="Partner (optional)">
            <Select value={draft.partnerId} onChange={e => setDraft(d => ({ ...d, partnerId: e.target.value }))}>
              <option value="">None</option>
              {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
          </Field>
        </div>
      </Modal>

      {/* All statements modal */}
      <Modal
        open={statementsOpen}
        onClose={() => setStatementsOpen(false)}
        title={`All statements (${allRows.length})`}
        size="xl"
        footer={<Button variant="primary" onClick={() => setStatementsOpen(false)}>Done</Button>}
      >
        <DataTable columns={txColumns} rows={allRows} rowKey={r => r.id} empty={<EmptyState title="No transactions" />} />
      </Modal>

      {/* Splits modal */}
      <Modal
        open={splitsOpen}
        onClose={() => setSplitsOpen(false)}
        title="Partner splits"
        description="Adjust each partner's share of inbound revenue. Aim for 100% total."
        footer={
          <>
            <span className={`mr-auto text-xs font-medium ${totalSplit === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {totalSplit}% allocated
            </span>
            <Button variant="primary" onClick={() => setSplitsOpen(false)}>Done</Button>
          </>
        }
      >
        <div className="space-y-2">
          {partners.map(p => (
            <div key={p.id} className="flex items-center gap-3 px-3 py-2.5 bg-white/[0.03] border border-white/5 rounded-lg">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{p.name}</div>
                <div className="text-[11px] text-slate-500 truncate">{p.contactEmail ?? '—'}</div>
              </div>
              <Input
                type="number"
                min="0"
                max="100"
                value={p.splitPercent}
                onChange={e => updateSplit(p.id, Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
                className="w-20 text-right"
              />
              <span className="text-sm text-slate-400">%</span>
            </div>
          ))}
        </div>
      </Modal>
    </Page>
  );
};

export default FinanceDashboardView;

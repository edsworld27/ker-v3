import { useMemo, useState } from 'react';
import { TrendingUp, DollarSign, CreditCard, PieChart } from 'lucide-react';
import {
  financeStore,
  useFinanceTransactions,
  useFinancePartners,
  useFinancePayouts,
  exportTransactionsCsv,
  type FinanceTransaction,
} from '../../store/financeStore';

const fmtCurrency = (n: number): string => {
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}k`;
  return `${sign}$${abs.toLocaleString('en-US')}`;
};

const fmtAmount = (n: number): string => {
  const sign = n >= 0 ? '+' : '-';
  const abs = Math.abs(n);
  return `${sign}$${abs.toLocaleString('en-US')}`;
};

const fmtDate = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export interface DashboardTransactionRow {
  id: string;
  description: string;
  date: string;
  type: string;
  amount: string;
  status: string;
  raw: FinanceTransaction;
}

export const useFinanceDashboardLogic = () => {
  const transactions = useFinanceTransactions();
  const partners = useFinancePartners();
  const payouts = useFinancePayouts();

  const [searchQuery, setSearchQuery] = useState('');
  const [statementsOpen, setStatementsOpen] = useState(false);
  const [splitsOpen, setSplitsOpen] = useState(false);
  const [newTxOpen, setNewTxOpen] = useState(false);

  // Compute KPIs from real data
  const statistics = useMemo(() => {
    const inbound = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const outbound = transactions.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0);
    const net = inbound + outbound;
    const activeSettlements = transactions.filter(t => t.type === 'Settlement' && t.status !== 'completed').length;
    const partnersLinked = partners.length;
    const pendingPayouts = payouts
      .filter(p => p.status === 'scheduled' || p.status === 'processing')
      .reduce((s, p) => s + p.amount, 0);

    return [
      { label: 'Net Revenue',        value: fmtCurrency(net),             change: inbound === 0 ? '—' : `${((net / inbound) * 100).toFixed(1)}%`, trend: net >= 0 ? 'up' : 'down', icon: DollarSign },
      { label: 'Active Settlements', value: String(activeSettlements),    change: `${transactions.filter(t => t.type === 'Settlement').length} total`,         trend: 'up',                  icon: PieChart },
      { label: 'Partners Linked',    value: String(partnersLinked),       change: `${partners.reduce((s, p) => s + p.splitPercent, 0)}% allocated`,            trend: 'up',                  icon: TrendingUp },
      { label: 'Pending Payouts',    value: fmtCurrency(pendingPayouts),  change: `${payouts.filter(p => p.status !== 'cancelled' && p.status !== 'sent').length} scheduled`, trend: 'up',                  icon: CreditCard },
    ];
  }, [transactions, partners, payouts]);

  // Filtered + formatted transaction rows for the dashboard table
  const filteredRows = useMemo<DashboardTransactionRow[]>(() => {
    const q = searchQuery.trim().toLowerCase();
    return transactions
      .filter(t => !q || t.description.toLowerCase().includes(q) || t.id.toLowerCase().includes(q) || t.type.toLowerCase().includes(q))
      .map(t => ({
        id: t.id,
        description: t.description,
        date: fmtDate(t.date),
        type: t.type,
        amount: fmtAmount(t.amount),
        status: t.status.toUpperCase(),
        raw: t,
      }));
  }, [transactions, searchQuery]);

  const recentTransactions = filteredRows.slice(0, 5);
  const allRows = filteredRows;

  const upcomingPayouts = useMemo(() => {
    return payouts
      .filter(p => p.status === 'scheduled' || p.status === 'processing')
      .sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor))
      .slice(0, 5)
      .map(p => {
        const partner = partners.find(pp => pp.id === p.partnerId);
        return {
          id: p.id,
          partnerName: partner?.name ?? 'Unknown partner',
          amount: fmtAmount(p.amount),
          scheduledFor: fmtDate(p.scheduledFor),
          raw: p,
        };
      });
  }, [payouts, partners]);

  // Action handlers
  const onDownload = () => {
    if (typeof window === 'undefined') return;
    const csv = exportTransactionsCsv(transactions);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aqua-finance-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const onViewAllStatements = () => setStatementsOpen(true);
  const onReviewSplits = () => setSplitsOpen(true);
  const onNewTransaction = () => setNewTxOpen(true);

  // Helpers exposed for modals
  const createTransaction = (input: Omit<FinanceTransaction, 'id'>) => financeStore.createTransaction(input);
  const updateSplit = (partnerId: string, splitPercent: number) => {
    const p = partners.find(p => p.id === partnerId);
    if (!p) return;
    financeStore.upsertPartner({ ...p, splitPercent });
  };

  return {
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
  };
};

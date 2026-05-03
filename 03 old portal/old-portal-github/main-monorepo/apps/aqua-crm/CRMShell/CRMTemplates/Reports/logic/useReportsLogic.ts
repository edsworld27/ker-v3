import { useCRMStore } from '../../store/crmStore';
import { type ForecastPoint, type KPI, type StageBucket } from './mockData';

export interface UseReportsLogicResult {
  kpis: KPI[];
  stageBuckets: StageBucket[];
  forecast: ForecastPoint[];
}

const fmtCurrency = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2)}M` : n >= 1_000 ? `$${(n / 1_000).toFixed(1)}k` : `$${n}`;

const fmtPercent = (ratio: number) => `${(ratio * 100).toFixed(1)}%`;

const STAGE_ORDER = ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'] as const;

const FORECAST_MONTHS = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'] as const;

export const useReportsLogic = (): UseReportsLogicResult => {
  return useCRMStore<UseReportsLogicResult>(s => {
    const all = s.deals;
    const won = all.filter(d => d.stage === 'Closed Won');
    const lost = all.filter(d => d.stage === 'Closed Lost');
    const closed = won.length + lost.length;
    const open = all.filter(d => d.stage !== 'Closed Won' && d.stage !== 'Closed Lost');
    const pipelineValue = open.reduce((sum, d) => sum + d.value, 0);
    const wonValue = won.reduce((sum, d) => sum + d.value, 0);
    const winRate = closed === 0 ? 0 : won.length / closed;
    const avgDealSize = all.length === 0 ? 0 : all.reduce((s, d) => s + d.value, 0) / all.length;

    const kpis: KPI[] = [
      { id: 'kpi-pipeline', label: 'Total Pipeline Value', value: fmtCurrency(pipelineValue), delta: `${open.length} open`, positive: true },
      { id: 'kpi-closed', label: 'Closed Won (lifetime)', value: fmtCurrency(wonValue), delta: `${won.length} deals`, positive: true },
      { id: 'kpi-winrate', label: 'Win Rate', value: fmtPercent(winRate), delta: closed === 0 ? '—' : `${won.length}/${closed}`, positive: winRate >= 0.4 },
      { id: 'kpi-avg', label: 'Average Deal Size', value: fmtCurrency(avgDealSize), delta: `${all.length} total`, positive: true },
    ];

    const stageBuckets: StageBucket[] = STAGE_ORDER.map(stage => {
      const inStage = all.filter(d => d.stage === stage);
      return {
        stage,
        deals: inStage.length,
        value: inStage.reduce((sum, d) => sum + d.value, 0),
      };
    });

    // 6-month forecast based on weighted pipeline distributed by expectedClose month
    const now = new Date();
    const monthBucket = (iso: string): number => {
      const d = new Date(iso);
      const monthsOut = (d.getFullYear() - now.getFullYear()) * 12 + (d.getMonth() - now.getMonth());
      return Math.max(0, Math.min(FORECAST_MONTHS.length - 1, monthsOut));
    };

    const forecast: ForecastPoint[] = FORECAST_MONTHS.map((month, idx) => {
      const dealsForMonth = open.filter(d => monthBucket(d.expectedClose) === idx);
      const weighted = dealsForMonth.reduce((sum, d) => sum + (d.value * d.probability) / 100, 0);
      const conservative = weighted * 0.65;
      return {
        month,
        forecast: Math.round(weighted),
        conservative: Math.round(conservative),
      };
    });

    return { kpis, stageBuckets, forecast };
  });
};

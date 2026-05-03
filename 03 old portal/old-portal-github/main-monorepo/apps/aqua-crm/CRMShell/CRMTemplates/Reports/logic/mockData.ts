/**
 * Reports mock data — KPI grid + bar chart + 6-month forecast.
 */

export interface KPI {
  id: string;
  label: string;
  value: string;
  delta: string;
  positive: boolean;
}

export interface StageBucket {
  stage: string;
  deals: number;
  value: number;
}

export interface ForecastPoint {
  month: string; // 'Jun', 'Jul', ...
  forecast: number;
  conservative: number;
}

export const KPIS: KPI[] = [
  {
    id: 'kpi-pipeline',
    label: 'Total Pipeline Value',
    value: '$1.42M',
    delta: '+12.4%',
    positive: true,
  },
  {
    id: 'kpi-closed',
    label: 'Closed Won (This Month)',
    value: '$180.5k',
    delta: '+34.1%',
    positive: true,
  },
  {
    id: 'kpi-winrate',
    label: 'Win Rate',
    value: '47.3%',
    delta: '+3.2%',
    positive: true,
  },
  {
    id: 'kpi-avg',
    label: 'Average Deal Size',
    value: '$118.6k',
    delta: '-1.8%',
    positive: false,
  },
];

export const STAGE_BUCKETS: StageBucket[] = [
  { stage: 'Lead', deals: 2, value: 102000 },
  { stage: 'Qualified', deals: 2, value: 209500 },
  { stage: 'Proposal', deals: 2, value: 263000 },
  { stage: 'Negotiation', deals: 2, value: 217000 },
  { stage: 'Closed Won', deals: 2, value: 180500 },
  { stage: 'Closed Lost', deals: 2, value: 476000 },
];

export const FORECAST: ForecastPoint[] = [
  { month: 'Jun', forecast: 268000, conservative: 198000 },
  { month: 'Jul', forecast: 312000, conservative: 224000 },
  { month: 'Aug', forecast: 358000, conservative: 251000 },
  { month: 'Sep', forecast: 401000, conservative: 282000 },
  { month: 'Oct', forecast: 372000, conservative: 268000 },
  { month: 'Nov', forecast: 425000, conservative: 312000 },
];

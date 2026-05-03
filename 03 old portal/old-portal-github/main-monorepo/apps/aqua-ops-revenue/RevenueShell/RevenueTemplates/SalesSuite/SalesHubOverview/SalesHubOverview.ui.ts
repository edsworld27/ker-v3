import {
  DollarSign,
  TrendingUp,
  CheckCircle,
  Target,
  PhoneCall,
  Mail,
  Handshake,
  FileSignature,
  AlertCircle,
  type LucideIcon,
} from 'lucide-react';

export interface SalesKpiSpark {
  day: string;
  value: number;
}

export interface SalesKpi {
  id: string;
  label: string;
  value: string;
  delta: string;
  deltaTrend: 'up' | 'down';
  icon: LucideIcon;
  accent: string;
  spark: SalesKpiSpark[];
}

export interface SalesActivityEvent {
  id: string;
  actor: string;
  verb: string;
  target: string;
  amount?: string;
  timestamp: string;
  icon: LucideIcon;
  tone: 'positive' | 'neutral' | 'negative';
}

export const SALES_OVERVIEW_HEADING = 'Sales Hub Overview';
export const SALES_OVERVIEW_SUBHEAD =
  'Quarterly performance signals, pipeline value, and the latest revenue activity from your reps.';
export const SALES_RECENT_ACTIVITY_HEADING = 'Recent Activity';
export const SALES_RECENT_ACTIVITY_SUBHEAD =
  'Last 10 sales events captured by the Bridge revenue stream.';

export const SALES_KPI_ICONS = {
  revenue: DollarSign,
  pipeline: TrendingUp,
  closed: CheckCircle,
  winRate: Target,
} as const;

export const SALES_ACTIVITY_ICONS = {
  call: PhoneCall,
  email: Mail,
  meeting: Handshake,
  proposal: FileSignature,
  alert: AlertCircle,
  closed: CheckCircle,
} as const;

export const SALES_KPI_ACCENT = {
  emerald: 'text-emerald-400 bg-emerald-500/10',
  sky: 'text-sky-400 bg-sky-500/10',
  amber: 'text-amber-400 bg-amber-500/10',
  violet: 'text-violet-400 bg-violet-500/10',
} as const;

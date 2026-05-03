import {
  Sparkles,
  CheckCheck,
  FileText,
  HandCoins,
  Trophy,
  XOctagon,
  type LucideIcon,
} from 'lucide-react';

export type SalesStageId =
  | 'lead'
  | 'qualified'
  | 'proposal'
  | 'negotiation'
  | 'closed-won'
  | 'closed-lost';

export interface SalesStageMeta {
  id: SalesStageId;
  label: string;
  icon: LucideIcon;
  accent: string;
  badgeAccent: string;
}

export interface PipelineDeal {
  id: string;
  company: string;
  title: string;
  value: number;
  probability: number;
  ownerName: string;
  ownerInitials: string;
  ownerColor: string;
  daysInStage: number;
  stage: SalesStageId;
  tag?: string;
}

export const PIPELINE_HEADING = 'Sales Pipeline';
export const PIPELINE_SUBHEAD =
  'Internal kanban of every revenue deal owned by your agency, by stage.';

export const SALES_STAGES: SalesStageMeta[] = [
  {
    id: 'lead',
    label: 'Lead',
    icon: Sparkles,
    accent: 'border-sky-500/40',
    badgeAccent: 'bg-sky-500/10 text-sky-300',
  },
  {
    id: 'qualified',
    label: 'Qualified',
    icon: CheckCheck,
    accent: 'border-violet-500/40',
    badgeAccent: 'bg-violet-500/10 text-violet-300',
  },
  {
    id: 'proposal',
    label: 'Proposal',
    icon: FileText,
    accent: 'border-amber-500/40',
    badgeAccent: 'bg-amber-500/10 text-amber-300',
  },
  {
    id: 'negotiation',
    label: 'Negotiation',
    icon: HandCoins,
    accent: 'border-orange-500/40',
    badgeAccent: 'bg-orange-500/10 text-orange-300',
  },
  {
    id: 'closed-won',
    label: 'Closed Won',
    icon: Trophy,
    accent: 'border-emerald-500/40',
    badgeAccent: 'bg-emerald-500/10 text-emerald-300',
  },
  {
    id: 'closed-lost',
    label: 'Closed Lost',
    icon: XOctagon,
    accent: 'border-rose-500/40',
    badgeAccent: 'bg-rose-500/10 text-rose-300',
  },
];

export const formatCurrency = (value: number): string => {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value}`;
};

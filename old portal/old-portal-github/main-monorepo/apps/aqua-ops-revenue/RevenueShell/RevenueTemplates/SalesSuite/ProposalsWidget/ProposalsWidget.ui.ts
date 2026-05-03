import { FilePen, Send, CheckCircle2, type LucideIcon } from 'lucide-react';

export type ProposalStatus = 'Drafted' | 'Sent' | 'Accepted';

export interface ProposalColumn {
  id: ProposalStatus;
  label: string;
  icon: LucideIcon;
  accent: string;
}

export interface Proposal {
  id: string;
  client: string;
  title: string;
  value: number;
  sentDate: string;
  status: ProposalStatus;
  owner: string;
}

export const PROPOSALS_HEADING = 'Proposals';
export const PROPOSALS_SUBHEAD =
  'Proposal status board — track every quote from draft to accepted.';

export const PROPOSAL_COLUMNS: ProposalColumn[] = [
  {
    id: 'Drafted',
    label: 'Drafted',
    icon: FilePen,
    accent: 'border-sky-500/40 bg-sky-500/5',
  },
  {
    id: 'Sent',
    label: 'Sent',
    icon: Send,
    accent: 'border-amber-500/40 bg-amber-500/5',
  },
  {
    id: 'Accepted',
    label: 'Accepted',
    icon: CheckCircle2,
    accent: 'border-emerald-500/40 bg-emerald-500/5',
  },
];

export const formatProposalCurrency = (value: number): string => {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value}`;
};

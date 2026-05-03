import {
  Globe,
  Mail,
  Users,
  Linkedin,
  Phone,
  Megaphone,
  type LucideIcon,
} from 'lucide-react';

export type LeadSource =
  | 'Web Form'
  | 'Cold Email'
  | 'Referral'
  | 'LinkedIn'
  | 'Inbound Call'
  | 'Webinar';

export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Disqualified';

export interface InboundLead {
  id: string;
  name: string;
  company: string;
  source: LeadSource;
  timestamp: string;
  status: LeadStatus;
  initials: string;
  avatarColor: string;
  unread: boolean;
  message: string;
}

export const INBOX_HEADING = 'CRM Inbox';
export const INBOX_SUBHEAD =
  'Latest 20 inbound leads across every channel — assign them, mark as read, or qualify.';

export const SOURCE_ICONS: Record<LeadSource, LucideIcon> = {
  'Web Form': Globe,
  'Cold Email': Mail,
  Referral: Users,
  LinkedIn: Linkedin,
  'Inbound Call': Phone,
  Webinar: Megaphone,
};

export const STATUS_PILL: Record<LeadStatus, string> = {
  New: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
  Contacted: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  Qualified: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  Disqualified: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
};

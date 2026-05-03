import {
  PhoneCall,
  Mail,
  Handshake,
  RefreshCcw,
  FileSignature,
  type LucideIcon,
} from 'lucide-react';

export type ActivityKind = 'call' | 'email' | 'meeting' | 'status' | 'proposal';

export interface TimelineLead {
  id: string;
  name: string;
  company: string;
  stage: string;
  initials: string;
  avatarColor: string;
}

export interface TimelineEntry {
  id: string;
  leadId: string;
  kind: ActivityKind;
  actor: string;
  verb: string;
  timestamp: string;
  note?: string;
}

export const TIMELINE_HEADING = 'Lead Timeline';
export const TIMELINE_SUBHEAD =
  'Chronological activity feed for any single lead — calls, emails, meetings, status changes.';

export const ACTIVITY_ICONS: Record<ActivityKind, LucideIcon> = {
  call: PhoneCall,
  email: Mail,
  meeting: Handshake,
  status: RefreshCcw,
  proposal: FileSignature,
};

export const ACTIVITY_ACCENTS: Record<ActivityKind, string> = {
  call: 'text-sky-300 bg-sky-500/10 border-sky-500/30',
  email: 'text-violet-300 bg-violet-500/10 border-violet-500/30',
  meeting: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30',
  status: 'text-amber-300 bg-amber-500/10 border-amber-500/30',
  proposal: 'text-rose-300 bg-rose-500/10 border-rose-500/30',
};

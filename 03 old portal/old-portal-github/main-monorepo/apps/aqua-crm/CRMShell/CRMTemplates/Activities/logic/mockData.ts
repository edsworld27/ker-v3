/**
 * Activities mock data — vertical timeline of recent CRM events.
 */

export type ActivityType = 'call' | 'email' | 'meeting' | 'note';

export type ActivityFilter = 'all' | ActivityType;

export interface ActivityEntry {
  id: string;
  type: ActivityType;
  actor: {
    name: string;
    initials: string;
    color: string;
  };
  verb: string;
  target: string;
  dealId?: string;
  contactId?: string;
  timestamp: string; // ISO
  note?: string;
}

export const ACTIVITY_FILTER_OPTIONS: ReadonlyArray<{
  id: ActivityFilter;
  label: string;
}> = [
  { id: 'all', label: 'All Activity' },
  { id: 'call', label: 'Calls' },
  { id: 'email', label: 'Emails' },
  { id: 'meeting', label: 'Meetings' },
  { id: 'note', label: 'Notes' },
];

export const ACTIVITIES_MOCK: ActivityEntry[] = [
  {
    id: 'act-001',
    type: 'call',
    actor: { name: 'Maya Patel', initials: 'MP', color: 'from-amber-500 to-orange-600' },
    verb: 'called',
    target: 'Quinn Holloway · Ironclad Software',
    dealId: 'd-2007',
    contactId: 'c-3007',
    timestamp: '2026-05-02T17:00:00Z',
    note: 'Walked through travel comp vs. line item. Procurement aligning internally.',
  },
  {
    id: 'act-002',
    type: 'meeting',
    actor: { name: 'Jordan Reyes', initials: 'JR', color: 'from-sky-500 to-indigo-600' },
    verb: 'met with',
    target: 'Carmen Wu · Meridian Bank',
    dealId: 'd-2005',
    contactId: 'c-3005',
    timestamp: '2026-05-01T20:00:00Z',
    note: 'SOW walkthrough — legal sign-off expected within 7 days.',
  },
  {
    id: 'act-003',
    type: 'email',
    actor: { name: 'Sam O’Connor', initials: 'SO', color: 'from-emerald-500 to-teal-600' },
    verb: 'emailed',
    target: 'Patrick Mendelson · Hearthstone Realty',
    dealId: 'd-2008',
    contactId: 'c-3008',
    timestamp: '2026-04-30T22:15:00Z',
    note: 'Sent MSA for countersignature.',
  },
  {
    id: 'act-004',
    type: 'meeting',
    actor: { name: 'Jordan Reyes', initials: 'JR', color: 'from-sky-500 to-indigo-600' },
    verb: 'met with',
    target: 'Marcus Halcyon · Halcyon Coffee Co.',
    dealId: 'd-2002',
    contactId: 'c-3002',
    timestamp: '2026-04-30T15:00:00Z',
  },
  {
    id: 'act-005',
    type: 'email',
    actor: { name: 'Jordan Reyes', initials: 'JR', color: 'from-sky-500 to-indigo-600' },
    verb: 'emailed',
    target: 'Carmen Wu · Meridian Bank',
    dealId: 'd-2005',
    contactId: 'c-3005',
    timestamp: '2026-04-30T14:20:00Z',
    note: 'Sent revised SOW v3.',
  },
  {
    id: 'act-006',
    type: 'email',
    actor: { name: 'Sam O’Connor', initials: 'SO', color: 'from-emerald-500 to-teal-600' },
    verb: 'emailed',
    target: 'Lena Park · Vertex Robotics',
    dealId: 'd-2004',
    contactId: 'c-3004',
    timestamp: '2026-04-29T10:05:00Z',
    note: 'Follow-up with pricing tiers by team size.',
  },
  {
    id: 'act-007',
    type: 'email',
    actor: { name: 'Maya Patel', initials: 'MP', color: 'from-amber-500 to-orange-600' },
    verb: 'emailed',
    target: 'Priya Iyer · Northwind Logistics',
    dealId: 'd-2001',
    contactId: 'c-3001',
    timestamp: '2026-04-28T14:12:00Z',
    note: 'Sent capabilities deck and 3 case studies.',
  },
  {
    id: 'act-008',
    type: 'note',
    actor: { name: 'Tomas Berg', initials: 'TB', color: 'from-fuchsia-500 to-pink-600' },
    verb: 'left a note on',
    target: 'Aerie Outfitters · Paid Social Expansion',
    dealId: 'd-2006',
    contactId: 'c-3006',
    timestamp: '2026-04-27T18:11:00Z',
    note: 'Pilot ROAS hit 4.2x — strong case for expansion to 4 channels.',
  },
  {
    id: 'act-009',
    type: 'meeting',
    actor: { name: 'Maya Patel', initials: 'MP', color: 'from-amber-500 to-orange-600' },
    verb: 'met with',
    target: 'Dr. Hank Castillo · Lumen Health',
    dealId: 'd-2003',
    contactId: 'c-3003',
    timestamp: '2026-04-25T19:30:00Z',
    note: 'Discussed BAA template and SOC2 docs.',
  },
  {
    id: 'act-010',
    type: 'meeting',
    actor: { name: 'Tomas Berg', initials: 'TB', color: 'from-fuchsia-500 to-pink-600' },
    verb: 'met with',
    target: 'Eli Greenway · Greenway Foods',
    dealId: 'd-2010',
    contactId: 'c-3010',
    timestamp: '2026-04-23T16:30:00Z',
    note: 'Kickoff scheduled for May 6.',
  },
  {
    id: 'act-011',
    type: 'call',
    actor: { name: 'Maya Patel', initials: 'MP', color: 'from-amber-500 to-orange-600' },
    verb: 'called',
    target: 'Priya Iyer · Northwind Logistics',
    dealId: 'd-2001',
    contactId: 'c-3001',
    timestamp: '2026-04-22T16:00:00Z',
    note: 'Discovery call. VP Marketing championing internally.',
  },
  {
    id: 'act-012',
    type: 'note',
    actor: { name: 'Jordan Reyes', initials: 'JR', color: 'from-sky-500 to-indigo-600' },
    verb: 'logged a milestone for',
    target: 'Polaris Apparel · Multi-channel Spring Campaign',
    dealId: 'd-2009',
    contactId: 'c-3009',
    timestamp: '2026-04-11T13:00:00Z',
    note: 'Closed Won at full ask. Kickoff May 15.',
  },
  {
    id: 'act-013',
    type: 'email',
    actor: { name: 'Maya Patel', initials: 'MP', color: 'from-amber-500 to-orange-600' },
    verb: 'emailed',
    target: 'Reggie Atlas · Atlas Realty Group',
    dealId: 'd-2011',
    contactId: 'c-3011',
    timestamp: '2026-03-31T15:42:00Z',
    note: 'Loss debrief sent. Revisit Q1 2027.',
  },
  {
    id: 'act-014',
    type: 'note',
    actor: { name: 'Sam O’Connor', initials: 'SO', color: 'from-emerald-500 to-teal-600' },
    verb: 'left a note on',
    target: 'Bayside Hospitality',
    dealId: 'd-2012',
    contactId: 'c-3012',
    timestamp: '2026-03-02T11:18:00Z',
    note: 'Did not renew. Building internal team.',
  },
  {
    id: 'act-015',
    type: 'call',
    actor: { name: 'Tomas Berg', initials: 'TB', color: 'from-fuchsia-500 to-pink-600' },
    verb: 'called',
    target: 'Beatriz Solano · Andromeda Bio',
    contactId: 'c-3015',
    timestamp: '2026-04-08T18:45:00Z',
    note: 'Cold outreach. Interested in Q3 work.',
  },
  {
    id: 'act-016',
    type: 'meeting',
    actor: { name: 'Maya Patel', initials: 'MP', color: 'from-amber-500 to-orange-600' },
    verb: 'met with',
    target: 'Yuki Tanaka · Kestrel Mobility',
    contactId: 'c-3014',
    timestamp: '2026-04-19T15:30:00Z',
    note: 'Referral from Polaris. Exploring identity work.',
  },
  {
    id: 'act-017',
    type: 'note',
    actor: { name: 'Jordan Reyes', initials: 'JR', color: 'from-sky-500 to-indigo-600' },
    verb: 'left a note on',
    target: 'Solstice Studios',
    contactId: 'c-3013',
    timestamp: '2026-04-15T19:00:00Z',
    note: 'Networking lead — possible partnership channel.',
  },
];

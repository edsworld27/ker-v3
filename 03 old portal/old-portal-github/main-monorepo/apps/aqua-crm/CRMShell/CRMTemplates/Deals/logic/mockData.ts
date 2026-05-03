/**
 * Deals mock data — sortable table rows with detail-pane payload.
 */

export type DealStage =
  | 'Lead'
  | 'Qualified'
  | 'Proposal'
  | 'Negotiation'
  | 'Closed Won'
  | 'Closed Lost';

export type DealFilter = 'all' | 'open' | 'closed-won' | 'closed-lost';

export interface DealActivity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note';
  actor: string;
  summary: string;
  timestamp: string; // ISO
}

export interface DealContact {
  name: string;
  title: string;
  email: string;
  phone: string;
}

export interface DealRecord {
  id: string;
  name: string;
  stage: DealStage;
  value: number;
  owner: string;
  expectedClose: string; // ISO
  lastActivity: string; // ISO
  notes: string;
  activities: DealActivity[];
  contact: DealContact;
}

export const DEALS_MOCK: DealRecord[] = [
  {
    id: 'd-2001',
    name: 'Brand Refresh — Q3 Launch',
    stage: 'Lead',
    value: 84000,
    owner: 'Maya Patel',
    expectedClose: '2026-08-15',
    lastActivity: '2026-04-28',
    notes:
      'Inbound from website. Marketing director is championing internally. Mentioned competitor proposal at $110k.',
    activities: [
      {
        id: 'a-1',
        type: 'email',
        actor: 'Maya Patel',
        summary: 'Sent capabilities deck and case studies',
        timestamp: '2026-04-28T14:12:00Z',
      },
      {
        id: 'a-2',
        type: 'call',
        actor: 'Maya Patel',
        summary: 'Discovery call with VP Marketing',
        timestamp: '2026-04-22T16:00:00Z',
      },
    ],
    contact: {
      name: 'Priya Iyer',
      title: 'VP Marketing',
      email: 'priya@northwindlogistics.com',
      phone: '+1 (415) 555-0148',
    },
  },
  {
    id: 'd-2002',
    name: 'Performance Marketing Retainer',
    stage: 'Lead',
    value: 18000,
    owner: 'Jordan Reyes',
    expectedClose: '2026-07-01',
    lastActivity: '2026-04-30',
    notes: 'Trial budget for 60 days, $3k/mo retainer after.',
    activities: [
      {
        id: 'a-3',
        type: 'meeting',
        actor: 'Jordan Reyes',
        summary: 'Intro meeting with founder',
        timestamp: '2026-04-30T15:00:00Z',
      },
    ],
    contact: {
      name: 'Marcus Halcyon',
      title: 'Founder',
      email: 'marcus@halcyoncoffee.co',
      phone: '+1 (503) 555-0192',
    },
  },
  {
    id: 'd-2003',
    name: 'Website Redesign + CMS',
    stage: 'Qualified',
    value: 142000,
    owner: 'Maya Patel',
    expectedClose: '2026-09-30',
    lastActivity: '2026-04-25',
    notes:
      'Procurement is ready, requires SOC2 and BAA on file. Engineering lead added to next call.',
    activities: [
      {
        id: 'a-4',
        type: 'note',
        actor: 'Maya Patel',
        summary: 'BAA template requested by Lumen security',
        timestamp: '2026-04-25T19:30:00Z',
      },
    ],
    contact: {
      name: 'Dr. Hank Castillo',
      title: 'Director of Digital',
      email: 'hcastillo@lumenhealth.org',
      phone: '+1 (617) 555-0223',
    },
  },
  {
    id: 'd-2004',
    name: 'Sales Enablement Program',
    stage: 'Qualified',
    value: 67500,
    owner: 'Sam O’Connor',
    expectedClose: '2026-08-20',
    lastActivity: '2026-04-29',
    notes: 'Need pricing breakdown by team size.',
    activities: [
      {
        id: 'a-5',
        type: 'email',
        actor: 'Sam O’Connor',
        summary: 'Follow-up with pricing tiers',
        timestamp: '2026-04-29T10:05:00Z',
      },
    ],
    contact: {
      name: 'Lena Park',
      title: 'Head of Revenue',
      email: 'lena.park@vertexrobotics.io',
      phone: '+1 (408) 555-0167',
    },
  },
  {
    id: 'd-2005',
    name: 'Annual Content Engine',
    stage: 'Proposal',
    value: 215000,
    owner: 'Jordan Reyes',
    expectedClose: '2026-06-12',
    lastActivity: '2026-05-01',
    notes:
      'Statement of work in legal review. Compliance asked about data residency for editorial workflow.',
    activities: [
      {
        id: 'a-6',
        type: 'meeting',
        actor: 'Jordan Reyes',
        summary: 'SOW walkthrough with procurement',
        timestamp: '2026-05-01T20:00:00Z',
      },
      {
        id: 'a-7',
        type: 'email',
        actor: 'Jordan Reyes',
        summary: 'Sent revised SOW v3',
        timestamp: '2026-04-30T14:20:00Z',
      },
    ],
    contact: {
      name: 'Carmen Wu',
      title: 'CMO',
      email: 'cwu@meridianbank.com',
      phone: '+1 (212) 555-0301',
    },
  },
  {
    id: 'd-2006',
    name: 'Paid Social Expansion',
    stage: 'Proposal',
    value: 48000,
    owner: 'Tomas Berg',
    expectedClose: '2026-05-29',
    lastActivity: '2026-04-27',
    notes: 'Pilot performed well. Expansion to 4 channels proposed.',
    activities: [
      {
        id: 'a-8',
        type: 'note',
        actor: 'Tomas Berg',
        summary: 'Pilot ROAS hit 4.2x — strong case for expansion',
        timestamp: '2026-04-27T18:11:00Z',
      },
    ],
    contact: {
      name: 'Rae Aldrich',
      title: 'Director of Brand',
      email: 'rae@aerieoutfitters.com',
      phone: '+1 (646) 555-0119',
    },
  },
  {
    id: 'd-2007',
    name: 'Conference Activation — DevSummit',
    stage: 'Negotiation',
    value: 125000,
    owner: 'Maya Patel',
    expectedClose: '2026-05-18',
    lastActivity: '2026-05-02',
    notes: 'Final hold on travel line item; agency comping flights.',
    activities: [
      {
        id: 'a-9',
        type: 'call',
        actor: 'Maya Patel',
        summary: 'Procurement bridge call',
        timestamp: '2026-05-02T17:00:00Z',
      },
    ],
    contact: {
      name: 'Quinn Holloway',
      title: 'Head of Events',
      email: 'qholloway@ironclad.dev',
      phone: '+1 (415) 555-0277',
    },
  },
  {
    id: 'd-2008',
    name: 'Identity System + Guidelines',
    stage: 'Negotiation',
    value: 92000,
    owner: 'Sam O’Connor',
    expectedClose: '2026-06-04',
    lastActivity: '2026-04-30',
    notes: 'Verbal yes; awaiting countersigned MSA.',
    activities: [
      {
        id: 'a-10',
        type: 'email',
        actor: 'Sam O’Connor',
        summary: 'MSA sent for countersignature',
        timestamp: '2026-04-30T22:15:00Z',
      },
    ],
    contact: {
      name: 'Patrick Mendelson',
      title: 'COO',
      email: 'patrick@hearthstonerealty.com',
      phone: '+1 (303) 555-0188',
    },
  },
  {
    id: 'd-2009',
    name: 'Multi-channel Campaign — Spring',
    stage: 'Closed Won',
    value: 156000,
    owner: 'Jordan Reyes',
    expectedClose: '2026-04-10',
    lastActivity: '2026-04-11',
    notes: 'Closed at full ask. Kickoff scheduled for May 15.',
    activities: [
      {
        id: 'a-11',
        type: 'note',
        actor: 'Jordan Reyes',
        summary: 'Closed Won — countersigned',
        timestamp: '2026-04-11T13:00:00Z',
      },
    ],
    contact: {
      name: 'Mira Sandoval',
      title: 'VP Brand',
      email: 'msandoval@polarisapparel.com',
      phone: '+1 (213) 555-0244',
    },
  },
  {
    id: 'd-2010',
    name: 'SEO Audit + Roadmap',
    stage: 'Closed Won',
    value: 24500,
    owner: 'Tomas Berg',
    expectedClose: '2026-04-22',
    lastActivity: '2026-04-23',
    notes: 'Audit kickoff scheduled.',
    activities: [
      {
        id: 'a-12',
        type: 'meeting',
        actor: 'Tomas Berg',
        summary: 'Kickoff scheduled for May 6',
        timestamp: '2026-04-23T16:30:00Z',
      },
    ],
    contact: {
      name: 'Eli Greenway',
      title: 'Head of Growth',
      email: 'eli@greenwayfoods.com',
      phone: '+1 (646) 555-0356',
    },
  },
  {
    id: 'd-2011',
    name: 'Custom Portal Build',
    stage: 'Closed Lost',
    value: 380000,
    owner: 'Maya Patel',
    expectedClose: '2026-03-30',
    lastActivity: '2026-03-31',
    notes: 'Lost on price; competitor at 65% of our quote.',
    activities: [
      {
        id: 'a-13',
        type: 'email',
        actor: 'Maya Patel',
        summary: 'Loss debrief sent',
        timestamp: '2026-03-31T15:42:00Z',
      },
    ],
    contact: {
      name: 'Reggie Atlas',
      title: 'CTO',
      email: 'reggie@atlasrealtygroup.com',
      phone: '+1 (305) 555-0399',
    },
  },
  {
    id: 'd-2012',
    name: 'Annual Retainer — Renewal',
    stage: 'Closed Lost',
    value: 96000,
    owner: 'Sam O’Connor',
    expectedClose: '2026-02-28',
    lastActivity: '2026-03-02',
    notes: 'Did not renew — moved in-house.',
    activities: [
      {
        id: 'a-14',
        type: 'note',
        actor: 'Sam O’Connor',
        summary: 'Client building internal team',
        timestamp: '2026-03-02T11:18:00Z',
      },
    ],
    contact: {
      name: 'Helena Brewer',
      title: 'CMO',
      email: 'helena@baysidehospitality.com',
      phone: '+1 (786) 555-0231',
    },
  },
];

export const DEAL_FILTER_OPTIONS: ReadonlyArray<{ id: DealFilter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'open', label: 'Open' },
  { id: 'closed-won', label: 'Closed Won' },
  { id: 'closed-lost', label: 'Closed Lost' },
];

export const DEAL_SORT_KEYS = [
  'name',
  'stage',
  'value',
  'owner',
  'expectedClose',
  'lastActivity',
] as const;

export type DealSortKey = (typeof DEAL_SORT_KEYS)[number];

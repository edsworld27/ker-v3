/**
 * Pipeline mock data — kanban deals across the standard sales stages.
 * Each card has a stable id, owner, and predictable shape so DnD can target it.
 */

export type PipelineStage =
  | 'Lead'
  | 'Qualified'
  | 'Proposal'
  | 'Negotiation'
  | 'Closed Won'
  | 'Closed Lost';

export interface PipelineDeal {
  id: string;
  name: string;
  company: string;
  value: number;
  probability: number;
  stage: PipelineStage;
  owner: {
    id: string;
    name: string;
    initials: string;
    color: string;
  };
  expectedClose: string;
  tags: string[];
}

export const PIPELINE_STAGES: readonly PipelineStage[] = [
  'Lead',
  'Qualified',
  'Proposal',
  'Negotiation',
  'Closed Won',
  'Closed Lost',
] as const;

export const PIPELINE_DEALS: PipelineDeal[] = [
  {
    id: 'deal-001',
    name: 'Brand Refresh — Q3 Launch',
    company: 'Northwind Logistics',
    value: 84000,
    probability: 25,
    stage: 'Lead',
    owner: { id: 'u1', name: 'Maya Patel', initials: 'MP', color: 'from-amber-500 to-orange-600' },
    expectedClose: '2026-08-15',
    tags: ['rebrand', 'enterprise'],
  },
  {
    id: 'deal-002',
    name: 'Performance Marketing Retainer',
    company: 'Halcyon Coffee Co.',
    value: 18000,
    probability: 30,
    stage: 'Lead',
    owner: { id: 'u2', name: 'Jordan Reyes', initials: 'JR', color: 'from-sky-500 to-indigo-600' },
    expectedClose: '2026-07-01',
    tags: ['retainer'],
  },
  {
    id: 'deal-003',
    name: 'Website Redesign + CMS',
    company: 'Lumen Health',
    value: 142000,
    probability: 55,
    stage: 'Qualified',
    owner: { id: 'u1', name: 'Maya Patel', initials: 'MP', color: 'from-amber-500 to-orange-600' },
    expectedClose: '2026-09-30',
    tags: ['web', 'cms'],
  },
  {
    id: 'deal-004',
    name: 'Sales Enablement Program',
    company: 'Vertex Robotics',
    value: 67500,
    probability: 50,
    stage: 'Qualified',
    owner: { id: 'u3', name: 'Sam O’Connor', initials: 'SO', color: 'from-emerald-500 to-teal-600' },
    expectedClose: '2026-08-20',
    tags: ['enablement'],
  },
  {
    id: 'deal-005',
    name: 'Annual Content Engine',
    company: 'Meridian Bank',
    value: 215000,
    probability: 70,
    stage: 'Proposal',
    owner: { id: 'u2', name: 'Jordan Reyes', initials: 'JR', color: 'from-sky-500 to-indigo-600' },
    expectedClose: '2026-06-12',
    tags: ['content', 'finserv'],
  },
  {
    id: 'deal-006',
    name: 'Paid Social Expansion',
    company: 'Aerie Outfitters',
    value: 48000,
    probability: 65,
    stage: 'Proposal',
    owner: { id: 'u4', name: 'Tomas Berg', initials: 'TB', color: 'from-fuchsia-500 to-pink-600' },
    expectedClose: '2026-05-29',
    tags: ['paid-social'],
  },
  {
    id: 'deal-007',
    name: 'Conference Activation — DevSummit',
    company: 'Ironclad Software',
    value: 125000,
    probability: 80,
    stage: 'Negotiation',
    owner: { id: 'u1', name: 'Maya Patel', initials: 'MP', color: 'from-amber-500 to-orange-600' },
    expectedClose: '2026-05-18',
    tags: ['event', 'b2b'],
  },
  {
    id: 'deal-008',
    name: 'Identity System + Guidelines',
    company: 'Hearthstone Realty',
    value: 92000,
    probability: 75,
    stage: 'Negotiation',
    owner: { id: 'u3', name: 'Sam O’Connor', initials: 'SO', color: 'from-emerald-500 to-teal-600' },
    expectedClose: '2026-06-04',
    tags: ['brand-system'],
  },
  {
    id: 'deal-009',
    name: 'Multi-channel Campaign — Spring',
    company: 'Polaris Apparel',
    value: 156000,
    probability: 100,
    stage: 'Closed Won',
    owner: { id: 'u2', name: 'Jordan Reyes', initials: 'JR', color: 'from-sky-500 to-indigo-600' },
    expectedClose: '2026-04-10',
    tags: ['campaign'],
  },
  {
    id: 'deal-010',
    name: 'SEO Audit + Roadmap',
    company: 'Greenway Foods',
    value: 24500,
    probability: 100,
    stage: 'Closed Won',
    owner: { id: 'u4', name: 'Tomas Berg', initials: 'TB', color: 'from-fuchsia-500 to-pink-600' },
    expectedClose: '2026-04-22',
    tags: ['seo'],
  },
  {
    id: 'deal-011',
    name: 'Custom Portal Build',
    company: 'Atlas Realty Group',
    value: 380000,
    probability: 0,
    stage: 'Closed Lost',
    owner: { id: 'u1', name: 'Maya Patel', initials: 'MP', color: 'from-amber-500 to-orange-600' },
    expectedClose: '2026-03-30',
    tags: ['portal'],
  },
  {
    id: 'deal-012',
    name: 'Annual Retainer — Renewal',
    company: 'Bayside Hospitality',
    value: 96000,
    probability: 0,
    stage: 'Closed Lost',
    owner: { id: 'u3', name: 'Sam O’Connor', initials: 'SO', color: 'from-emerald-500 to-teal-600' },
    expectedClose: '2026-02-28',
    tags: ['retainer'],
  },
];

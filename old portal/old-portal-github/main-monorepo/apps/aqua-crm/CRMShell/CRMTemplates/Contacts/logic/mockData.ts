/**
 * Contacts mock data — directory of decision-makers tied to deals.
 */

export interface ContactDeal {
  id: string;
  name: string;
  stage: string;
  value: number;
}

export interface Contact {
  id: string;
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  location: string;
  initials: string;
  avatarColor: string;
  tags: string[];
  recentDeals: ContactDeal[];
  lastContacted: string; // ISO
  notes: string;
}

export const CONTACTS_MOCK: Contact[] = [
  {
    id: 'c-3001',
    name: 'Priya Iyer',
    title: 'VP Marketing',
    company: 'Northwind Logistics',
    email: 'priya@northwindlogistics.com',
    phone: '+1 (415) 555-0148',
    location: 'San Francisco, CA',
    initials: 'PI',
    avatarColor: 'from-amber-500 to-orange-600',
    tags: ['enterprise', 'logistics'],
    recentDeals: [
      { id: 'd-2001', name: 'Brand Refresh — Q3 Launch', stage: 'Lead', value: 84000 },
    ],
    lastContacted: '2026-04-28',
    notes: 'Prefers async; replies on Slack faster than email.',
  },
  {
    id: 'c-3002',
    name: 'Marcus Halcyon',
    title: 'Founder',
    company: 'Halcyon Coffee Co.',
    email: 'marcus@halcyoncoffee.co',
    phone: '+1 (503) 555-0192',
    location: 'Portland, OR',
    initials: 'MH',
    avatarColor: 'from-rose-500 to-red-600',
    tags: ['SMB', 'CPG'],
    recentDeals: [
      { id: 'd-2002', name: 'Performance Marketing Retainer', stage: 'Lead', value: 18000 },
    ],
    lastContacted: '2026-04-30',
    notes: 'Heavily involved in product decisions; loop in for creative reviews.',
  },
  {
    id: 'c-3003',
    name: 'Dr. Hank Castillo',
    title: 'Director of Digital',
    company: 'Lumen Health',
    email: 'hcastillo@lumenhealth.org',
    phone: '+1 (617) 555-0223',
    location: 'Boston, MA',
    initials: 'HC',
    avatarColor: 'from-emerald-500 to-teal-600',
    tags: ['healthcare', 'compliance'],
    recentDeals: [
      { id: 'd-2003', name: 'Website Redesign + CMS', stage: 'Qualified', value: 142000 },
    ],
    lastContacted: '2026-04-25',
    notes: 'Requires HIPAA documentation; legal sign-off mandatory.',
  },
  {
    id: 'c-3004',
    name: 'Lena Park',
    title: 'Head of Revenue',
    company: 'Vertex Robotics',
    email: 'lena.park@vertexrobotics.io',
    phone: '+1 (408) 555-0167',
    location: 'San Jose, CA',
    initials: 'LP',
    avatarColor: 'from-sky-500 to-indigo-600',
    tags: ['robotics', 'series-c'],
    recentDeals: [
      { id: 'd-2004', name: 'Sales Enablement Program', stage: 'Qualified', value: 67500 },
    ],
    lastContacted: '2026-04-29',
    notes: 'Quarterly board reviews end of every quarter — avoid those weeks.',
  },
  {
    id: 'c-3005',
    name: 'Carmen Wu',
    title: 'CMO',
    company: 'Meridian Bank',
    email: 'cwu@meridianbank.com',
    phone: '+1 (212) 555-0301',
    location: 'New York, NY',
    initials: 'CW',
    avatarColor: 'from-violet-500 to-purple-600',
    tags: ['finserv', 'enterprise'],
    recentDeals: [
      { id: 'd-2005', name: 'Annual Content Engine', stage: 'Proposal', value: 215000 },
    ],
    lastContacted: '2026-05-01',
    notes: 'Executive sponsor for all marketing programs; cc on every SOW.',
  },
  {
    id: 'c-3006',
    name: 'Rae Aldrich',
    title: 'Director of Brand',
    company: 'Aerie Outfitters',
    email: 'rae@aerieoutfitters.com',
    phone: '+1 (646) 555-0119',
    location: 'New York, NY',
    initials: 'RA',
    avatarColor: 'from-fuchsia-500 to-pink-600',
    tags: ['retail', 'DTC'],
    recentDeals: [
      { id: 'd-2006', name: 'Paid Social Expansion', stage: 'Proposal', value: 48000 },
    ],
    lastContacted: '2026-04-27',
    notes: 'Drives most decisions; budget approval through CFO.',
  },
  {
    id: 'c-3007',
    name: 'Quinn Holloway',
    title: 'Head of Events',
    company: 'Ironclad Software',
    email: 'qholloway@ironclad.dev',
    phone: '+1 (415) 555-0277',
    location: 'San Francisco, CA',
    initials: 'QH',
    avatarColor: 'from-amber-500 to-yellow-600',
    tags: ['saas', 'devtools'],
    recentDeals: [
      {
        id: 'd-2007',
        name: 'Conference Activation — DevSummit',
        stage: 'Negotiation',
        value: 125000,
      },
    ],
    lastContacted: '2026-05-02',
    notes: 'Manages 6+ events a year; great long-term relationship potential.',
  },
  {
    id: 'c-3008',
    name: 'Patrick Mendelson',
    title: 'COO',
    company: 'Hearthstone Realty',
    email: 'patrick@hearthstonerealty.com',
    phone: '+1 (303) 555-0188',
    location: 'Denver, CO',
    initials: 'PM',
    avatarColor: 'from-cyan-500 to-blue-600',
    tags: ['real-estate'],
    recentDeals: [
      { id: 'd-2008', name: 'Identity System + Guidelines', stage: 'Negotiation', value: 92000 },
    ],
    lastContacted: '2026-04-30',
    notes: 'Decision-maker; CFO signs off above $100k.',
  },
  {
    id: 'c-3009',
    name: 'Mira Sandoval',
    title: 'VP Brand',
    company: 'Polaris Apparel',
    email: 'msandoval@polarisapparel.com',
    phone: '+1 (213) 555-0244',
    location: 'Los Angeles, CA',
    initials: 'MS',
    avatarColor: 'from-pink-500 to-rose-600',
    tags: ['apparel', 'DTC'],
    recentDeals: [
      {
        id: 'd-2009',
        name: 'Multi-channel Campaign — Spring',
        stage: 'Closed Won',
        value: 156000,
      },
    ],
    lastContacted: '2026-04-11',
    notes: 'Champion account; primary advocate.',
  },
  {
    id: 'c-3010',
    name: 'Eli Greenway',
    title: 'Head of Growth',
    company: 'Greenway Foods',
    email: 'eli@greenwayfoods.com',
    phone: '+1 (646) 555-0356',
    location: 'Brooklyn, NY',
    initials: 'EG',
    avatarColor: 'from-lime-500 to-green-600',
    tags: ['CPG', 'organic'],
    recentDeals: [
      { id: 'd-2010', name: 'SEO Audit + Roadmap', stage: 'Closed Won', value: 24500 },
    ],
    lastContacted: '2026-04-23',
    notes: 'Hands-on operator; appreciates quick async updates.',
  },
  {
    id: 'c-3011',
    name: 'Reggie Atlas',
    title: 'CTO',
    company: 'Atlas Realty Group',
    email: 'reggie@atlasrealtygroup.com',
    phone: '+1 (305) 555-0399',
    location: 'Miami, FL',
    initials: 'RA',
    avatarColor: 'from-orange-500 to-red-600',
    tags: ['real-estate', 'tech'],
    recentDeals: [
      { id: 'd-2011', name: 'Custom Portal Build', stage: 'Closed Lost', value: 380000 },
    ],
    lastContacted: '2026-03-31',
    notes: 'Closed lost — revisit in Q1 2027.',
  },
  {
    id: 'c-3012',
    name: 'Helena Brewer',
    title: 'CMO',
    company: 'Bayside Hospitality',
    email: 'helena@baysidehospitality.com',
    phone: '+1 (786) 555-0231',
    location: 'Miami, FL',
    initials: 'HB',
    avatarColor: 'from-teal-500 to-cyan-600',
    tags: ['hospitality'],
    recentDeals: [
      { id: 'd-2012', name: 'Annual Retainer — Renewal', stage: 'Closed Lost', value: 96000 },
    ],
    lastContacted: '2026-03-02',
    notes: 'Building internal team; possible reactivation 2027.',
  },
  {
    id: 'c-3013',
    name: 'Idris Beaumont',
    title: 'Founder',
    company: 'Solstice Studios',
    email: 'idris@solsticestudios.io',
    phone: '+1 (415) 555-0411',
    location: 'San Francisco, CA',
    initials: 'IB',
    avatarColor: 'from-indigo-500 to-violet-600',
    tags: ['gaming', 'studio'],
    recentDeals: [],
    lastContacted: '2026-04-15',
    notes: 'Networking contact; potential partnership opportunity.',
  },
  {
    id: 'c-3014',
    name: 'Yuki Tanaka',
    title: 'Director of Product',
    company: 'Kestrel Mobility',
    email: 'yuki@kestrelmobility.com',
    phone: '+1 (650) 555-0488',
    location: 'Mountain View, CA',
    initials: 'YT',
    avatarColor: 'from-blue-500 to-cyan-600',
    tags: ['mobility', 'EV'],
    recentDeals: [],
    lastContacted: '2026-04-19',
    notes: 'Referral from Polaris CMO.',
  },
  {
    id: 'c-3015',
    name: 'Beatriz Solano',
    title: 'Head of Comms',
    company: 'Andromeda Bio',
    email: 'beatriz@andromedabio.com',
    phone: '+1 (617) 555-0517',
    location: 'Cambridge, MA',
    initials: 'BS',
    avatarColor: 'from-emerald-500 to-green-600',
    tags: ['biotech'],
    recentDeals: [],
    lastContacted: '2026-04-08',
    notes: 'Cold outreach; expressed interest in Q3 work.',
  },
];

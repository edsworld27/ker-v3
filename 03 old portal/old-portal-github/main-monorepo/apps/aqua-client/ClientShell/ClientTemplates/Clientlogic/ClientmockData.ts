// Merged Mock Data for AQUA Client Standalone App

export const initialMarketingCampaigns = [
  { id: 'camp-1', name: 'Spring Launch 2026', type: 'Email', status: 'Active', budget: 200000, spend: 84000, leads: 142, conversions: 18, roi: 220, startDate: '2026-03-01', endDate: '2026-04-30', spendToDate: 84000 },
  { id: 'camp-2', name: 'LinkedIn B2B Outreach', type: 'Social', status: 'Active', budget: 150000, spend: 62000, leads: 67, conversions: 9, roi: 180, startDate: '2026-03-10', endDate: '2026-05-10', spendToDate: 62000 },
  { id: 'camp-3', name: 'Google Ads – Brand', type: 'PPC', status: 'Paused', budget: 300000, spend: 189000, leads: 310, conversions: 41, roi: 340, startDate: '2026-02-01', endDate: '2026-03-31', spendToDate: 189000 },
];

export const initialPressReleases = [
  { id: 'pr-1', title: 'Aqua Agency Launches Portal v9', outreachStatus: 'Published', publishedAt: '2026-03-15', clientName: 'Aqua Agency', body: '' },
];

export const initialSocialPosts = [
  { id: 'sp-1', clientName: 'Acme Corp', platform: 'LinkedIn', content: 'Excited to share our Q1 results!', status: 'Published', scheduledAt: '2026-03-20' },
  { id: 'sp-2', clientName: 'Global Tech', platform: 'Twitter', content: 'New product drop this Friday 🚀', status: 'Scheduled', scheduledAt: '2026-04-05' },
];

export const initialAdCampaigns = [];

export const initialMarketingLeads = [
  { id: 'lead-1', name: 'James Carter', company: 'Nexus Digital', email: 'james@nexus.io', source: 'LinkedIn', status: 'New', scrapedAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'lead-2', name: 'Sophie Walsh', company: 'Bright Media', email: 'sophie@brightmedia.co', source: 'Google', status: 'Contacted', scrapedAt: new Date(Date.now() - 7200000).toISOString() },
  { id: 'lead-3', name: 'Tom Richards', company: 'Peak Labs', email: 'tom@peaklabs.com', source: 'Referral', status: 'Qualified', scrapedAt: new Date(Date.now() - 86400000).toISOString() },
];

export const initialMailingLists = [
  { id: 'ml-1', name: 'Active Clients', contacts: [{ email: 'client@acme.com', name: 'Acme Corp' }], createdAt: '2026-01-15', status: 'Active' },
  { id: 'ml-2', name: 'Prospects Q2 2026', contacts: [], createdAt: '2026-03-01', status: 'Active' },
  { id: 'ml-3', name: 'Newsletter Subscribers', contacts: [], createdAt: '2026-02-10', status: 'Active' },
];

export const initialInfluencers = [
  { id: 'inf-1', name: 'Alex Rivera', platform: 'Instagram', followers: 84000, engagementRate: 4.2, niche: 'Tech', status: 'Active' },
];

export const initialBrandAssets = [];

export const initialAffiliateAccounts = [
  {
    id: 'aff-1',
    clientId: 'client-1',
    referralCode: 'ACME2026',
    tier: 'Pearl' as const,
    totalEarned: 1200,
    pendingPayout: 300,
    referrals: [
      { id: 'ref-1', referredName: 'Global Tech Ltd', referredEmail: 'info@globaltech.com', status: 'active' as const, rewardAmount: 500, rewardPaid: true },
      { id: 'ref-2', referredName: 'Peak Labs', referredEmail: 'hello@peaklabs.com', status: 'signed' as const, rewardAmount: 300, rewardPaid: false },
    ],
  },
];

export const initialMarketingPipelines = [
  {
    id: 'pipe-1',
    name: 'Q2 Acquisition Pipeline',
    stages: [
      { id: 'awareness', label: 'Awareness', color: 'var(--client-widget-text-muted)' },
      { id: 'interest', label: 'Interest', color: 'var(--client-widget-info)' },
      { id: 'consideration', label: 'Consideration', color: 'var(--client-widget-warning)' },
      { id: 'conversion', label: 'Conversion', color: 'var(--client-widget-success)' },
    ],
    createdAt: '2026-03-01',
  },
];

export const initialDeals = [
  { id: 'deal-1', name: 'Acme Corp – Full Retainer', value: 6000, stage: 'Won', expectedCloseDate: '2026-03-15', createdAt: '2026-02-01' },
  { id: 'deal-2', name: 'Global Tech – Brand Strategy', value: 8500, stage: 'Proposal', expectedCloseDate: '2026-04-20', createdAt: '2026-03-01' },
  { id: 'deal-3', name: 'Peak Labs – SEO Package', value: 2400, stage: 'Discovery', expectedCloseDate: '2026-05-01', createdAt: '2026-03-10' },
  { id: 'deal-4', name: 'Bright Media – Web Redesign', value: 12000, stage: 'Lead', expectedCloseDate: '2026-06-01', createdAt: '2026-03-20' },
];

export const initialCommissionRecords = [
  { id: 'comm-1', employeeId: 2, dealId: 'deal-1', amount: 600, rate: 10, period: 'Q1 2026', status: 'Paid' },
  { id: 'comm-2', employeeId: 2, dealId: 'deal-2', amount: 425, rate: 5, period: 'Q2 2026', status: 'Pending' },
];

export const initialCommissionPrizes = [
  { id: 'prize-1', tier: 'Silver', target: 10000, reward: 'Bonus £500', icon: '🥈' },
  { id: 'prize-2', tier: 'Gold', target: 25000, reward: 'Bonus £1,500 + Voucher', icon: '🥇' },
  { id: 'prize-3', tier: 'Platinum', target: 50000, reward: 'Bonus £3,000 + Trip', icon: '💎' },
];

export const initialClientAds: any[] = [];

// Enterprise Command Data
export const initialBoardMeetings: any[] = [
  {
    id: 'bm-1',
    title: 'Q1 2026 Strategy Review',
    date: '2026-03-28',
    time: '10:00',
    attendees: ['Edward Hallam', 'John Manager'],
    agenda: ['Revenue targets', 'Headcount plan', 'Product roadmap'],
    status: 'completed',
    minutes: 'Q1 targets reviewed. Revenue at 94% of plan. Approved 2 new hires.'
  },
  {
    id: 'bm-2',
    title: 'Q2 2026 Planning Session',
    date: '2026-04-15',
    time: '09:00',
    attendees: ['Edward Hallam', 'John Manager', 'Sarah Employee'],
    agenda: ['Q2 OKRs', 'Budget allocation', 'Client expansion'],
    status: 'scheduled',
    minutes: ''
  },
];

export const initialStrategicProjections: any[] = [
  {
    id: 'sp-1',
    period: 'Q2 2026',
    revenueCents: 18500000,
    expensesCents: 11200000,
    headcount: 6,
    newClients: 3,
    createdAt: '2026-03-01'
  },
  {
    id: 'sp-2',
    period: 'Q3 2026',
    revenueCents: 24000000,
    expensesCents: 14000000,
    headcount: 8,
    newClients: 4,
    createdAt: '2026-03-01'
  },
];

export const initialStrategicObjectives: any[] = [
  {
    id: 'obj-1',
    title: 'Grow Monthly Recurring Revenue to £50k',
    description: 'Scale agency retainers to 10 active clients at £5k average.',
    status: 'In Progress',
    progress: 42,
    owner: 'Edward Hallam',
    dueDate: '2026-09-30',
    keyResults: [
      { id: 'kr-1', title: 'Onboard 3 new clients in Q2', progress: 33 },
      { id: 'kr-2', title: 'Upsell 2 existing clients', progress: 50 },
    ]
  },
  {
    id: 'obj-2',
    title: 'Launch Aqua Portal SaaS',
    description: 'Release self-serve portal product to market.',
    status: 'Planning',
    progress: 18,
    owner: 'Edward Hallam',
    dueDate: '2026-12-31',
    keyResults: [
      { id: 'kr-3', title: 'Complete v9 core feature set', progress: 35 },
      { id: 'kr-4', title: 'Beta launch with 5 pilot clients', progress: 0 },
    ]
  },
];

export const initialRiskAssessments: any[] = [
  {
    id: 'risk-1',
    title: 'Key Person Dependency',
    category: 'Operational',
    likelihood: 'High',
    impact: 'High',
    status: 'Open',
    owner: 'Edward Hallam',
    mitigation: 'Document all critical processes; cross-train team members.',
    createdAt: '2026-03-01'
  },
  {
    id: 'risk-2',
    title: 'Client Concentration Risk',
    category: 'Commercial',
    likelihood: 'Medium',
    impact: 'High',
    status: 'Mitigating',
    owner: 'John Manager',
    mitigation: 'No single client to exceed 30% of revenue. Diversify pipeline.',
    createdAt: '2026-03-10'
  },
  {
    id: 'risk-3',
    title: 'Data Breach / Cyber Incident',
    category: 'IT Security',
    likelihood: 'Low',
    impact: 'Critical',
    status: 'Monitored',
    owner: 'Edward Hallam',
    mitigation: 'SOC2 controls, 2FA enforced, regular pen-tests.',
    createdAt: '2026-02-15'
  },
];

export const initialApprovalRequests: any[] = [];

export const initialKnowledgeBaseArticles: any[] = [
  {
    id: 'kb-1',
    title: 'Onboarding New Clients',
    category: 'Onboarding',
    content: 'Step-by-step guide for onboarding new agency clients through the portal discovery flow.',
    tags: ['process', 'clients'],
    views: 142,
    lastUpdated: '2026-03-01'
  },
  {
    id: 'kb-2',
    title: 'Running Monthly Payroll',
    category: 'Finance',
    content: 'Instructions for completing a payroll run including approvals and FPS submissions.',
    tags: ['payroll', 'finance'],
    views: 89,
    lastUpdated: '2026-03-15'
  },
];

export const initialStakeholderStatements: any[] = [
  {
    id: 'ss-1',
    author: 'Edward Hallam',
    role: 'Founder & CEO',
    statement: 'Our mission is to build the most powerful white-label operating system for digital agencies. Q1 has validated our product-market fit.',
    date: '2026-03-28',
    type: 'CEO Update'
  },
];

export const initialLegalDocuments: any[] = [
  {
    id: 'legal-1',
    title: 'Master Services Agreement — Acme Corp',
    type: 'MSA',
    clientId: 'client-1',
    status: 'Active',
    signedAt: '2026-01-15',
    expiresAt: '2027-01-15',
    value: 60000
  },
  {
    id: 'legal-2',
    title: 'NDA — Global Tech',
    type: 'NDA',
    clientId: 'client-2',
    status: 'Active',
    signedAt: '2026-02-01',
    expiresAt: '2027-02-01',
    value: 0
  },
];

export const initialInsurancePolicies: any[] = [
  {
    id: 'ins-1',
    type: 'Professional Indemnity',
    provider: 'Hiscox',
    policyNumber: 'HX-2026-89123',
    coverageCents: 100000000,
    premiumCents: 220000,
    status: 'Active',
    renewsAt: '2027-01-01'
  },
  {
    id: 'ins-2',
    type: 'Cyber Liability',
    provider: 'AXA XL',
    policyNumber: 'AX-CY-56701',
    coverageCents: 50000000,
    premiumCents: 140000,
    status: 'Active',
    renewsAt: '2027-03-01'
  },
];

export const initialDataProtectionRecords: any[] = [
  {
    id: 'dpr-1',
    activity: 'CRM Client Data Processing',
    legalBasis: 'Legitimate Interest',
    dataSubjects: 'Clients',
    retentionYears: 7,
    lastReviewed: '2026-01-01',
    status: 'Compliant'
  },
  {
    id: 'dpr-2',
    activity: 'Employee Payroll Processing',
    legalBasis: 'Contract',
    dataSubjects: 'Employees',
    retentionYears: 7,
    lastReviewed: '2026-01-01',
    status: 'Compliant'
  },
];

export const initialInventory: any[] = [
  {
    id: 'inv-1',
    name: 'MacBook Pro 16"',
    category: 'Hardware',
    quantity: 3,
    unitCostCents: 249900,
    location: 'Office',
    assignedTo: 1,
    status: 'In Use'
  },
  {
    id: 'inv-2',
    name: 'Dell 27" Monitor',
    category: 'Hardware',
    quantity: 5,
    unitCostCents: 45000,
    location: 'Office',
    status: 'Available'
  },
  {
    id: 'inv-3',
    name: 'Adobe Creative Cloud (Annual)',
    category: 'Software',
    quantity: 3,
    unitCostCents: 59988,
    location: 'Digital',
    status: 'Active'
  },
];

export const initialSOPs: any[] = [
  {
    id: 'sop-1',
    title: 'Client Onboarding Process',
    department: 'Operations',
    version: '2.1',
    status: 'Active',
    owner: 'John Manager',
    lastReviewed: '2026-02-15',
    steps: [
      'Send welcome email with portal access',
      'Schedule discovery call',
      'Complete discovery questionnaire',
      'Present brand strategy deck',
      'Sign MSA and begin work',
    ]
  },
  {
    id: 'sop-2',
    title: 'Monthly Payroll Checklist',
    department: 'Finance',
    version: '1.3',
    status: 'Active',
    owner: 'Edward Hallam',
    lastReviewed: '2026-03-01',
    steps: [
      'Review timesheets by 25th',
      'Process expense claims',
      'Generate payroll run in portal',
      'Get Founder sign-off',
      'Submit FPS to HMRC',
      'Transfer net pay by last working day',
    ]
  },
];

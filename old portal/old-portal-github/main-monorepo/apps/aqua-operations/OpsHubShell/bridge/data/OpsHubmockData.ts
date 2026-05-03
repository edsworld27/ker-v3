// @ts-nocheck
import {
  AppUser, Client, Project, ProjectTask, AppTicket, LogEntry, Todo, Deal,
  SetSailGift, YouDeserveItAllowance,
  AppNotification, PayrollRecord, ARInvoice,
  Integration, Webhook, ApprovalRequest, KnowledgeBaseArticle
} from '@OpsHubShell/bridge/types';

export const initialTodos: Todo[] = [
  { id: '1', text: 'Review Q1 performance reports', completed: false, priority: 'High', category: 'Strategic' },
  { id: '2', text: 'Onboard new development lead', completed: false, priority: 'Medium', category: 'HR' },
  { id: '3', text: 'Update global compliance docs', completed: true, priority: 'High', category: 'Legal' },
];

export const initialUsers: AppUser[] = [
  {
    id: 999,
    name: 'Demo Admin',
    email: 'demo@aqua.portal',
    role: 'Founder',
    avatar: 'DA',
    baseSalaryCents: 0,
    portalTier: 'agency'
  },
  { 
    id: 1, name: 'Edward Hallam', email: 'edwardhallam07@gmail.com', role: 'Founder', avatar: 'EH', workingHours: '9:00 AM - 6:00 PM', bio: 'Founder', joinedDate: '2025-01-01',
    baseSalaryCents: 12000000,
    taxProfile: {
      residentialAddress: { line1: '123 Founder Lane', city: 'London', state: 'Greater London', postalCode: 'W1 1AA', country: 'UK', lat: 51.5074, lng: -0.1278 },
      workAddress: { line1: 'Aqua HQ', city: 'London', state: 'Greater London', postalCode: 'W1 1AA', country: 'UK', lat: 51.5074, lng: -0.1278 },
      taxId: 'NI123456C', exemptions: [], filingStatus: 'Single'
    },
    portalTier: 'agency'
  },
  { 
    id: 2, name: 'John Manager', email: 'john@example.com', role: 'AgencyManager', avatar: 'JM', workingHours: '9:00 AM - 5:00 PM', bio: 'Operations Manager', joinedDate: '2025-02-15',
    baseSalaryCents: 8500000,
    taxProfile: {
      residentialAddress: { line1: '45 Manager St', city: 'London', state: 'Greater London', postalCode: 'E1 1BB', country: 'UK', lat: 51.5174, lng: -0.1178 },
      workAddress: { line1: 'Aqua HQ', city: 'London', state: 'Greater London', postalCode: 'W1 1AA', country: 'UK', lat: 51.5074, lng: -0.1278 },
      taxId: 'NI654321D', exemptions: [], filingStatus: 'Married'
    }
  },
  { 
    id: 3, name: 'Sarah Employee', email: 'sarah@example.com', role: 'AgencyEmployee', avatar: 'SE', workingHours: '10:00 AM - 4:00 PM', bio: 'Design Lead', joinedDate: '2025-03-10',
    baseSalaryCents: 7500000,
    taxProfile: {
      residentialAddress: { line1: '500 Jersey Ave', city: 'Jersey City', state: 'NJ', postalCode: '07302', country: 'US', lat: 40.7178, lng: -74.0431 },
      workAddress: { line1: '1 World Trade Center', city: 'New York', state: 'NY', postalCode: '10007', country: 'US', lat: 40.7127, lng: -74.0134 },
      taxId: '666-00-1234', exemptions: ['401k'], filingStatus: 'Single'
    }
  },
  { id: 4, name: 'Client Owner', email: 'contact@acme.com', role: 'ClientOwner', clientId: 'client-1', avatar: 'CO', workingHours: '8:00 AM - 4:00 PM', bio: 'CEO at Acme Corp', joinedDate: '2026-01-20', baseSalaryCents: 0 },
];

export const initialClients: Client[] = [
  {
    id: 'client-1',
    name: 'Acme Corp',
    email: 'contact@acme.com',
    stage: 'discovery',
    discoveryAnswers: {
      'business-goals': 'We want to increase our online sales by 50% this year.',
      'target-audience': 'Tech-savvy professionals aged 25-45.',
      'brand-voice': 'Professional, yet approachable and innovative.'
    },
    resources: [],
    enabledSuiteIds: ['hr_suite', 'sales_suite']
  },
  {
    id: 'client-2',
    name: 'Global Tech',
    email: 'info@globaltech.io',
    stage: 'design',
    websiteUrl: 'https://example.com/preview/globaltech',
    discoveryAnswers: {},
    resources: [{ name: 'Brand Assets', url: '#', type: 'zip' }],
    enabledSuiteIds: ['marketing_suite']
  },
  {
    id: 'client-3',
    name: 'Nexus Dynamics',
    email: 'hello@nexus.com',
    stage: 'development',
    discoveryAnswers: { 'q1': 'Scaling architecture needed.' },
    resources: [
      { id: 'res-3', name: 'API Documentation.pdf', type: 'document', url: '#', uploadedAt: '2026-03-01' },
      { id: 'res-4', name: 'Database Schema.png', type: 'image', url: '#', uploadedAt: '2026-03-05' }
    ],
    enabledSuiteIds: ['cms-suite', 'website-suite']
  },
  {
    id: 'client-4',
    name: 'Aurora Health',
    email: 'contact@aurora.health',
    stage: 'onboarding',
    discoveryAnswers: { 'q1': 'We need a full portal setup.' },
    resources: [
      { id: 'res-5', name: 'Brand Guidelines.pdf', type: 'document', url: '#', uploadedAt: '2026-01-20' },
      { id: 'res-6', name: 'Welcome Pack.pdf', type: 'document', url: '#', uploadedAt: '2026-04-05' }
    ],
    enabledSuiteIds: ['clients-hub-suite']
  },
  {
    id: 'client-5',
    name: 'LiveWire Fitness',
    email: 'info@livewire.fit',
    stage: 'live',
    websiteUrl: 'https://livewire.fit',
    discoveryAnswers: { 'q1': 'High traffic expected.' },
    resources: [
      { id: 'res-7', name: 'Analytics Report Q1.pdf', type: 'document', url: '#', uploadedAt: '2026-04-01' }
    ],
    enabledSuiteIds: ['marketing_suite', 'website-suite', 'clients-hub-suite']
  }
];

export const initialProjects: Project[] = [
  { id: 'proj-1', name: 'Aqua Portal V2', clientId: 'client-1', description: 'Internal refactor and feature expansion.', status: 'Active', createdAt: '2026-03-01', budgetLimitCents: 1000000, burnRateThreshold: 0.8, hourlyRateTargetCents: 15000 },
  { id: 'proj-2', name: 'Brand Identity', clientId: 'client-1', description: 'Redesigning the core brand elements.', status: 'Planning', createdAt: '2026-03-15', budgetLimitCents: 500000, burnRateThreshold: 0.7, hourlyRateTargetCents: 12000 },
  { id: 'proj-3', name: 'UI Prototypes', clientId: 'client-2', description: 'Figma layout creation for the web app.', status: 'Active', createdAt: '2026-03-10', budgetLimitCents: 300000, burnRateThreshold: 0.6, hourlyRateTargetCents: 10000 },
  { id: 'proj-4', name: 'Nexus Engine Build', clientId: 'client-3', description: 'Development of the core routing and API algorithms.', status: 'Active', createdAt: '2026-02-01', budgetLimitCents: 2000000, burnRateThreshold: 0.85, hourlyRateTargetCents: 15000 },
  { id: 'proj-5', name: 'Aurora Health Deployment', clientId: 'client-4', description: 'Final onboarding and DNS propagation.', status: 'Active', createdAt: '2026-01-15', budgetLimitCents: 800000, burnRateThreshold: 0.9, hourlyRateTargetCents: 12000 },
  { id: 'proj-6', name: 'LiveWire Fitness Maintenance', clientId: 'client-5', description: 'Ongoing Monthly SLA and SEO retainer.', status: 'Active', createdAt: '2025-11-01', budgetLimitCents: 150000, burnRateThreshold: 0.5, hourlyRateTargetCents: 10000 },
];

export const initialProjectTasks: ProjectTask[] = [
  { 
    id: 'task-1', 
    projectId: 'proj-1', 
    title: 'Implement Task Management', 
    description: 'Create the core UI and state for managing projects and tasks.',
    status: 'Done',
    priority: 'High',
    assigneeId: 1,
    dueDate: '2026-03-20',
    createdAt: '2026-03-01',
    isBillable: true,
    timeSpentMinutes: 320
  },
  { id: 'task-2', projectId: 'proj-3', title: 'Interactive Prototypes', description: 'Complete Figma flows.', status: 'In Progress', priority: 'High', assigneeId: 2, dueDate: '2026-04-12', createdAt: '2026-03-15', isBillable: true, timeSpentMinutes: 120 },
  { id: 'task-3', projectId: 'proj-4', title: 'API Gateway Integration', description: 'Connect GraphQL to the Nexus App.', status: 'In Progress', priority: 'High', assigneeId: 1, dueDate: '2026-04-05', createdAt: '2026-03-20', isBillable: true, timeSpentMinutes: 450 },
  { id: 'task-4', projectId: 'proj-4', title: 'Database Migrations', description: 'Schema updates for v2.', status: 'Done', priority: 'Medium', assigneeId: 1, dueDate: '2026-03-25', createdAt: '2026-03-20', isBillable: true, timeSpentMinutes: 180 },
  { id: 'task-5', projectId: 'proj-5', title: 'Deploy to AWS', description: 'Final production build and upload.', status: 'Done', priority: 'High', assigneeId: 1, dueDate: '2026-04-01', createdAt: '2026-03-28', isBillable: true, timeSpentMinutes: 60 },
  { id: 'task-6', projectId: 'proj-5', title: 'DNS Propagation Test', description: 'Verify Aurora Health domain is pointing to new servers.', status: 'In Progress', priority: 'High', assigneeId: 1, dueDate: '2026-04-10', createdAt: '2026-04-05', isBillable: true, timeSpentMinutes: 0 },
  { id: 'task-7', projectId: 'proj-6', title: 'Monthly Plugin Updates', description: 'Update SEO frameworks and run security scan.', status: 'Done', priority: 'Medium', assigneeId: 2, dueDate: '2026-04-02', createdAt: '2026-04-01', isBillable: true, timeSpentMinutes: 45 },
];

export const initialTickets: AppTicket[] = [
  { id: 'TIC-001', title: 'Login issue reported via call', status: 'Open', priority: 'High', creator: 'Client Owner', creatorId: 4, createdAt: new Date().toISOString(), type: 'internal', description: 'Client mentioned login lag during the weekly sync.', channel: 'web' },
  { id: 'TIC-003', title: 'Unable to upload logo', status: 'Open', priority: 'Medium', creator: 'Acme Corp', creatorId: 'client-1', createdAt: new Date().toISOString(), type: 'client', channel: 'web' },
  { id: 'TIC-004', title: 'Feedback on Hero Section', status: 'Open', priority: 'High', creator: 'Global Tech', creatorId: 'client-2', createdAt: new Date().toISOString(), type: 'client', channel: 'web', description: 'Can we make the colors more vibrant?' },
  { id: 'TIC-005', title: 'Staging API Timeout', status: 'Resolved', priority: 'High', creator: 'Nexus Dynamics', creatorId: 'client-3', createdAt: new Date(Date.now() - 86400000).toISOString(), type: 'client', channel: 'web', description: 'The staging link throws a 504 on login.' },
  { id: 'TIC-006', title: 'Need access to the tutorial videos', status: 'Open', priority: 'Medium', creator: 'Aurora Health', creatorId: 'client-4', createdAt: new Date().toISOString(), type: 'client', channel: 'web', description: 'Where are the vault credentials?' },
  { id: 'TIC-007', title: 'Update homepage banner for Spring Sale', status: 'Open', priority: 'Medium', creator: 'LiveWire Fitness', creatorId: 'client-5', createdAt: new Date().toISOString(), type: 'client', channel: 'web', description: 'Please swap the image to the new promo.' },
];

export const initialActivityLogs: LogEntry[] = [
  { id: '1', timestamp: new Date().toISOString(), userId: 1, userName: 'Founder', action: 'Login', details: 'Founder logged in', type: 'system' },
  { id: '2', timestamp: new Date().toISOString(), userId: 1, userName: 'Founder', action: 'Portal Access', details: 'Accessed Agency Hub', type: 'action' },
];

export const initialDeals: Deal[] = [
  { id: 'deal-1', name: 'Website Redesign', value: 15000, stage: 'Discovery', clientId: 'client-1', expectedCloseDate: '2026-04-15', createdAt: '2026-03-01' },
  { id: 'deal-2', name: 'SEO Retainer', value: 3000, stage: 'Proposal', clientId: 'client-2', expectedCloseDate: '2026-03-30', createdAt: '2026-03-10' },
];

export const initialNotifications: AppNotification[] = [
  { id: 'notif-1', userId: 1, type: 'info', title: 'Payroll Run Ready', message: 'March 2026 payroll is ready for final approval.', read: false, createdAt: '2026-03-28T09:00:00Z', link: 'payroll' },
];

export const initialIntegrations: Integration[] = [
  { id: 'google-analytics', service: 'Google Analytics', label: 'Website Traffic', description: 'Monitor live visitor behavior.', status: 'connected', connectedAt: '2026-01-15' },
  { id: 'stripe', service: 'Stripe', label: 'Payment Processing', description: 'Handle multi-rail payments.', status: 'connected', connectedAt: '2026-02-01' },
  { id: 'slack', service: 'Slack', label: 'Team Communication', description: 'Internal notifications.', status: 'connected', connectedAt: '2026-02-20' },
  { id: 'zapier', service: 'Zapier', label: 'Automation', description: 'Connect over 5000+ apps.', status: 'disconnected' },
];

export const initialWebhooks: Webhook[] = [
  { id: 'wh-1', name: 'Slack Notifications', url: 'https://hooks.slack.com/services/...', events: ['ticket.created', 'payment.received'], active: true, createdAt: '2026-02-20' },
];

export const initialApprovalRequests: ApprovalRequest[] = [
  {
    id: 'appr-1',
    title: 'March 2026 Payroll Execution',
    requesterId: 2,
    targetId: 'pr-mar-2026',
    currentStage: 0,
    status: 'Pending',
    stages: [
      { id: 'stg-1', roleId: 'Founder', status: 'Pending' }
    ],
    createdAt: '2026-03-28T10:00:00Z',
    updatedAt: '2026-03-28T10:00:00Z'
  },
];

export const initialKnowledgeBaseArticles: KnowledgeBaseArticle[] = [
  { id: 'kb-1', title: 'Onboarding New Clients', category: 'Onboarding', content: 'Full guide...', tags: ['process'], views: 142, lastUpdated: '2026-03-01' },
];

export const initialPayrollRecords: PayrollRecord[] = [
  { id: 'pr-1', employeeId: 1, period: 'March 2026', grossPay: 10000, netPay: 8000, status: 'processed' },
  { id: 'pr-2', employeeId: 2, period: 'March 2026', grossPay: 7000, netPay: 5500, status: 'processed' },
];

export const initialInvoices: ARInvoice[] = [
  { id: 'inv-1', clientName: 'Acme Corp', amount: 5000, dueDate: '2026-04-10', status: 'sent', clientId: 'client-1' },
  { id: 'inv-2', clientName: 'Global Tech', amount: 3000, dueDate: '2026-04-15', status: 'paid', clientId: 'client-2' },
  { id: 'inv-3', clientName: 'Nexus Dynamics', amount: 15000, dueDate: '2026-04-20', status: 'paid', clientId: 'client-3' },
  { id: 'inv-4', clientName: 'Aurora Health', amount: 2500, dueDate: '2026-04-05', status: 'paid', clientId: 'client-4' },
  { id: 'inv-5', clientName: 'LiveWire Fitness', amount: 1500, dueDate: '2026-04-30', status: 'sent', clientId: 'client-5' },
];

export const initialYdiAllowances: YouDeserveItAllowance[] = [
  { id: 'ydi-1', employeeId: 1, amount: 500, category: 'wellness', status: 'available', description: 'Monthly Wellness Benefit' },
];

export const initialSetSailGifts: SetSailGift[] = [
  { id: 'gift-1', recipientId: 'client-1', recipientType: 'client', giftType: 'physical', status: 'delivered', value: 150, message: 'Welcome aboard!' },
];

export const initialConversations: Conversation[] = [
  {
    id: 'conv-1',
    participants: [
      { id: 'u-1', name: 'System Admin', role: 'admin' },
      { id: 'u-2', name: 'Client User', role: 'client' }
    ],
    lastMessage: {
      id: 'm-1',
      senderId: 'u-1',
      content: 'Welcome to the portal! Let us know if you need anything.',
      timestamp: new Date().toISOString(),
      status: 'read'
    },
    unreadCount: 0,
    updatedAt: new Date().toISOString(),
    type: 'direct'
  }
];

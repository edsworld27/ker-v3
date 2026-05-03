import { AppUser, Client, Project, ProjectTask, AppTicket, LogEntry, Todo } from '../types';

export const initialTodos: Todo[] = [
  { id: '1', text: 'Review Q1 performance reports', completed: false, priority: 'High', category: 'Strategic' },
  { id: '2', text: 'Onboard new development lead', completed: false, priority: 'Medium', category: 'HR' },
  { id: '3', text: 'Update global compliance docs', completed: true, priority: 'High', category: 'Legal' },
];

export const initialUsers: AppUser[] = [
  { id: 2, name: 'John Manager', email: 'john@example.com', role: 'AgencyManager', avatar: 'JM', workingHours: '9:00 AM - 5:00 PM', bio: 'Operations Manager', joinedDate: '2025-02-15' },
  { id: 3, name: 'Sarah Employee', email: 'sarah@example.com', role: 'AgencyEmployee', avatar: 'SE', workingHours: '10:00 AM - 4:00 PM', bio: 'Design Lead', joinedDate: '2025-03-10' },
  { id: 4, name: 'Client Owner', email: 'contact@acme.com', role: 'ClientOwner', clientId: 'client-1', avatar: 'CO', workingHours: '8:00 AM - 4:00 PM', bio: 'CEO at Acme Corp', joinedDate: '2026-01-20' },
  { id: 101, name: 'Example Operator', email: 'operator@example.com', role: 'AgencyEmployee', avatar: 'EO', workingHours: '9-5', bio: 'Mock Operator', joinedDate: '2026-01-01' },
  { id: 102, name: 'Example Manager', email: 'manager@example.com', role: 'AgencyManager', avatar: 'EM', workingHours: '9-5', bio: 'Mock Manager', joinedDate: '2026-01-01' },
  { id: 103, name: 'Example Client', email: 'client@example.com', role: 'ClientOwner', clientId: 'client-1', avatar: 'EC', workingHours: '9-5', bio: 'Mock Client', joinedDate: '2026-01-01' },
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
    resources: []
  },
  {
    id: 'client-2',
    name: 'Global Tech',
    email: 'info@globaltech.io',
    stage: 'design',
    websiteUrl: 'https://example.com/preview/globaltech',
    discoveryAnswers: {},
    resources: [{ name: 'Brand Assets', url: '#', type: 'zip' }]
  }
];

export const initialProjects: Project[] = [
  { id: 'proj-1', name: 'Aqua Portal V2', clientId: 'client-1', description: 'Internal refactor and feature expansion.', status: 'Active', createdAt: '2026-03-01' },
  { id: 'proj-2', name: 'Brand Identity', clientId: 'client-1', description: 'Redesigning the core brand elements.', status: 'Planning', createdAt: '2026-03-15' },
];

export const initialProjectTasks: ProjectTask[] = [
  { 
    id: 'task-1', 
    projectId: 'proj-1', 
    title: 'Implement Task Management', 
    description: 'Create the core UI and state for managing projects and tasks.',
    status: 'In Progress',
    priority: 'High',
    assigneeId: 1,
    dueDate: '2026-03-26',
    createdAt: '2026-03-24'
  }
];

export const initialTaskSteps = [
  { id: 's1', taskId: 'task-1', text: 'Define Data Models', completed: true },
  { id: 's2', taskId: 'task-1', text: 'Implement Project Hub', completed: false },
  { id: 's3', taskId: 'task-1', text: 'Build Task Board', completed: false }
];

export const initialTaskAttachments = [
  { id: 'a1', taskId: 'task-1', name: 'SOP: Project Standards', url: '#', type: 'sop' }
];

export const initialTickets: AppTicket[] = [
  { id: 'TIC-001', title: 'Login issue reported via call', status: 'Open', priority: 'High', creator: 'Client Owner', creatorId: 4, createdAt: new Date().toISOString(), type: 'internal', description: 'Client mentioned login lag during the weekly sync.' },
  { id: 'TIC-002', title: 'Feature request: Dark mode', status: 'Closed', priority: 'Low', creator: 'Edward Hallam', creatorId: 1, createdAt: new Date().toISOString(), type: 'internal' },
  { id: 'TIC-003', title: 'Unable to upload logo', status: 'Open', priority: 'Medium', creator: 'Acme Corp', creatorId: 'client-1', createdAt: new Date().toISOString(), type: 'client' }
];

export const initialActivityLogs: LogEntry[] = [
  { id: '1', timestamp: new Date().toISOString(), userId: 1, userName: 'Founder', action: 'Login', details: 'Founder logged in', type: 'system' },
  { id: '2', timestamp: new Date().toISOString(), userId: 1, userName: 'Founder', action: 'Portal Access', details: 'Accessed Agency Hub', type: 'action' },
  { id: '3', timestamp: new Date().toISOString(), userId: 2, userName: 'John Manager', action: 'Update', details: 'Updated client priority', type: 'action' },
];

export const initialAiSessions = [
  { id: 'sess-1', userId: 1, userName: 'Edward Hallam', interactions: [{ prompt: 'Analyze revenue', response: 'Revenue is up 20%...', timestamp: new Date().toISOString() }] },
  { id: 'sess-2', userId: 4, userName: 'Client Owner', interactions: [{ prompt: 'How do I add a logo?', response: 'Go to settings...', timestamp: new Date().toISOString() }] }
];

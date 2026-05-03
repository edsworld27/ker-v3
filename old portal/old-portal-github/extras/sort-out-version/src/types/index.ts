export type Step = 'setup' | 'login' | 'security' | 'portal';
export type ClientStage = 'discovery' | 'design' | 'development' | 'live';
export type PortalView = 'dashboard' | 'crm' | 'website' | 'resources' | 'settings' | 'support' | 'your-plan' | 'agency-hub'
  | 'agency-communicate'
  | 'support-tickets'
  | 'founder-todos'
  | 'global-activity'
  | 'global-settings'
  | 'feature-request'
  | 'ai-sessions'
  | 'agency-clients'
  | 'project-hub'
  | 'task-board'
  | 'notifications' | 'discover' | 'updates' | 'aqua-ai' | 'workspaces' | 'company' | 'data-hub' | 'admin-dashboard' | 'client-management' | 'onboarding' | 'collaboration' | 'discovery-form' | 'logs' | 'design-dashboard' | 'dev-dashboard' | 'onboarding-dashboard' | 'discovery-dashboard' | 'employee-management' | 'employee-profile' | 'agency-builder' | 'apps';

export type WidgetType = 'metric' | 'chart' | 'list' | 'text';

export interface DashboardWidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  size: 'small' | 'medium' | 'large' | 'full';
  dataEndpoint?: string; // Mock endpoint or data source
  content?: string; // For text widgets
}

export interface CustomPage {
  id: string;
  title: string;
  slug: string;
  iconName: string;
  widgets: DashboardWidgetConfig[];
  roles: string[]; // Roles that can view this page
}

export interface CustomSidebarLink {
  id: string;
  label: string;
  iconName: string;
  view: PortalView | string;
  url?: string;
  roles: string[];
  order: number;
}

export interface AgencyTemplate {
  id: string;
  name: string;
  description: string;
  features: string[];
  sidebarLinks: CustomSidebarLink[];
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: 'High' | 'Medium' | 'Low';
  category: string;
}

export interface ActivityLog {
  id: string;
  userId: number;
  userName: string;
  action: string;
  module: string;
  timestamp: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  stage: ClientStage;
  logo?: string;
  websiteUrl?: string;
  discoveryAnswers: Record<string, string>;
  resources: { name: string, url: string, type: string }[];
  permissions: (PortalView | string)[];
  assignedEmployees?: number[]; // IDs of Agency Employees assigned to this client
}

export interface CustomRole {
  id: string;
  name: string;
  permissions: (PortalView | string)[];
  isMaster?: boolean;
}

export interface Agency {
  id: string;
  name: string;
  logo?: string;
  theme?: {
    primary: string;
    secondary: string;
  };
  roles: CustomRole[];
  isConfigured: boolean;
}

export type UserRole = 'Founder' | 'AgencyManager' | 'AgencyEmployee' | 'ClientOwner' | 'ClientEmployee' | string;

export interface AppUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  customRoleId?: string;
  permissions: (PortalView | string)[];
  clientId?: string;
  avatar?: string;
  workingHours?: string;
  bio?: string;
  joinedDate?: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  userId: number | string;
  userName: string;
  action: string;
  details: string;
  clientId?: string;
  type: 'auth' | 'impersonation' | 'action' | 'system';
}

export interface AppTicket {
  id: string;
  title: string;
  status: 'Open' | 'Closed' | 'In Progress';
  priority: 'High' | 'Medium' | 'Low';
  creator: string; // Display name
  creatorId: number | string;
  createdAt: string;
  type: 'internal' | 'client';
  description?: string;
}

export interface SubStep {
  id: string;
  text: string;
  completed: boolean;
}

export interface TaskAttachment {
  id: string;
  name: string;
  url: string;
  type: 'file' | 'link' | 'sop';
}

export interface Project {
  id: string;
  name: string;
  clientId?: string;
  description: string;
  status: 'Planning' | 'Active' | 'On Hold' | 'Completed';
  createdAt: string;
}

export interface ProjectTask {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: 'Backlog' | 'In Progress' | 'Review' | 'Done';
  priority: 'High' | 'Medium' | 'Low';
  assigneeId?: number;
  dueDate?: string;
  steps: SubStep[];
  attachments: TaskAttachment[];
  createdAt: string;
}

/**
 * @aqua/bridge — Shared Type Contracts
 *
 * These types are the single source of truth for the entire system.
 * Operations, AQUA Client, and CRM all import from here.
 * Never define core entity types anywhere else.
 */

// ── Enums / Literals ──────────────────────────────────────────────────────────

export type PortalProduct = 'operations' | 'client' | 'crm';
export type PortalTier = 'agency' | 'client' | 'community';
export type ClientStage = 'lead' | 'discovery' | 'design' | 'development' | 'onboarding' | 'live' | 'churned';
export type PortalView = string;
export type Step = 'welcome' | 'setup' | 'setup-wizard' | 'login' | 'security' | 'incubator' | 'portal';

/**
 * All possible roles across the system.
 * - Founder / AgencyManager / AgencyEmployee → Operations access
 * - ClientOwner / ClientEmployee             → AQUA Client portal only
 * - Freelancer                               → AQUA Client fulfilment only (never Operations)
 */
export type UserRole =
  | 'Founder'
  | 'AgencyManager'
  | 'AgencyEmployee'
  | 'ClientOwner'
  | 'ClientEmployee'
  | 'Freelancer'
  | string;

// ── Agency / Tenant ───────────────────────────────────────────────────────────

export interface Agency {
  id: string;
  name: string;
  logo?: string;
  theme?: {
    primary: string;
    secondary: string;
    accent?: string;
  };
  domain?: string;
  isConfigured: boolean;
  createdAt?: string;
}

// ── Users ─────────────────────────────────────────────────────────────────────

export interface AppUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  customRoleId?: string;
  agencyId?: string;
  clientId?: string;
  avatar?: string;
  bio?: string;
  joinedDate?: string;
  department?: string;
  managerId?: number;
  skills?: string[];
  status?: 'active' | 'inactive' | 'on-leave';
  locationType?: 'remote' | 'hybrid' | 'office' | string;
  workingHours?: string;
  baseSalaryCents?: number;
  portalTier?: PortalTier;
  taxProfile?: any;
  /** Which product(s) this user can access */
  productAccess?: PortalProduct[];
}

// ── Clients ───────────────────────────────────────────────────────────────────

export interface Client {
  id: string;
  agencyId: string;
  name: string;
  email: string;
  stage: ClientStage;
  logo?: string;
  websiteUrl?: string;
  brandColor?: string;
  bgColor?: string;
  portalName?: string;
  discoveryAnswers: Record<string, string>;
  assignedEmployees?: number[];     // internal staff (by AppUser.id)
  assignedFreelancers?: string[];   // external fulfilment (by AppUser.email)
  resources?: ClientResource[];
  enabledSuiteIds: string[];
  permissions?: Record<string, boolean>;
  // CMS / Website Editor
  githubOwner?: string;
  githubRepo?: string;
  githubFilePath?: string;
  cmsProvisioned?: boolean;
  cmsProvisionedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClientResource {
  id?: string;
  name: string;
  url: string;
  type: 'document' | 'image' | 'video' | 'zip' | 'link' | string;
  uploadedBy?: number;
  uploadedAt?: string;
}

// ── Fulfilment ────────────────────────────────────────────────────────────────

export type DeliverableStatus = 'brief' | 'in-progress' | 'review' | 'approved' | 'revision' | 'complete';

export interface FulfilmentBrief {
  id: string;
  clientId: string;
  title: string;
  description: string;
  attachments?: ClientResource[];
  assignedTo?: number[];           // fulfilment team member IDs
  dueDate?: string;
  status: DeliverableStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface FulfilmentDeliverable {
  id: string;
  briefId: string;
  clientId: string;
  title: string;
  url?: string;
  notes?: string;
  submittedBy: number;
  submittedAt: string;
  approvedAt?: string;
  revisionNotes?: string;
  status: DeliverableStatus;
}

// ── Notifications ─────────────────────────────────────────────────────────────

export interface AppNotification {
  id: string;
  userId: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  link?: string;
  createdAt: string;
}

// ── Activity Logs ─────────────────────────────────────────────────────────────

export interface LogEntry {
  id: string;
  type: string;
  message: string;
  category?: string;
  clientId?: string;
  userId?: number;
  timestamp: string;
}

// ── Bridge Auth Session ───────────────────────────────────────────────────────

export interface BridgeSession {
  user: AppUser;
  agency: Agency;
  /** Which suites this user's role can access */
  enabledSuiteIds: string[];
  /** Which product(s) this user can see */
  productAccess: PortalProduct[];
  /** Is this a demo session (no real DB) */
  isDemo: boolean;
}

// ── Suite / Template Meta ─────────────────────────────────────────────────────

export interface SuiteSubItem {
  id: string;
  label: string;
  icon?: any;
  view: string;
  component?: any;
}

export interface SuiteTemplate {
  id: string;
  label: string;
  icon: any;
  component?: any;
  section?: string;
  requiredSuites?: string[];
  defaultView?: string;
  subItems?: SuiteSubItem[];
  /** Long-form description shown on marketplace cards */
  description?: string;
  /** Marketplace categorisation — used for filter pills */
  category?: PluginCategory;
  /** Per-suite configuration schema rendered as a drawer in the marketplace */
  configSchema?: PluginConfigField[];
  /** Marketplace pricing label (cosmetic — billing isn't wired yet) */
  pricing?: 'free' | 'pro' | 'enterprise';
  /** Permissions required to install/use this plugin */
  requiredPermissions?: string[];
  /** Lifecycle hooks fired by the marketplace when the plugin state changes */
  onInstall?: (ctx: PluginLifecycleContext) => void | Promise<void>;
  onUninstall?: (ctx: PluginLifecycleContext) => void | Promise<void>;
  onConfigChange?: (ctx: PluginLifecycleContext, oldConfig: any, newConfig: any) => void | Promise<void>;
}

export type PluginCategory =
  | 'Sales'
  | 'Marketing'
  | 'Finance'
  | 'People'
  | 'Operations'
  | 'Content'
  | 'Integrations'
  | 'Analytics'
  | 'Other';

export interface PluginConfigField {
  key: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect' | 'json';
  options?: string[];
  default?: any;
  description?: string;
  placeholder?: string;
  /** Mark fields as secret to render them masked + store in encrypted column (server side) */
  secret?: boolean;
  /** Field is required when installing */
  required?: boolean;
}

export interface PluginLifecycleContext {
  agencyId: string;
  userId?: number;
  config: Record<string, any>;
}

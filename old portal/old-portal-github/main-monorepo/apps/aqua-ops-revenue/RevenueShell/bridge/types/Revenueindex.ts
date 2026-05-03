import type React from 'react';

/**
 * CORE TYPES — Shared across the App Shell and all Templates.
 *
 * Core entity types (AppUser, Client, Agency, BridgeSession, etc.) are
 * re-exported from @aqua/bridge — single source of truth.
 * Domain-specific UI types (HR, Finance, CRM entities) remain here.
 */

// ── Core types from Bridge (single source of truth) ──────────────────────────
export type {
  PortalProduct,
  PortalTier,
  ClientStage,
  PortalView,
  Step,
  UserRole,
  Agency,
  AppUser,
  Client,
  ClientResource,
  FulfilmentBrief,
  FulfilmentDeliverable,
  AppNotification,
  BridgeSession,
} from '@aqua/bridge/types';

// ── LogEntry — RevenueShell-extended version with action/details/userName ─────────
// (Bridge LogEntry uses message/timestamp; RevenueShell uses action/details/userName)
export interface LogEntry {
  id: string;
  timestamp: string;
  userId: number;
  userName: string;
  action: string;
  details: string;
  type: 'system' | 'action' | 'info' | 'warning' | 'error' | 'success' | string;
  clientId?: string;
}

// ── App-shell-specific navigation types ──────────────────────────────────────
export interface CustomSidebarLink {
  id: string;
  label: string;
  iconName: string;
  view: string;
  url?: string;
  roles: string[];
  order: number;
}

// ── Suite / Bridge Registration (RevenueShell-extended versions) ─────────────────
// These extend the Bridge base types with React-specific fields (component refs,
// onClick handlers, etc.) needed by the Sidebar and SuiteRouter.
export interface SubNavItem {
  id: string;
  label: string;
  icon?: any;
  view: string;
  active?: boolean;
  onClick?: () => void;
  badge?: string | number;
  component?: React.ComponentType<any>;
  children?: SubNavItem[];
}

export interface SuiteSetupFeature {
  id: string;
  label: string;
  description?: string;
  enabled?: boolean;
  defaultValue?: any;
}

export interface SuiteSetupComponent {
  id: string;
  label: string;
  component: React.ComponentType<any>;
}

export interface SuiteSetup {
  features?: SuiteSetupFeature[];
  components?: SuiteSetupComponent[];
  availableComponents?: Array<{ id: string; label: string; description?: string; componentKey?: string }>;
  configurationInstructions?: string;
}

// ── SuiteSubItem & SuiteTemplate (RevenueShell-extended) ─────────────────────────
// These are the canonical types used by all Template registries.
// They extend Bridge's base types with React-specific fields.
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
  name?: string;
  icon: any;
  component?: React.ComponentType<any> | any;
  demoComponent?: React.ComponentType<any>;
  editorComponent?: React.ComponentType<any>;
  isEnabled?: boolean;
  section?: string;
  defaultView?: string;
  subItems?: (SuiteSubItem | SubNavItem)[];
  setup?: SuiteSetup;
  requiredSuites?: string[];
  status?: string;
  view?: string;
  children?: SubNavItem[];
  badge?: string | number;
  onClick?: () => void;
}

// ── Projects / Tasks ──────────────────────────────────────────────────────────
export interface Project {
  id: string;
  name: string;
  clientId?: string;
  status: 'active' | 'completed' | 'on-hold' | 'cancelled';
  startDate?: string;
  endDate?: string;
  budget?: number;
  description?: string;
  assignedEmployees?: number[];
  tags?: string[];
  priority?: 'low' | 'medium' | 'high';
}

export interface ProjectTask {
  id: string;
  projectId?: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  assigneeId?: number;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
  createdAt?: string;
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority?: 'Low' | 'Medium' | 'High';
  category?: string;
  dueDate?: string;
  assigneeId?: number;
}

// ── CRM / Sales ───────────────────────────────────────────────────────────────
export type DealStage = 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';

export interface Deal {
  id: string;
  name: string;
  clientId?: string;
  value: number;
  stage: DealStage;
  probability?: number;
  expectedCloseDate?: string;
  assigneeId?: number;
  notes?: string;
  createdAt?: string;
}

export interface MarketingCampaign {
  id: string;
  name: string;
  type: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  budget?: number;
  startDate?: string;
  endDate?: string;
  metrics?: Record<string, number>;
  clientId?: string;
}

export interface ClientAdCampaign {
  id: string;
  clientId: string;
  name: string;
  platform: string;
  status: 'active' | 'paused' | 'completed';
  budget: number;
  spent?: number;
  impressions?: number;
  clicks?: number;
  conversions?: number;
  startDate?: string;
  endDate?: string;
}

export interface SocialMediaPost {
  id: string;
  clientId?: string;
  clientName?: string;
  platform: string;
  content: string;
  status: 'draft' | 'scheduled' | 'published';
  scheduledAt?: string;
  publishedAt?: string;
  metrics?: { likes?: number; shares?: number; comments?: number; reach?: number };
}

export interface PressRelease {
  id: string;
  title: string;
  content: string;
  status: 'draft' | 'review' | 'published';
  publishedAt?: string;
  clientId?: string;
}

// ── Finance ───────────────────────────────────────────────────────────────────
export interface JournalEntry {
  id: string;
  date: string;
  description: string;
  debit: number;
  credit: number;
  accountCode?: string;
  reference?: string;
  status?: 'draft' | 'posted';
  ref?: string;
}

export interface LedgerAccount {
  id: string;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  subType?: string;
  balance: number;
  currency?: string;
}

export interface GLMapping {
  id: string;
  sourceAccount: string;
  targetAccount: string;
  description?: string;
  isActive?: boolean;
  payrollCategory?: string;
}

export interface APInvoice {
  id: string;
  vendorId?: string;
  vendorName: string;
  amount: number;
  currency?: string;
  dueDate: string;
  status: 'pending' | 'approved' | 'paid' | 'overdue';
  lineItems?: Array<{ description: string; amount: number }>;
}

export interface ARInvoice {
  id: string;
  clientId?: string;
  clientName: string;
  amount: number;
  currency?: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  lineItems?: Array<{ description: string; amount: number }>;
  invoiceNumber?: string;
  issuedDate?: string;
}

export interface BankReconciliation {
  id: string;
  accountId: string;
  accountName: string;
  statementDate: string;
  statementBalance: number;
  bookBalance: number;
  difference: number;
  status: 'pending' | 'reconciled' | 'in-progress';
  lines?: any[];
}

export interface CashForecast {
  id: string;
  period: string;
  openingBalance?: number;
  projectedInflow?: number;
  projectedOutflow?: number;
  projectedIn?: number;
  projectedOut?: number;
  closingBalance?: number;
  month?: string;
}

export interface ExpenseReport {
  id: string;
  employeeId: number;
  employeeName?: string;
  title: string;
  totalAmount: number;
  currency?: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid' | 'reimbursed';
  submittedAt?: string;
  items?: Array<{ description: string; amount: number; category: string; date: string }>;
  reimbursedInPayRunId?: string;
}

export interface PurchaseOrder {
  id: string;
  vendorName: string;
  totalAmount: number;
  currency?: string;
  status: 'draft' | 'approved' | 'sent' | 'received' | 'cancelled' | 'closed';
  createdAt?: string;
  lineItems?: Array<{ id?: string; description: string; quantity?: number; unitPrice: number; qty?: number; total?: number }>;
  poNumber?: string;
  vendorId?: string;
  issueDate?: string;
  expectedDate?: string;
}

export type PaymentRail = 'ACH' | 'Wire' | 'Check' | 'Card' | 'Crypto' | string;

export interface PaymentTransaction {
  id: string;
  amount: number;
  currency?: string;
  rail: PaymentRail;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'reversed';
  fromAccountId?: string;
  toAccountId?: string;
  reference?: string;
  createdAt?: string;
}

export type RevenueState = 'recognized' | 'deferred' | 'pending';
export interface RevenueStateData {
  monthlyRevenue?: number;
  growthRate?: number;
  expenses?: number;
}

export interface FraudSignal {
  id: string;
  transactionId?: string;
  signalType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  reason?: string;
  score?: number;
  detectedAt: string;
  status: 'open' | 'investigating' | 'resolved' | 'false-positive';
}

// ── HR / Human Capital ────────────────────────────────────────────────────────
export interface EmployeeRecord {
  id: string;
  userId: number;
  employeeNumber?: string;
  department?: string;
  position?: string;
  startDate?: string;
  endDate?: string;
  contractType?: 'full-time' | 'part-time' | 'contractor' | 'intern';
  salary?: number;
  currency?: string;
  managerId?: number;
  ssn?: string;
  auditStatus?: string;
}

export interface ClockInRecord {
  id: string;
  employeeId?: number;
  userId?: number;
  clockIn: string;
  clockOut?: string;
  duration?: number;
  projectId?: string;
  notes?: string;
  location?: string;
  ipAddress?: string;
  type?: string;
  status?: 'active' | 'completed' | 'adjusted' | 'Active' | 'Completed';
  totalHours?: number;
  durationString?: string;
}

export type PayrollStatus = 'draft' | 'processing' | 'approved' | 'paid' | 'failed' | 'pending' | 'processed' | 'review';

export interface PayRun {
  id: string;
  period: string;
  payDate: string;
  status: PayrollStatus;
  totalGross: number;
  totalNet: number;
  employeeCount: number;
  currency?: string;
  payslips: Payslip[];
  aiFlags?: AiPayrollFlag[];
  grossPay?: number;
}

export interface AiPayrollFlag {
  id: string;
  employeeId: number;
  payRunId?: string;
  payslipId?: string;
  category?: string;
  title?: string;
  explanation?: string;
  proposedCorrection?: any;
  flagType?: string;
  severity: 'low' | 'medium' | 'high' | 'critical' | 'warning';
  message?: string;
  resolvedAt?: string;
  status?: string;
  createdAt?: string;
}

export interface BenefitPlan {
  id: string;
  name: string;
  type: 'health' | 'dental' | 'vision' | 'life' | 'retirement' | 'other' | 'Health' | 'Dental' | 'Vision';
  description?: string;
  employerContribution?: number;
  employeeContribution?: number;
  enrollmentDeadline?: string;
  enrolledUserIds?: number[];
  tiers?: any[];
}

export interface GarnishmentOrder {
  id: string;
  employeeId: number;
  type: string;
  amount: number;
  percentage?: number;
  effectiveDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'suspended';
  courtOrderRef?: string;
  monthlyAmount?: number;
}

export interface EWARequest {
  id: string;
  employeeId: number;
  requestedAmount: number;
  approvedAmount?: number;
  status: 'pending' | 'approved' | 'denied' | 'disbursed' | 'paid';
  requestedAt: string;
  payRunId?: string;
  paymentRail?: string;
}

export interface PerformanceReview {
  id: string;
  employeeId: number;
  reviewerId?: number;
  period: string;
  overallRating?: number;
  status: 'draft' | 'in-progress' | 'completed';
  completedAt?: string;
  categories?: Array<{ name: string; rating: number; comments?: string }>;
  reviewType?: string;
  overallScore?: number;
}

export interface Candidate {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  position?: string;
  status: 'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected' | 'Interview' | 'Offer';
  jobId?: string;
  score?: number;
  aiAnalysis?: any;
  coverLetter?: string;
  references?: any[];
  employeeStatements?: any[];
  source?: string;
  appliedAt?: string;
  skills?: string[];
}

export interface JobPosting {
  id: string;
  title: string;
  department?: string;
  description?: string;
  requirements?: string[];
  status: 'draft' | 'open' | 'closed' | 'filled' | 'Published';
  priority?: string;
  location?: string;
  postedAt?: string;
  closingDate?: string;
  salary?: { min: number; max: number; currency: string };
}

export interface JobBoard {
  id: string;
  name: string;
  url?: string;
  isActive: boolean;
  postings?: number;
  apiConnected?: boolean;
}

export interface TrainingCourse {
  id: string;
  title: string;
  description?: string;
  duration?: number;
  format?: 'online' | 'in-person' | 'hybrid';
  status?: 'active' | 'archived';
  enrolledCount?: number;
  category?: string;
  mandatory?: boolean;
  estimatedMinutes?: number;
}

export interface LmsCourse {
  id: string;
  title: string;
  modules?: Array<{ id: string; title: string; duration: number }>;
  enrolledEmployees?: number[];
  completionRate?: number;
  status?: 'active' | 'archived';
}

export interface CourseEnrollment {
  id: string;
  courseId: string;
  employeeId: number;
  enrolledAt: string;
  completedAt?: string;
  progress?: number;
  grade?: string;
  status?: 'enrolled' | 'in-progress' | 'completed' | 'dropped' | 'Overdue' | 'Completed';
  userId?: number;
}

export interface DisciplinaryAction {
  id: string;
  employeeId: number;
  type: 'verbal-warning' | 'written-warning' | 'suspension' | 'termination' | 'other' | string;
  description?: string;
  details?: string;
  contravention?: string;
  incidentDate?: string;
  issuedAt?: string;
  createdAt?: string;
  issuedById?: number;
  status?: 'open' | 'resolved';
}

export interface SafetyIncident {
  id: string;
  reportedById: number;
  incidentDate: string;
  description: string;
  severity: 'minor' | 'moderate' | 'serious' | 'critical';
  status: 'reported' | 'investigating' | 'resolved' | 'closed';
  location?: string;
}

export interface SpecialLeaveRequest {
  id: string;
  employeeId: number;
  leaveType?: string;
  type?: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'Approved' | 'Pending' | 'Rejected';
  reason?: string;
  documents?: any[];
  durationDays?: number;
}

export interface EngagementSurvey {
  id: string;
  title: string;
  period: string;
  status: 'draft' | 'active' | 'closed';
  responseCount?: number;
  averageScore?: number;
}

export interface TeamHealthSignal {
  id: string;
  teamId?: string;
  managerId?: number;
  metric: string;
  value: number;
  trend?: 'up' | 'down' | 'stable';
  recordedAt: string;
  recognitionGaps?: string[];
  suggestedActions?: any[];
  burnoutRiskCount?: number;
}

export interface IndividualDevelopmentPlan {
  id: string;
  employeeId: number;
  goals?: Array<{ id: string; description: string; targetDate?: string; status: string }>;
  createdAt?: string;
  lastReviewedAt?: string;
}

export interface MentorshipRelation {
  id: string;
  mentorId: number;
  menteeId: number;
  type?: string;
  startDate?: string;
  startedAt?: string;
  endDate?: string;
  status: 'active' | 'completed' | 'paused';
  goals?: string[];
  objectives?: any[];
  checkInsCount?: number;
}

export interface HrAlert {
  id: string;
  type: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  employeeId?: number;
  createdAt: string;
  resolvedAt?: string;
}

export interface WorkforceModel {
  id: string;
  name: string;
  period: string;
  headcount: number;
  budget: number;
  departments?: Array<{ name: string; headcount: number; budget: number }>;
  targetHeadcount?: number;
  projectedRevenue?: number;
  scenario?: string;
}

export interface TalentProfile {
  id: string;
  employeeId: number;
  skills?: string[];
  certifications?: string[];
  careerPath?: string;
  potential?: 'low' | 'medium' | 'high' | 'exceptional';
  readiness?: string;
}

export interface OnboardingWorkflow {
  id: string;
  employeeId?: number;
  templateId?: string;
  name: string;
  steps?: Array<{ id: string; title: string; label?: string; completed: boolean; dueDate?: string }>;
  startedAt?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'In Progress';
  startDate?: string;
  completedAt?: string;
  userId?: number;
  mentorId?: number;
  progress?: number;
}

export interface AiRecommendation {
  id: string;
  type: string;
  title: string;
  description?: string;
  confidence?: number;
  priority?: 'low' | 'medium' | 'high' | 'critical' | 'warning';
  actionable?: boolean;
  createdAt: string;
  employeeId?: number;
  rationale?: string;
  suggestedValue?: any;
  biasAuditStatus?: string;
}

export interface CompanyAsset {
  id: string;
  name: string;
  type: string;
  assignedToId?: number;
  serialNumber?: string;
  purchaseDate?: string;
  value?: number;
  status: 'available' | 'assigned' | 'maintenance' | 'retired';
}

export interface DeviceActivity {
  id: string;
  deviceId?: string;
  employeeId?: number;
  action: string;
  timestamp: string;
  ipAddress?: string;
}

// ── Enterprise / Legal / Compliance ─────────────────────────────────────────
export interface LegalDocument {
  id: string;
  title: string;
  type: string;
  status: 'draft' | 'review' | 'signed' | 'expired' | 'archived' | 'executed';
  clientId?: string;
  expiresAt?: string;
  signedAt?: string;
  content?: string;
  parties?: string[];
}

export interface DataProtectionRecord {
  id: string;
  dataType: string;
  processingPurpose: string;
  legalBasis: string;
  retentionPeriod?: string;
  dataController?: string;
  lastReviewedAt?: string;
  status: 'compliant' | 'needs-review' | 'non-compliant';
}

export interface InsurancePolicy {
  id: string;
  type: string;
  provider: string;
  policyNumber?: string;
  startDate: string;
  endDate: string;
  premium?: number;
  coverage?: number;
  status: 'active' | 'expired' | 'pending';
}

export interface ApprovalRequest {
  id: string;
  type: string;
  requestedById: number;
  requestedByName?: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  resolvedAt?: string;
  resolvedById?: number;
}

export interface KnowledgeBaseArticle {
  id: string;
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  authorId?: number;
  publishedAt?: string;
  updatedAt?: string;
  views?: number;
}

export interface BoardMeeting {
  id: string;
  title: string;
  date: string;
  attendees?: string[];
  agenda?: string[];
  minutes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface StakeholderStatement {
  id: string;
  stakeholderName: string;
  type: string;
  content: string;
  publishedAt?: string;
  period?: string;
}

export interface StrategicProjections {
  id: string;
  period: string;
  revenue?: number;
  expenses?: number;
  headcount?: number;
  assumptions?: string[];
  growthDriver?: string;
}

export interface StrategicObjective {
  id: string;
  title: string;
  description?: string;
  owner?: string;
  dueDate?: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'at-risk';
  progress?: number;
  keyResults?: Array<{ id: string; description: string; target: number; current: number }>;
  obj?: any;
}

export interface RiskAssessment {
  id: string;
  title: string;
  category: string;
  likelihood: 1 | 2 | 3 | 4 | 5;
  impact: 1 | 2 | 3 | 4 | 5;
  status: 'open' | 'mitigating' | 'accepted' | 'resolved' | 'Critical' | 'Mitigated' | 'Active';
  owner?: string;
  mitigationPlan?: string;
  reviewDate?: string;
  riskScore?: number;
  description?: string;
  mitigationStrategy?: string;
}

export interface AiGuardrail {
  id: string;
  name: string;
  type: string;
  rule: string;
  isActive: boolean;
  triggeredCount?: number;
  lastTriggeredAt?: string;
}

// ── Infrastructure / IT ───────────────────────────────────────────────────────
export interface Integration {
  id: string;
  name?: string;
  label?: string;
  type?: string;
  service?: string;
  description?: string;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  apiKey?: string;
  connectedAt?: string;
  lastSyncAt?: string;
  config?: Record<string, any>;
}

export interface Webhook {
  id: string;
  name?: string;
  url: string;
  events: string[];
  isActive?: boolean;
  active?: boolean;
  secret?: string;
  createdAt?: string;
  lastTriggeredAt?: string;
  failureCount?: number;
}

export interface SavedApiKey {
  id: string;
  name: string;
  service: string;
  maskedKey?: string;
  key?: string;
  createdAt: string;
  lastUsedAt?: string;
  expiresAt?: string;
  isActive?: boolean;
}

export interface AgencyTemplate {
  id: string;
  name: string;
  description?: string;
  type?: string;
  config?: Record<string, any>;
  isActive?: boolean;
  // Extended fields used by AgencyBuilder
  roles?: Record<string, any>;
  sidebarLinks?: CustomSidebarLink[];
  features?: any[];
  isCustom?: boolean;
}

export interface CustomPage {
  id: string;
  title: string;
  slug?: string;
  blocks?: PageBlock[];
  publishedAt?: string;
  status: 'draft' | 'published';
}

export type PageBlockType = 'text' | 'image' | 'video' | 'cta' | 'form' | 'embed' | 'divider' | string;

export interface PageBlock {
  id: string;
  type: PageBlockType;
  content?: any;
  settings?: Record<string, any>;
  order?: number;
  component?: string;
}

// ── Messaging / Comms ─────────────────────────────────────────────────────────
export interface UnifiedMessage {
  id: string;
  conversationId?: string;
  senderId?: string | number;
  senderName?: string;
  content: string;
  type?: 'text' | 'file' | 'image' | 'system';
  createdAt: string;
  readBy?: Array<string | number>;
  attachments?: UnifiedAttachment[];
}

export interface Conversation {
  id: string;
  participants: Array<{ id: string | number; name: string; avatar?: string }>;
  lastMessage?: UnifiedMessage;
  unreadCount: number;
  updatedAt: string;
  type: 'direct' | 'group' | 'channel';
  title?: string;
  isStarred?: boolean;
  accountId?: string;
  contactName?: string;
  contactIdentifier?: string;
  subject?: string;
  lastMessageAt?: string;
  service?: string;
  lastMessageText?: string;
}

export interface UnifiedAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size?: number;
}

// ── Gifting / Affiliates ──────────────────────────────────────────────────────
export type GiftType = 'physical' | 'digital' | 'experience' | 'donation';
export type GiftStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'cancelled' | 'packed' | 'dispatched';
export type GiftRecipientType = 'client' | 'employee' | 'prospect' | 'partner';
export type GiftFormat = 'box' | 'envelope' | 'digital' | 'custom';

export interface SetSailGift {
  id: string;
  recipientId?: string;
  recipientType?: GiftRecipientType;
  giftType?: GiftType;
  format?: GiftFormat;
  status?: GiftStatus;
  value?: number;
  message?: string;
  sentAt?: string;
  deliveredAt?: string;
}

export interface GiftRecord {
  id: string;
  giftId?: string;
  recipientName?: string;
  amount?: number;
  occasion?: string;
  sentAt?: string;
  status?: GiftStatus;
}

export type YDICategory = 'wellness' | 'learning' | 'equipment' | 'entertainment' | 'travel' | string;
export type YDIStatus = 'available' | 'requested' | 'approved' | 'spent' | 'expired' | 'pending' | 'rejected';

export interface YouDeserveItExpense {
  id: string;
  employeeId: number;
  clientId?: string;
  category?: YDICategory;
  amount: number;
  description?: string;
  notes?: string;
  status?: YDIStatus;
  submittedAt?: string;
  approvedAt?: string;
  // Allowance tracking fields
  totalAllowance?: number;
  allowance?: number;
  used?: number;
  spent?: number;
  expenses?: YouDeserveItExpense[];
}

export interface AffiliateReferral {
  id: string;
  affiliateId?: string;
  referredEmail?: string;
  referredName?: string;
  status: 'pending' | 'qualified' | 'converted' | 'rejected';
  commission?: number;
  createdAt?: string;
  convertedAt?: string;
}

export interface AffiliateTier {
  id: string;
  name: string;
  commissionRate: number;
  minReferrals?: number;
  benefits?: string[];
}

export interface AffiliateAccount {
  id: string;
  userId?: number;
  tier?: AffiliateTier;
  referralCode: string;
  totalReferrals?: number;
  totalEarnings?: number;
  balance?: number;
  status: 'active' | 'inactive' | 'suspended';
}

// ── Support / Ticketing ───────────────────────────────────────────────────────
export interface AppTicket {
  id: string;
  title: string;
  description?: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed' | 'Closed';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  clientId?: string;
  assigneeId?: number;
  createdAt?: string;
  resolvedAt?: string;
  tags?: string[];
  category?: string;
  type?: string;
  creatorId?: number | string;
}

// ── Payroll extras ────────────────────────────────────────────────────────────
export interface Payslip {
  id: string;
  employeeId: number;
  employeeName?: string;
  payRunId?: string;
  grossPay: number;
  netPay: number;
  deductions?: Record<string, number>;
  stateTax?: number;
  federalTax?: number;
  period?: string;
  paidAt?: string;
  regularPay?: number;
  regularHours?: number;
  overtimeHours?: number;
  paymentRail?: string;
}

export interface PayrollRecord {
  id: string;
  employeeId: number;
  period: string;
  grossPay: number;
  netPay: number;
  status: PayrollStatus;
  payslip?: Payslip;
  userId?: number;
  periodEnd?: string;
  paymentDate?: string;
}

export interface CommissionRecord {
  id: string;
  employeeId: number;
  amount: number;
  period: string;
  dealId?: string;
  status: 'pending' | 'approved' | 'paid' | 'confirmed';
  commissionAmount?: number;
}

export interface PrizeTier {
  id: string;
  name: string;
  threshold: number;
  reward: string;
}

export interface JournalLine {
  accountCode: string;
  accountName?: string;
  debit: number;
  credit: number;
  description?: string;
}

export interface DigitalWallet {
  id: string;
  name: string;
  balance: number;
  currency: string;
  type: string;
  status: 'active' | 'frozen' | 'closed';
}

export interface AccountingException {
  id: string;
  type: string;
  description: string;
  amount?: number;
  severity: 'low' | 'medium' | 'high';
  status: 'open' | 'resolved' | 'Resolved';
  createdAt: string;
  resolutionNotes?: string;
}

export interface PayrollException {
  id: string;
  employeeId: number;
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  status: 'open' | 'resolved';
}

// ── Infrastructure extras ─────────────────────────────────────────────────────
export interface NetworkLog {
  id: string;
  timestamp: string;
  type: string;
  message: string;
  severity?: 'info' | 'warning' | 'error';
  source?: string;
}

export interface SoftwareLicense {
  id: string;
  name: string;
  vendor?: string;
  licenseKey?: string;
  seats?: number;
  usedSeats?: number;
  expiresAt?: string;
  status?: 'active' | 'expired' | 'pending';
}

export interface HardwareAsset {
  id: string;
  name: string;
  type?: string;
  serialNumber?: string;
  assignedToId?: number;
  purchaseDate?: string;
  condition?: 'new' | 'good' | 'fair' | 'poor' | 'retired';
  value?: number;
}

// ── Older / legacy compatible types used in mockData ─────────────────────────
export type Balance = number;
export type YouDeserveItAllowance = YouDeserveItExpense;


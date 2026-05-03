/**
 * @license SPDX-License-Identifier: Apache-2.0
 *
 * ============================================================
 * CORE CONSTANTS — Shared across the App Shell.
 * Suite-specific constants belong in their respective Templates.
 * ============================================================
 */

// ── All registerable views (used by role permission editor) ──────────────────

export const ALL_VIEWS: { id: string; label: string; group: string }[] = [
  { id: 'dashboard',            label: 'Dashboard',          group: 'Core' },
  { id: 'admin-dashboard',      label: 'Admin Dashboard',    group: 'Core' },
  { id: 'agency-clients',       label: 'Clients',            group: 'Agency' },
  { id: 'client-management',    label: 'Client Management',  group: 'Agency' },
  { id: 'project-hub',          label: 'Projects',           group: 'Agency' },
  { id: 'task-board',           label: 'Task Board',         group: 'Agency' },
  { id: 'employee-management',  label: 'Team',               group: 'Agency' },
  { id: 'agency-communicate',   label: 'Communicate',        group: 'Agency' },
  { id: 'agency-builder',       label: 'App Builder',        group: 'Agency' },
  { id: 'agency-hub',           label: 'Agency Hub',         group: 'Agency' },
  { id: 'logs',                 label: 'Activity Logs',      group: 'Agency' },
  { id: 'all-users',           label: 'All Users',          group: 'Agency' },
  { id: 'company',             label: 'Company Hub',        group: 'Agency' },
  { id: 'master-logs',         label: 'Master Logs',        group: 'Agency' },
  { id: 'onboarding',           label: 'Onboarding',         group: 'Client' },
  { id: 'support',              label: 'Support',            group: 'Client' },
  { id: 'resources',            label: 'Resources',          group: 'Client' },
  { id: 'crm',                  label: 'CRM',                group: 'Client' },
  { id: 'website',              label: 'Website',            group: 'Client' },
  { id: 'collaboration',        label: 'Collaboration',      group: 'Client' },
  { id: 'discover',             label: 'Discover',           group: 'Client' },
  { id: 'aqua-ai',              label: 'Aqua AI',            group: 'Client' },
  { id: 'feature-request',      label: 'Feature Requests',   group: 'Client' },
  { id: 'data-hub',             label: 'Data Hub',           group: 'Client' },
  { id: 'founder-todos',        label: 'Founder Todos',      group: 'Founder' },
  { id: 'global-activity',      label: 'Global Activity',    group: 'Founder' },
  { id: 'agency-configurator',  label: 'Configurator',       group: 'Founder' },
];

export const VIEW_GROUPS = ['Core', 'Agency', 'Client', 'Founder'] as const;

// ── Stage dashboard routing ────────────────────────────────────────────────
// Maps a client's stage to the view they land on after impersonation starts.

export const STAGE_DASHBOARDS: Record<string, string> = {
  discovery:   'discovery-dashboard',
  onboarding:  'onboarding-dashboard',
  design:      'design-dashboard',
  development: 'dev-dashboard',
  live:        'dashboard',
};

export const CLIENT_STAGES = [
  { id: 'lead',        label: 'Lead',        color: 'bg-slate-500' },
  { id: 'prospect',    label: 'Prospect',    color: 'bg-blue-500' },
  { id: 'discovery',   label: 'Discovery',   color: 'bg-amber-500' },
  { id: 'onboarding',  label: 'Onboarding',  color: 'bg-purple-500' },
  { id: 'design',      label: 'Design',      color: 'bg-pink-500' },
  { id: 'development', label: 'Development', color: 'bg-indigo-500' },
  { id: 'live',        label: 'Live',        color: 'bg-emerald-500' },
  { id: 'inactive',    label: 'Inactive',    color: 'bg-red-500' }
];

// ── UI Configs ───────────────────────────────────────────────────────────

export const PRIORITY_CONFIG: Record<string, { color: string; label: string; text?: string }> = {
  high:   { color: 'bg-red-500/10 border-red-500/20 text-red-400', label: 'High Priority', text: 'text-red-400' },
  medium: { color: 'bg-amber-500/10 border-amber-500/20 text-amber-400', label: 'Medium', text: 'text-amber-400' },
  low:    { color: 'bg-blue-500/10 border-blue-500/20 text-blue-400', label: 'Low', text: 'text-blue-400' }
};

export const TASK_STATUS_CONFIG: Record<string, { color: string; label: string; text?: string }> = {
  todo:        { color: 'bg-slate-500/10 border-slate-500/20 text-slate-400', label: 'To Do' },
  in_progress: { color: 'bg-blue-500/10 border-blue-500/20 text-blue-400', label: 'In Progress' },
  review:      { color: 'bg-amber-500/10 border-amber-500/20 text-amber-400', label: 'In Review' },
  done:        { color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400', label: 'Done' }
};

export const LOG_TYPE_COLORS: Record<string, string> = {
  system: 'bg-slate-500',
  action: 'bg-blue-500',
  security: 'bg-red-500',
  impersonation: 'bg-amber-500',
  api: 'bg-emerald-500'
};


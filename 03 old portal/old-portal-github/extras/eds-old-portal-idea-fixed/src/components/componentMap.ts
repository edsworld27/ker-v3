/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * ============================================================
 * THE COMPONENT MAP — Complete Universe
 * ============================================================
 *
 * This is the ONLY place React components are imported by name.
 * It is a pure dictionary — no logic, no conditionals, no JSX.
 *
 * Two tiers:
 *
 *   WIDGETS  — granular, composable building blocks.
 *              Referenced by agencyConfig.viewLayouts[role][view].components
 *              to assemble a view per-role from config.
 *
 *   VIEWS    — full-page view components (transitional).
 *              Used as a fallback by DynamicViewRenderer while
 *              views are progressively decomposed into widget layouts.
 *              These will be removed as each view gains a viewLayouts entry.
 *
 * To register a new component:
 *   1. Import it below in the correct section.
 *   2. Add its key to the map object.
 *   3. Add its key to the appropriate type union (WidgetName or ViewName).
 *   That's it. The config system can now reference it by string.
 * ============================================================
 */

import type { ComponentType } from 'react';

// ── Shared widgets ────────────────────────────────────────────────────────────
import { DashboardWidget } from './shared/DashboardWidget';
import { RoleSwitcher } from './shared/RoleSwitcher';
import { SidebarItem } from './shared/SidebarItem';
import { StageDropdown } from './shared/StageDropdown';

// ── Collaboration widgets ─────────────────────────────────────────────────────
import { DesignConcepts } from './collaboration/DesignConcepts';
import { ProjectTimeline } from './collaboration/ProjectTimeline';
import { ProjectChat } from './collaboration/ProjectChat';
import { SyncCard } from './collaboration/SyncCard';

// ── AI widget ─────────────────────────────────────────────────────────────────
import AIChatbot from './AIChatbot';

// ── Data widgets — standalone composable building blocks ──────────────────────
import { ClientsStatsWidget } from './widgets/ClientsStatsWidget';
import { ProjectsStatsWidget } from './widgets/ProjectsStatsWidget';
import { TasksStatsWidget } from './widgets/TasksStatsWidget';
import { TicketsStatsWidget } from './widgets/TicketsStatsWidget';
import { ClientListWidget } from './widgets/ClientListWidget';
import { ClientDirectoryWidget } from './widgets/ClientDirectoryWidget';
import { ClientActivityWidget } from './widgets/ClientActivityWidget';
import { ProjectListWidget } from './widgets/ProjectListWidget';
import { TaskListWidget } from './widgets/TaskListWidget';
import { TeamListWidget } from './widgets/TeamListWidget';
import { ActivityFeedWidget } from './widgets/ActivityFeedWidget';
import { QuickActionsWidget } from './widgets/QuickActionsWidget';
import { ClientWelcomeWidget } from './widgets/ClientWelcomeWidget';
import { ClientRecentActivityWidget } from './widgets/ClientRecentActivityWidget';
import { AdminStatsWidget } from './widgets/AdminStatsWidget';
import { AdminActivityWidget } from './widgets/AdminActivityWidget';

// ── Views (transitional — removed as viewLayouts entries replace them) ─────────
import { LogsView } from './views/LogsView';
import { AiSessionsView } from './views/AiSessionsView';
import { SupportTicketsView } from './views/SupportTicketsView';
import { WebsiteView } from './views/WebsiteView';
import { ResourcesView } from './views/ResourcesView';
import { DiscoverView } from './views/DiscoverView';
import { FeatureRequestView } from './views/FeatureRequestView';
import { SupportView } from './views/SupportView';
import { DataHubView } from './views/DataHubView';
import { OnboardingView } from './views/OnboardingView';
import { CollaborationView } from './views/CollaborationView';
import { InboxView } from './views/InboxView';
import { AgencyConfiguratorView } from './views/AgencyConfiguratorView';
import { GlobalSettingsView } from './views/GlobalSettingsView';
import { EmployeeManagementView } from './views/EmployeeManagementView';
import { AgencySetupView } from './views/AgencySetupView';
import { AgencyLoginView } from './views/AgencyLoginView';
import { ClientLoginView } from './views/ClientLoginView';
import { RoleBuilder } from './views/RoleBuilder';
import { CustomPageView } from './views/CustomPageView';
import { GlobalActivityView } from './views/GlobalActivityView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { AgencyBuilderView } from './views/AgencyBuilderView';
import { AgencyClientsView } from './views/AgencyClientsView';
import { AgencyHubView } from './views/AgencyHubView';
import { AquaAiView } from './views/AquaAiView';
import { ClientManagementView } from './views/ClientManagementView';
import { CrmView } from './views/CrmView';
import { DashboardOverviewView } from './views/DashboardOverviewView';
import { DesignDashboardView } from './views/DesignDashboardView';
import { DevDashboardView } from './views/DevDashboardView';
import { DiscoveryDashboardView } from './views/DiscoveryDashboardView';
import { FounderTodosView } from './views/FounderTodosView';
import { OnboardingDashboardView } from './views/OnboardingDashboardView';
import { ProjectHubView } from './views/ProjectHubView';
import { TaskBoardView } from './views/TaskBoardView';

// ── The map ───────────────────────────────────────────────────────────────────

export const componentMap: Record<string, ComponentType<any>> = {
  // Widgets
  DashboardWidget,
  RoleSwitcher,
  SidebarItem,
  StageDropdown,

  // Collaboration widgets
  DesignConcepts,
  ProjectTimeline,
  ProjectChat,
  SyncCard,

  // AI widget
  AIChatbot,

  // Data widgets
  ClientsStatsWidget,
  ProjectsStatsWidget,
  TasksStatsWidget,
  TicketsStatsWidget,
  ClientListWidget,
  ClientDirectoryWidget,
  ClientActivityWidget,
  ProjectListWidget,
  TaskListWidget,
  TeamListWidget,
  ClientWelcomeWidget,
  ClientRecentActivityWidget,
  ActivityFeedWidget,
  QuickActionsWidget,
  AdminStatsWidget,
  AdminActivityWidget,

  // Views (transitional)
  LogsView,
  AiSessionsView,
  SupportTicketsView,
  WebsiteView,
  ResourcesView,
  DiscoverView,
  FeatureRequestView,
  SupportView,
  DataHubView,
  OnboardingView,
  CollaborationView,
  InboxView,
  AgencyConfiguratorView,
  GlobalSettingsView,
  EmployeeManagementView,
  AgencySetupView,
  AgencyLoginView,
  ClientLoginView,
  GlobalActivityView,
  RoleBuilder,
  CustomPageView,
  AdminDashboardView,
  AgencyBuilderView,
  AgencyClientsView,
  AgencyHubView,
  AquaAiView,
  ClientManagementView,
  CrmView,
  DashboardOverviewView,
  DesignDashboardView,
  DevDashboardView,
  DiscoveryDashboardView,
  FounderTodosView,
  OnboardingDashboardView,
  ProjectHubView,
  TaskBoardView,
};

// ── Type exports ──────────────────────────────────────────────────────────────

/** Every registered key — used to type agencyConfig.viewLayouts component references. */
export type ComponentName = keyof typeof componentMap;

/** Granular widget keys only. Use when building viewLayouts entries. */
export type WidgetName =
  | 'DashboardWidget'
  | 'RoleSwitcher'
  | 'SidebarItem'
  | 'StageDropdown'
  | 'DesignConcepts'
  | 'ProjectTimeline'
  | 'ProjectChat'
  | 'SyncCard'
  | 'AIChatbot'
  // Data widgets
  | 'ClientsStatsWidget'
  | 'ProjectsStatsWidget'
  | 'TasksStatsWidget'
  | 'TicketsStatsWidget'
  | 'ClientListWidget'
  | 'ClientDirectoryWidget'
  | 'ClientActivityWidget'
  | 'ProjectListWidget'
  | 'TaskListWidget'
  | 'TeamListWidget'
  | 'ActivityFeedWidget'
  | 'QuickActionsWidget'
  | 'ClientWelcomeWidget'
  | 'ClientRecentActivityWidget'
  | 'AdminStatsWidget'
  | 'AdminActivityWidget';

/** Full view component keys (transitional). */
export type ViewName =
  | 'LogsView'
  | 'AiSessionsView'
  | 'SupportTicketsView'
  | 'WebsiteView'
  | 'ResourcesView'
  | 'DiscoverView'
  | 'FeatureRequestView'
  | 'SupportView'
  | 'DataHubView'
  | 'OnboardingView'
  | 'CollaborationView'
  | 'InboxView'
  | 'AgencyConfiguratorView'
  | 'GlobalSettingsView'
  | 'EmployeeManagementView'
  | 'AgencySetupView'
  | 'AgencyLoginView'
  | 'ClientLoginView'
  | 'GlobalActivityView'
  | 'RoleBuilder'
  | 'CustomPageView';

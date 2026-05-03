// ============================================================
// Views — UI Config
// This file imports all individual view UI configurations
// and exports them as a single object.
// Feeds up to: uiMaster.ts
// ============================================================

import { adminDashboardUI } from './AdminDashboardView/ui';
import { clientManagementViewUI } from './ClientManagementView/ui';
import { agencyHubViewUI } from './AgencyHubView/ui';
import { aquaAiViewUI } from './AquaAiView/ui';
import { dashboardOverviewViewUI } from './DashboardOverviewView/ui';
import { dataHubViewUI } from './DataHubView/ui';
import { designDashboardUI } from './DesignDashboardView/ui';
import { onboardingDashboardUI } from './OnboardingDashboardView/ui';
import { onboardingViewUI } from './OnboardingView/ui';
import { projectHubViewUI } from './ProjectHubView/ui';
import { logsViewUI } from './LogsView/ui';
import { taskBoardViewUI } from './TaskBoardView/ui';
import { supportViewUI } from './SupportView/ui';
import { founderTodosUI } from './FounderTodosView/ui';
import { globalActivityUI } from './GlobalActivityView/ui';
import { crmViewUI } from './CrmView/ui';
import { websiteViewUI } from './WebsiteView/ui';
import { resourcesViewUI } from './ResourcesView/ui';
import { discoverViewUI } from './DiscoverView/ui';
import { featureRequestViewUI } from './FeatureRequestView/ui';
import { aiSessionsViewUI } from './AiSessionsView/ui';
import { supportTicketsViewUI } from './SupportTicketsView/ui';
import { agencyLoginViewUI } from './AgencyLoginView/ui';
import { clientLoginViewUI } from './ClientLoginView/ui';
import { agencySetupViewUI } from './AgencySetupView/ui';
import { agencyBuilderViewUI } from './AgencyBuilderView/ui';
import { employeeManagementViewUI } from './EmployeeManagementView/ui';
import { pageBuilderUI } from './PageBuilder/ui';
import { roleBuilderUI } from './RoleBuilder/ui';
import { customPageViewUI } from './CustomPageView/ui';
import { agencyClientsViewUI } from './AgencyClientsView/ui';
import { globalSettingsViewUI } from './GlobalSettingsView/ui';

export const viewsUI = {
  adminDashboard: adminDashboardUI,
  clientManagement: clientManagementViewUI,
  agencyHub: agencyHubViewUI,
  aquaAi: aquaAiViewUI,
  dashboardOverview: dashboardOverviewViewUI,
  dataHub: dataHubViewUI,
  designDashboard: designDashboardUI,
  onboardingDashboard: onboardingDashboardUI,
  onboarding: onboardingViewUI,
  projectHub: projectHubViewUI,
  logs: logsViewUI,
  taskBoard: taskBoardViewUI,
  support: supportViewUI,
  founderTodos: founderTodosUI,
  globalActivity: globalActivityUI,
  crm: crmViewUI,
  website: websiteViewUI,
  resources: resourcesViewUI,
  discover: discoverViewUI,
  featureRequest: featureRequestViewUI,
  aiSessions: aiSessionsViewUI,
  supportTickets: supportTicketsViewUI,
  agencyLogin: agencyLoginViewUI,
  clientLogin: clientLoginViewUI,
  agencySetup: agencySetupViewUI,
  agencyBuilder: agencyBuilderViewUI,
  employeeManagement: employeeManagementViewUI,
  pageBuilder: pageBuilderUI,
  roleBuilder: roleBuilderUI,
  customPage: customPageViewUI,
  agencyClients: agencyClientsViewUI,
  globalSettings: globalSettingsViewUI,
};
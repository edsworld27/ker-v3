// @ts-nocheck
import { BridgeRegistry } from '@ClientShell/bridge/ClientRegistration';
import React, { lazy } from 'react';

/**
 * Discovery for standalone AQUA Client App
 *
 * Paths use the Client* file prefix per the repo's naming convention.
 * Earlier sessions left this file with unprefixed paths that no longer
 * existed; restored to match the actual filesystem.
 */
export function performClientDiscovery() {
  console.log('[AQUA Client] Performing Component Discovery...');

  BridgeRegistry.register('phases-hub', lazy(() => import('./PhasesHub/ClientPhasesHubView').then(m => ({ default: m.default }))));
  BridgeRegistry.register('discovery-phase-view', lazy(() => import('./PhasesHub/phases/Discovery/ClientDiscoveryPhaseView').then(m => ({ default: m.default }))));
  BridgeRegistry.register('design-phase-view', lazy(() => import('./PhasesHub/phases/Design/ClientDesignPhaseView').then(m => ({ default: m.default }))));
  BridgeRegistry.register('development-phase-view', lazy(() => import('./PhasesHub/phases/Development/ClientDevelopmentPhaseView').then(m => ({ default: m.default }))));
  BridgeRegistry.register('onboarding-phase-view', lazy(() => import('./PhasesHub/phases/Onboarding/ClientOnboardingPhaseView').then(m => ({ default: m.default }))));
  BridgeRegistry.register('live-phase-view', lazy(() => import('./PhasesHub/phases/LiveOps/ClientLivePhaseView').then(m => ({ default: m.default }))));
  BridgeRegistry.register('client-resources', lazy(() => import('./ClientResources/ClientResourcesView').then(m => ({ default: m.default }))));

  BridgeRegistry.register('ClientManagementView', lazy(() => import('./ClientManagement/ClientManagementView').then(m => ({ default: m.ClientManagementView }))));
  BridgeRegistry.register('clients-overview', lazy(() => import('./ClientManagement/views/ClientManagementOverview').then(m => ({ default: m.ClientManagementOverview }))));

  // Agency Clients — file is ClientAgencyClientsView, exports both named + default
  BridgeRegistry.register('AgencyClientsView', lazy(() => import('./AgencyClients/ClientAgencyClientsView').then(m => ({ default: m.ClientAgencyClientsView ?? m.default }))));

  // Fulfillment
  BridgeRegistry.register('FulfillmentView', lazy(() => import('./Fulfillment/ClientFulfillmentView').then(m => ({ default: m.FulfillmentView ?? m.default }))));
  BridgeRegistry.register('ff-production', lazy(() => import('./Fulfillment/views/ClientFulfillmentOverview').then(m => ({ default: m.FulfillmentOverview ?? m.default }))));

  // Portal
  BridgeRegistry.register('PortalView', lazy(() => import('./PortalView/ClientPortalView').then(m => ({ default: m.default }))));

  // Web Studio / Website Suite
  BridgeRegistry.register('WebStudioDashboard', lazy(() => import('./WebStudio/ClientWebStudioView').then(m => ({ default: (props: any) => React.createElement(m.WebStudioView, { ...props, initialTab: 'Analytics' }) }))));
  BridgeRegistry.register('WebsiteAnalytics', lazy(() => import('./WebStudio/ClientWebStudioView').then(m => ({ default: (props: any) => React.createElement(m.WebStudioView, { ...props, initialTab: 'Analytics' }) }))));
  BridgeRegistry.register('PayloadEditor', lazy(() => import('./CustomSuites/IFrameView/ClientIFrameView').then(m => ({ default: m.default }))));

  // Client Dashboard
  BridgeRegistry.register('ClientDashboardView', lazy(() => import('./ClientDashboard/ClientDashboardView').then(m => ({ default: m.ClientDashboardView ?? m.default }))));

  console.log('[AQUA Client] Discovery complete.');
}

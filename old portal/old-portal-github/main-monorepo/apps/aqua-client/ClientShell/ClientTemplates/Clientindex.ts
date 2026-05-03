import { BridgeRegistry } from '@aqua/bridge';
import { BridgeUIRegistry } from '@aqua/bridge/ui';
import { Users2, Compass, FileText, Layout, Users, BarChart3, Globe } from 'lucide-react';
import { performClientDiscovery } from './Clientdiscovery';

// 1. Import Suite Barrels (Index files)
import * as ClientManagement from './ClientManagement';
import * as AgencyClients from './AgencyClients';
import * as Fulfillment from './Fulfillment';
import * as ClientDashboard from './ClientDashboard';
import * as Portal from './PortalView';

// 2. Custom views (IFrame, etc.)
import { IFrameView, IFrameViewUI } from './CustomSuites/IFrameView';
// The UI definitions for Phases need to be imported or removed since they were basic views. 
// For now, removing UI registration for Onboarding and Live since they are now standard dashboard views 
// registered dynamically in discovery.ts not custom explicit Bridge UI injections.

/**
 * Register the Client Application as a standalone module.
 * Consolidates all client-facing suites into a unified "Clients Hub".
 */
export async function registerClientApp() {
  console.log('[AQUA Client] Registering Standalone Client App...');

  // 0. Perform Internal Discovery (Registers lazy components by ID)
  performClientDiscovery();

  // 1. Register UI token bags by view-id (Design Mode lookups via BridgeUIRegistry.resolve)
  if (ClientManagement.ui) BridgeUIRegistry.register('client-management', ClientManagement.ui, 'Client Management');
  if (AgencyClients.ui) BridgeUIRegistry.register('agency-clients', AgencyClients.ui, 'Agency Clients');
  if (Fulfillment.ui) BridgeUIRegistry.register('fulfillment-view', Fulfillment.ui, 'Fulfillment Hub');
  if (ClientDashboard.ui) BridgeUIRegistry.register('client-dashboard', ClientDashboard.ui, 'Client Dashboard');
  if (Portal.ui) BridgeUIRegistry.register('portal', Portal.ui, 'Client Portal');

  BridgeUIRegistry.register(IFrameViewUI);

  // 2. Register Standalone Views
  BridgeRegistry.register('iframe-view', IFrameView);

  // Fallback map directly inside autoComponentMap for SuiteRouter

  // 3. Register the Unified "Clients Hub" Suite
  // This is the primary entry point in the sidebar.
  BridgeRegistry.registerSuite({
    id: 'clients-hub-suite',
    section: 'Clients Hub',
    label: 'My Clients',
    icon: Users2,
    defaultView: 'agency-clients',
    subItems: [
      {
        id: 'agency-clients-list',
        label: 'Client Portfolio',
        icon: Users,
        view: 'agency-clients',
        component: AgencyClients.default
      },
      {
        id: 'phases-hub',
        label: 'Phases Hub',
        icon: Compass,
        view: 'phases-hub',
      },
      {
        id: 'client-resources',
        label: 'Client Resources',
        icon: FileText,
        view: 'client-resources',
      },
      {
        id: 'client-dashboard-view',
        label: 'Performance Dashboard',
        icon: BarChart3,
        view: 'client-dashboard',
        component: ClientDashboard.default
      },
      {
        id: 'client-portal',
        label: 'Client Portal',
        icon: Layout,
        view: 'portal',
        component: Portal.default
      }
    ],
  });

  // 4. Register the "Website" Suite
  BridgeRegistry.registerSuite({
    id: 'website-suite',
    section: 'Website',
    label: 'Website',
    icon: Globe,
    defaultView: 'WebStudioDashboard',
    subItems: [
      {
        id: 'web-dashboard',
        label: 'Dashboard',
        icon: Layout,
        view: 'WebStudioDashboard',
      },
      {
        id: 'website-editor',
        label: 'Website Editor',
        icon: FileText,
        view: 'PayloadEditor',
      },
      {
        id: 'web-analytics',
        label: 'Analytics',
        icon: BarChart3,
        view: 'WebsiteAnalytics',
      }
    ],
  });

  // 5. Register original standalone suites for internal routing
  BridgeRegistry.registerSuite(ClientManagement.registry);
  BridgeRegistry.registerSuite(AgencyClients.registry);
  BridgeRegistry.registerSuite(Fulfillment.registry);
  BridgeRegistry.registerSuite(ClientDashboard.registry);
  BridgeRegistry.registerSuite(Portal.registry);

  console.log('[AQUA Client] Standalone Client App registered.');
}

// Re-export for compatibility
export { registerClientApp as registerCustomSuites };

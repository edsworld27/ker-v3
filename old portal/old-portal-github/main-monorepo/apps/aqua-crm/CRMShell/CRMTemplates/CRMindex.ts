import { BridgeRegistry } from '@aqua/bridge/registry';

// Phase 2 templates — registries
import { PipelineRegistry, PipelineView } from './Pipeline';
import { DealsRegistry, DealsView } from './Deals';
import { ContactsRegistry, ContactsView } from './Contacts';
import { ActivitiesRegistry, ActivitiesView } from './Activities';
import { ReportsRegistry, ReportsView } from './Reports';

export async function registerCrmApp() {
  console.log('[AQUA CRM] Registering Standalone CRM App...');

  // Register suites (powers the sidebar groups + view-id resolution).
  BridgeRegistry.registerSuite(PipelineRegistry);
  BridgeRegistry.registerSuite(DealsRegistry);
  BridgeRegistry.registerSuite(ContactsRegistry);
  BridgeRegistry.registerSuite(ActivitiesRegistry);
  BridgeRegistry.registerSuite(ReportsRegistry);

  // Register concrete components against their canonical view-ids so
  // the App Shell renderer can resolve them.
  BridgeRegistry.registerAll({
    'crm-pipeline': PipelineView,
    'crm-deals': DealsView,
    'crm-contacts': ContactsView,
    'crm-activities': ActivitiesView,
    'crm-reports': ReportsView,
  });
}

export {
  PipelineRegistry,
  DealsRegistry,
  ContactsRegistry,
  ActivitiesRegistry,
  ReportsRegistry,
};

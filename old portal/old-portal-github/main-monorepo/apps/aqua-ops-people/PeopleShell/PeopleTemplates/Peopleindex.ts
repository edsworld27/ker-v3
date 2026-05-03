import { BridgeRegistry } from '@aqua/bridge/registry';
import { Users, UserCog } from 'lucide-react';
import { PeopleHRView } from './HR/PeopleHRView';
import { HrProvider } from './PeopleHrContext';

export const PeopleSuiteRegistry = {
  id: 'people-suite',
  section: 'People',
  label: 'People Hub',
  icon: Users,
  defaultView: 'people-hr',
  description: 'HR records, payroll readiness, and team operations.',
  category: 'People' as const,
  pricing: 'pro' as const,
  subItems: [
    {
      id: 'people-hr',
      label: 'HR',
      icon: UserCog,
      view: 'people-hr',
    },
  ],
};

export async function registerPeopleApp() {
  console.log('[AQUA People] Registering Standalone People App...');

  BridgeRegistry.registerSuite(PeopleSuiteRegistry);
  BridgeRegistry.registerProvider('people-suite', HrProvider);

  BridgeRegistry.registerAll({
    'people-hr': PeopleHRView,
    'people-suite': PeopleHRView,
    'hr-suite': PeopleHRView,
  });
}

export { PeopleHRView };

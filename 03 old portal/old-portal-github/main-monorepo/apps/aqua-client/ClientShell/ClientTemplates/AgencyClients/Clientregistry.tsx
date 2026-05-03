import { lazy } from 'react';
import { Users } from 'lucide-react';
import { SuiteTemplate } from '@ClientShell/bridge/types';

const AgencyClientsView = lazy(() => import('./ClientAgencyClientsView').then(m => ({ default: m.ClientAgencyClientsView })));

export const AgencyClientsRegistry: SuiteTemplate = {
  id: 'agency-clients',
  label: 'Agency Clients',
  icon: Users,
  component: AgencyClientsView,
  section: 'Revenue Hub'
};

export default AgencyClientsRegistry;

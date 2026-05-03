import { lazy } from 'react';
import { Layout } from 'lucide-react';
import { SuiteTemplate } from '@ClientShell/bridge/types';

const ClientDashboardView = lazy(() => import('./ClientDashboardView').then(m => ({ default: m.ClientDashboardView })));

export const ClientDashboardRegistry: SuiteTemplate = {
  id: 'client-dashboard',
  label: 'Client Dashboard',
  icon: Layout,
  component: ClientDashboardView,
  section: 'Experience'
};

export default ClientDashboardRegistry;

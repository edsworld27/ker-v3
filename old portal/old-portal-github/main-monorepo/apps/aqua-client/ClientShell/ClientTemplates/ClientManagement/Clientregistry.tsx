import { lazy } from 'react';
import { Users, List, Search, Activity } from 'lucide-react';
import { SuiteTemplate } from '@ClientShell/bridge/types';
const ClientManagementView = lazy(() => import('./ClientManagementView').then(m => ({ default: m.ClientManagementView })));
const ClientManagementOverview = lazy(() => import('./views/ClientManagementOverview').then(m => ({ default: m.ClientManagementOverview })));
const ClientListWidget = lazy(() => import('./components/ClientListWidget/ClientListWidget').then(m => ({ default: m.ClientListWidget })));
const ClientDirectoryWidget = lazy(() => import('./components/ClientDirectoryWidget/ClientDirectoryWidget').then(m => ({ default: m.ClientDirectoryWidget })));
const ClientActivityWidget = lazy(() => import('./components/ClientActivityWidget/ClientActivityWidget').then(m => ({ default: m.ClientActivityWidget })));

export const ClientManagementRegistry: SuiteTemplate = {
  id: 'client-management',
  label: 'Client Portfolio',
  icon: Users,
  component: ClientManagementView,
  section: 'Revenue Hub',
  requiredSuites: ['sales-suite', 'project-hub'], 
  subItems: [
    { 
      id: 'clients-overview', 
      label: 'Portfolio Overview',   
      icon: Users,   
      view: 'clients-overview',
      component: ClientManagementOverview
    },
    { 
      id: 'client-list', 
      label: 'Client List',   
      icon: List,   
      view: 'client-list',
      component: ClientListWidget
    },
    { 
      id: 'client-directory', 
      label: 'Directory',   
      icon: Search,   
      view: 'client-directory',
      component: ClientDirectoryWidget
    },
    { 
      id: 'client-activity', 
      label: 'Activity',   
      icon: Activity,   
      view: 'client-activity',
      component: ClientActivityWidget
    }
  ]
};

export default ClientManagementRegistry;

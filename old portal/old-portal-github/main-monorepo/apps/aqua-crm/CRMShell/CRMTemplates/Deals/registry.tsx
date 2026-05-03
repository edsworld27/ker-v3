import React from 'react';
import { Briefcase } from 'lucide-react';
import type { SuiteTemplate } from '@CRMShell/bridge/types/CRMindex';

export const DealsRegistry: SuiteTemplate = {
  id: 'crm-deals',
  label: 'Deals',
  icon: Briefcase,
  section: 'Sales',
  defaultView: 'crm-deals',
  component: React.lazy(() => import('./DealsView')),
  subItems: [
    {
      id: 'crm-deals-list',
      label: 'All Deals',
      icon: Briefcase,
      view: 'crm-deals',
    },
  ],
};

export default DealsRegistry;

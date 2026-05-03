// @ts-nocheck
import React from 'react';
import { SuiteTemplate } from '@ClientShell/bridge/types';
import { Layout } from 'lucide-react';

export const PortalRegistry: SuiteTemplate = {
  id: 'portal',
  label: 'Client Portal',
  icon: Layout,
  section: 'Experience',
  component: React.lazy(() => import('./ClientPortalView'))
};

export default PortalRegistry;

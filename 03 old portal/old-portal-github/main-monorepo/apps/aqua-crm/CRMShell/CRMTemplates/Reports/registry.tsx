import React from 'react';
import { BarChart3 } from 'lucide-react';
import type { SuiteTemplate } from '@aqua/bridge';

export const ReportsRegistry: SuiteTemplate = {
  id: 'crm-reports',
  label: 'Reports',
  icon: BarChart3,
  section: 'Insights',
  category: 'Analytics',
  description: 'KPI cards + Deals-by-Stage bar chart + 6-month revenue forecast. Live numbers from your pipeline.',
  pricing: 'pro',
  defaultView: 'crm-reports',
  component: React.lazy(() => import('./ReportsView')),
  configSchema: [
    { key: 'forecastHorizon', label: 'Forecast horizon (months)', type: 'select', options: ['3', '6', '12'], default: '6' },
    { key: 'fiscalYearStart', label: 'Fiscal year start',         type: 'select', options: ['Jan', 'Apr', 'Jul', 'Oct'], default: 'Jan' },
    { key: 'sendWeeklyDigest', label: 'Email weekly digest',      type: 'boolean', default: true },
  ],
  subItems: [
    {
      id: 'crm-reports-dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      view: 'crm-reports',
    },
  ],
};

export default ReportsRegistry;

import {
  TrendingUp,
  LayoutDashboard,
  KanbanSquare,
  Calendar,
  Inbox,
  FileText,
  Activity,
} from 'lucide-react';
import type { SuiteTemplate } from '@aqua/bridge';

import { SalesHubOverview } from './SalesHubOverview';
import { SalesPipelineView } from './SalesPipelineView';
import { SalesCalendarView } from './SalesCalendarView';
import { CrmInboxWidget } from './CrmInboxWidget';
import { ProposalsWidget } from './ProposalsWidget';
import { LeadTimelineWidget } from './LeadTimelineWidget';

export const SalesSuiteRegistry: SuiteTemplate = {
  id: 'sales-suite',
  label: 'Sales',
  icon: TrendingUp,
  section: 'Revenue Hub',
  category: 'Sales',
  description: 'Agency-internal sales hub: revenue KPIs, pipeline kanban, deal-close calendar, lead inbox, proposal tracking, per-lead activity timeline.',
  pricing: 'pro',
  defaultView: 'sales-hub-overview',
  configSchema: [
    { key: 'currency',   label: 'Currency',     type: 'select',  options: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'], default: 'USD' },
    { key: 'fiscalYearStart', label: 'Fiscal year start', type: 'select', options: ['Jan', 'Apr', 'Jul', 'Oct'], default: 'Jan' },
    { key: 'pipelineStages', label: 'Pipeline stages', type: 'multiselect', options: ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'], default: ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'] },
    { key: 'crmIntegration', label: 'Sync from CRM', type: 'boolean', default: true, description: 'Pulls inbound leads into the CRM Inbox widget.' },
  ],
  subItems: [
    {
      id: 'sales-hub-overview',
      label: 'Overview',
      icon: LayoutDashboard,
      view: 'sales-hub-overview',
      component: SalesHubOverview,
    },
    {
      id: 'sales-pipeline',
      label: 'Pipeline',
      icon: KanbanSquare,
      view: 'sales-pipeline',
      component: SalesPipelineView,
    },
    {
      id: 'sales-calendar',
      label: 'Calendar',
      icon: Calendar,
      view: 'sales-calendar',
      component: SalesCalendarView,
    },
    {
      id: 'crm-inbox',
      label: 'CRM Inbox',
      icon: Inbox,
      view: 'crm-inbox',
      component: CrmInboxWidget,
    },
    {
      id: 'proposals',
      label: 'Proposals',
      icon: FileText,
      view: 'proposals',
      component: ProposalsWidget,
    },
    {
      id: 'lead-timeline',
      label: 'Lead Timeline',
      icon: Activity,
      view: 'lead-timeline',
      component: LeadTimelineWidget,
    },
  ],
};

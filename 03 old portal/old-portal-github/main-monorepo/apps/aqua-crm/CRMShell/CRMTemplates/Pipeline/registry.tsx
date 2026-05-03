import React from 'react';
import { Kanban } from 'lucide-react';
import type { SuiteTemplate } from '@aqua/bridge';

export const PipelineRegistry: SuiteTemplate = {
  id: 'crm-pipeline',
  label: 'Pipeline',
  icon: Kanban,
  section: 'Sales',
  category: 'Sales',
  description: 'Visual kanban board of deals across stages — drag cards between Lead, Qualified, Proposal, Negotiation, Closed Won/Lost.',
  pricing: 'free',
  defaultView: 'crm-pipeline',
  component: React.lazy(() => import('./PipelineView')),
  configSchema: [
    { key: 'defaultOwner',  label: 'Default deal owner',  type: 'string',  description: 'Auto-assigned when a new deal is created.', placeholder: 'maya@aqua.io' },
    { key: 'showProbability', label: 'Show probability %', type: 'boolean', default: true },
    { key: 'autoArchiveDays', label: 'Auto-archive Closed Won after N days', type: 'number', default: 30 },
  ],
  subItems: [
    {
      id: 'crm-pipeline-board',
      label: 'Board',
      icon: Kanban,
      view: 'crm-pipeline',
    },
  ],
};

export default PipelineRegistry;

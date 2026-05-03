import React from 'react';
import { MessageSquare } from 'lucide-react';
import type { SuiteTemplate } from '@aqua/bridge';

export const ActivitiesRegistry: SuiteTemplate = {
  id: 'crm-activities',
  label: 'Activities',
  icon: MessageSquare,
  section: 'Activity',
  category: 'Sales',
  description: 'Vertical timeline of every call, email, meeting, and note — filter by type, sort by recency, or drill into a single deal.',
  pricing: 'free',
  defaultView: 'crm-activities',
  component: React.lazy(() => import('./ActivitiesView')),
  configSchema: [
    { key: 'gmailSync',    label: 'Sync Gmail',      type: 'boolean', default: false, description: 'Two-way sync of sent + received email as activities.' },
    { key: 'callRecording', label: 'Record calls',   type: 'boolean', default: false, description: 'Captures audio for review (requires Stripe billing).' },
    { key: 'retentionDays', label: 'Retention (days)', type: 'number', default: 365 },
  ],
  subItems: [
    {
      id: 'crm-activities-feed',
      label: 'Feed',
      icon: MessageSquare,
      view: 'crm-activities',
    },
  ],
};

export default ActivitiesRegistry;

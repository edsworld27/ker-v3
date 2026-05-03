import React from 'react';
import { Users } from 'lucide-react';
import type { SuiteTemplate } from '@aqua/bridge';

export const ContactsRegistry: SuiteTemplate = {
  id: 'crm-contacts',
  label: 'Contacts',
  icon: Users,
  section: 'Contacts',
  category: 'Sales',
  description: 'Searchable directory of every contact across deals — click a card to see their profile, recent deals, and activity history.',
  pricing: 'free',
  defaultView: 'crm-contacts',
  component: React.lazy(() => import('./ContactsView')),
  configSchema: [
    { key: 'duplicateDetection', label: 'Auto-merge duplicate contacts',  type: 'boolean', default: true,  description: 'Match on email + company.' },
    { key: 'enrichmentEnabled',  label: 'Enrich via Clearbit-style API',  type: 'boolean', default: false, description: 'Pulls public profile data when a contact is added.' },
  ],
  subItems: [
    {
      id: 'crm-contacts-directory',
      label: 'Directory',
      icon: Users,
      view: 'crm-contacts',
    },
  ],
};

export default ContactsRegistry;

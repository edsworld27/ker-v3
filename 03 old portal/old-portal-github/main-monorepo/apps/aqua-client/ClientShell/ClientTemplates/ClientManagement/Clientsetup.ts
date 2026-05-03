import { SuiteSetup } from '@ClientShell/bridge/types';

export const ClientManagementSetup: SuiteSetup = {
  configurationInstructions: "Manage your client portfolio settings. Configure onboarding workflows and data visibility for client accounts.",
  features: [
    {
      id: 'automated-onboarding',
      label: 'Automated Onboarding',
      description: 'Trigger automatic welcome sequences and document requests for new clients.',
      enabled: true,
      defaultValue: true
    },
    {
      id: 'client-self-provisioning',
      label: 'Self-Provisioning',
      description: 'Allow clients to initialize their own CMS nodes and technical infrastructure.',
      enabled: false,
      defaultValue: false
    }
  ],
  availableComponents: [
    {
      id: 'clients-overview',
      label: 'Portfolio Overview',
      description: 'Real-time monitoring of all active client accounts and their health scores.'
    },
    {
      id: 'client-list',
      label: 'Detailed Client Roster',
      description: 'Tabular view of client data with advanced filtering and exporting.'
    }
  ]
};

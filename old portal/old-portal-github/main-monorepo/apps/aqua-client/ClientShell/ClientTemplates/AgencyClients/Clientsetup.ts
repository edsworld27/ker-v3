import { SuiteSetup } from '@ClientShell/bridge/types';

export const AgencyClientsSetup: SuiteSetup = {
  configurationInstructions: "Configure the Agency Client Roster. Define visibility and permissions for agency-wide client listings.",
  features: [
    {
      id: 'roster-export',
      label: 'Roster Exporting',
      description: 'Enable internal staff to export the client roster to CSV/XLS.',
      enabled: true,
      defaultValue: true
    }
  ],
  availableComponents: [
    {
      id: 'agency-clients-list',
      label: 'Global Agency Roster',
      description: 'Master list of all accounts across the agency.'
    }
  ]
};

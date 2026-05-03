import { Agency } from '@HostShell/bridge/types';

export interface MasterConfig {
  agency: Agency;
  customPages: any[];
  customSidebarLinks: any[];
  theme: {
    primaryColor: string;
    secondaryColor: string;
    logoUrl: string | null;
  };
}

export const initialMasterConfig: MasterConfig = {
  agency: {
    id: 'agency-1',
    name: 'Default Agency',
    isConfigured: false,
  },
  customPages: [],
  customSidebarLinks: [],
  theme: {
    primaryColor: '#4f46e5', // Indigo-600
    secondaryColor: '#10b981', // Emerald-500
    logoUrl: null,
  },
};

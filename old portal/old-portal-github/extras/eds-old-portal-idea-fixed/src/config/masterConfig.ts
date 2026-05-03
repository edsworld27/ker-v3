import { Agency, CustomPage, CustomSidebarLink } from '../types';

export interface MasterConfig {
  agency: Agency;
  customPages: CustomPage[];
  customSidebarLinks: CustomSidebarLink[];
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

import React, { createContext, useContext, ReactNode } from 'react';
import { AppUser, Client, AppTicket, Project, ProjectTask, LogEntry, PortalView, CustomSidebarLink, AgencyTemplate, Agency, CustomPage } from '../types';

interface AppContextType {
  users: AppUser[];
  setUsers: React.Dispatch<React.SetStateAction<AppUser[]>>;
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  tickets: AppTicket[];
  setTickets: React.Dispatch<React.SetStateAction<AppTicket[]>>;
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  tasks: ProjectTask[];
  setTasks: React.Dispatch<React.SetStateAction<ProjectTask[]>>;
  activityLogs: LogEntry[];
  setActivityLogs: React.Dispatch<React.SetStateAction<LogEntry[]>>;
  userProfile: any;
  setUserProfile: React.Dispatch<React.SetStateAction<any>>;
  impersonatedUserEmail: string | null;
  setImpersonatedUserEmail: React.Dispatch<React.SetStateAction<string | null>>;
  impersonatingClientId: string | null;
  setImpersonatingClientId: React.Dispatch<React.SetStateAction<string | null>>;
  appTheme: string;
  setAppTheme: React.Dispatch<React.SetStateAction<string>>;
  appLogo: string | null;
  setAppLogo: React.Dispatch<React.SetStateAction<string | null>>;
  loginPortalType: 'standard' | 'branded';
  setLoginPortalType: React.Dispatch<React.SetStateAction<'standard' | 'branded'>>;
  portalView: PortalView | string;
  setPortalView: React.Dispatch<React.SetStateAction<PortalView | string>>;
  addLog: (action: string, details: string, type: 'auth' | 'impersonation' | 'action' | 'system', clientId?: string) => void;
  currentUser: AppUser | undefined;
  isAgencyAdmin: boolean;
  isAgencyEmployee: boolean;
  customSidebarLinks: CustomSidebarLink[];
  setCustomSidebarLinks: React.Dispatch<React.SetStateAction<CustomSidebarLink[]>>;
  activeTemplate: AgencyTemplate | null;
  setActiveTemplate: React.Dispatch<React.SetStateAction<AgencyTemplate | null>>;
  agencies: Agency[];
  setAgencies: React.Dispatch<React.SetStateAction<Agency[]>>;
  currentAgency: Agency | undefined;
  activeAgencyId: string;
  customPages: CustomPage[];
  setCustomPages: React.Dispatch<React.SetStateAction<CustomPage[]>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode, value: AppContextType }> = ({ children, value }) => {
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

/**
 * designMockData — Rich mock data for Design Mode previews.
 * Re-exports from the central mockData store so design mode shows
 * fully-populated views without live integrations.
 */
import {
  initialActivityLogs,
  initialClients,
  initialTickets,
  initialProjects,
  initialProjectTasks,
  initialIntegrations,
  initialUsers,
  initialDeals,
} from './PeoplemockData';

export const designActivityLogs = initialActivityLogs;
export const designClients = initialClients;
export const designTickets = initialTickets;
export const designProjects = initialProjects;
export const designIntegrations = initialIntegrations;
export const designUsers = initialUsers;
export const designProjectTasks = initialProjectTasks;
export const designDeals = initialDeals;

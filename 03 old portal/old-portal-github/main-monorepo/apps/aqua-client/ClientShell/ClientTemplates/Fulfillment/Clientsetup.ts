import { SuiteSetup } from '@ClientShell/bridge/types';

export const FulfillmentSuiteSetup: SuiteSetup = {
  configurationInstructions: "Optimize your production pipeline. Configure project delivery parameters, enable real-time logistics tracking, and select operational oversight widgets.",
  features: [
    {
      id: 'automated-task-routing',
      label: 'AI Task Orchestration',
      description: 'Automatically assign tasks to the most qualified staff based on workload and skill level.',
      enabled: true,
      defaultValue: true
    },
    {
      id: 'logistics-integration',
      label: 'Global Transit Sync',
      description: 'Connect to external carriers for real-time tracking of physical deliverables.',
      enabled: false,
      defaultValue: false
    },
    {
      id: 'burn-rate-alerts',
      label: 'Financial Burn Monitor',
      description: 'Receive instant alerts when a project exceeds its budgeted labor allocation.',
      enabled: true,
      defaultValue: true
    }
  ],
  availableComponents: [
    {
      id: 'project-timeline',
      label: 'Global Project Timeline',
      description: 'Visual Gantt-style representation of all active production nodes.'
    },
    {
      id: 'task-kanban',
      label: 'Omni-Channel Kanban',
      description: 'Drag-and-drop workflow management for internal and client-facing tasks.'
    },
    {
      id: 'fulfillment-stats',
      label: 'Operations Pulse',
      description: 'Real-time metrics for delivery speed, task completion, and backlog volume.'
    }
  ]
};

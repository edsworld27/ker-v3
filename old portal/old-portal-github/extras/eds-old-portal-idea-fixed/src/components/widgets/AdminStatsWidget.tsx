import React from 'react';
import { DashboardWidget } from '../shared/DashboardWidget';
import { useAppContext } from '../../context/AppContext';
import { useRoleConfig } from '../../hooks/useRoleConfig';
import { useTheme } from '../../hooks/useTheme';

// Define widget configurations based on role
const WIDGET_CONFIG = {
  founder: [
    { id: 'clients-count', icon: 'users', label: 'Clients', valueKey: 'clients.length', color: 'bg-indigo-500' },
    { id: 'active-projects', icon: 'briefcase', label: 'Active Projects', valueKey: 'activeProjects.length', color: 'bg-blue-500' },
    { id: 'user-clients', icon: 'user-cog', label: 'My Clients', valueKey: 'userClients.length', color: 'bg-purple-500' },
  ],
  manager: [
    { id: 'clients-count', icon: 'users', label: 'Clients', valueKey: 'clients.length', color: 'bg-indigo-500' },
    { id: 'active-projects', icon: 'briefcase', label: 'Active Projects', valueKey: 'activeProjects.length', color: 'bg-blue-500' },
    { id: 'pipeline-status', icon: 'trending-up', label: 'Pipeline', valueKey: 'pipeline-status', color: 'bg-cyan-500' }, // Placeholder value
  ],
  employee: [
    { id: 'tasks-count', icon: 'list-checks', label: 'Tasks', valueKey: 'tasks.length', color: 'bg-emerald-500' },
    { id: 'upcoming-deadlines', icon: 'calendar-check', label: 'Deadlines', valueKey: 'upcomingDeadlines.length', color: 'bg-amber-500' }, // Placeholder value
    { id: 'my-clients', icon: 'user-cog', label: 'My Clients', valueKey: 'userClients.length', color: 'bg-purple-500' },
  ],
};

export const AdminStatsWidget: React.FC = () => {
  const context = useAppContext();
  const { label } = useRoleConfig();
  const theme = useTheme();

  // Determine role-specific widgets
  const getWidgetsForRole = () => {
    switch (context.currentUser?.role) {
      case 'Founder': return WIDGET_CONFIG.founder;
      case 'AgencyManager': return WIDGET_CONFIG.manager;
      case 'AgencyEmployee': return WIDGET_CONFIG.employee;
      default: return WIDGET_CONFIG.employee; // Default to employee if role is unknown
    }
  };

  const widgetsToRender = getWidgetsForRole();

  const resolvedValue = (widget: typeof WIDGET_CONFIG.founder[0]): string => {
    let value: string = '';
    if (widget.valueKey === 'clients.length') value = context.clients.length.toString();
    if (widget.valueKey === 'activeProjects.length') value = context.clients.filter(c => c.stage !== 'live').length.toString();
    if (widget.valueKey === 'userClients.length') value = context.clients.filter(c => c.assignedEmployees?.includes(context.currentUser?.id || 0)).length.toString();
    if (widget.valueKey === 'tasks.length') value = context.tasks.length.toString();
    // Placeholder values for other keys if needed, or they could be fetched from context
    if (widget.valueKey === 'pipeline-status') value = 'N/A'; // Placeholder
    if (widget.valueKey === 'upcomingDeadlines.length') value = 'N/A'; // Placeholder
    return value;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {widgetsToRender.map(widget => (
        <DashboardWidget
          key={widget.id}
          icon={widget.icon as any} // Assuming icons are compatible or need mapping
          label={label(widget.label as any)}
          value={resolvedValue(widget)!}
          trend={(widget as any).trend} // Trend optional — added to config if needed
          color={widget.color as any}
          // Theme primary color for icons if needed, or use colors defined in config
        />
      ))}
    </div>
  );
};

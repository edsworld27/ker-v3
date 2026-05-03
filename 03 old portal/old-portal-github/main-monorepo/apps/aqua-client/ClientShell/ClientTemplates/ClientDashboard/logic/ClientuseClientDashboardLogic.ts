import { useMemo } from 'react';
import { useAppContext } from '@ClientShell/bridge/ClientAppContext';
import { CLIENT_DASHBOARD_STAGES } from './ClientmockData';

export function useClientDashboardLogic() {
  const context = useAppContext();
  const { 
    currentUser, 
    clients, 
    activeClient, 
    impersonatingClientId,
    handleViewChange,
    tasks = [],
    tickets = [],
    users = []
  } = context;

  const clientId = impersonatingClientId ?? activeClient?.id ?? currentUser?.clientId;
  const client = useMemo(() => clients.find(c => c.id === clientId), [clients, clientId]);

  const clientTasks = useMemo(() => tasks.filter(t => t.clientId === clientId), [tasks, clientId]);
  const clientTickets = useMemo(() => tickets.filter(t => t.clientId === clientId), [tickets, clientId]);

  const doneTasks = clientTasks.filter(t => t.status === 'Done').length;
  const openTickets = clientTickets.filter(t => t.status !== 'Resolved').length;
  const resourceCount = (client?.resources ?? []).length;

  const progress = useMemo(() => {
    if (clientTasks.length === 0) return 0;
    return Math.round((doneTasks / clientTasks.length) * 100);
  }, [clientTasks, doneTasks]);

  const agencyTeam = useMemo(() => 
    users.filter(u => client?.assignedEmployees?.includes(u.id)),
    [users, client]
  );

  const stageInfo = client?.stage ? (CLIENT_DASHBOARD_STAGES as any)[client.stage] : null;

  const helpers = {
    initials: (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
    avatarColor: (name: string) => {
      const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
      let hash = 0;
      for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
      return colors[Math.abs(hash) % colors.length];
    }
  };

  return {
    client,
    clientTasks,
    clientTickets,
    doneTasks,
    openTickets,
    resourceCount,
    progress,
    agencyTeam,
    stageInfo,
    setPortalView: handleViewChange,
    helpers
  };
}

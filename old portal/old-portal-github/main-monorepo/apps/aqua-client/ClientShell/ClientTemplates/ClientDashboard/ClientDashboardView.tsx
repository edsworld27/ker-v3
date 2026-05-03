import React from 'react';
import {
  CheckCircle2,
  TicketCheck,
  FolderOpen,
  Users,
  CheckSquare,
  AlertCircle,
  Box,
  ShieldCheck,
  Activity,
  Settings,
} from 'lucide-react';
import {
  Page,
  Card,
  KpiCard,
  Button,
  Badge,
  Avatar,
  EmptyState,
} from '@aqua/bridge/ui/kit';
import { useClientDashboardLogic } from './logic/ClientuseClientDashboardLogic';

type TaskStatus = 'Done' | 'In Progress' | 'Review' | 'To Do' | string;

const STATUS_TONE = (status: TaskStatus) => {
  if (status === 'Done') return 'success' as const;
  if (status === 'In Progress') return 'indigo' as const;
  if (status === 'Review') return 'warning' as const;
  return 'neutral' as const;
};

export const ClientDashboardView: React.FC = () => {
  const {
    client,
    clientTasks,
    openTickets,
    doneTasks,
    resourceCount,
    progress,
    agencyTeam,
    stageInfo,
  } = useClientDashboardLogic();

  if (!client) {
    return (
      <Page>
        <Card padding="lg">
          <EmptyState
            icon={AlertCircle}
            title="Authorization required"
            description="Pick a client workspace from the sidebar to load this dashboard."
          />
        </Card>
      </Page>
    );
  }

  const inProgress = clientTasks.filter(t => t.status === 'In Progress').length;

  return (
    <Page>
      <div className="flex items-center justify-between gap-4 mb-8 pb-8 border-b border-white/5">
        <div className="flex items-center gap-4 min-w-0">
          <Avatar name={client.name} size="lg" />
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] uppercase tracking-[0.18em] text-slate-500 font-medium">Client</span>
              {stageInfo ? <Badge tone="indigo">{stageInfo.label}</Badge> : null}
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight truncate">{client.name}</h1>
            <p className="text-sm text-slate-400 mt-1">
              {inProgress} active task{inProgress === 1 ? '' : 's'}
              {openTickets > 0 ? <span className="text-amber-400"> · {openTickets} open ticket{openTickets === 1 ? '' : 's'}</span> : null}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" icon={ShieldCheck}>Protocol</Button>
          <Button variant="ghost" size="sm" icon={Settings} aria-label="Settings" />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Task execution" value={`${doneTasks}/${clientTasks.length}`} delta={`${progress}% complete`} trend="up" icon={CheckSquare} />
        <KpiCard label="Open tickets" value={openTickets} icon={TicketCheck} />
        <KpiCard label="Resources" value={resourceCount} icon={FolderOpen} />
        <KpiCard label="Engagement" value={`${progress}%`} icon={Activity} />
      </div>

      {clientTasks.length > 0 ? (
        <Card padding="md" className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-white">Engagement progress</h2>
              <p className="text-xs text-slate-400 mt-0.5">Core objective completion</p>
            </div>
            <div className="text-2xl font-semibold text-white tabular-nums">{progress}%</div>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-indigo-500 transition-[width] duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <Card padding="md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white">Operational stream</h3>
            <span className="text-[11px] text-slate-500">Latest tasks</span>
          </div>
          <ul className="divide-y divide-white/5 -mx-2">
            {clientTasks.slice(0, 8).map(task => (
              <li key={task.id} className="px-2 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/5 flex items-center justify-center text-slate-400 shrink-0">
                    {task.status === 'Done' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    ) : (
                      <Box className="w-4 h-4" />
                    )}
                  </div>
                  <span className={`text-sm truncate ${task.status === 'Done' ? 'text-slate-500 line-through' : 'text-white font-medium'}`}>
                    {task.title}
                  </span>
                </div>
                <Badge tone={STATUS_TONE(task.status)}>{task.status}</Badge>
              </li>
            ))}
            {clientTasks.length === 0 ? (
              <li className="text-center text-xs text-slate-500 py-10">No tasks yet.</li>
            ) : null}
          </ul>
        </Card>

        <Card padding="md">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-indigo-300" />
            <h3 className="text-base font-semibold text-white">Agency team</h3>
          </div>
          <ul className="space-y-3">
            {agencyTeam.slice(0, 6).map(u => (
              <li key={u.id} className="flex items-center gap-3">
                <Avatar name={u.name} size="md" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{u.name}</p>
                  <p className="text-[11px] uppercase tracking-wider text-slate-500 truncate">{u.role}</p>
                </div>
              </li>
            ))}
            {agencyTeam.length === 0 ? (
              <li className="text-xs text-slate-500">No team members assigned.</li>
            ) : null}
          </ul>
        </Card>
      </div>
    </Page>
  );
};

export default ClientDashboardView;

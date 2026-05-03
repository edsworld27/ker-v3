import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, ArrowLeft, Plus, Users, Briefcase, UserCog, ListChecks, CalendarCheck, TrendingUp } from 'lucide-react'; // Import necessary icons
import { useAppContext } from '../../context/AppContext';
import { useModalContext } from '../../context/ModalContext';
import { useRoleConfig } from '../../hooks/useRoleConfig';
import { useTheme } from '../../hooks/useTheme';
import { DashboardWidget } from '../shared/DashboardWidget';
import { adminDashboardUI as ui } from '../views/AdminDashboardView/ui'; // Import UI config from original view

// Helper to map icon names to actual components
const iconMap: Record<string, React.ElementType> = {
  'users': Users,
  'briefcase': Briefcase,
  'user-cog': UserCog,
  'list-checks': ListChecks,
  'calendar-check': CalendarCheck,
  'trending-up': TrendingUp,
};

export const AdminActivityWidget: React.FC = () => {
  const context = useAppContext();
  const { setShowAddClientModal } = useModalContext();
  const { label } = useRoleConfig();
  const theme = useTheme();

  const isAgencyAdmin = context.isAgencyAdmin; // Assuming isAgencyAdmin is available in context

  const widgetsToRender = React.useMemo(() => {
    switch (context.currentUser?.role) {
      case 'Founder': return ui.widgets.founder;
      case 'AgencyManager': return ui.widgets.manager;
      default: return ui.widgets.employee; // Default to employee
    }
  }, [context.currentUser?.role, context.clients, context.users, context.tasks]); // Re-evaluate if context changes

  const resolvedValue = (widget: typeof ui.widgets.founder[0]) => {
    let value = widget.value;
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
    <motion.div
      key={ui.page.motionKey + '-activity'} // Unique key for motion
      initial={ui.page.animation.initial}
      animate={ui.page.animation.animate}
      className={`${ui.page.padding} ${ui.page.maxWidth}`}
    >
      <div className={`${ui.header.layout} ${ui.header.gap}`}>
        <div>
          <h2 className={ui.header.title.base}>
            {context.currentUser?.role === 'Founder' ? ui.header.title.founder :
             context.currentUser?.role === 'AgencyManager' ? ui.header.title.manager :
             ui.header.title.employee}
          </h2>
          <p className={ui.header.subtitle.base}>
            {context.currentUser?.role === 'Founder' ? ui.header.subtitle.founder :
             context.currentUser?.role === 'AgencyManager' ? ui.header.subtitle.manager :
             ui.header.subtitle.employee}
          </p>
        </div>
        <div className={ui.header.actions.layout}>
          {isAgencyAdmin && (
            <button 
              onClick={() => setShowAddClientModal(true)}
              className={ui.header.actions.addClientBtn.layout}
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              <ui.header.actions.addClientBtn.icon className={ui.header.actions.addClientBtn.iconSize} />
              {ui.header.actions.addClientBtn.label}
            </button>
          )}
        </div>
      </div>

      {/* Metrics Widgets (AdminStatsWidget's responsibility, but duplicated here for now) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {widgetsToRender.map(widget => (
          <DashboardWidget
            key={widget.id}
            icon={widget.icon || Users} // widget.icon is already a Lucide component
            label={label(widget.label as any)}
            value={resolvedValue(widget)!}
            trend={widget.trend}
            color={widget.color as any}
          />
        ))}
      </div>

      {/* Main Grid for Role-Specific Content (could be considered Activity/Alerts) */}
      <div className={ui.mainGrid.layout}>
        {context.currentUser?.role === 'Founder' ? (
          <>
            {/* Operator Performance */}
            <div className={ui.mainGrid.cards.base}>
              <h3 className={ui.mainGrid.cards.title}>Operator Performance</h3>
              <div className={ui.mainGrid.cards.list}>
                {[
                  { name: 'Sarah Jenkins', role: 'Agency Manager', clients: 12, rating: 4.9 },
                  { name: 'Michael Chen', role: 'Agency Manager', clients: 8, rating: 4.7 },
                  { name: 'Emma Wilson', role: 'Agency Manager', clients: 15, rating: 4.8 }
                ].map((op, i) => (
                  <div key={i} className={ui.mainGrid.cards.operator.item}>
                    <div className={ui.mainGrid.cards.operator.leftGroup}>
                      <div 
                        className={ui.mainGrid.cards.operator.avatar}
                        style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)', color: 'var(--color-primary)' }}
                      >
                        {op.name.charAt(0)}
                      </div>
                      <div>
                        <div className={ui.mainGrid.cards.operator.name}>{op.name}</div>
                        <div className={ui.mainGrid.cards.operator.role}>{op.role}</div>
                      </div>
                    </div>
                    <div className={ui.mainGrid.cards.operator.rightGroup}>
                      <div className={ui.mainGrid.cards.operator.rating}>{op.rating} ★</div>
                      <div className={ui.mainGrid.cards.operator.clients}>{op.clients} {label('clients')}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Revenue Clients */}
            <div className={ui.mainGrid.cards.base}>
              <h3 className={ui.mainGrid.cards.title}>Top Revenue {label('clients')}</h3>
              <div className={ui.mainGrid.cards.listTight}>
                {context.clients.slice(0, 4).map((client) => (
                  <div key={client.id} className={ui.mainGrid.cards.revenue.item}>
                    <div className={ui.mainGrid.cards.revenue.leftGroup}>
                      <div 
                        className={ui.mainGrid.cards.revenue.avatar}
                        style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)', color: 'var(--color-primary)' }}
                      >
                        {client.name.charAt(0)}
                      </div>
                      <div>
                        <div className={ui.mainGrid.cards.revenue.name}>{client.name}</div>
                        <div className={ui.mainGrid.cards.revenue.stage}>{client.stage}</div>
                      </div>
                    </div>
                    <div className={ui.mainGrid.cards.revenue.amount} style={{ color: 'var(--color-primary)' }}>£2,450/mo</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : context.currentUser?.role === 'AgencyManager' ? (
          <>
            {/* Pipeline Status */}
            <div className={ui.mainGrid.cards.base}>
              <h3 className={ui.mainGrid.cards.title}>Pipeline Status</h3>
              <div className={ui.mainGrid.cards.list}>
                {[
                  { stage: 'Discovery', count: 5, color: 'bg-indigo-500' },
                  { stage: 'Onboarding', count: 3, color: 'bg-blue-500' },
                  { stage: 'Design', count: 8, color: 'bg-purple-500' },
                  { stage: 'Development', count: 12, color: 'bg-cyan-500' },
                  { stage: 'Live', count: 45, color: 'bg-emerald-500' }
                ].map((s, i) => (
                  <div key={i} className={ui.mainGrid.cards.pipeline.item}>
                    <div className={ui.mainGrid.cards.pipeline.header}>
                      <span className={ui.mainGrid.cards.pipeline.stageLabel}>{s.stage}</span>
                      <span className={ui.mainGrid.cards.pipeline.count}>{s.count}</span>
                    </div>
                    <div className={ui.mainGrid.cards.pipeline.track}>
                      <div 
                        className={`${ui.mainGrid.cards.pipeline.fill} ${s.color}`} 
                        style={{ width: `${(s.count / 73) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Workload */}
            <div className={ui.mainGrid.cards.base}>
              <h3 className={ui.mainGrid.cards.title}>{label('team')} Workload</h3>
              <div className={ui.mainGrid.cards.listTight}>
                {context.users.filter((u: any) => u.role === 'AgencyEmployee').slice(0, 4).map((user: any) => (
                  <div key={user.id} className={ui.mainGrid.cards.workload.item}>
                    <div className={ui.mainGrid.cards.workload.leftGroup}>
                      <div className={ui.mainGrid.cards.workload.avatar}>
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className={ui.mainGrid.cards.workload.name}>{user.name}</div>
                        <div className={ui.mainGrid.cards.workload.clients}>4 Active {label('clients')}</div>
                      </div>
                    </div>
                    <div className={ui.mainGrid.cards.workload.statusBadge}>
                      Available
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Task List */}
            <div className={ui.mainGrid.cards.base}>
              <h3 className={ui.mainGrid.cards.title}>Your {label('tasks')}</h3>
              <div className={ui.mainGrid.cards.listTight}>
                {[
                  { task: 'Review Design Feedback', client: 'Acme Corp', priority: 'High' },
                  { task: 'Update Staging Environment', client: 'Global Tech', priority: 'Medium' },
                  { task: 'Prepare Onboarding Docs', client: 'Nexus Solutions', priority: 'Low' }
                ].map((t, i) => (
                  <div key={i} className={ui.mainGrid.cards.tasks.item}>
                    <div className={ui.mainGrid.cards.tasks.leftGroup}>
                      <div className={`${ui.mainGrid.cards.tasks.dotBase} ${
                        t.priority === 'High' ? ui.mainGrid.cards.tasks.dotHigh :
                        t.priority === 'Medium' ? ui.mainGrid.cards.tasks.dotMedium : ui.mainGrid.cards.tasks.dotLow
                      }`} />
                      <div>
                        <div className={ui.mainGrid.cards.tasks.taskName}>{t.task}</div>
                        <div className={ui.mainGrid.cards.tasks.client}>{t.client}</div>
                      </div>
                    </div>
                    <button className={ui.mainGrid.cards.tasks.checkBtn}>
                      <CheckCircle2 className={ui.mainGrid.cards.tasks.checkIcon} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Deadlines */}
            <div className={ui.mainGrid.cards.base}>
              <h3 className={ui.mainGrid.cards.title}>Upcoming Deadlines</h3>
              <div className={ui.mainGrid.cards.listTight}>
                {[
                  { item: 'Design V2 Approval', date: 'Mar 26', status: 'Pending' },
                  { item: 'Beta Launch', date: 'Mar 28', status: 'On Track' },
                  { item: 'Client Sync', date: 'Mar 30', status: 'Scheduled' }
                ].map((d, i) => (
                  <div key={i} className={ui.mainGrid.cards.deadlines.item}>
                    <div className={ui.mainGrid.cards.deadlines.leftGroup}>
                      <div 
                        className={ui.mainGrid.cards.deadlines.avatar}
                        style={{ color: 'var(--color-primary)' }}
                      >
                        <span className={ui.mainGrid.cards.deadlines.dateMonth}>{d.date.split(' ')[0]}</span>
                        <span>{d.date.split(' ')[1]}</span>
                      </div>
                      <div className={ui.mainGrid.cards.deadlines.taskName}>{d.item}</div>
                    </div>
                    <div className={ui.mainGrid.cards.deadlines.status}>{d.status}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

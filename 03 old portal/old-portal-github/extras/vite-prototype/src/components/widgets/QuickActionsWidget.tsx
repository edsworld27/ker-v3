import React from 'react';
import { UserPlus, FolderPlus, CheckSquare, Ticket, MessageSquare, Zap } from 'lucide-react';
import { useModalContext } from '../../context/ModalContext';
import { useTheme } from '../../hooks/useTheme';
import { useRoleConfig } from '../../hooks/useRoleConfig';

const ACTIONS = [
  { label: 'Add Client',    icon: UserPlus,     key: 'addClient'    },
  { label: 'New Project',   icon: FolderPlus,   key: 'newProject'   },
  { label: 'New Task',      icon: CheckSquare,  key: 'newTask'      },
  { label: 'New Ticket',    icon: Ticket,       key: 'newTicket'    },
  { label: 'Inbox',         icon: MessageSquare,key: 'inbox'        },
] as const;

type ActionKey = typeof ACTIONS[number]['key'];

export function QuickActionsWidget() {
  const {
    setShowAddClientModal,
    setShowNewProjectModal,
    setShowNewTaskModal,
    setShowTicketModal,
    setShowInboxModal,
  } = useModalContext();
  const theme = useTheme();
  const { label } = useRoleConfig();

  const handlers: Record<ActionKey, () => void> = {
    addClient:  () => setShowAddClientModal(true),
    newProject: () => setShowNewProjectModal(true),
    newTask:    () => setShowNewTaskModal(true),
    newTicket:  () => setShowTicketModal(true),
    inbox:      () => setShowInboxModal(true),
  };

  return (
    <div className="glass-card p-4 rounded-2xl border border-white/5">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-4 h-4" style={{ color: theme.primary }} />
        <h3 className="text-sm font-semibold">Quick Actions</h3>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {ACTIONS.map(({ label: actionLabel, icon: Icon, key }) => (
          <button
            key={key}
            onClick={handlers[key]}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-xs font-medium transition-all text-left"
          >
            <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: theme.primary }} />
            {actionLabel}
          </button>
        ))}
      </div>
    </div>
  );
}

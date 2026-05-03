import React from 'react';
import { motion } from 'motion/react';
import { StageDropdown } from '../../shared/StageDropdown';
import { ClientStage } from '../../../types';
import { useRoleConfig } from '../../../hooks/useRoleConfig';
import { useTheme } from '../../../hooks/useTheme';
import { useAppContext } from '../../../context/AppContext';
import { useModalContext } from '../../../context/ModalContext';
import { agencyClientsViewUI } from './ui';

interface AgencyClientsViewProps {
  clients?: any[];
  setShowAddClientModal?: (show: boolean) => void;
  handleImpersonate?: (clientId: string) => void;
  canImpersonate?: boolean;
  onEditClient?: (client: any) => void;
  onUpdateClientStage?: (clientId: string, stage: ClientStage) => void;
}

export function AgencyClientsView(props: AgencyClientsViewProps) {
  const context = useAppContext();
  const { setShowAddClientModal: setModalShow } = useModalContext();

  // Resolve values from props or context
  const clients = props.clients || context.clients;
  const setShowAddClientModal = props.setShowAddClientModal || setModalShow;
  const handleImpersonate = props.handleImpersonate || context.handleImpersonate;
  const canImpersonate = props.canImpersonate !== undefined ? props.canImpersonate : context.canCurrentUserImpersonate();
  const onEditClient = props.onEditClient || context.handleEditClient;
  const onUpdateClientStage = props.onUpdateClientStage || context.handleUpdateClientStage;

  const { label } = useRoleConfig();
  const theme = useTheme();
  const ui = agencyClientsViewUI;

  return (
    <motion.div
      key="agency-clients"
      initial={ui.motion.initial}
      animate={ui.motion.animate}
      className={ui.container}
    >
      <div className={ui.header.container}>
        <div className={ui.header.textContainer}>
          <h2 className={ui.header.title}>{label('clients')}</h2>
          <p className={ui.header.description}>{ui.text.description}</p>
        </div>
        <button 
          onClick={() => setShowAddClientModal(true)}
          className={`${ui.header.button} text-white`}
          style={{ 
            backgroundColor: theme.primary,
            boxShadow: `0 10px 15px -3px ${theme.primary}33` 
          }}
        >
          <ui.header.buttonIcon className={ui.header.buttonIconClass} />
          {ui.text.addButton}
        </button>
      </div>

      <div className={ui.grid}>
        {clients.map(client => (
          <div key={client.id} className={ui.card.container}>
            <div className={ui.header.container}>
              <div className={ui.card.header.info}>
                <div 
                  className={ui.card.header.iconContainer}
                  style={{ backgroundColor: `${theme.primary}1A`, color: theme.primary }}
                >
                  <ui.card.header.icon className={ui.card.header.iconClass} />
                </div>
                <div className={ui.card.header.textContainer}>
                  <h3 
                    className={ui.card.header.title}
                    style={{ '--hover-color': theme.primary } as React.CSSProperties}
                  >
                    {client.name}
                  </h3>
                  <StageDropdown currentStage={client.stage} onUpdate={(stage) => onUpdateClientStage(client.id, stage)} />
                </div>
              </div>
              <button 
                onClick={() => onEditClient(client)}
                className={ui.card.header.editButton}
              >
                <ui.card.header.editIcon className={ui.card.header.editIconClass} />
              </button>
            </div>

            <div className={ui.card.stats.container}>
              <div className={`${ui.card.stats.item} ${ui.card.stats.borderItem}`}>
                <span className={ui.card.stats.label}>{ui.text.labelAccess}</span>
                <span className={ui.card.stats.value}>{client.permissions.length} {ui.text.labelModules}</span>
              </div>
              <div className={ui.card.stats.item}>
                <span className={ui.card.stats.label}>{ui.text.labelContact}</span>
                <span className={`${ui.card.stats.value} ${ui.card.stats.email}`}>{client.email}</span>
              </div>
            </div>

            {canImpersonate && (
              <div className={ui.card.actions.container}>
                <button
                  onClick={() => handleImpersonate(client.id)}
                  className={`${ui.card.actions.impersonateButton} text-amber-400 group-hover:bg-amber-600 group-hover:text-white`}
                >
                  <ui.card.actions.impersonateIcon className={ui.card.actions.impersonateIconClass} />
                  {ui.text.viewWorkspace}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { settingsModalUI as ui } from './ui';
import { useRoleConfig } from '../../../hooks/useRoleConfig';
import { useTheme } from '../../../hooks/useTheme';
import { AppUser } from '../../../types';
import { useAppContext } from '../../../context/AppContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddUser: () => void;
  onEditUser: (user: AppUser) => void;
  onDeleteUser: (id: number) => void;
  onDeleteRole: (id: string) => void;
  onExportData: () => void;
  onExportWebsite: () => void;
  exporting: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenAddUser,
  onEditUser,
  onDeleteUser,
  onDeleteRole,
  onExportData,
  onExportWebsite,
  exporting,
}) => {
  const [activeTab, setActiveTab] = useState('users');
  const { users, agencyConfig } = useAppContext();
  const { label } = useRoleConfig();
  const theme = useTheme();

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return (
          <div>
            <div className={ui.contentArea.header.base}>
              <h3 className={ui.contentArea.header.title}>{label('team') ? `Manage ${label('team')}` : ui.text.manageUsers}</h3>
              <button onClick={onOpenAddUser} className={ui.contentArea.header.button.base} style={theme.primaryBgStyle}>
                <ui.contentArea.header.button.icon className={ui.contentArea.header.button.iconSize} />
                Add Member
              </button>
            </div>
            <div className={ui.contentArea.list.base}>
              {users.map(user => (
                <div key={user.id} className={ui.contentArea.list.item.base}>
                  <div className={ui.contentArea.list.item.info}>
                    <div className={ui.contentArea.list.item.avatar}>{user.avatar}</div>
                    <div>
                      <div className={ui.contentArea.list.item.name}>{user.name}</div>
                      <div className={ui.contentArea.list.item.detail}>{user.email}</div>
                    </div>
                  </div>
                  <div className={ui.contentArea.list.item.actions.base}>
                    <button onClick={() => onEditUser(user)} className={ui.contentArea.list.item.actions.button}>
                      <ui.contentArea.list.item.actions.editIcon className={ui.contentArea.list.item.actions.iconSize} />
                    </button>
                    <button onClick={() => onDeleteUser(user.id)} className={ui.contentArea.list.item.actions.button}>
                      <ui.contentArea.list.item.actions.deleteIcon className={ui.contentArea.list.item.actions.iconSize} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'roles':
        return (
          <div>
            <div className={ui.contentArea.header.base}>
              <h3 className={ui.contentArea.header.title}>{ui.text.manageRoles}</h3>
            </div>
            <div className={ui.contentArea.list.base}>
              {Object.entries(agencyConfig.roles).map(([roleId, role]) => (
                <div key={roleId} className={ui.contentArea.list.item.base}>
                  <div className={ui.contentArea.list.item.info}>
                    <div>
                      <div className={ui.contentArea.list.item.name}>{role.displayName}</div>
                      <div className={ui.contentArea.list.item.detail}>
                        {role.allowedViews === '*' ? 'All' : role.allowedViews.length} {ui.text.permissionsCount}
                      </div>
                    </div>
                  </div>
                  <div className={ui.contentArea.list.item.actions.base}>
                    {!role.isSystem && (
                      <button onClick={() => onDeleteRole(roleId)} className={ui.contentArea.list.item.actions.button}>
                        <ui.contentArea.list.item.actions.deleteIcon className={ui.contentArea.list.item.actions.iconSize} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'data':
        return (
          <div>
            <h3 className={ui.contentArea.header.title}>{ui.text.dataExport}</h3>
            <div className={ui.contentArea.exportSection.base}>
              <div className={ui.contentArea.exportSection.card}>
                <h4 className={ui.contentArea.exportSection.title}>{ui.text.exportDataTitle}</h4>
                <p className={ui.contentArea.exportSection.description}>{ui.text.exportDataDesc}</p>
                <button onClick={onExportData} className={ui.contentArea.exportSection.button}>{ui.text.exportDataButton}</button>
              </div>
              <div className={ui.contentArea.exportSection.card}>
                <h4 className={ui.contentArea.exportSection.title}>{ui.text.exportWebsiteTitle}</h4>
                <p className={ui.contentArea.exportSection.description}>{ui.text.exportWebsiteDesc}</p>
                <button onClick={onExportWebsite} disabled={exporting} className={ui.contentArea.exportSection.button}>
                  {exporting ? ui.text.exportingText : ui.text.exportWebsiteButton}
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className={ui.overlay}>
          <motion.div initial={ui.modal.animation.initial} animate={ui.modal.animation.animate} exit={ui.modal.animation.exit} onClick={(e) => e.stopPropagation()} className={ui.modal.base}>
            <div className={ui.header.base}>
              <div className={ui.header.titleWrapper}>
                <ui.header.icon className={ui.header.iconSize} />
                <h2 className={ui.header.titleStyle}>{ui.header.title}</h2>
              </div>
              <button onClick={onClose} className={ui.header.closeButton.base}>
                <ui.header.closeButton.icon className={ui.header.closeButton.iconSize} />
              </button>
            </div>
            <div className={ui.mainContent.base}>
              <aside className={ui.sidebar.base}>
                <nav className={ui.sidebar.list}>
                  {ui.sidebar.tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`${ui.sidebar.item.base} ${activeTab === tab.id ? ui.sidebar.item.active : ui.sidebar.item.inactive}`}>
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </aside>
              <main className={ui.contentArea.base}>{renderContent()}</main>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

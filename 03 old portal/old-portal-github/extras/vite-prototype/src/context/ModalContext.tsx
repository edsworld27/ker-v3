import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ModalContextType {
  showPlanModal: boolean;
  setShowPlanModal: (show: boolean) => void;
  showAgencyCommunicateModal: boolean;
  setShowAgencyCommunicateModal: (show: boolean) => void;
  showSupportTicketsModal: boolean;
  setShowSupportTicketsModal: (show: boolean) => void;
  showNewProjectModal: boolean;
  setShowNewProjectModal: (show: boolean) => void;
  showNewTaskModal: boolean;
  setShowNewTaskModal: (show: boolean) => void;
  showAddUserModal: boolean;
  setShowAddUserModal: (show: boolean) => void;
  showSettingsModal: boolean;
  setShowSettingsModal: (show: boolean) => void;
  showGlobalTasksModal: boolean;
  setShowGlobalTasksModal: (show: boolean) => void;
  showInboxModal: boolean;
  setShowInboxModal: (show: boolean) => void;
  showAppLauncherModal: boolean;
  setShowAppLauncherModal: (show: boolean) => void;
  showTicketModal: boolean;
  setShowTicketModal: (show: boolean) => void;
  showMobileMenu: boolean;
  setShowMobileMenu: (show: boolean) => void;
  showAddClientModal: boolean;
  setShowAddClientModal: (show: boolean) => void;
  showEditClientModal: boolean;
  setShowEditClientModal: (show: boolean) => void;
  showConfirmationModal: boolean;
  setShowConfirmationModal: (show: boolean) => void;
  showAddRoleModal: boolean;
  setShowAddRoleModal: (show: boolean) => void;
  showEmployeeProfileModal: boolean;
  setShowEmployeeProfileModal: (show: boolean) => void;
  showEmployeeManagementModal: boolean;
  setShowEmployeeManagementModal: (show: boolean) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showAgencyCommunicateModal, setShowAgencyCommunicateModal] = useState(false);
  const [showSupportTicketsModal, setShowSupportTicketsModal] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showGlobalTasksModal, setShowGlobalTasksModal] = useState(false);
  const [showInboxModal, setShowInboxModal] = useState(false);
  const [showAppLauncherModal, setShowAppLauncherModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showEditClientModal, setShowEditClientModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [showEmployeeProfileModal, setShowEmployeeProfileModal] = useState(false);
  const [showEmployeeManagementModal, setShowEmployeeManagementModal] = useState(false);

  return (
    <ModalContext.Provider value={{
      showPlanModal, setShowPlanModal,
      showAgencyCommunicateModal, setShowAgencyCommunicateModal,
      showSupportTicketsModal, setShowSupportTicketsModal,
      showNewProjectModal, setShowNewProjectModal,
      showNewTaskModal, setShowNewTaskModal,
      showAddUserModal, setShowAddUserModal,
      showSettingsModal, setShowSettingsModal,
      showGlobalTasksModal, setShowGlobalTasksModal,
      showInboxModal, setShowInboxModal,
      showAppLauncherModal, setShowAppLauncherModal,
      showTicketModal, setShowTicketModal,
      showMobileMenu, setShowMobileMenu,
      showAddClientModal, setShowAddClientModal,
      showEditClientModal, setShowEditClientModal,
      showConfirmationModal, setShowConfirmationModal,
      showAddRoleModal, setShowAddRoleModal,
      showEmployeeProfileModal, setShowEmployeeProfileModal,
      showEmployeeManagementModal, setShowEmployeeManagementModal
    }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModalContext = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModalContext must be used within a ModalProvider');
  }
  return context;
};

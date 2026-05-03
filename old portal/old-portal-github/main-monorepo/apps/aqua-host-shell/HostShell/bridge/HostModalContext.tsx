"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ModalState {
  name: string;
  props: any;
}

interface ModalContextType {
  activeModal: ModalState | null;
  openModal: (name: string, props?: any) => void;
  closeModal: () => void;
  closeAllModals: () => void;
  setShowTicketModal?: (show: boolean) => void;
  setShowNewProjectModal?: (show: boolean) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeModal, setActiveModal] = useState<ModalState | null>(null);

  const openModal = (name: string, props: any = {}) => {
    setActiveModal({ name, props });
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const closeAllModals = () => {
    setActiveModal(null);
  };

  return (
    <ModalContext.Provider value={{
      activeModal,
      openModal,
      closeModal,
      closeAllModals
    }}>
      {children}
    </ModalContext.Provider>
  );
};

// Permissive default — returned when ModalProvider isn't mounted higher up.
// Keeps optional `openModal?.()` callsites working without crashing the tree.
const noopModal: ModalContextType = {
  activeModal: null,
  openModal: () => {},
  closeModal: () => {},
  closeAllModals: () => {},
};

export const useModalContext = (): ModalContextType => {
  const context = useContext(ModalContext);
  return context ?? noopModal;
};

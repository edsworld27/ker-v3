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

const noopModal: any = new Proxy({}, {
  get(_t, prop) {
    if (prop === 'open' || prop === 'close' || prop === 'openModal' || prop === 'closeModal' || prop === 'toggle') return () => {};
    if (prop === 'isOpen' || prop === 'visible') return false;
    if (prop === 'name' || prop === 'modalName') return null;
    return undefined;
  },
});

export const useModalContext = () => {
  const context = useContext(ModalContext);
  return context ?? noopModal;
};

"use client";
import React, { ReactNode, useEffect } from 'react';
import { InboxProvider } from '@HostShell/bridge/HostInboxContext';
import { ModalProvider, useModalContext } from '@HostShell/bridge/HostModalContext';
import { AIChatPanel } from '@aqua/bridge/ui/AIChatPanel';

interface HostBridgeHubProps {
  children: ReactNode;
}

/**
 * Listens for global `aqua:open-modal` CustomEvents dispatched by plugin
 * views (which can't import host context directly) and routes them through
 * the host's ModalProvider.openModal.
 */
const ModalEventBridge: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { openModal } = useModalContext();
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onOpen = (e: Event) => {
      const detail = (e as CustomEvent<{ name?: string; props?: any }>).detail;
      if (detail?.name) openModal(detail.name, detail.props ?? {});
    };
    window.addEventListener('aqua:open-modal', onOpen);
    return () => window.removeEventListener('aqua:open-modal', onOpen);
  }, [openModal]);
  return <>{children}</>;
};

/**
 * HostBridgeHub
 *
 * Wraps the host shell with the providers it owns:
 *   - ModalProvider for modal state (inbox, notifications, etc.)
 *   - InboxProvider for cross-app messages
 *   - ModalEventBridge translates plugin-emitted CustomEvents into modal opens
 */
export const HostBridgeHub: React.FC<HostBridgeHubProps> = ({ children }) => {
  return (
    <ModalProvider>
      <ModalEventBridge>
        <InboxProvider>
          {children}
          <AIChatPanel />
        </InboxProvider>
      </ModalEventBridge>
    </ModalProvider>
  );
};

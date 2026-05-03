"use client";
import React, { ReactNode } from 'react';
import { InboxProvider } from '@CRMShell/bridge/CRMInboxContext';

interface BridgeHubProps {
  children: ReactNode;
}

/**
 * BridgeHub
 *
 * Provides global context wrappers for the CRM app.
 * Template suite providers have been removed — each micro-app manages
 * its own context independently in the iframe architecture.
 */
export const CRMBridgeHub: React.FC<BridgeHubProps> = ({ children }) => {
  return (
    <InboxProvider>
      {children}
    </InboxProvider>
  );
};

// Alias for backward compatibility
export const BridgeHub = CRMBridgeHub;

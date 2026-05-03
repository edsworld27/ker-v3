"use client";
import React, { ReactNode } from 'react';
import { InboxProvider } from '@PeopleShell/bridge/PeopleInboxContext';

interface BridgeHubProps {
  children: ReactNode;
}

/**
 * BridgeHub
 *
 * Provides global context wrappers for the People app.
 * Template suite providers have been removed — each micro-app manages
 * its own context independently in the iframe architecture.
 */
export const PeopleBridgeHub: React.FC<BridgeHubProps> = ({ children }) => {
  return (
    <InboxProvider>
      {children}
    </InboxProvider>
  );
};

// Alias for backward compatibility
export const BridgeHub = PeopleBridgeHub;

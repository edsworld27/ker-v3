import React, { useEffect, useState } from 'react';
import { AppMarketplace, type AppMarketplaceSuite } from '@aqua/bridge/ui/AppMarketplace';
import { useAppContext } from '@ClientShell/bridge/ClientAppContext';
import { SUITE_METADATA } from '@ClientShell/bridge/ClientSuiteRegistry';
import { BridgeRegistry } from '@ClientShell/bridge/ClientRegistration';

export const TemplateHubView: React.FC = () => {
  const { enabledSuiteIds, toggleSuite, currentUserEmail } = useAppContext();
  const [, setTick] = useState(0);
  useEffect(() => BridgeRegistry.subscribe(() => setTick(t => t + 1)), []);

  return (
    <AppMarketplace
      appLabel="Client marketplace"
      authorizedEmail={currentUserEmail}
      suites={SUITE_METADATA.all as AppMarketplaceSuite[]}
      enabledSuiteIds={enabledSuiteIds}
      onToggle={toggleSuite}
    />
  );
};

export default TemplateHubView;

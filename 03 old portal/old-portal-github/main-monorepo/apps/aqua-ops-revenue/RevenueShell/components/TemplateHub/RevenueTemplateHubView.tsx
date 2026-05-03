import React, { useEffect, useState } from 'react';
import { AppMarketplace, type AppMarketplaceSuite } from '@aqua/bridge/ui/AppMarketplace';
import { useRevenueContext } from '@RevenueShell/bridge/RevenueContext';
import { SUITE_METADATA } from '@RevenueShell/bridge/RevenueSuiteRegistry';
import { RevenueRegistration } from '@RevenueShell/bridge/RevenueRegistration';

export const TemplateHubView: React.FC = () => {
  const { enabledSuiteIds, toggleSuite, currentUserEmail } = useRevenueContext();
  const [, setTick] = useState(0);
  useEffect(() => RevenueRegistration.subscribe(() => setTick(t => t + 1)), []);

  return (
    <AppMarketplace
      appLabel="Revenue marketplace"
      authorizedEmail={currentUserEmail}
      suites={SUITE_METADATA.all as AppMarketplaceSuite[]}
      enabledSuiteIds={enabledSuiteIds}
      onToggle={toggleSuite}
    />
  );
};

export default TemplateHubView;

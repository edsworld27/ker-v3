import React, { useEffect, useState } from 'react';
import { AppMarketplace, type AppMarketplaceSuite } from '@aqua/bridge/ui/AppMarketplace';
import { useFinanceContext } from '@FinanceShell/bridge/FinanceContext';
import { SUITE_METADATA } from '@FinanceShell/bridge/FinanceSuiteRegistry';
import { FinanceRegistration } from '@FinanceShell/bridge/FinanceRegistration';

export const TemplateHubView: React.FC = () => {
  const { enabledSuiteIds, toggleSuite, currentUserEmail } = useFinanceContext();
  const [, setTick] = useState(0);
  useEffect(() => FinanceRegistration.subscribe(() => setTick(t => t + 1)), []);

  return (
    <AppMarketplace
      appLabel="Finance marketplace"
      authorizedEmail={currentUserEmail}
      suites={SUITE_METADATA.all as AppMarketplaceSuite[]}
      enabledSuiteIds={enabledSuiteIds}
      onToggle={toggleSuite}
    />
  );
};

export default TemplateHubView;

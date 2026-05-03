import React, { useEffect, useState } from 'react';
import { AppMarketplace, type AppMarketplaceSuite } from '@aqua/bridge/ui/AppMarketplace';
import { usePeopleContext } from '@PeopleShell/bridge/PeopleContext';
import { SUITE_METADATA } from '@PeopleShell/bridge/PeopleSuiteRegistry';
import { PeopleRegistration } from '@PeopleShell/bridge/PeopleRegistration';

export const TemplateHubView: React.FC = () => {
  const { enabledSuiteIds, toggleSuite, currentUserEmail } = usePeopleContext();
  const [, setTick] = useState(0);
  useEffect(() => PeopleRegistration.subscribe(() => setTick(t => t + 1)), []);

  return (
    <AppMarketplace
      appLabel="People marketplace"
      authorizedEmail={currentUserEmail}
      suites={SUITE_METADATA.all as AppMarketplaceSuite[]}
      enabledSuiteIds={enabledSuiteIds}
      onToggle={toggleSuite}
    />
  );
};

export default TemplateHubView;

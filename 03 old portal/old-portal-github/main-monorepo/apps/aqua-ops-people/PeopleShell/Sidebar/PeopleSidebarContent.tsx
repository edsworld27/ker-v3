/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppSidebar } from '@aqua/bridge/ui/AppSidebar';
import { usePeopleContext } from '@PeopleShell/bridge/PeopleContext';
import { useModalContext } from '@PeopleShell/bridge/PeopleModalContext';
import { getSidebarItems } from './PeopleSidebarLogic';
import { BridgeRegistry } from '@PeopleShell/bridge/PeopleRegistration';

export const PeopleSidebarContent: React.FC = () => {
  const ctx = usePeopleContext();
  const { openModal } = useModalContext();
  const [, setTick] = useState(0);
  useEffect(() => BridgeRegistry.subscribe(() => setTick(t => t + 1)), []);

  const sections = getSidebarItems({
    currentUser: ctx.currentUser as never,
    activeClient: ctx.activeClient,
    portalView: ctx.portalView,
    isAgencyRole: ctx.isAgencyRole,
    impersonatingClientId: ctx.impersonatingClientId,
    hasPermission: ctx.hasPermission,
    handleViewChange: ctx.handleViewChange,
    agencyConfig: ctx.agencyConfig,
    appMode: ctx.appMode,
    setAppMode: ctx.setAppMode,
    handleImpersonate: ctx.handleImpersonate,
    enabledSuiteIds: ctx.enabledSuiteIds,
    openModal,
  });

  return (
    <AppSidebar
      collapsed={ctx.sidebarCollapsed}
      setCollapsed={ctx.setSidebarCollapsed}
      agencyName={ctx.currentAgency?.name}
      agencyLogo={ctx.currentAgency?.logo}
      appLabel="People"
      primaryColorVar="var(--people-widget-primary-color-1)"
      sections={sections as never}
      portalView={ctx.portalView}
      sidebarStack={ctx.sidebarStack as never}
      popSidebarLevel={ctx.popSidebarLevel}
      pushSidebarLevel={ctx.pushSidebarLevel as never}
      handleViewChange={ctx.handleViewChange}
      openModal={openModal}
      appMode={ctx.appMode}
      setAppMode={ctx.setAppMode}
      currentUser={ctx.currentUser as never}
      userAvatar={ctx.userProfile?.avatar}
      isDropdownOpen={ctx.isDropdownOpen}
      setIsDropdownOpen={ctx.setIsDropdownOpen}
      dropdownRef={ctx.dropdownRef}
      canImpersonate={ctx.canCurrentUserImpersonate}
      users={(ctx.users || []) as never}
      setImpersonatedUserEmail={ctx.setImpersonatedUserEmail}
      addLog={ctx.addLog}
      handleLogout={ctx.handleLogout}
    />
  );
};

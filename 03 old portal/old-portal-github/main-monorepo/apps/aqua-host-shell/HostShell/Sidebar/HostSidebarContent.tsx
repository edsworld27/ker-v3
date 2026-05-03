/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck, ArrowLeft, LogOut, ChevronRight, ChevronLeft, Settings,
  CheckSquare, Clock, Bell,
} from 'lucide-react';
import { useHostContext } from '@HostShell/bridge/HostContext';
import { useModalContext } from '@HostShell/bridge/HostModalContext';
import { getSidebarItems } from './HostSidebarLogic';
import { HostRegistration } from '@HostShell/bridge/HostRegistration';
import { Search } from './components/HostSearch';
import { SidebarItem } from './components/HostSidebarItem';

interface SidebarItemRecord {
  id: string;
  label: string;
  icon: React.ElementType;
  view?: string;
  active?: boolean;
  badge?: string | number;
  onClick?: () => void;
  children?: SidebarItemRecord[];
}

const isAnyChildActive = (
  items: SidebarItemRecord[],
  portalView: string | undefined,
): boolean =>
  items.some(item => {
    if (item.active || (item.view && portalView === item.view)) return true;
    return item.children ? isAnyChildActive(item.children, portalView) : false;
  });

export const HostSidebarContent: React.FC = () => {
  const {
    currentUser,
    userProfile,
    activeClient,
    portalView,
    isAgencyRole,
    impersonatingClientId,
    hasPermission,
    handleViewChange,
    agencyConfig,
    appMode,
    setAppMode,
    handleImpersonate,
    sidebarCollapsed,
    setSidebarCollapsed,
    sidebarStack,
    pushSidebarLevel,
    popSidebarLevel,
    currentAgency,
    handleLogout,
    enabledSuiteIds,
    isDropdownOpen,
    setIsDropdownOpen,
    dropdownRef,
    setImpersonatedUserEmail,
    addLog,
    canCurrentUserImpersonate,
    users,
  } = useHostContext();

  const [, setTick] = useState(0);
  useEffect(() => {
    return HostRegistration.subscribe(() => setTick(t => t + 1));
  }, []);

  const { openModal } = useModalContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedSections, setCollapsedSections] = useState<string[]>([]);

  const toggleSection = (id: string) => {
    setCollapsedSections(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    );
  };

  const allSections = getSidebarItems({
    currentUser: currentUser as never,
    activeClient,
    portalView,
    isAgencyRole,
    impersonatingClientId,
    hasPermission,
    handleViewChange,
    agencyConfig,
    appMode,
    setAppMode,
    handleImpersonate,
    enabledSuiteIds,
    openModal,
  });

  const filteredSections = allSections
    .map(section => {
      if (!searchQuery) return section;
      const filteredItems = section.items.filter((item: SidebarItemRecord) =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      return { ...section, items: filteredItems };
    })
    .filter(section => section.items.length > 0);

  const renderItem = (item: SidebarItemRecord, isChild = false) => (
    <SidebarItem
      key={item.id}
      icon={item.icon}
      label={item.label}
      active={
        item.active ||
        (item.view ? portalView === item.view : false) ||
        (item.children ? isAnyChildActive(item.children, portalView) : false)
      }
      onClick={() => {
        if (item.children && item.children.length > 0) {
          pushSidebarLevel(item.label, item.children, item.icon);
        }
        if (item.onClick) {
          item.onClick();
        } else if (item.view) {
          handleViewChange(item.view);
        }
      }}
      collapsed={sidebarCollapsed}
      badge={item.badge}
      hasChildren={!!(item.children && item.children.length > 0)}
      isChild={isChild}
    />
  );

  const renderDrillDown = () => {
    const currentLevel = sidebarStack[sidebarStack.length - 1];
    const parentLevel = sidebarStack[sidebarStack.length - 2];
    const backTitle = parentLevel ? parentLevel.title : 'Back';
    return (
      <div className="space-y-1">
        {!sidebarCollapsed && (
          <button
            onClick={popSidebarLevel}
            className="w-full flex items-center gap-2 h-9 px-3 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.04] transition-colors mb-2 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-xs font-medium tracking-wide">{backTitle}</span>
          </button>
        )}
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2 px-3 mb-3 pb-2 border-b border-white/5">
            {currentLevel.icon && (
              <currentLevel.icon
                className="w-4 h-4"
                style={{ color: 'var(--host-widget-primary-color-1)' }}
              />
            )}
            <span className="text-[11px] uppercase tracking-[0.18em] font-medium text-slate-400">
              {currentLevel.title}
            </span>
          </div>
        )}
        {(currentLevel.items || []).map((item: SidebarItemRecord) => renderItem(item))}
      </div>
    );
  };

  return (
    <motion.aside
      initial={false}
      animate={{
        width: sidebarCollapsed ? 76 : 268,
        x:
          typeof window !== 'undefined' && window.innerWidth < 768 ? -280 : 0,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 35 }}
      className="fixed md:relative h-full bg-[#08080a] md:bg-transparent border-r border-white/5 flex flex-col z-[60] group/sidebar shadow-2xl md:shadow-none backdrop-blur-xl md:backdrop-blur-none"
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className={`px-4 pt-5 pb-4 flex items-center gap-3 ${sidebarCollapsed ? 'justify-center px-3' : ''}`}>
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
            style={{
              backgroundColor: 'var(--host-widget-primary-color-1)',
              boxShadow: '0 8px 20px -8px color-mix(in srgb, var(--host-widget-primary-color-1) 60%, transparent)',
            }}
          >
            {currentAgency?.logo ? (
              <img src={currentAgency.logo} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-white" />
            )}
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <div className="text-sm font-semibold tracking-tight text-white truncate">
                {currentAgency?.name || 'Aqua Portal'}
              </div>
              <div className="text-[10px] uppercase tracking-[0.15em] text-slate-500 font-medium truncate">
                {appMode === 'settings' ? 'Settings' : 'Workspace'}
              </div>
            </div>
          )}
        </div>

        {/* Search */}
        <Search
          collapsed={sidebarCollapsed}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {/* Navigation */}
        <nav className="flex-1 px-3 overflow-y-auto custom-scrollbar">
          {sidebarStack.length > 0
            ? renderDrillDown()
            : filteredSections.map((section, index) => {
                const isCollapsed = section.id && collapsedSections.includes(section.id);
                return (
                  <div key={index} className="mb-5">
                    {!sidebarCollapsed && (
                      <div
                        className={`flex items-center justify-between px-3 mb-1.5 ${section.isCollapsible ? 'cursor-pointer group/section' : ''}`}
                        onClick={() => section.isCollapsible && section.id && toggleSection(section.id)}
                      >
                        <div className="text-[10px] uppercase tracking-[0.18em] font-medium text-slate-500 group-hover/section:text-slate-300 transition-colors">
                          {section.section}
                        </div>
                        {section.isCollapsible && (
                          <ChevronRight
                            className={`w-3 h-3 text-slate-600 transition-transform duration-200 ${!isCollapsed ? 'rotate-90' : ''}`}
                          />
                        )}
                      </div>
                    )}

                    <AnimatePresence initial={false}>
                      {!isCollapsed && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.18 }}
                          className="overflow-hidden space-y-0.5"
                        >
                          {section.items.map((item: SidebarItemRecord) => renderItem(item))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
        </nav>

        {/* Bottom actions */}
        <div className="px-3 pt-3 pb-4 border-t border-white/5 space-y-2">
          {/* Quick actions */}
          <div className={`flex items-center ${sidebarCollapsed ? 'flex-col gap-1' : 'gap-1 px-1'}`}>
            <IconButton label="Tasks" onClick={() => openModal('GlobalTasksModal')}>
              <CheckSquare className="w-4 h-4" />
            </IconButton>
            <IconButton label="Inbox" onClick={() => openModal('InboxModal')} dot="primary">
              <Clock className="w-4 h-4" />
            </IconButton>
            <IconButton label="Notifications" onClick={() => openModal('NotificationsModal')} dot="rose">
              <Bell className="w-4 h-4" />
            </IconButton>
          </div>

          {/* User dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`w-full flex items-center gap-3 h-12 px-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-colors ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold text-white shadow-md shrink-0"
                style={{ backgroundColor: 'var(--host-widget-primary-color-1)' }}
              >
                {userProfile?.avatar || 'U'}
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs font-semibold text-white truncate">{currentUser?.name}</p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium truncate">{currentUser?.role}</p>
                </div>
              )}
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className={`absolute ${sidebarCollapsed ? 'left-full ml-2 bottom-0' : 'left-0 right-0 bottom-full mb-2'} bg-[#0e0e10] border border-white/10 rounded-xl shadow-2xl z-[70] overflow-hidden min-w-[220px]`}
                >
                  <div className="p-1.5">
                    {canCurrentUserImpersonate ? (
                      <>
                        <div className="px-3 py-1.5 text-[10px] text-slate-500 uppercase tracking-[0.15em] font-medium">
                          Switch user
                        </div>
                        {(users || []).slice(0, 5).map((u) => (
                          <button
                            key={u.id}
                            onClick={() => {
                              setImpersonatedUserEmail(u.email);
                              setIsDropdownOpen(false);
                              addLog('Impersonation', `Switched to ${u.name}`, 'impersonation');
                            }}
                            className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-white/[0.06] hover:text-white rounded-lg transition-colors"
                          >
                            {u.name}
                          </button>
                        ))}
                        <div className="border-t border-white/5 my-1.5" />
                        <button
                          onClick={() => {
                            handleViewChange('workspaces');
                            setIsDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-white/[0.06] hover:text-white rounded-lg transition-colors"
                        >
                          View workspaces
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setIsDropdownOpen(false)}
                        className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-white/[0.06] hover:text-white rounded-lg transition-colors"
                      >
                        Profile details
                      </button>
                    )}
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-rose-300 hover:bg-rose-500/10 hover:text-rose-200 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Log out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={() => {
              for (let i = 0; i < sidebarStack.length; i++) {
                popSidebarLevel();
              }
              if (appMode === 'settings') {
                setAppMode('operations');
                handleViewChange('dashboard');
              } else {
                setAppMode('settings');
                handleViewChange('global-settings');
              }
            }}
            className={`w-full flex items-center gap-3 h-10 px-3 rounded-lg transition-colors ${
              sidebarCollapsed ? 'justify-center px-0' : ''
            } ${
              appMode === 'settings'
                ? 'bg-white/[0.05] text-white'
                : 'text-slate-400 hover:bg-white/[0.03] hover:text-white'
            }`}
          >
            <Settings className="w-[18px] h-[18px] shrink-0" />
            {!sidebarCollapsed && (
              <span className="text-sm font-medium">
                {appMode === 'settings' ? 'Exit settings' : 'Settings'}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="absolute bottom-10 -right-3 w-6 h-6 rounded-full flex items-center justify-center shadow-lg border border-white/10 bg-[#0e0e10] hover:bg-[#16161a] transition-colors z-30"
        aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {sidebarCollapsed ? (
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5 text-slate-300" />
        )}
      </button>
    </motion.aside>
  );
};

interface IconButtonProps {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  dot?: 'primary' | 'rose';
}

const IconButton: React.FC<IconButtonProps> = ({ label, onClick, children, dot }) => (
  <button
    onClick={onClick}
    title={label}
    aria-label={label}
    className="relative flex-1 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
  >
    {children}
    {dot ? (
      <span
        className={`absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full ${dot === 'rose' ? 'bg-rose-500' : ''}`}
        style={dot === 'primary' ? { backgroundColor: 'var(--host-widget-primary-color-1)' } : undefined}
      />
    ) : null}
  </button>
);

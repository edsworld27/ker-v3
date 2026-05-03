/**
 * @aqua/bridge/ui/AppSidebar — shared kit-styled sidebar for every sub-app.
 *
 * Each sub-app's `*SidebarContent.tsx` was a 380-line near-duplicate of the
 * same component, only differing in which context hook it pulled from. This
 * lifts the rendering layer here so the visual design lives in one place.
 *
 * Per-app wrappers should:
 *   1. Pull their own context (useAppContext / useFinanceCore / etc.)
 *   2. Compute their own sidebar items via the per-app `getSidebarItems`
 *   3. Pass everything down as props.
 */
'use client';

import React, { useState } from 'react';

const SvgBase: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className = 'w-4 h-4',
  children,
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden
  >
    {children}
  </svg>
);

const ShieldCheck: React.FC<{ className?: string }> = props => (
  <SvgBase {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </SvgBase>
);
const ArrowLeft: React.FC<{ className?: string }> = props => (
  <SvgBase {...props}>
    <path d="M19 12H5" />
    <path d="m12 19-7-7 7-7" />
  </SvgBase>
);
const LogOut: React.FC<{ className?: string }> = props => (
  <SvgBase {...props}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="m16 17 5-5-5-5" />
    <path d="M21 12H9" />
  </SvgBase>
);
const ChevronRight: React.FC<{ className?: string }> = props => (
  <SvgBase {...props}>
    <path d="m9 18 6-6-6-6" />
  </SvgBase>
);
const ChevronLeft: React.FC<{ className?: string }> = props => (
  <SvgBase {...props}>
    <path d="m15 18-6-6 6-6" />
  </SvgBase>
);
const Settings: React.FC<{ className?: string }> = props => (
  <SvgBase {...props}>
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </SvgBase>
);
const CheckSquare: React.FC<{ className?: string }> = props => (
  <SvgBase {...props}>
    <path d="m9 11 3 3L22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </SvgBase>
);
const Clock: React.FC<{ className?: string }> = props => (
  <SvgBase {...props}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </SvgBase>
);
const Bell: React.FC<{ className?: string }> = props => (
  <SvgBase {...props}>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </SvgBase>
);
const SearchIcon: React.FC<{ className?: string }> = props => (
  <SvgBase {...props}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </SvgBase>
);

export interface AppSidebarItem {
  id: string;
  label: string;
  icon: React.ElementType;
  view?: string;
  active?: boolean;
  badge?: string | number;
  onClick?: () => void;
  children?: AppSidebarItem[];
}

export interface AppSidebarSection {
  id?: string;
  section: string;
  isCollapsible?: boolean;
  items: AppSidebarItem[];
}

export interface AppSidebarLevel {
  title: string;
  icon?: React.ElementType;
  items: AppSidebarItem[];
}

export interface AppSidebarUser {
  id?: string | number;
  name?: string;
  email?: string;
  role?: string;
}

interface AppSidebarProps {
  // Layout
  collapsed: boolean;
  setCollapsed: (next: boolean) => void;

  // Content
  agencyName?: string;
  agencyLogo?: string;
  appLabel?: string;
  primaryColorVar: string;
  sections: AppSidebarSection[];
  portalView?: string;
  sidebarStack: AppSidebarLevel[];
  popSidebarLevel: () => void;
  pushSidebarLevel: (title: string, items: AppSidebarItem[], icon?: React.ElementType) => void;
  handleViewChange: (view: string) => void;

  // Bottom row
  openModal: (name: string) => void;
  appMode?: string;
  setAppMode?: (next: string) => void;

  // User dropdown
  currentUser?: AppSidebarUser | null;
  userAvatar?: string;
  isDropdownOpen: boolean;
  setIsDropdownOpen: (next: boolean) => void;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  canImpersonate?: boolean;
  users?: AppSidebarUser[];
  setImpersonatedUserEmail?: (email: string | null) => void;
  addLog?: (kind: string, message: string, level: string) => void;
  handleLogout: () => void;
}

const isAnyChildActive = (
  items: AppSidebarItem[],
  portalView: string | undefined,
): boolean =>
  items.some(item => {
    if (item.active || (item.view && portalView === item.view)) return true;
    return item.children ? isAnyChildActive(item.children, portalView) : false;
  });

export const AppSidebar: React.FC<AppSidebarProps> = (props) => {
  const {
    collapsed,
    setCollapsed,
    agencyName,
    agencyLogo,
    appLabel = 'Workspace',
    primaryColorVar,
    sections,
    portalView,
    sidebarStack,
    popSidebarLevel,
    pushSidebarLevel,
    handleViewChange,
    openModal,
    appMode,
    setAppMode,
    currentUser,
    userAvatar,
    isDropdownOpen,
    setIsDropdownOpen,
    dropdownRef,
    canImpersonate,
    users,
    setImpersonatedUserEmail,
    addLog,
    handleLogout,
  } = props;

  const [collapsedSections, setCollapsedSections] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleSection = (id: string) =>
    setCollapsedSections(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    );

  const filteredSections = sections
    .map(section => {
      if (!searchQuery) return section;
      return {
        ...section,
        items: section.items.filter(item =>
          item.label.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      };
    })
    .filter(section => section.items.length > 0);

  const renderItem = (item: AppSidebarItem, isChild = false) => {
    const Icon = item.icon;
    const active =
      item.active ||
      (item.view ? portalView === item.view : false) ||
      (item.children ? isAnyChildActive(item.children, portalView) : false);

    return (
      <button
        key={item.id}
        onClick={() => {
          if (item.children && item.children.length > 0) {
            pushSidebarLevel(item.label, item.children, item.icon);
          }
          if (item.onClick) item.onClick();
          else if (item.view) handleViewChange(item.view);
        }}
        className={`group relative w-full flex items-center justify-between rounded-lg transition-colors duration-150 ${
          collapsed ? 'h-10 justify-center' : isChild ? 'h-9 pl-9 pr-3' : 'h-10 px-3'
        } ${
          active
            ? 'bg-white/[0.05] text-white'
            : 'text-slate-400 hover:bg-white/[0.03] hover:text-white'
        }`}
      >
        {active && !collapsed ? (
          <span
            className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full"
            style={{ backgroundColor: primaryColorVar }}
          />
        ) : null}

        <span className="flex items-center gap-3 min-w-0">
          <Icon
            className={`shrink-0 ${isChild ? 'w-3.5 h-3.5' : 'w-[18px] h-[18px]'} ${
              active ? 'text-white' : 'text-slate-500 group-hover:text-slate-200'
            }`}
          />
          {!collapsed ? (
            <span className={`truncate font-medium ${isChild ? 'text-xs' : 'text-sm'}`}>
              {item.label}
            </span>
          ) : null}
        </span>

        {!collapsed && item.badge != null && !item.children?.length ? (
          <span
            className={`shrink-0 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-md text-[10px] font-medium border ${
              active
                ? 'bg-white/10 text-white border-white/15'
                : 'bg-white/[0.04] text-slate-400 border-white/10'
            }`}
          >
            {item.badge}
          </span>
        ) : null}

        {!collapsed && item.children && item.children.length > 0 ? (
          <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-500" />
        ) : null}

        {collapsed ? (
          <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1 bg-[#0e0e10] border border-white/10 text-white text-xs font-medium rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-xl">
            {item.label}
          </span>
        ) : null}
      </button>
    );
  };

  const renderDrillDown = () => {
    const currentLevel = sidebarStack[sidebarStack.length - 1];
    const parentLevel = sidebarStack[sidebarStack.length - 2];
    const backTitle = parentLevel ? parentLevel.title : 'Back';
    return (
      <div className="space-y-1">
        {!collapsed ? (
          <button
            onClick={popSidebarLevel}
            className="w-full flex items-center gap-2 h-9 px-3 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.04] transition-colors mb-2 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-xs font-medium tracking-wide">{backTitle}</span>
          </button>
        ) : null}
        {!collapsed ? (
          <div className="flex items-center gap-2 px-3 mb-3 pb-2 border-b border-white/5">
            {currentLevel.icon ? (
              <currentLevel.icon className="w-4 h-4" style={{ color: primaryColorVar }} />
            ) : null}
            <span className="text-[11px] uppercase tracking-[0.18em] font-medium text-slate-400">
              {currentLevel.title}
            </span>
          </div>
        ) : null}
        {(currentLevel.items || []).map(item => renderItem(item))}
      </div>
    );
  };

  return (
    <aside
      className="fixed md:relative h-full bg-[#08080a] md:bg-transparent border-r border-white/5 flex flex-col z-[60] group/sidebar shadow-2xl md:shadow-none backdrop-blur-xl md:backdrop-blur-none transition-[width] duration-200"
      style={{ width: collapsed ? 76 : 268 }}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className={`px-4 pt-5 pb-4 flex items-center gap-3 ${collapsed ? 'justify-center px-3' : ''}`}>
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
            style={{
              backgroundColor: primaryColorVar,
              boxShadow: `0 8px 20px -8px color-mix(in srgb, ${primaryColorVar} 60%, transparent)`,
            }}
          >
            {agencyLogo ? (
              <img src={agencyLogo} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-white" />
            )}
          </div>
          {!collapsed ? (
            <div className="min-w-0">
              <div className="text-sm font-semibold tracking-tight text-white truncate">
                {agencyName || 'Aqua Portal'}
              </div>
              <div className="text-[10px] uppercase tracking-[0.15em] text-slate-500 font-medium truncate">
                {appMode === 'settings' ? 'Settings' : appLabel}
              </div>
            </div>
          ) : null}
        </div>

        {/* Search */}
        {collapsed ? (
          <div className="px-3 pb-3">
            <button
              type="button"
              className="w-full h-9 flex items-center justify-center rounded-lg bg-white/[0.03] border border-white/5 text-slate-500 hover:text-white hover:bg-white/[0.06] transition-colors"
              aria-label="Search"
            >
              <SearchIcon className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="px-4 pb-3">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full h-9 bg-white/[0.03] border border-white/5 rounded-lg pl-8 pr-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-white/15 focus:bg-white/[0.05] transition-colors"
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 overflow-y-auto custom-scrollbar">
          {sidebarStack.length > 0
            ? renderDrillDown()
            : filteredSections.map((section, index) => {
                const isCollapsed = section.id && collapsedSections.includes(section.id);
                return (
                  <div key={index} className="mb-5">
                    {!collapsed ? (
                      <div
                        className={`flex items-center justify-between px-3 mb-1.5 ${
                          section.isCollapsible ? 'cursor-pointer group/section' : ''
                        }`}
                        onClick={() => section.isCollapsible && section.id && toggleSection(section.id)}
                      >
                        <div className="text-[10px] uppercase tracking-[0.18em] font-medium text-slate-500 group-hover/section:text-slate-300 transition-colors">
                          {section.section}
                        </div>
                        {section.isCollapsible ? (
                          <ChevronRight
                            className={`w-3 h-3 text-slate-600 transition-transform duration-200 ${
                              !isCollapsed ? 'rotate-90' : ''
                            }`}
                          />
                        ) : null}
                      </div>
                    ) : null}

                    {!isCollapsed ? (
                      <div className="space-y-0.5">
                        {section.items.map(item => renderItem(item))}
                      </div>
                    ) : null}
                  </div>
                );
              })}
        </nav>

        {/* Bottom actions */}
        <div className="px-3 pt-3 pb-4 border-t border-white/5 space-y-2">
          <div className={`flex items-center ${collapsed ? 'flex-col gap-1' : 'gap-1 px-1'}`}>
            <BottomIconButton
              label="Tasks"
              onClick={() => openModal('GlobalTasksModal')}
              icon={CheckSquare}
            />
            <BottomIconButton
              label="Inbox"
              onClick={() => openModal('InboxModal')}
              icon={Clock}
              dotColor={primaryColorVar}
            />
            <BottomIconButton
              label="Notifications"
              onClick={() => openModal('NotificationsModal')}
              icon={Bell}
              dotColor="#f43f5e"
            />
          </div>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`w-full flex items-center gap-3 h-12 px-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-colors ${
                collapsed ? 'justify-center px-0' : ''
              }`}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold text-white shadow-md shrink-0"
                style={{ backgroundColor: primaryColorVar }}
              >
                {userAvatar || currentUser?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              {!collapsed ? (
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs font-semibold text-white truncate">{currentUser?.name}</p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium truncate">
                    {currentUser?.role}
                  </p>
                </div>
              ) : null}
            </button>

            {isDropdownOpen ? (
              <div
                className={`absolute ${
                  collapsed ? 'left-full ml-2 bottom-0' : 'left-0 right-0 bottom-full mb-2'
                } bg-[#0e0e10] border border-white/10 rounded-xl shadow-2xl z-[70] overflow-hidden min-w-[220px]`}
              >
                <div className="p-1.5">
                  {canImpersonate ? (
                    <>
                      <div className="px-3 py-1.5 text-[10px] text-slate-500 uppercase tracking-[0.15em] font-medium">
                        Switch user
                      </div>
                      {(users || []).slice(0, 5).map(u => (
                        <button
                          key={String(u.id)}
                          onClick={() => {
                            if (u.email) setImpersonatedUserEmail?.(u.email);
                            setIsDropdownOpen(false);
                            if (u.name) addLog?.('Impersonation', `Switched to ${u.name}`, 'impersonation');
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
              </div>
            ) : null}
          </div>

          {setAppMode ? (
            <button
              onClick={() => {
                if (appMode === 'settings') {
                  setAppMode('operations');
                  handleViewChange('dashboard');
                } else {
                  setAppMode('settings');
                  handleViewChange('global-settings');
                }
              }}
              className={`w-full flex items-center gap-3 h-10 px-3 rounded-lg transition-colors ${
                collapsed ? 'justify-center px-0' : ''
              } ${
                appMode === 'settings'
                  ? 'bg-white/[0.05] text-white'
                  : 'text-slate-400 hover:bg-white/[0.03] hover:text-white'
              }`}
            >
              <Settings className="w-[18px] h-[18px] shrink-0" />
              {!collapsed ? (
                <span className="text-sm font-medium">
                  {appMode === 'settings' ? 'Exit settings' : 'Settings'}
                </span>
              ) : null}
            </button>
          ) : null}
        </div>
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute bottom-10 -right-3 w-6 h-6 rounded-full flex items-center justify-center shadow-lg border border-white/10 bg-[#0e0e10] hover:bg-[#16161a] transition-colors z-30"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? (
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5 text-slate-300" />
        )}
      </button>
    </aside>
  );
};

interface BottomIconButtonProps {
  label: string;
  onClick: () => void;
  icon: React.ElementType;
  dotColor?: string;
}

const BottomIconButton: React.FC<BottomIconButtonProps> = ({ label, onClick, icon: Icon, dotColor }) => (
  <button
    onClick={onClick}
    title={label}
    aria-label={label}
    className="relative flex-1 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
  >
    <Icon className="w-4 h-4" />
    {dotColor ? (
      <span
        className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: dotColor }}
      />
    ) : null}
  </button>
);

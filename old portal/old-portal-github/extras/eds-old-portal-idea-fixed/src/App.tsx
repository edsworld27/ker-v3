/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, 
  User, 
  ShieldCheck, 
  ChevronRight, 
  LayoutDashboard, 
  Users, 
  Globe, 
  ChevronLeft, 
  FileText, 
  BarChart3,
  ExternalLink,
  BookOpen,
  Settings,
  LogOut,
  LifeBuoy,
  CreditCard,
  Lightbulb,
  Calendar,
  MessageSquare,
  Star,
  Download,
  Link2,
  Sparkles,
  Send,
  Zap,
  Bell,
  Clock,
  Briefcase,
  Building2,
  HelpCircle,
  Database,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Shield,
  ArrowLeft,
  Play,
  UserPlus,
  Settings2,
  Monitor,
  Layers,
  Compass,
  CheckCircle,
  Circle,
  Upload,
  MessageSquarePlus,
  Layout,
  Activity,
  Palette,
  Code2,
  Ticket,
  History,
  MessageCircle,
  ShieldAlert,
  UserCog,
  UserCircle,
  Mail,
  FolderOpen,
  PlusCircle,
  CheckSquare,
  LayoutGrid,
  Terminal,
  UserCheck,
  X,
  Menu
} from 'lucide-react';
import { getSidebarItems } from './config/sidebar';

import { PortalView, Agency } from './types';
import { AppProvider } from './context/AppContext';
import { InboxProvider } from './context/InboxContext';
import { useModalContext } from './context/ModalContext';
import { useAppLogic } from './hooks/useAppLogic';
import { DynamicViewRenderer } from './components/DynamicViewRenderer';
import { SidebarItem } from './components/shared/SidebarItem';
import { RoleSwitcher } from './components/shared/RoleSwitcher';
import { ModalManager } from './components/ModalManager';
import { LoginView } from './components/auth/LoginView';
import { SecurityCheckView } from './components/auth/SecurityCheckView';
import {
  initialTodos,
  initialUsers,
  initialClients,
  initialProjects,
  initialProjectTasks,
  initialTickets,
  initialActivityLogs,
  initialAiSessions,
} from './data/mockData';

export const iconMap: Record<string, any> = {
  Lock, User, ShieldCheck, ChevronRight, LayoutDashboard, Users, Globe, ChevronLeft, FileText, BarChart3, ExternalLink, BookOpen, Settings, LogOut, LifeBuoy, CreditCard, Lightbulb, Calendar, MessageSquare, Star, Download, Link2, Sparkles, Send, Zap, Bell, Clock, Briefcase, Building2, HelpCircle, Database, Plus, Trash2, CheckCircle2, XCircle, Shield, ArrowLeft, Play, UserPlus, Settings2, Monitor, Layers, Compass, CheckCircle, Circle, Upload, MessageSquarePlus, Layout, Activity, Palette, Code2, Ticket, History, MessageCircle, ShieldAlert, UserCog, UserCircle, Mail, FolderOpen, PlusCircle, CheckSquare, LayoutGrid, Terminal, UserCheck
};

export default function App() {
  const {
    step, setStep,
    portalView, setPortalView,
    todos, setTodos,
    sidebarCollapsed, setSidebarCollapsed,
    username, setUsername,
    code, setCode,
    userProfile, setUserProfile,
    editingClient,
    selectedTask, setSelectedTask,
    users, setUsers,
    clients, setClients,
    projects, setProjects,
    projectTasks, setProjectTasks,
    tickets, setTickets,
    activityLogs, setActivityLogs,
    confirmationConfig,
    customPages, setCustomPages,
    masterConfig, setMasterConfig,
    agencyConfig, setAgencyConfig,
    activeAgencyId, setActiveAgencyId,
    agencies, setAgencies,
    impersonatingClientId, setImpersonatingClientId,
    impersonatedUserEmail, setImpersonatedUserEmail,
    activeTemplate, setActiveTemplate,
    appLogo, setAppLogo,
    loginPortalType, setLoginPortalType,
    currentUser, currentAgency,
    addLog,
    handleImpersonate,
    handleStopImpersonating,
    handleUpdateClientStage,
    handleEditClient,
    handleDeleteUser,
    handleViewChange,
    canCurrentUserImpersonate,
    isAgencyAdmin,
    isAgencyEmployee,
    customSidebarLinks,
    setCustomSidebarLinks
  } = useAppLogic();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const {
    showInboxModal, setShowInboxModal,
    showMobileMenu, setShowMobileMenu,
    setShowGlobalTasksModal,
    setShowEmployeeManagementModal,
    setShowAppLauncherModal,
  } = useModalContext();
  const [agencyMessages, setAgencyMessages] = useState([
    { id: '1', senderId: 1, text: "Hey team, how's the new portal coming along?", timestamp: new Date().toISOString() },
    { id: '2', senderId: 2, text: "Almost there! Working on the AI integration now.", timestamp: new Date().toISOString() }
  ]);




  // Switcher variable: sync agencyConfig colors → CSS custom properties
  // Components reference var(--color-primary) instead of hardcoded hex values.
  // This is the ONLY place colors are ever applied — agencyConfig is the single source.
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', agencyConfig.identity.primaryColor);
    root.style.setProperty('--color-secondary', agencyConfig.identity.secondaryColor);
  }, [agencyConfig.identity.primaryColor, agencyConfig.identity.secondaryColor]);

  


  // Resolve labels and feature flags directly from agencyConfig (can't use useRoleConfig here — we're the provider)
  const _roleId = currentUser?.customRoleId || currentUser?.role || 'AgencyEmployee';
  const _roleConfig = agencyConfig.roles[_roleId];

  // Agency role = any role whose allowed views include at least one ops view, or has full access.
  // This replaces hardcoded === 'Founder' / === 'AgencyManager' checks.
  const AGENCY_VIEW_MARKERS = ['agency-hub', 'agency-clients', 'project-hub', 'admin-dashboard'];
  const isAgencyRole = _roleConfig?.allowedViews === '*' ||
    (Array.isArray(_roleConfig?.allowedViews) &&
      (_roleConfig.allowedViews as string[]).some(v => AGENCY_VIEW_MARKERS.includes(v)));
  const label = (key: keyof typeof agencyConfig.labels): string =>
    _roleConfig?.labelOverrides[key] ?? agencyConfig.labels[key] ?? key;
  // Maps view IDs to label keys for the header title
  const viewTitleLabel = (view: string): string => {
    const map: Record<string, keyof typeof agencyConfig.labels> = {
      'agency-clients': 'clients',
      'project-hub': 'projects',
      'task-board': 'tasks',
      'support': 'support',
      'support-tickets': 'tickets',
      'resources': 'resources',
      'agency-hub': 'dashboard',
      'dashboard': 'dashboard',
    };
    return map[view] ? label(map[view]) : view.replace(/-/g, ' ');
  };

  const activeClient = impersonatingClientId 
    ? clients.find(c => c.id === impersonatingClientId) 
    : (!isAgencyRole ? clients.find(c => c.email === userProfile.email) : null);


  const hasPermission = (view: PortalView | string): boolean => {
    if (!currentUser) return false;

    // Resolve the effective role — the person whose perspective we're in
    const effectiveUser = impersonatedUserEmail
      ? users.find(u => u.email === impersonatedUserEmail)
      : currentUser;

    const roleId = effectiveUser?.customRoleId || effectiveUser?.role || 'AgencyEmployee';
    const roleConfig = agencyConfig.roles[roleId];

    if (!roleConfig) return false;
    if (roleConfig.allowedViews === '*') return true;
    return (roleConfig.allowedViews as string[]).includes(view);
  };


  const handleLogout = () => {
    setStep('login');
    setUsername('');
    setCode(['', '', '', '']);
    setPortalView('dashboard');
    setSidebarCollapsed(false);
  };

  const appContextValue = {
    users,
    setUsers,
    clients,
    setClients,
    tickets,
    setTickets,
    projects,
    setProjects,
    tasks: projectTasks,
    setTasks: setProjectTasks,
    projectTasks,
    setProjectTasks,
    activityLogs,
    setActivityLogs,
    userProfile,
    setUserProfile,
    impersonatedUserEmail,
    setImpersonatedUserEmail,
    impersonatingClientId,
    setImpersonatingClientId,
    appLogo,
    setAppLogo,
    loginPortalType,
    setLoginPortalType,
    portalView,
    setPortalView,
    addLog,
    currentUser,
    isAgencyAdmin,
    isAgencyEmployee,
    customSidebarLinks,
    setCustomSidebarLinks,
    activeTemplate,
    setActiveTemplate,
    agencies,
    setAgencies,
    currentAgency,
    activeAgencyId,
    customPages,
    setCustomPages,
    todos,
    setTodos,
    masterConfig,
    setMasterConfig,
    agencyConfig,
    setAgencyConfig,
    handleImpersonate,
    handleStopImpersonating,
    handleUpdateClientStage,
    handleEditClient,
    handleDeleteUser,
    handleViewChange,
    canCurrentUserImpersonate,
    agencyMessages,
    setAgencyMessages,
    editingClient,
    selectedTask,
    setSelectedTask,
    confirmationConfig,
  };

  return (
    <InboxProvider>
      <AppProvider value={appContextValue}>
      <div className={`relative flex min-h-screen overflow-hidden transition-colors duration-1000 ${step === 'portal' ? 'bg-black' : 'bg-[#0f172a]'}`}>
      {/* Background Orbs */}
      {step !== 'portal' && (
        <>
          <motion.div 
            animate={{ 
              x: [0, 100, 0], 
              y: [0, 50, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="bg-glow top-1/4 left-1/4" 
          />
          <motion.div 
            animate={{ 
              x: [0, -100, 0], 
              y: [0, -50, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="bg-glow bottom-1/4 right-1/4" 
          />
        </>
      )}

      <AnimatePresence mode="wait">
        {step === 'login' && (
          <LoginView
            onQuickLogin={(name, email, avatar) => {
              setUserProfile({ name, email, avatar });
              setStep('portal');
            }}
          />
        )}

        {step === 'security' && (
          <SecurityCheckView
            code={code}
            setCode={setCode}
            onVerify={() => {
              if (code.every(digit => digit !== '')) {
                addLog('Login Success', `User ${username} verified and logged in`, 'auth');
                setStep('portal');
              }
            }}
            onBack={() => setStep('login')}
          />
        )}

        {step === 'portal' && (
          <motion.div
            key="portal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex w-full h-screen text-white"
          >
            {/* Mobile Menu Overlay */}
            <AnimatePresence>
              {showMobileMenu && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowMobileMenu(false)}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
                />
              )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
              initial={false}
              animate={{ 
                width: sidebarCollapsed ? 80 : 280,
                x: showMobileMenu ? 0 : (typeof window !== 'undefined' && window.innerWidth < 768 ? -280 : 0)
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 35 }}
              className={`fixed md:relative h-full glass-card border-r border-white/5 flex flex-col z-[60] group/sidebar transition-all duration-300 shadow-2xl md:shadow-none bg-[#0a0a0a]/90 md:bg-transparent backdrop-blur-xl md:backdrop-blur-none`}
            >
              <div className="flex flex-col h-full">
                <div className={`p-4 md:p-6 mb-4 md:mb-8 flex items-center gap-3 ${sidebarCollapsed ? 'justify-center' : ''}`}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 overflow-hidden shadow-lg"
                       style={{ backgroundColor: 'var(--color-primary)', boxShadow: '0 10px 15px -3px color-mix(in srgb, var(--color-primary) 20%, transparent)' }}>
                    {currentAgency?.logo ? (
                      <img src={currentAgency.logo} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <ShieldCheck className="w-5 h-5 text-white" />
                    )}
                  </div>
                  {!sidebarCollapsed && (
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-lg md:text-xl font-semibold tracking-tight truncate"
                    >
                      {currentAgency?.name || 'Portal'}
                    </motion.span>
                  )}
                </div>

                <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
                  {getSidebarItems({
                    currentUser: currentUser!,
                    activeClient,
                    portalView,
                    clients,
                    projects,
                    tickets,
                    isAgencyRole,
                    impersonatingClientId,
                    hasPermission,
                    handleViewChange,
                    setShowEmployeeManagementModal,
                    setShowAppLauncherModal,
                    sidebarCollapsed,
                    agencyConfig,
                  }).map((section, index) => (
                    <div key={index} className="mb-6 space-y-1">
                      {!sidebarCollapsed && <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500 mb-2 px-4">{section.section}</div>}
                      {section.items.map(item => (
                        <SidebarItem 
                          key={item.id}
                          icon={item.icon}
                          label={item.label}
                          active={item.active}
                          onClick={item.onClick}
                          collapsed={sidebarCollapsed}
                          badge={item.badge}
                        />
                      ))}
                    </div>
                  ))}
                </nav>


                <div className="p-4 border-t border-white/5 space-y-1">
                  <button
                    onClick={handleLogout}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-all duration-300 ${sidebarCollapsed ? 'justify-center' : ''}`}
                  >
                    <LogOut className="w-5 h-5 shrink-0" />
                    {!sidebarCollapsed && <span className="font-medium">Logout</span>}
                  </button>
                </div>
              </div>

              {/* Toggle Button */}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className={`absolute bottom-8 -right-3 w-6 h-6 rounded-full flex items-center justify-center shadow-lg border border-white/10 hover:scale-110 transition-transform z-30`}
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            </motion.aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-hidden relative bg-black/40 flex flex-col">
              {/* Mobile Header */}
              <div className="md:hidden h-16 bg-[#1e1e2d] border-b border-white/5 flex items-center justify-between px-6 z-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                       style={{ backgroundColor: 'var(--color-primary)' }}>
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-bold text-lg tracking-tight">AquaPortal</span>
                </div>
                <button 
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="p-2 hover:bg-white/5 rounded-xl transition-colors"
                >
                  {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>

              {impersonatedUserEmail && (
                <div className="h-10 backdrop-blur-md flex items-center justify-between px-8 text-white z-50"
                     style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 90%, transparent)' }}>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                    <ShieldCheck className="w-4 h-4" />
                    Viewing as {currentUser.name} ({currentUser.role})
                  </div>
                  <button 
                    onClick={() => {
                      setImpersonatedUserEmail(null);
                      setPortalView('dashboard');
                      addLog('Impersonation Stopped', `Returned to ${userProfile.name}'s account`, 'system');
                    }}
                    className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all"
                  >
                    Switch back to my profile
                  </button>
                </div>
              )}
              {impersonatingClientId && !impersonatedUserEmail && (
                <div className="h-10 bg-amber-600/90 backdrop-blur-md flex items-center justify-between px-8 text-white z-50">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                    <Building2 className="w-4 h-4" />
                    Viewing {clients.find(c => c.id === impersonatingClientId)?.name} Workspace
                  </div>
                  <button 
                    onClick={() => {
                      setImpersonatingClientId(null);
                      setPortalView('operations-hub');
                    }}
                    className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all"
                  >
                    Return to Agency Hub
                  </button>
                </div>
              )}

              {/* Top Header */}
              <header className="h-16 border-b border-white/5 bg-black/20 backdrop-blur-xl flex items-center justify-between px-4 md:px-8 shrink-0 z-10">
                <div className="flex items-center gap-4">
                  <h2 className="text-xs font-medium text-slate-400 capitalize truncate max-w-[150px] md:max-w-none">
                    {viewTitleLabel(portalView)}
                  </h2>
                </div>
                <div className="flex items-center gap-1 md:gap-2">
                  <button 
                    onClick={() => setShowGlobalTasksModal(true)}
                    className="p-1.5 md:p-2 rounded-lg transition-all hover:bg-white/5 group relative text-slate-400 hover:text-[var(--color-primary)]"
                  >
                    <CheckSquare className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                  <button 
                    onClick={() => setShowInboxModal(true)}
                    className={`p-1.5 md:p-2 rounded-lg transition-all hover:bg-white/5 group relative ${showInboxModal ? '' : 'text-slate-400'}`}
                    style={showInboxModal ? { color: 'var(--color-primary)' } : {}}
                  >
                    <Clock className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full border border-black" style={{ backgroundColor: 'var(--color-primary)' }} />
                  </button>
                  <button 
                    onClick={() => setShowInboxModal(true)}
                    className={`p-1.5 md:p-2 rounded-lg transition-all hover:bg-white/5 group relative ${showInboxModal ? '' : 'text-slate-400'}`}
                    style={showInboxModal ? { color: 'var(--color-primary)' } : {}}
                  >
                    <Bell className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full border border-black" />
                  </button>
                  <div className="w-px h-4 bg-white/10 mx-1 md:mx-2" />
                  <div className="relative" ref={dropdownRef}>
                    <button 
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center gap-2 md:gap-3 pl-1 md:pl-2 group"
                    >
                      <div className="w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-[9px] md:text-[10px] font-bold text-white"
                           style={{ backgroundColor: 'var(--color-primary)' }}>
                        {userProfile.avatar}
                      </div>
                    </button>
                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-xl shadow-lg border border-white/10 z-50">
                        <div className="p-2">
                          {canCurrentUserImpersonate() ? (
                            <div className="space-y-1">
                              <div className="px-4 py-1 text-xs text-slate-500 uppercase">Switch User</div>
                              {users.map(u => (
                                <button
                                  key={u.id}
                                  onClick={() => {
                                    setImpersonatedUserEmail(u.email);
                                    setIsDropdownOpen(false);
                                    addLog('Impersonation', `Switched to ${u.name}`, 'impersonation');
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 rounded-lg"
                                >
                                  {u.name} ({u.role})
                                </button>
                              ))}
                              <div className="border-t border-white/10 my-1"></div>
                              <button onClick={() => { setPortalView('workspaces'); setIsDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 rounded-lg">View Workspaces</button>
                            </div>
                          ) : (
                            <button onClick={() => { /* Add logic for Add Account */ setIsDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 rounded-lg">Add Account</button>
                          )}
                          <button onClick={() => { handleLogout(); setIsDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-400/10 rounded-lg">Log Out</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </header>

              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <AnimatePresence mode="wait">
                  <DynamicViewRenderer viewId={portalView} key={portalView} />
                </AnimatePresence>
              </div>
            </main>
          </motion.div>
        )}
      </AnimatePresence>

      <ModalManager />
      <RoleSwitcher />
    </div>
    </AppProvider>
    </InboxProvider>
  );
}

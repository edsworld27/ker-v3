/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, Building2, CheckSquare, Clock, Bell, Zap, Menu, X 
} from 'lucide-react';
import { useRevenueContext } from '@RevenueShell/bridge/RevenueContext';
import { useModalContext } from '@RevenueShell/bridge/RevenueModalContext';

interface RevenueTopBarProps {
  // Add other props if needed
}

export const RevenueTopBar: React.FC<RevenueTopBarProps> = () => {
  const {
    portalView,
    viewTitleLabel,
    isDropdownOpen,
    setIsDropdownOpen,
    dropdownRef,
    impersonatedUserEmail,
    setImpersonatedUserEmail,
    handleViewChange,
    currentUser,
    userProfile,
    addLog,
    impersonatingClientId,
    clients,
    handleStopImpersonating,
    canCurrentUserImpersonate,
    users,
    handleLogout,
    portalMode,
    setPortalMode
  } = useRevenueContext();

  const {
    openModal,
  } = useModalContext();

  const [showMobileMenu, setShowMobileMenu] = React.useState(false);

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden h-16 bg-[#1e1e2d] border-b border-white/5 flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
               style={{ backgroundColor: 'var(--revenue-widget-primary-color-1)' }}>
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

      {/* Impersonation banners */}
      {impersonatedUserEmail && (
        <div className="h-10 backdrop-blur-md flex items-center justify-between px-8 text-white z-50"
             style={{ backgroundColor: 'color-mix(in srgb, var(--revenue-widget-primary-color-1) 90%, transparent)' }}>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4" />
            Viewing as {currentUser?.name} ({currentUser?.role})
          </div>
          <button
            onClick={() => {
              setImpersonatedUserEmail(null);
              handleViewChange('dashboard');
              addLog('Impersonation Stopped', `Returned to ${userProfile?.name}'s account`, 'system');
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
            onClick={handleStopImpersonating}
            className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all"
          >
            Return to Agency Hub
          </button>
        </div>
      )}

      {/* Main Top Header */}
      <header className="h-16 border-b border-white/5 bg-black/20 backdrop-blur-xl flex items-center justify-between px-4 md:px-8 shrink-0 z-10">
        <div className="flex items-center gap-4">
          <h2 className="text-xs font-medium text-slate-400 capitalize truncate max-w-[150px] md:max-w-none">
            {viewTitleLabel}
          </h2>
          <button
            onClick={() => {
              const nextMode = portalMode === 'demo' ? 'user' : 'demo';
              setPortalMode(nextMode);
            }}
            className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full transition-all border ${
              portalMode === 'demo' 
                ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30 animate-pulse'
                : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
            }`}
          >
            {portalMode === 'demo' ? 'Demo Mode active' : '● Live Mode'}
          </button>
        </div>
        
        <div className="flex items-center gap-1 md:gap-2">
          <button
            onClick={() => openModal('GlobalTasksModal')}
            className="p-1.5 md:p-2 rounded-lg transition-all hover:bg-white/5 group relative text-slate-400 hover:text-[var(--revenue-widget-primary-color-1)]"
          >
            <CheckSquare className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          
          <button
            onClick={() => openModal('InboxModal')}
            className="p-1.5 md:p-2 rounded-lg transition-all hover:bg-white/5 group relative text-slate-400"
          >
            <Clock className="w-4 h-4 md:w-5 md:h-5" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full border border-black" style={{ backgroundColor: 'var(--revenue-widget-primary-color-1)' }} />
          </button>
          
          <button
            onClick={() => openModal('NotificationsModal')}
            className="p-1.5 md:p-2 rounded-lg transition-all hover:bg-white/5 group relative text-slate-400"
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
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-[9px] md:text-[10px] font-bold text-white shadow-lg"
                   style={{ backgroundColor: 'var(--revenue-widget-primary-color-1)' }}>
                {userProfile?.avatar || 'U'}
              </div>
            </button>
            
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-xl shadow-2xl border border-white/10 z-50 overflow-hidden"
                >
                  <div className="p-2">
                    {canCurrentUserImpersonate ? (
                      <div className="space-y-1">
                        <div className="px-4 py-1 text-[10px] text-slate-500 uppercase font-bold tracking-widest">Switch User</div>
                        {(users || []).slice(0, 5).map((u: any) => (
                          <button
                            key={u.id}
                            onClick={() => {
                              setImpersonatedUserEmail(u.email);
                              setIsDropdownOpen(false);
                              addLog('Impersonation', `Switched to ${u.name}`, 'impersonation');
                            }}
                            className="w-full text-left px-4 py-2 text-xs text-white hover:bg-white/10 rounded-lg transition-colors"
                          >
                            {u.name}
                          </button>
                        ))}
                        <div className="border-t border-white/10 my-1"></div>
                        <button onClick={() => { handleViewChange('workspaces'); setIsDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-xs text-white hover:bg-white/10 rounded-lg">View Workspaces</button>
                      </div>
                    ) : (
                      <button onClick={() => setIsDropdownOpen(false)} className="w-full text-left px-4 py-2 text-xs text-white hover:bg-white/10 rounded-lg">Profile Details</button>
                    )}
                    <button onClick={() => { handleLogout(); setIsDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-red-400/10 rounded-lg">Log Out</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>
    </>
  );
};

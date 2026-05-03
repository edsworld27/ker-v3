/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck, Building2, CheckSquare, Clock, Bell, Zap, Menu, X, LogOut, Sparkles,
} from 'lucide-react';
import { useHostContext } from '@HostShell/bridge/HostContext';
import { useModalContext } from '@HostShell/bridge/HostModalContext';

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
    className="relative w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
  >
    {children}
    {dot ? (
      <span
        className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full ${dot === 'rose' ? 'bg-rose-500' : ''}`}
        style={dot === 'primary' ? { backgroundColor: 'var(--host-widget-primary-color-1)' } : undefined}
      />
    ) : null}
  </button>
);

export const HostTopBar: React.FC = () => {
  const {
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
    setHostPortalMode,
  } = useHostContext();

  const { openModal } = useModalContext();

  const [showMobileMenu, setShowMobileMenu] = React.useState(false);

  return (
    <>
      {/* Mobile header */}
      <div className="md:hidden h-14 bg-[#08080a] border-b border-white/5 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'var(--host-widget-primary-color-1)' }}
          >
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-sm tracking-tight text-white">Aqua Portal</span>
        </div>
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-white/[0.05] text-slate-300 transition-colors"
          aria-label="Toggle menu"
        >
          {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Impersonation banners */}
      {impersonatedUserEmail && (
        <div
          className="h-9 flex items-center justify-between px-6 text-white z-50 backdrop-blur-md"
          style={{ backgroundColor: 'color-mix(in srgb, var(--host-widget-primary-color-1) 90%, transparent)' }}
        >
          <div className="flex items-center gap-2 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>
              Viewing as <strong className="font-semibold">{currentUser?.name}</strong>
              <span className="opacity-75"> · {currentUser?.role}</span>
            </span>
          </div>
          <button
            onClick={() => {
              setImpersonatedUserEmail(null);
              handleViewChange('dashboard');
              addLog('Impersonation Stopped', `Returned to ${userProfile?.name}'s account`, 'system');
            }}
            className="h-7 px-2.5 bg-white/15 hover:bg-white/25 rounded-md text-[11px] font-medium transition-colors"
          >
            Switch back
          </button>
        </div>
      )}

      {impersonatingClientId && !impersonatedUserEmail && (
        <div className="h-9 bg-amber-500/90 backdrop-blur-md flex items-center justify-between px-6 text-white z-50">
          <div className="flex items-center gap-2 text-xs font-medium">
            <Building2 className="w-3.5 h-3.5" />
            <span>
              Viewing{' '}
              <strong className="font-semibold">
                {clients.find(c => c.id === impersonatingClientId)?.name}
              </strong>{' '}
              workspace
            </span>
          </div>
          <button
            onClick={handleStopImpersonating}
            className="h-7 px-2.5 bg-white/15 hover:bg-white/25 rounded-md text-[11px] font-medium transition-colors"
          >
            Return to agency
          </button>
        </div>
      )}

      {/* Main top header */}
      <header className="h-14 border-b border-white/5 bg-[#0a0a0c]/80 backdrop-blur-xl flex items-center justify-between px-4 md:px-6 shrink-0 z-10">
        <div className="flex items-center gap-3 min-w-0">
          <h2 className="text-sm font-medium text-slate-300 capitalize truncate">
            {viewTitleLabel}
          </h2>
          <button
            onClick={() => {
              const nextMode = portalMode === 'demo' ? 'user' : 'demo';
              setHostPortalMode(nextMode);
            }}
            className={`inline-flex items-center gap-1.5 h-6 px-2 text-[11px] font-medium rounded-md border transition-colors ${
              portalMode === 'demo'
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/25 hover:bg-amber-500/15'
                : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25 hover:bg-emerald-500/15'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                portalMode === 'demo' ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
            />
            {portalMode === 'demo' ? 'Demo' : 'Live'}
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('aqua:open-chat'));
              }
            }}
            className="inline-flex items-center gap-1.5 h-8 pl-2 pr-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/25 text-indigo-200 hover:bg-indigo-500/15 hover:text-white transition-colors text-xs font-medium"
            aria-label="Ask Aqua AI"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Ask AI
          </button>
          <div className="w-px h-5 bg-white/10 mx-1" />
          <IconButton label="Tasks" onClick={() => openModal('GlobalTasksModal')}>
            <CheckSquare className="w-4 h-4" />
          </IconButton>
          <IconButton label="Inbox" onClick={() => openModal('InboxModal')} dot="primary">
            <Clock className="w-4 h-4" />
          </IconButton>
          <IconButton label="Notifications" onClick={() => openModal('NotificationsModal')} dot="rose">
            <Bell className="w-4 h-4" />
          </IconButton>

          <div className="w-px h-5 bg-white/10 mx-1" />

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 h-9 pl-1 pr-2 rounded-lg hover:bg-white/[0.05] transition-colors group"
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold text-white shadow-md"
                style={{ backgroundColor: 'var(--host-widget-primary-color-1)' }}
              >
                {userProfile?.avatar || 'U'}
              </div>
              <div className="hidden md:flex flex-col items-start min-w-0 leading-tight pr-1">
                <span className="text-[11px] font-medium text-white truncate max-w-[120px]">
                  {currentUser?.name}
                </span>
                <span className="text-[10px] text-slate-500 truncate max-w-[120px]">
                  {currentUser?.role}
                </span>
              </div>
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="absolute right-0 mt-2 w-56 bg-[#0e0e10] rounded-xl shadow-2xl border border-white/10 z-50 overflow-hidden"
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
        </div>
      </header>
    </>
  );
};

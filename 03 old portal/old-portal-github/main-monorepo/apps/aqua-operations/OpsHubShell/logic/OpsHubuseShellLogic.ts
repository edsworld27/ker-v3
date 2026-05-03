import { useState, useEffect, useRef, useCallback } from 'react';
import { PortalView } from '@OpsHubShell/bridge/types';

/**
 * useShellLogic
 * 
 * Manages the "Unified Shell" state:
 * - LocalStorage persistence for the base application frame.
 * - Non-business UI state (Dropdowns, Sidebar collapse, Local Auth).
 * - Navigation state (portalView, handleViewChange).
 * - This logic is intended for the "Shell" only, ensuring portability.
 */
export function useShellLogic(persistedState: any, deps: { addLog: any }) {
  const { addLog } = deps;

  // ── UI States ─────────────────────────────────────────────────────────────
  const [sidebarCollapsed, setSidebarCollapsed] = useState(persistedState?.sidebarCollapsed ?? false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [activePortalTheme, setActivePortalTheme] = useState(persistedState?.theme ?? 'dark');
  const [sidebarStack, setSidebarStack] = useState<{ title: string; icon?: any; items: any[] }[]>(() => {
    if (!persistedState?.sidebarStack) return [];
    // Ensure all titles are strings to prevent React crashes from stale/buggy localStorage
    return persistedState.sidebarStack.filter((s: any) => typeof s.title === 'string');
  });
  
  // Navigation State (Moved from Core)
  const [portalView, setPortalView] = useState<PortalView | string>(persistedState?.portalView ?? 'dashboard');
  const [appLogo, setAppLogo] = useState<string>(persistedState?.appLogo || 'https://aqua-digital.io/logo.png');

  // ── Persistence Logic ─────────────────────────────────────────────────────
  const saveShellState = useCallback((overrides: any = {}) => {
    const currentState = {
      sidebarCollapsed,
      theme: activePortalTheme,
      sidebarStack,
      portalView,
      appLogo,
      ...overrides
    };
    localStorage.setItem('aqua_shell_persistence', JSON.stringify(currentState));
  }, [sidebarCollapsed, activePortalTheme, sidebarStack, portalView, appLogo]);

  // Sync state to storage
  useEffect(() => {
    saveShellState();
  }, [saveShellState]);

  // Handle outside clicks for the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleViewChange = (viewId: string) => {
    setPortalView(viewId);
    if (addLog) addLog('Navigation', `Changed view to ${viewId}`, 'view');
  };

  return {
    sidebarCollapsed, setSidebarCollapsed,
    isDropdownOpen, setIsDropdownOpen,
    dropdownRef,
    activePortalTheme, setActivePortalTheme,
    sidebarStack, setSidebarStack,
    portalView, setPortalView,
    handleViewChange,
    appLogo, setAppLogo,
    pushSidebarLevel: (title: any, items: any[], icon?: any) => {
      // Safety: Ensure title is a string to prevent React "Objects as child" errors
      const safeTitle = typeof title === 'string' ? title : (title?.label || 'Back');
      setSidebarStack(prev => [...prev, { title: safeTitle, icon, items }]);
    },
    popSidebarLevel: () => {
      setSidebarStack(prev => prev.length > 0 ? prev.slice(0, -1) : []);
    },
    saveShellState
  };
}

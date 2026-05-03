import {
  BookOpen,
  LifeBuoy,
  Puzzle,
  Store
} from 'lucide-react';
import { BridgeRegistry } from '@ClientShell/bridge/ClientRegistration';
import type { SuiteTemplate, SuiteSubItem } from '@aqua/bridge';
import { AgencyConfig } from '@ClientShell/bridge/config/ClientagencyConfig';
import { PortalView, Client, AppUser } from '@ClientShell/bridge/types';

interface SubNavItem {
  id: string;
  label: string;
  icon: any;
  view?: string;
  active?: boolean;
  onClick?: () => void;
  badge?: string | number;
  children?: SubNavItem[];
}

interface NavItem {
  id:string;
  label: string;
  icon: any;
  view?: string;
  active?: boolean;
  onClick?: () => void;
  badge?: string | number;
  children?: SubNavItem[];
  isParent?: boolean;
}

export interface SidebarSectionData {
  section: string;
  items: NavItem[];
  isCollapsible?: boolean;
  id?: string;
}

interface GetSidebarItemsArgs {
  currentUser: AppUser;
  activeClient: Client | null;
  portalView: PortalView | string;
  isAgencyRole: boolean;
  impersonatingClientId: string | null;
  hasPermission: (view: PortalView | string) => boolean;
  handleViewChange: (view: PortalView | string) => void;
  agencyConfig: AgencyConfig;
  appMode?: string;
  setAppMode: (mode: string) => void;
  handleImpersonate?: (clientId: string) => void;
  handleStopImpersonating?: () => void;
  enabledSuiteIds: string[];
  openModal?: (name: string) => void;
}

export const getSidebarItems = ({
  portalView,
  handleViewChange,
  enabledSuiteIds,
}: GetSidebarItemsArgs): SidebarSectionData[] => {

  const sections: SidebarSectionData[] = [];

  // ── Registry-driven plugin sections ─────────────────────────────────────────
  // Pull all registered suites and filter to those the current session has enabled.
  const allSuites = BridgeRegistry.getSuites();
  const enabledSet = new Set(enabledSuiteIds ?? []);
  const enabledSuites = allSuites.filter((s: SuiteTemplate) => enabledSet.has(s.id));

  if (enabledSuites.length === 0) {
    // Empty-state: no plugins enabled — point user at the marketplace.
    sections.push({
      section: 'PLUGINS',
      items: [
        {
          id: 'open-marketplace',
          label: 'Open Marketplace',
          icon: Store,
          view: 'marketplace',
          active: portalView === 'marketplace',
          onClick: () => handleViewChange('marketplace'),
        },
      ],
    });
  } else {
    // Group by SuiteTemplate.section (fallback to "Plugins").
    const grouped = new Map<string, SuiteTemplate[]>();
    for (const suite of enabledSuites) {
      const key = suite.section?.trim() || 'Plugins';
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(suite);
    }

    for (const [sectionLabel, suites] of grouped) {
      const items: NavItem[] = suites.map((suite: SuiteTemplate) => {
        const subItems = (suite.subItems ?? []) as SuiteSubItem[];
        const topView = suite.defaultView ?? subItems[0]?.view ?? suite.id;
        const childActive = subItems.some(si => si.view === portalView);
        const children: SubNavItem[] = subItems.map(si => ({
          id: si.id,
          label: si.label,
          icon: si.icon ?? Puzzle,
          view: si.view,
          active: portalView === si.view,
          onClick: () => handleViewChange(si.view),
        }));
        return {
          id: suite.id,
          label: suite.label,
          icon: suite.icon ?? Puzzle,
          view: topView,
          active: portalView === topView || childActive,
          onClick: () => handleViewChange(topView),
          children: children.length > 0 ? children : undefined,
          isParent: children.length > 0,
        };
      });

      sections.push({ section: sectionLabel.toUpperCase(), items });
    }
  }

  // ── Always-shown hardcoded sections ─────────────────────────────────────────
  // Knowledge & Help — never registry-controlled, always visible.
  sections.push({
    section: 'Resources',
    items: [
      { id: 'resources', label: 'Resource Library', icon: BookOpen, view: 'client-resources', active: portalView === 'client-resources', onClick: () => handleViewChange('client-resources') },
      { id: 'support', label: 'Help Desk', icon: LifeBuoy, view: 'support', active: portalView === 'support', onClick: () => handleViewChange('support') },
    ]
  });

  return sections;
};

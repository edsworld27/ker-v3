// ============================================================
// Shared Components — UI Config
// This file imports all individual shared UI configurations
// and exports them as a single object.
// Feeds up to: uiMaster.ts
// ============================================================

import { dashboardWidgetUI } from './DashboardWidget/ui';
import { roleSwitcherUI } from './RoleSwitcher/ui';
import { sidebarItemUI } from './SidebarItem/ui';
import { stageDropdownUI } from './StageDropdown/ui';
import { aiChatbotUI } from '../AIChatbot/ui';

export const sharedUI = {
  dashboardWidget: dashboardWidgetUI,
  roleSwitcher: roleSwitcherUI,
  sidebarItem: sidebarItemUI,
  stageDropdown: stageDropdownUI,
  aiChatbot: aiChatbotUI,
};
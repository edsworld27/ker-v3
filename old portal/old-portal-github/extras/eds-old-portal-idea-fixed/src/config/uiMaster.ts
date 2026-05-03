// ============================================================
// UI Master — The Root Configuration
// This is the single source of truth for all UI variables.
// It imports configurations from all sub-directories.
// ============================================================

import { viewsUI } from '../components/views/ui.config';
import { sharedUI } from '../components/shared/ui.config';
import { collaborationUI } from '../components/collaboration/ui.config';
import { modalsUI } from '../components/modals/ui.config';

export const uiMaster = {
  views: viewsUI,
  shared: sharedUI,
  collaboration: collaborationUI,
  modals: modalsUI,
};

export type UiMaster = typeof uiMaster;
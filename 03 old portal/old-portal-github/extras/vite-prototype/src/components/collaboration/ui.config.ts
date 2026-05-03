// ============================================================
// Collaboration Components — UI Config
// This file imports all individual collaboration component UI
// configurations and exports them as a single object.
// Feeds up to: uiMaster.ts
// ============================================================

import { projectChatUI } from './ProjectChat/ui';

export const collaborationUI = {
  projectChat: projectChatUI,
};
// ============================================================
// UI Master — The Root Configuration
// This is the single source of truth for all UI variables.
// It imports configurations from all sub-directories.
// ============================================================

export const uiMaster = {
  views: {} as any,
  shared: {} as any,
  collaboration: {} as any,
  modals: {} as any,
};

export type UiMaster = typeof uiMaster;
// ============================================================
// RoleSwitcher — UI Variables
// Dev tool for impersonating roles. All values live here.
// Feeds up to: shared/ui.config.ts → uiMaster.ts
// ============================================================

export const roleSwitcherUI = {

  // --- Wrapper ---
  wrapper: {
    position: 'fixed top-2 right-2',
    zIndex: 'z-50',
    layout: 'flex gap-2',
    padding: 'p-2',
    bg: 'bg-slate-900/90',
    border: 'border border-slate-700',
    radius: 'rounded-lg',
    shadow: 'shadow-xl',
  },

  // --- Role buttons ---
  button: {
    paddingX: 'px-3',
    paddingY: 'py-1',
    fontSize: 'text-xs',
    textColor: 'text-white',
    bg: 'bg-slate-700',
    bgHover: 'hover:bg-slate-600',
    radius: 'rounded',
    transition: 'transition-colors',
  },

  // --- Role definitions (label shown + email used for impersonation) ---
  roles: [
    { label: 'Founder',  email: 'edwardhallam07@gmail.com' },
    { label: 'Client',   email: 'contact@acme.com' },
    { label: 'Operator', email: 'operator@example.com' },
    { label: 'Employee', email: 'sarah@example.com' },
  ],

};

"use client";

import { useEffect, useRef } from "react";
import {
  getBranding, getAdminMode, ADMIN_MODES, onAdminConfigChange,
} from "@/lib/admin/adminConfig";
import { getSession, AUTH_EVENT } from "@/lib/auth";

// Injects admin-panel-specific CSS variables and custom CSS.
// Scoped to elements inside [data-admin-panel] so it only affects admin pages.
export default function AdminThemeInjector() {
  const styleRef = useRef<HTMLStyleElement | null>(null);

  function apply() {
    const session = getSession();
    const mode = getAdminMode(session?.user.email);
    const colors = ADMIN_MODES[mode];
    const brand = getBranding();

    // For "custom" mode, branding values override the defaults
    const panelBg = mode === "custom" ? brand.panelBg : colors.panelBg;
    const panelText = mode === "custom" ? brand.panelText : colors.panelText;
    const sidebarBg = mode === "custom" ? brand.sidebarBg : colors.sidebarBg;
    const sidebarText = mode === "custom" ? brand.sidebarText : colors.sidebarText;

    const css = `
[data-admin-panel] {
  --admin-bg: ${panelBg};
  --admin-text: ${panelText};
  --admin-sidebar-bg: ${sidebarBg};
  --admin-sidebar-text: ${sidebarText};
  --admin-card-bg: ${colors.cardBg};
  --admin-border: ${colors.borderColor};
  --admin-muted: ${colors.mutedText};
  --admin-accent: ${brand.accentColor};
}
[data-admin-panel] {
  background: var(--admin-bg) !important;
  color: var(--admin-text);
}
[data-admin-panel] [data-admin-sidebar] {
  background: var(--admin-sidebar-bg) !important;
  color: var(--admin-sidebar-text);
}
${brand.customCSS || ""}
`.trim();

    if (!styleRef.current) {
      const existing = document.getElementById("lk-admin-theme-css");
      if (existing) {
        styleRef.current = existing as HTMLStyleElement;
      } else {
        const el = document.createElement("style");
        el.id = "lk-admin-theme-css";
        document.head.appendChild(el);
        styleRef.current = el;
      }
    }
    styleRef.current.textContent = css;
  }

  useEffect(() => {
    apply();
    const off = onAdminConfigChange(apply);
    window.addEventListener(AUTH_EVENT, apply);
    return () => { off(); window.removeEventListener(AUTH_EVENT, apply); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

// Per-site embed theme — colours, logo, copy, admin-access button. Drives
// /embed/login + /portal/embed.js so each tenant's portal widget looks
// like their brand.

import { getState, mutate } from "./storage";
import type { EmbedTheme } from "./types";

export type { EmbedTheme };

// Empty theme reflects "use the portal default" everywhere — the
// embed page + loader script both have hardcoded fallbacks (brand
// orange, "Sign in" label, no logo).
const EMPTY: EmbedTheme = {};

export function getEmbedTheme(siteId: string): EmbedTheme {
  return getState().embedThemes[siteId] ?? EMPTY;
}

export function setEmbedTheme(siteId: string, theme: EmbedTheme): EmbedTheme {
  let saved!: EmbedTheme;
  mutate(state => {
    // Strip empty strings so the server-side "is this set?" checks work
    // cleanly — empty in = "use default", not "store empty".
    const cleaned: EmbedTheme = {};
    if (theme.brandColor?.trim())       cleaned.brandColor = theme.brandColor.trim();
    if (theme.logoUrl?.trim())          cleaned.logoUrl = theme.logoUrl.trim();
    if (theme.faviconUrl?.trim())       cleaned.faviconUrl = theme.faviconUrl.trim();
    if (theme.welcomeHeadline?.trim())  cleaned.welcomeHeadline = theme.welcomeHeadline.trim();
    if (theme.welcomeSubtitle?.trim())  cleaned.welcomeSubtitle = theme.welcomeSubtitle.trim();
    if (theme.signInLabel?.trim())      cleaned.signInLabel = theme.signInLabel.trim();
    if (theme.adminLinkLabel?.trim())   cleaned.adminLinkLabel = theme.adminLinkLabel.trim();
    if (theme.adminUrl?.trim())         cleaned.adminUrl = theme.adminUrl.trim();
    if (typeof theme.showAdminLink === "boolean") cleaned.showAdminLink = theme.showAdminLink;
    state.embedThemes[siteId] = cleaned;
    saved = cleaned;
  });
  return saved;
}

export function clearEmbedTheme(siteId: string): void {
  mutate(state => { delete state.embedThemes[siteId]; });
}

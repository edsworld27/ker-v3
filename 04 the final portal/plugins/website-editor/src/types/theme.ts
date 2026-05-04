// ThemeRecord — flat token-based theme. Lifted from
// `02 felicias aqua portal work/src/portal/server/themes.ts`. Tokens map
// to CSS variables (`--theme-*`) injected by EditorThemeInjector at the
// page root.

import type { AgencyId, ClientId } from "../lib/tenancy";

export interface ThemeTokens {
  // Brand-kit-aligned colours
  "primary"?: string;
  "primary-foreground"?: string;
  "secondary"?: string;
  "secondary-foreground"?: string;
  "accent"?: string;
  "accent-foreground"?: string;
  "background"?: string;
  "foreground"?: string;
  "muted"?: string;
  "muted-foreground"?: string;
  "border"?: string;
  // Typography
  "font-heading"?: string;
  "font-body"?: string;
  "font-mono"?: string;
  // Layout
  "radius"?: string;
  "container-max-width"?: string;
  "section-padding-y"?: string;
  // Open extension — plugins or operators can extend.
  [token: string]: string | undefined;
}

export interface ThemeRecord {
  id: string;
  siteId: string;
  agencyId: AgencyId;
  clientId: ClientId;
  name: string;
  description?: string;
  tokens: ThemeTokens;
  isDefault?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface CreateThemeInput {
  siteId: string;
  agencyId: AgencyId;
  clientId: ClientId;
  name: string;
  description?: string;
  tokens?: ThemeTokens;
  isDefault?: boolean;
}

export interface UpdateThemePatch {
  name?: string;
  description?: string;
  tokens?: Partial<ThemeTokens>;
  isDefault?: boolean;
}

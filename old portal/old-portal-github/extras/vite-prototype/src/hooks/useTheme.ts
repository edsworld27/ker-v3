// ============================================================
// useTheme — The Color Token Hook
// ============================================================
// All color values in the app should come from here, not from
// hardcoded strings or Tailwind config. This is the "switcher
// variable" layer: one hook call, fully typed color tokens,
// all sourced from agencyConfig.identity as the single
// hardcoded/configurable source.
//
// Usage:
//   const theme = useTheme();
//   <div style={{ background: theme.primary }} />
//   <div className={theme.primaryBg} />  ← Tailwind inline variant
// ============================================================

import type React from 'react';
import { useAppContext } from '../context/AppContext';
import { agencyConfig as defaultConfig } from '../config/agencyConfig';

export interface ThemeTokens {
  /** Raw hex values — use in style={{ }} props */
  primary: string;
  secondary: string;
  /** Agency display name */
  agencyName: string;
  /** Agency tagline */
  tagline: string;
  /** Logo URL or null */
  logo: string | null;
  /**
   * Returns an inline style object with background set to the primary color.
   * For cases where you need a primary-colored background.
   */
  primaryBgStyle: React.CSSProperties;
  /**
   * Returns an inline style object with color set to the primary color.
   * For cases where you need primary-colored text.
   */
  primaryTextStyle: React.CSSProperties;
  /**
   * Returns an inline style object with border set to the primary color.
   */
  primaryBorderStyle: React.CSSProperties;
}

export function useTheme(): ThemeTokens {
  const { agencyConfig } = useAppContext();

  // Runtime config takes precedence over file defaults
  const identity = agencyConfig?.identity ?? defaultConfig.identity;

  return {
    primary: identity.primaryColor,
    secondary: identity.secondaryColor,
    agencyName: identity.name,
    tagline: identity.tagline,
    logo: identity.logo,
    primaryBgStyle: { backgroundColor: identity.primaryColor },
    primaryTextStyle: { color: identity.primaryColor },
    primaryBorderStyle: { borderColor: identity.primaryColor },
  };
}

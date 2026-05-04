// Login-portal customisation helpers. Round-1 minimal port from
// `02/src/lib/admin/loginCustomisation.ts` — exposes a typed shape
// that the LoginFormBlock reads.

export interface LoginCustomisation {
  submitLabel?: string;
  signupHref?: string;
  signupLabel?: string;
  showRememberMe?: boolean;
  showForgotPassword?: boolean;
  showSocialAuth?: boolean;
  helperText?: string;
}

export const DEFAULT_LOGIN_CUSTOMISATION: LoginCustomisation = {
  submitLabel: "Sign in",
  showRememberMe: true,
  showForgotPassword: true,
  showSocialAuth: false,
};

export function mergeLoginCustomisation(
  overrides: Partial<LoginCustomisation> | undefined,
): LoginCustomisation {
  return { ...DEFAULT_LOGIN_CUSTOMISATION, ...(overrides ?? {}) };
}

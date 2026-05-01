// Server-side store for portal-wide settings. Persisted via the cloud
// Backend (file/memory/kv) so admin teams share one source of truth and
// secrets never need to ride in request bodies after the first save.

import { getState, mutate } from "./storage";
import type { PortalSettings, PortalSettingsPatch } from "./types";

export type { PortalSettings };

export const DEFAULT_SETTINGS: PortalSettings = {
  github: { repoUrl: "", defaultBranch: "main" },
  database: { backend: "file" },
  deployment: {},
  integrations: {},
  compliance: { mode: "none" },
};

export function getSettings(): PortalSettings {
  const stored = getState().settings;
  if (!stored) return DEFAULT_SETTINGS;
  return {
    github:       { ...DEFAULT_SETTINGS.github,       ...stored.github       },
    database:     { ...DEFAULT_SETTINGS.database,     ...stored.database     },
    deployment:   { ...DEFAULT_SETTINGS.deployment,   ...stored.deployment   },
    integrations: { ...(DEFAULT_SETTINGS.integrations ?? {}), ...(stored.integrations ?? {}) },
    compliance: {
      mode: stored.compliance?.mode ?? DEFAULT_SETTINGS.compliance?.mode ?? "none",
      auditRetentionDaysOverride: stored.compliance?.auditRetentionDaysOverride ?? DEFAULT_SETTINGS.compliance?.auditRetentionDaysOverride,
      acknowledgedWarnings: stored.compliance?.acknowledgedWarnings ?? DEFAULT_SETTINGS.compliance?.acknowledgedWarnings,
    },
  };
}

export function saveSettings(patch: PortalSettingsPatch): PortalSettings {
  let saved!: PortalSettings;
  mutate(state => {
    const prev = state.settings ?? DEFAULT_SETTINGS;
    saved = {
      github:     { ...prev.github,     ...(patch.github     ?? {}) },
      database: {
        ...prev.database,
        ...(patch.database ?? {}),
        backend: patch.database?.backend ?? prev.database.backend,
      },
      deployment:   { ...prev.deployment,   ...(patch.deployment ?? {}) },
      integrations: { ...(prev.integrations ?? {}), ...(patch.integrations ?? {}) },
      compliance: patch.compliance
        ? { ...(prev.compliance ?? { mode: "none" }), ...patch.compliance, mode: patch.compliance.mode ?? prev.compliance?.mode ?? "none" }
        : prev.compliance,
    };
    state.settings = saved;
  });
  return saved;
}

export function resetSettings(): PortalSettings {
  mutate(state => {
    state.settings = null;
  });
  return DEFAULT_SETTINGS;
}

// Public projection — sensitive fields redacted. Used by any caller that
// might surface settings to an unauthenticated audience (today: nobody, but
// the shape exists so we don't accidentally leak when admin auth lands).
export function getPublicSettings(): PortalSettings {
  const s = getSettings();
  return {
    github: {
      repoUrl: s.github.repoUrl,
      defaultBranch: s.github.defaultBranch,
      // pat / appId / installationId omitted
    },
    database: { backend: s.database.backend },
    deployment: s.deployment,
  };
}

// Sentinel returned to the admin in place of the actual secret. The admin
// UI shows this as "•••••• saved" so the operator sees that a value is
// configured without ever re-fetching the secret itself.
export const SECRET_PLACEHOLDER = "__portal_secret_set__";

// Admin projection — secret fields are replaced with SECRET_PLACEHOLDER
// when set, so the UI can show "saved" without the secret leaving the
// server. POSTs that contain SECRET_PLACEHOLDER are interpreted as
// "leave unchanged".
export function getAdminSettings(): PortalSettings {
  const s = getSettings();
  return {
    github: {
      repoUrl: s.github.repoUrl,
      defaultBranch: s.github.defaultBranch,
      appId: s.github.appId ?? "",
      installationId: s.github.installationId ?? "",
      pat: s.github.pat ? SECRET_PLACEHOLDER : "",
    },
    database: {
      backend: s.database.backend,
      kvUrl: s.database.kvUrl ? SECRET_PLACEHOLDER : "",
      postgresUrl: s.database.postgresUrl ? SECRET_PLACEHOLDER : "",
    },
    deployment: { ...s.deployment },
    integrations: {
      vercelToken: s.integrations?.vercelToken ? SECRET_PLACEHOLDER : "",
      autoDiscover: s.integrations?.autoDiscover,
    },
    compliance: s.compliance,
  };
}

// Strip placeholders out of an incoming patch so they never overwrite the
// real stored secret. Anything else passes through.
export function applyAdminPatch(patch: PortalSettingsPatch): PortalSettings {
  const cleaned: PortalSettingsPatch = {};
  if (patch.github) {
    const g: NonNullable<PortalSettingsPatch["github"]> = { ...patch.github };
    if (g.pat === SECRET_PLACEHOLDER) delete g.pat;
    cleaned.github = g;
  }
  if (patch.database) {
    const d: NonNullable<PortalSettingsPatch["database"]> = { ...patch.database };
    if (d.kvUrl === SECRET_PLACEHOLDER) delete d.kvUrl;
    if (d.postgresUrl === SECRET_PLACEHOLDER) delete d.postgresUrl;
    cleaned.database = d;
  }
  if (patch.deployment) cleaned.deployment = { ...patch.deployment };
  if (patch.integrations) {
    const i: NonNullable<PortalSettingsPatch["integrations"]> = { ...patch.integrations };
    if (i.vercelToken === SECRET_PLACEHOLDER) delete i.vercelToken;
    cleaned.integrations = i;
  }
  if (patch.compliance) cleaned.compliance = { ...patch.compliance };
  return saveSettings(cleaned);
}

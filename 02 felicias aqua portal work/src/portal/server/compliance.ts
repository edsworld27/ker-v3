// Compliance helpers — read the active mode from settings and surface
// the rules the rest of the server enforces. Single source of truth so
// the admin UI shows the same answers the API gates produce.

import { getSettings } from "./settings";
import { getBackendInfo } from "./storage";
import {
  NON_BAA_TRACKER_PROVIDERS,
  NON_BAA_EMBED_PROVIDERS,
  RETENTION_DAYS,
  type ComplianceMode,
  type ComplianceSettings,
} from "./types";

export type { ComplianceMode, ComplianceSettings };

const DEFAULT_COMPLIANCE: ComplianceSettings = {
  mode: "none",
  acknowledgedWarnings: [],
};

export function getCompliance(): ComplianceSettings {
  const stored = getSettings().compliance;
  if (!stored) return DEFAULT_COMPLIANCE;
  return { ...DEFAULT_COMPLIANCE, ...stored };
}

export function getComplianceMode(): ComplianceMode {
  return getCompliance().mode;
}

export function auditRetentionDays(): number {
  const c = getCompliance();
  if (c.auditRetentionDaysOverride && c.auditRetentionDaysOverride > 0) {
    return c.auditRetentionDaysOverride;
  }
  return RETENTION_DAYS[c.mode];
}

// True if the given tracker provider is allowed under the active
// compliance mode. HIPAA blocks every non-BAA provider; GDPR allows
// everything but enforces consent gating elsewhere; SOC 2 doesn't gate
// providers (it gates audit + access); none is unrestricted.
export function isTrackerProviderAllowed(provider: string): boolean {
  const mode = getComplianceMode();
  if (mode === "hipaa" && NON_BAA_TRACKER_PROVIDERS.includes(provider)) return false;
  return true;
}

export function isEmbedProviderAllowed(provider: string): boolean {
  const mode = getComplianceMode();
  if (mode === "hipaa" && NON_BAA_EMBED_PROVIDERS.includes(provider)) return false;
  return true;
}

// True if straight customer impersonation is allowed. HIPAA blocks
// session-as-customer outright; SOC 2 requires re-auth + audit, which
// the legacy ImpersonationBar doesn't satisfy, so we block it there
// too. The customer-edit replacement (E-4) is permitted under all
// modes because every change is logged to the customer's record.
export function isImpersonationAllowed(): boolean {
  const mode = getComplianceMode();
  return !(mode === "hipaa" || mode === "soc2");
}

// Computed compliance dashboard — what the /admin/compliance page
// renders. Each check has a status: ok, warn (worth surfacing but
// non-blocking), or fail (mode is currently violated).
export type CheckStatus = "ok" | "warn" | "fail";

export interface ComplianceCheck {
  id: string;
  label: string;
  status: CheckStatus;
  detail: string;
  fixHint?: string;       // human-readable next step
}

export function getComplianceReport(): {
  mode: ComplianceMode;
  retentionDays: number;
  checks: ComplianceCheck[];
} {
  const mode = getComplianceMode();
  const checks: ComplianceCheck[] = [];

  // 1. Active backend persistence — read from getBackendInfo() so we see
  // the *actual* runtime choice (env-driven), not just the admin's intent.
  const settings = getSettings();
  const backendInfo = getBackendInfo();
  if (mode !== "none" && (backendInfo.kind === "memory" || !backendInfo.persistent)) {
    checks.push({
      id: "backend-ephemeral",
      label: "Storage backend",
      status: "fail",
      detail: "Active backend isn't persistent; state and audit log are lost on restart.",
      fixHint: "Set PORTAL_BACKEND=kv with PORTAL_KV_URL + PORTAL_KV_TOKEN, or run with a durable file backend.",
    });
  } else if (mode === "hipaa" && backendInfo.kind === "file") {
    checks.push({
      id: "backend-file-hipaa",
      label: "Storage backend",
      status: "warn",
      detail: "File backend lives on the host disk. Verify your hosting provider offers encryption-at-rest.",
      fixHint: "Switch to KV with a HIPAA-eligible Upstash plan, or use a self-hosted Postgres with encryption.",
    });
  } else {
    checks.push({
      id: "backend-ok",
      label: "Storage backend",
      status: "ok",
      detail: `Active backend: ${backendInfo.kind} (${backendInfo.persistent ? "persistent" : "ephemeral"}).`,
    });
  }

  // 2. Audit retention
  const days = auditRetentionDays();
  checks.push({
    id: "audit-retention",
    label: "Audit log retention",
    status: "ok",
    detail: `Activity entries older than ${days} days are purged. Mode default for ${mode}.`,
  });

  // 3. Impersonation
  if (mode === "hipaa" || mode === "soc2") {
    checks.push({
      id: "impersonation",
      label: "Customer impersonation",
      status: "ok",
      detail: "Disabled under this mode. Use the Edit/Configure flow on the customer record.",
    });
  } else {
    checks.push({
      id: "impersonation",
      label: "Customer impersonation",
      status: "warn",
      detail: "Allowed under the current mode. Prefer Edit/Configure for an audit-friendly trail.",
    });
  }

  // 4. GitHub PAT presence
  if (settings.github.repoUrl && !settings.github.pat) {
    checks.push({
      id: "github-pat",
      label: "GitHub credentials",
      status: "warn",
      detail: "Repo URL is set but no PAT — promote-to-PR will fail.",
      fixHint: "Add a PAT in /admin/portal-settings, or install a GitHub App.",
    });
  }

  // 5. Preview secret
  if (mode !== "none" && !process.env.PORTAL_PREVIEW_SECRET) {
    checks.push({
      id: "preview-secret",
      label: "Preview link signing secret",
      status: "warn",
      detail: "Using a built-in dev fallback for PORTAL_PREVIEW_SECRET. Tokens can be forged across deployments using the same fallback.",
      fixHint: "Set PORTAL_PREVIEW_SECRET to a long random value in your hosting env.",
    });
  }

  return { mode, retentionDays: days, checks };
}

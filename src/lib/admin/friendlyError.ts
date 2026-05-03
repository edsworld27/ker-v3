// Translate API error codes to human-readable strings.
//
// The portal's API routes return short machine-readable error codes
// ("missing-fields", "rate-limited", "exceeds-outstanding", …). The
// admin UI surfaces those in toasts, which is fine for developers but
// opaque for non-technical operators. This module is the single
// source of translation.
//
// Usage:
//   const { title, message, hint } = friendlyError(data.error, "Couldn't save");
//   notify({ tone: "error", title, message: hint ? `${message} ${hint}` : message });

export interface FriendlyError {
  title: string;
  message: string;
  hint?: string;
}

interface Mapping {
  title: string;
  message: string;
  hint?: string;
}

// Catalog of known codes. Add new ones here as you introduce them on
// the server. Unknown codes pass through with the raw code surfaced in
// the message so you can spot the gap and add a row.
const CATALOG: Record<string, Mapping> = {
  // Auth
  "unauthorized": {
    title: "Sign in required",
    message: "Your session has expired. Sign in again to continue.",
  },
  "forbidden": {
    title: "Not allowed",
    message: "Your role doesn't have permission for this. Ask an admin to grant access.",
  },
  "invalid-credentials": {
    title: "Sign-in failed",
    message: "That email and password combination doesn't match a known account.",
  },
  "invalid-current-password": {
    title: "Wrong current password",
    message: "Double-check the password you typed in the 'Current password' field.",
  },
  "rate-limited": {
    title: "Too many attempts",
    message: "Wait a minute and try again — we throttle repeated requests to keep accounts safe.",
  },

  // Generic request shape
  "bad-json": {
    title: "Couldn't read the request",
    message: "The data sent was malformed. Reload the page and try again.",
  },
  "missing-fields": {
    title: "Missing details",
    message: "Some required fields weren't filled in. Check for highlighted boxes above.",
  },
  "not-found": {
    title: "Not found",
    message: "The thing you're looking for has been moved or deleted.",
  },

  // Memberships
  "unknown-tier": {
    title: "Unknown tier",
    message: "The tier you picked has been deleted. Refresh the list and try again.",
  },

  // Affiliates / payouts
  "unknown-affiliate": {
    title: "Affiliate not found",
    message: "This affiliate has been removed since the page loaded. Refresh and try again.",
  },
  "non-positive-amount": {
    title: "Amount must be positive",
    message: "Enter a number greater than zero.",
  },
  "exceeds-outstanding": {
    title: "Amount too high",
    message: "You're trying to pay more than the affiliate is owed. Lower the amount.",
  },

  // Backups
  "backup-not-found": {
    title: "Snapshot not found",
    message: "That backup has been deleted. Refresh the list and pick another.",
  },
  "backup-failed": {
    title: "Backup failed",
    message: "Something went wrong while writing the snapshot.",
    hint: "Check disk space (file adapter) or S3 credentials (S3 adapter).",
  },

  // Domains / Vercel
  "missing-domain": {
    title: "Domain required",
    message: "Type a domain in the box first (e.g. shop.example.com).",
  },

  // Stripe / billing portal
  "billing-portal-failed": {
    title: "Couldn't open billing portal",
    message: "Stripe couldn't mint a portal session for this customer.",
    hint: "Check that STRIPE_SECRET_KEY is set and the customer exists in your Stripe account.",
  },
};

export function friendlyError(rawCode: string | undefined, fallbackTitle = "Something went wrong"): FriendlyError {
  if (!rawCode) {
    return { title: fallbackTitle, message: "An unexpected error occurred. Try again in a moment." };
  }
  const known = CATALOG[rawCode];
  if (known) return known;
  // Unknown code — pass through but tag the raw code so devs can spot
  // the gap and add a translation.
  return {
    title: fallbackTitle,
    message: rawCode,
    hint: "If you keep seeing this, mention the message text to your admin.",
  };
}

// Convenience for the most common pattern: takes a fetch response +
// already-parsed body, returns a FriendlyError. Handles HTTP-level
// failures (non-2xx without an error code) with a generic message.
export function friendlyFromResponse(
  res: Response,
  body: { ok?: boolean; error?: string } | null,
  fallbackTitle = "Something went wrong",
): FriendlyError {
  if (body?.error) return friendlyError(body.error, fallbackTitle);
  if (res.status === 401) return friendlyError("unauthorized", fallbackTitle);
  if (res.status === 403) return friendlyError("forbidden", fallbackTitle);
  if (res.status === 404) return friendlyError("not-found", fallbackTitle);
  if (res.status === 429) return friendlyError("rate-limited", fallbackTitle);
  return {
    title: fallbackTitle,
    message: `Server error (HTTP ${res.status}). Try again in a moment.`,
  };
}

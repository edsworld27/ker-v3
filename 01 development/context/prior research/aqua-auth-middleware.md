# Aqua auth + middleware + admin libs (`02 felicias aqua portal work/src/lib/`)

Auth model, security headers, rate limits, the dual client-localStorage / server-cookie session, and the rich `src/lib/admin/` helper library.

> Source: agent 4 sweep of `src/lib/server/auth.ts`, `src/lib/auth.ts`, `src/middleware.ts`, `next.config.ts`, `src/lib/admin/`.

## Sessions

Dual-track:
1. **Server-side**: HMAC-signed cookie `lk_session_v1`. Source of truth for auth checks.
2. **Client-side scaffold**: localStorage `lk_session_v1`. UI state mirror; allows older client code paths to read `getSession()` without an API call.

### Server (`src/lib/server/auth.ts`)
- **Token format**: `${b64-payload}.${HMAC-SHA256-sig}`
- **Payload**: `{ email, iat, exp }` (Unix seconds)
- **Cookie**: httpOnly + sameSite=lax + secure-in-prod
- **Max age**: 30 days (`60 * 60 * 24 * 30`)
- **Secret**: `PORTAL_SESSION_SECRET` env. Fallback to `"dev-secret-do-not-use-in-prod"` for local dev (intentional).
- **API**:
  - `signSession(email)` — used by `/api/auth/login`
  - `verifySession(token)` — returns SessionPayload or null
  - `getCurrentUser()` — reads cookie + verifies + returns ServerUser
  - `getCurrentUserFromReq(req)` — same for `NextRequest`
  - `requireAdmin()` — throws Response(401/403) if not signed in or not admin (bypassed if `NEXT_PUBLIC_PORTAL_SECURITY=off` or `NEXT_PUBLIC_PORTAL_DEV_BYPASS=1`)

### Client scaffold (`src/lib/auth.ts`)
- **Storage key**: `lk_session_v1` (localStorage)
- **Format**: `Session = { user, accessToken, expiresAt }`
- **Expiry**: 30 days
- **API**: `getSession()`, `startSession(user)`, `signOut()` — fires `AUTH_EVENT` so navbar/account refresh
- **Role resolution**: `isAdminEmail(email)` checks hardcoded `ADMIN_EMAILS` (`felicia@luvandker.com`, `edwardhallam07@gmail.com`). Dev user `dev@local.portal` gets admin role only when security mode ≠ `"strict"`.

## Password hashing — scrypt

`src/portal/server/users.ts` uses Node stdlib scrypt (RFC 7914):
- N=16384, r=8, p=1
- 16-byte random per-user salt
- 32-byte derived key
- Comparison: `crypto.timingSafeEqual` on the derived buffer
- **Dummy hash on user-not-found** — runs scrypt against a constant-but-unused payload so timing doesn't leak whether the email exists. Defangs email-enumeration via timing.
- **Legacy upgrade**: existing sha256+salt hashes detected at login and transparently upgraded to scrypt.

> The client-side scaffold (`src/lib/auth.ts`) uses a `tinyHash()` only for the localStorage demo path. **Not** production-grade; the scaffold is being phased out as Shopify integration lands.

## Rate limits — `src/lib/server/rateLimit.ts`

In-memory token-bucket throttle. Per-IP and per-email maps reset on cold start (not distributed-safe; suitable for single-instance Vercel deploys).

- `/api/auth/login` — 10/min per IP, 5/min per email
- `/api/portal/analytics/track` — public ingest, rate-limited per-IP
- `/api/portal/forms/submit` — public submission, rate-limited per-IP
- `/api/portal/affiliates/track-click` — public, per-IP
- 429 response with `Retry-After` header + `retryAfterSec` JSON

Client IP detection from `X-Forwarded-For` / `X-Real-IP`.

## Open-redirect guard

`/login?next=` redirects accept relative paths only. Validation: `raw.startsWith("/") && !raw.startsWith("//")` — rejects protocol-relative (`//evil.com`) and absolute URLs. Defaults to `/admin` if guard rejects.

## requireAdmin() flow

1. Read env: `NEXT_PUBLIC_PORTAL_SECURITY` (default `"strict"`), `NEXT_PUBLIC_PORTAL_DEV_BYPASS` (legacy).
2. If `legacy=1` or `security=off`, return null (admin check disabled).
3. Otherwise, `getCurrentUser()`.
4. If null → throw `Response(401, "unauthorized")`.
5. If role ≠ `super-admin`/`admin` → throw `Response(403, "forbidden")`.
6. Return ServerUser.

**Dev bypass modes:**
- `NEXT_PUBLIC_PORTAL_SECURITY=strict` — production; `/login` has no dev button.
- `NEXT_PUBLIC_PORTAL_SECURITY=dev` (default for local) — auth enforced but `/login` shows `Dev mode` button → POST `/api/auth/dev` → `signInAsDev()`.
- `NEXT_PUBLIC_PORTAL_SECURITY=off` or `NEXT_PUBLIC_PORTAL_DEV_BYPASS=1` — auth bypassed entirely.
- Client-side override: `setSecurityModeOverride()` in localStorage (`lk_security_mode_v1`) wins over env vars.

## /api/auth endpoints

| endpoint | method | auth | purpose |
|----------|--------|------|---------|
| `/api/auth/login` | POST | rate-limited | First-run bootstrap if user table empty; otherwise verifyPassword + signSession |
| `/api/auth/logout` | POST | session | Clears `lk_session_v1` cookie |
| `/api/auth/me` | GET | session | Returns `{ user: CurrentUser } \| { error }` |
| `/api/auth/dev` | POST | dev-only | `signInAsDev()` — creates synth admin session |
| `/api/auth/change-password` | POST | session | Requires active session, not impersonating. Updates hash, clears `mustChangePassword` |
| `/api/auth/forgot-password` | POST | (scaffold) | Sends fake-success regardless of email existence (timing-safe). TODO Shopify customerRecover |
| `/api/auth/reset-password` | POST | (scaffold) | TODO Shopify customerResetByUrl |
| `/api/auth/verify` | POST | (scaffold) | TODO Shopify customerActivateByUrl |

## Force-password-change

- **Trigger**: admin-created user via `adminCreateUser(input, tempPassword)` sets `mustChangePassword: true` on `ServerUser`.
- **Surfaced**: `/api/auth/me` returns the flag; `/api/auth/login` returns it on first sign-in.
- **Enforcement**: admin shell redirects to `/account/change-password?forced=1` when set.
- **Clear**: `/api/auth/change-password` succeeds → server clears the flag.

## Network/response hardening — `next.config.ts`

Headers applied to all responses (except editor iframe routes — `X-Frame-Options DENY` would break admin-in-iframe edit mode):

| Header | Value | Purpose |
|--------|-------|---------|
| Strict-Transport-Security | `max-age=63072000; includeSubDomains; preload` | HSTS — force HTTPS for 2 years |
| X-Content-Type-Options | `nosniff` | Block MIME sniffing |
| Referrer-Policy | `strict-origin-when-cross-origin` | Leak only origin cross-origin |
| Permissions-Policy | `camera=(), microphone=(), geolocation=(), interest-cohort=()` | Disable unused APIs + block FLoC |

## Content Security Policy

Mode: soft / permissive (no nonces). Lenient on script-src so Tailwind + Next inline keep working; strict on object-src / base-uri / form-action.

| directive | value |
|-----------|-------|
| `default-src` | `'self'` |
| `script-src` | `'self' 'unsafe-inline' 'unsafe-eval' https:` |
| `style-src` | `'self' 'unsafe-inline' https:` |
| `img-src` | `'self' data: blob: https:` |
| `media-src` | `'self' blob: https:` |
| `font-src` | `'self' data: https:` |
| `connect-src` | `'self' https: wss:` |
| `frame-src` | `'self' https:` |
| `object-src` | `'none'` |
| `base-uri` | `'self'` |
| `form-action` | `'self'` |

## SSRF guard — `/api/portal/links/[siteId]?check=1`

Broken-link checker is admin-gated AND blocks:
- RFC1918 (10.x, 172.16-31.x, 192.168.x)
- Cloud metadata (`169.254.169.254`)
- IPv6 loopback (`::1`, `fe80:`)

Implemented in `src/lib/server/ssrfGuard.ts`.

## Middleware — `src/middleware.ts`

Lightweight, edge-optimised. Matcher: `/admin/:path*`. Behaviour:

- `NEXT_PUBLIC_PORTAL_SECURITY=true` / `"strict"` → require `lk_session_v1` cookie. Unsigned → `/login?next=<original-path>`.
- Unset / `"dev"` / `"false"` / `"off"` → dev bypass; no auth.
- Legacy: `NEXT_PUBLIC_PORTAL_DEV_BYPASS=1` also disables auth.

Full validation (signature, expiry, role) happens server-side per-API-call via `getCurrentUser()` / `requireAdmin()`. Middleware only gates UX rendering of admin chrome.

## Client-side libs — `src/lib/admin/`

~53 files managing admin UI state. Key ones for storefront integration:

| file | manages | storage key | events |
|------|---------|-------------|--------|
| `content.ts` | Published + draft text overrides | `lk_admin_content_v2` | `onContentChange()` |
| `media.ts` | Media library refs | `lk_admin_media_v1` | `onMediaChange()` |
| `portalCache.ts` | Cached portal published content | `lk_portal_cache_v1` | `onPortalCacheChange()` |
| `editorPages.ts` | Portal-created pages + portal variants | per-page localStorage | `onPagesChange()` |
| `customPages.ts` | Custom nav pages | `lk_custom_pages_v1` | `onCustomPagesChange()` |
| `products.ts` | Product overrides | `lk_admin_products_v1` | `onProductsChange()` |
| `collections.ts` | Product collections | `lk_admin_collections_v1` | `onCollectionsChange()` |
| `faq.ts` | FAQ entries | `lk_admin_faq_v1` | `onFaqChange()` |
| `blog.ts` | Blog posts | `lk_admin_blog_v1` | `onBlogChange()` |
| `marketing.ts` | Discount codes, attribution capture | `lk_admin_marketing_v1` | reads `?src=` and `?aff=` on first load |
| `inventory.ts` | Stock SKU tracking | localStorage | `syncReservations`, `stashPendingSale`, `consumeStock` |
| `reviews.ts` | Customer reviews | `lk_admin_reviews_v1` | `onReviewsChange()` |
| `featureFlags.ts` | Feature gates | `lk_feature_flags_v1` | onChange |
| `abtests.ts` | A/B test definitions | `lk_ab_tests_v1` | variant ID + change |
| `editorMode.ts` | Admin edit mode + preview mode | `lk_admin_edit_mode_v1`, `lk_admin_preview_mode` | `onEditorModeChange()` |
| `loginCustomisation.ts` | `/login` page customisation | `lk_login_customisation_v1` | onChange |
| `sidebarLayout.ts` | Left sidebar menu structure | `lk_sidebar_layout_v1` | (admin-only) |
| `installedPlugins.ts` | Per-org install cache + getPluginSidebarContributions | localStorage | onChange |
| `sites.ts` | Multi-site config (org IDs, custom domains) | `lk_sites_v1` | `onSitesChange()` |
| `theme.ts` + `themeVariants.ts` | Brand colours, type, spacing | `lk_admin_theme_v1` | `onThemeChange()` |
| `helpDocs.ts` | Per-route help docs (54 surfaces — Ask Aqua source) | inline | — |
| `friendlyError.ts` | Maps API error codes to operator-friendly strings | inline | — |
| `tabSets.ts` | `MARKETPLACE_TABS`, `SETTINGS_TABS`, `CONTENT_TABS`, `productDetailTabs(slug)` | inline | — |
| `portalStarters.ts` | Per-role starter block trees | inline | — |

**Pattern**: most files export `get*()`/`list*()` for reads, `set*()` for writes, and `on*Change(callback)` to subscribe via custom events (so cross-tab edits in another window propagate live).

# The Final Portal — Milesy Media (mock)

A standalone, no-build agency website mock for **Milesy Media**. Three pages
+ one CSS file, no dependencies, no install step.

## Pages

| File         | Purpose                                                     |
|--------------|-------------------------------------------------------------|
| `index.html` | Marketing landing page — hero, services, stats, testimonials, CTA |
| `login.html` | Centred login form with email + password + **Admin access** button |
| `admin.html` | Placeholder admin dashboard — sidebar, KPI strip, activity feed |
| `styles.css` | Shared design tokens + component CSS                         |

## How to view

Just open `index.html` in a browser:

```bash
open "the final portal/index.html"
```

Or serve it on a local port (handy if you want clean URLs):

```bash
cd "the final portal"
python3 -m http.server 4321
# → http://localhost:4321
```

## Flow

```
index.html  ──▶ login.html  ──▶ admin.html
   ↑                                │
   └────────── home / sign out ─────┘
```

The login form accepts any email + 8+ char password and bounces straight
to `admin.html` (no backend yet — this is a UI scaffold for design review).
The dedicated **Admin access** button under the form skips the email/pw
step entirely and drops you into the admin dashboard.

## Why this folder exists

It's the design ground-truth for the Milesy Media brand surface that will
eventually be built as a real Next.js app inside the Aqua / ker-v3 portal
platform. Treat this folder as a reference mock — colours, type, layout,
component shapes — not as production code.

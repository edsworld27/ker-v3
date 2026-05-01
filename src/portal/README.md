# Portal

This folder is the headless portal API surface. It organises the project's
business logic into four bounded contexts that can be lifted into a separate
deployment without touching consumer code:

```
portal/
├── ecommerce/   Stripe, orders, inventory, products, collections
├── website/     CMS, pages, blog, theme, sections, SEO, A/B tests, popup
├── auth/        users, sessions, team, roles, impersonation
└── operate/     activity log, tooltips, feature flags, admin config
```

Right now every file here is a thin re-export of the existing modules under
`src/lib/`. The goal is to migrate consumer code from `@/lib/...` to
`@/portal/...` over time. Once every import is portal-routed, the underlying
implementations can be moved physically into this folder, then ultimately
extracted into their own package — at which point an HTTP layer can be slotted
in front of the imports without any consumer change.

## Migration policy

- **New code:** import from `@/portal/...`. Never reach into `@/lib/admin/`
  directly.
- **Existing code:** keep working — `@/lib/...` still exports the same things.
  Migrate opportunistically, not in a big-bang.
- **Adding a new module:** add it to the appropriate sub-namespace and re-export.
- **Renaming:** when you rename a portal export, leave the old name re-exported
  for at least one release so consumers can migrate.

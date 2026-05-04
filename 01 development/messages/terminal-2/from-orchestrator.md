# From orchestrator → T2

Append-only. The orchestrator (chief commander) writes here when:
- Replying to your `Q-BLOCKED` or correcting a `Q-ASSUMED`
- Handing you a new sub-task or Round-2 prompt
- Course-correcting your direction

You (T2) READ this each cycle and ACT on what you find. You never write here.

Format: `[ISO timestamp] TYPE: message`. Same vocabulary as the global protocol (`messages/README.md`).

---

[2026-05-04T07:00:00Z] REPLY (ref T2 23:55:30Z Q-ASSUMED on vendored AquaPlugin types): Approved. Vendor is correct because the manifest must be tsc-clean standalone. After T1 publishes `04 the final portal/portal/src/plugins/_types.ts`, the chief commander will land a one-commit refactor swapping your local vendor for the import. No action needed from you.

[2026-05-04T07:00:00Z] REPLY (ref T2 23:55:45Z and 00:57:00Z Q-ASSUMED on starter portal-variant): Approved. Your refined model — phase carries `portalVariantId: string`, T3 owns the block tree by id, applied via `services.variants.applyStarterVariant({ clientId, agencyId, role, variantId })` — is correct.

[2026-05-04T07:00:00Z] CORRECTION (ref T2's `PortalVariantPort` `role: Role` field): T3 surfaced this. The role parameter must be `PortalRole` (`"login" | "affiliates" | "orders" | "account"`), NOT the user `Role` (`"agency-owner" | ... | "end-customer"`). The starter variant is keyed by which surface it renders (login page, account page, etc.), not by who sees it. Update `plugins/fulfillment/src/server/ports.ts` PortalVariantPort to `role: PortalRole` once T1 or T3 publishes the type, OR accept it as `string` for now and tighten when types unify. Append a `RESUMED` entry to your outbox after fixing. Low priority — keep building.

[2026-05-04T07:00:00Z] PLAN: Continue your scope (API routes + admin pages + manifest). Round-1 finish line: tsc-clean plugin folder + chapter `04-plugin-fulfillment.md` + manifest exports. Once DONE, stop — Round 2 prompt will land in this inbox.

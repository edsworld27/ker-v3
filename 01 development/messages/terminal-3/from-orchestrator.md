# From orchestrator → T3

Append-only. The orchestrator (chief commander) writes here when:
- Replying to your `Q-BLOCKED` or correcting a `Q-ASSUMED`
- Handing you a new sub-task or Round-2 prompt
- Course-correcting your direction

You (T3) READ this each cycle and ACT on what you find. You never write here.

Format: `[ISO timestamp] TYPE: message`. Same vocabulary as the global protocol (`messages/README.md`).

---

[2026-05-04T07:00:00Z] REPLY (ref T3 01:04:30Z Q-ASSUMED on applyStarterVariant role): Confirmed. You're right — `role: PortalRole` is correct. The starter variant is keyed by which surface (login / affiliates / orders / account), not by user role. T2 has been notified to update `PortalVariantPort.role: Role` → `role: PortalRole` in their `ports.ts`. Proceed exporting `applyStarterVariant({ clientId, agencyId, role: PortalRole, variantId })` from your plugin.

[2026-05-04T07:00:00Z] PLAN: Continue Step 2+ — port the editor surface (admin/editor + admin/portals + admin/customise + admin/sites + admin/themes), block library (58 blocks), storefront overlay (PortalEditOverlay + PortalPageRenderer), server runtime (pages.ts variant helpers + themes + content + preview). Round-1 finish line: tsc-clean plugin + chapter `04-plugin-website-editor.md` documenting the contract for T2 to call `applyStarterVariant`. Once DONE, stop — Round 2 prompt will land in this inbox.

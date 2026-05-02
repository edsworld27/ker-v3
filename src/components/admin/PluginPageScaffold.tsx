"use client";

// PluginPageScaffold — shared chrome for plugin admin pages whose
// runtime hasn't fully landed yet (or whose UI is intentionally minimal).
// Gives every page a consistent header, eyebrow, optional back link and
// empty-state card so a sidebar nav item never lands on a blank screen.
//
// Usage:
//   <PluginPageScaffold
//     pluginId="memberships"
//     eyebrow="People"
//     title="Member directory"
//     description="Everyone who's signed up across your tiers."
//     backHref="/admin/memberships" backLabel="Memberships"
//     emptyTitle="No members yet"
//     emptyHint="When someone signs up they'll appear here."
//   />
//
// Children opt out of the empty-state card and render whatever you want
// inside the page chrome.

import type { ReactNode } from "react";
import Link from "next/link";
import PluginRequired from "@/components/admin/PluginRequired";

interface Props {
  // Page metadata
  eyebrow?: string;
  title: string;
  description?: string;

  // Plugin gate (skipped if pluginId is omitted)
  pluginId?: string;
  feature?: string;

  // Optional back link (shown above the header)
  backHref?: string;
  backLabel?: string;

  // Right-aligned header actions (typically buttons)
  actions?: ReactNode;

  // Empty-state card shown when no children supplied
  emptyTitle?: string;
  emptyHint?: string;

  // Override the empty state with your own body
  children?: ReactNode;
}

export default function PluginPageScaffold(props: Props) {
  const body = <Body {...props} />;
  if (props.pluginId) {
    return (
      <PluginRequired plugin={props.pluginId} feature={props.feature}>
        {body}
      </PluginRequired>
    );
  }
  return body;
}

function Body({
  eyebrow, title, description,
  backHref, backLabel,
  actions,
  emptyTitle, emptyHint,
  children,
}: Props) {
  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-5xl space-y-6">
      {backHref && (
        <Link
          href={backHref}
          className="text-xs text-brand-cream/55 hover:text-brand-cream inline-block"
        >
          ← {backLabel ?? "Back"}
        </Link>
      )}

      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          {eyebrow && (
            <p className="text-[11px] tracking-[0.28em] uppercase text-brand-amber mb-2">
              {eyebrow}
            </p>
          )}
          <h1 className="font-display text-3xl sm:text-4xl text-brand-cream">
            {title}
          </h1>
          {description && (
            <p className="text-brand-cream/55 text-sm mt-1 max-w-prose leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
      </header>

      {children ?? (
        <section className="rounded-2xl border border-white/8 bg-brand-black-card p-6 sm:p-8 text-center">
          <p className="text-[13px] text-brand-cream/85">
            {emptyTitle ?? "Nothing here yet."}
          </p>
          {emptyHint && (
            <p className="text-[12px] text-brand-cream/55 mt-2 max-w-sm mx-auto leading-relaxed">
              {emptyHint}
            </p>
          )}
        </section>
      )}
    </div>
  );
}

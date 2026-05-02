"use client";

// /admin/donations/goals — campaign goals for the donations plugin.
// The /admin/donations overview links here from "Manage goals →"; until
// the goals API lands we surface a clear placeholder so the operator
// knows where this is going instead of hitting a 404.

import Link from "next/link";
import PluginRequired from "@/components/admin/PluginRequired";
import SetupRequired from "@/components/admin/SetupRequired";

export default function DonationGoalsPage() {
  return (
    <PluginRequired plugin="donations">
      <SetupRequired
        title="Donation goals are coming"
        message="Campaign-style fundraising goals (e.g. raise £5k for X) aren't wired yet. The donations overview shows aggregate stats meanwhile; this page will let you create + track each goal once the runtime ships."
        steps={[
          "Operators create a goal with a target amount",
          "Donation embed buttons link to the goal id",
          "This page shows progress + recent donors per goal",
        ]}
        cta={{ label: "Donations overview", href: "/admin/donations" }}
      />
    </PluginRequired>
  );
}

// Re-export for clarity of the link in /admin/donations.
export const _Link = () => <Link href="/admin/donations">Donations overview</Link>;

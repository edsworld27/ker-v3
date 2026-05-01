"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  listABTests, assign, recordView, recordConversion,
} from "@/lib/admin/abtests";

// Funnel step tracking moved server-side: when the storefront's
// AnalyticsTracker fires a pageview, /api/portal/analytics/track
// matches the URL against active funnels for the org and advances
// step counters. No client-side call needed here any more.

export default function ABTestRunner() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Run A/B tests
    const tests = listABTests().filter((t) => t.status === "running");
    for (const test of tests) {
      // Check if this page matches the target or goal
      const onTarget = pathname === test.targetPath;
      const onGoal = test.goalPath && pathname === test.goalPath;

      if (onTarget) {
        const variantId = assign(test);
        recordView(test.id, variantId);

        // Find variant and redirect if it points to a different page
        const variant = test.variants.find((v) => v.id === variantId);
        if (variant?.pageSlug) {
          router.replace(`/p/${variant.pageSlug}`);
        }
      }

      if (onGoal) {
        const variantId = assign(test); // returns existing assignment
        recordConversion(test.id, variantId);
      }
    }
  }, [pathname]);

  return null;
}

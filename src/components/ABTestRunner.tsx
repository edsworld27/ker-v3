"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  listABTests, assign, recordView, recordConversion,
} from "@/lib/admin/abtests";
import { matchAndRecord } from "@/lib/admin/funnels";

export default function ABTestRunner() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Track funnel step visits
    matchAndRecord(pathname);

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

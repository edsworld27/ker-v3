"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { getSections, onSectionsChange, type SectionDef } from "@/lib/admin/sections";
import FeaturedProducts from "@/components/FeaturedProducts";
import Problem from "@/components/Problem";
import Solution from "@/components/Solution";
import Shop from "@/components/Shop";

// Below-the-fold heavy components are dynamically imported so their
// JS doesn't compete with the initial render. SSR stays on so crawlers
// and the no-JS path still see the content; only the JS hydration is
// deferred. `loading: () => null` keeps the placeholder invisible —
// these sections sit far enough down the page that there's no LCP risk.
const SocialStrip  = dynamic(() => import("@/components/SocialStrip"),  { ssr: true, loading: () => null });
const Testimonials = dynamic(() => import("@/components/Testimonials"), { ssr: true, loading: () => null });

const SECTION_MAP: Record<string, React.ComponentType> = {
  social:       SocialStrip,
  featured:     FeaturedProducts,
  problem:      Problem,
  solution:     Solution,
  shop:         Shop,
  testimonials: Testimonials,
};

export default function HomeSections() {
  const [sections, setSections] = useState<SectionDef[]>([]);

  useEffect(() => {
    const refresh = () => setSections(getSections());
    refresh();
    return onSectionsChange(refresh);
  }, []);

  // SSR fallback: render in default order before hydration
  if (sections.length === 0) {
    return (
      <>
        <SocialStrip />
        <FeaturedProducts />
        <Problem />
        <Solution />
        <Shop />
        <Testimonials />
      </>
    );
  }

  return (
    <>
      {sections
        .filter((s) => s.id !== "hero" && s.visible && SECTION_MAP[s.id])
        .map((s) => {
          const Component = SECTION_MAP[s.id];
          return <Component key={s.id} />;
        })}
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { getSections, onSectionsChange, type SectionDef } from "@/lib/admin/sections";
import SocialStrip from "@/components/SocialStrip";
import FeaturedProducts from "@/components/FeaturedProducts";
import Problem from "@/components/Problem";
import Solution from "@/components/Solution";
import Shop from "@/components/Shop";
import Testimonials from "@/components/Testimonials";

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

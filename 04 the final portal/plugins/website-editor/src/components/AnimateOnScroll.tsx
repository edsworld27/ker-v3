// Animate-on-scroll wrapper. Round-1 pass-through; Round-2 lifts
// IntersectionObserver-driven animation from
// `02/src/components/editor/AnimateOnScroll.tsx`.

import type { ReactNode } from "react";
import type { BlockAnimation } from "../types/block";

export interface AnimateOnScrollProps {
  animation?: BlockAnimation;
  children: ReactNode;
}

export function AnimateOnScroll({ children }: AnimateOnScrollProps) {
  return <>{children}</>;
}

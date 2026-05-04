// Starter page templates offered when creating a new page in the editor.
// Round-1 minimal set; Round-2 lifts the full library from
// `02/src/components/editor/pageTemplates.ts`.

import type { Block } from "../types/block";
import { blockId } from "../lib/ids";

export interface PageTemplate {
  id: string;
  label: string;
  description?: string;
  blocks: Block[];
}

const blank = (): Block[] => [];

const heroPlusCta = (): Block[] => [
  {
    id: blockId("section"),
    type: "section",
    children: [
      { id: blockId("hero"), type: "hero", props: { title: "Welcome", subtitle: "Tell your story." } },
      { id: blockId("cta"), type: "cta", props: { label: "Get started", href: "#" } },
    ],
  },
];

export const PAGE_TEMPLATES: PageTemplate[] = [
  { id: "blank", label: "Blank", description: "Start from nothing.", blocks: blank() },
  {
    id: "hero-cta",
    label: "Hero + CTA",
    description: "A welcome hero followed by a call-to-action.",
    blocks: heroPlusCta(),
  },
];

export function getTemplate(id: string): PageTemplate | undefined {
  return PAGE_TEMPLATES.find((t) => t.id === id);
}

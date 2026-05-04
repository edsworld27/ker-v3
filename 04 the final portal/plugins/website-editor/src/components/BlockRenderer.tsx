// Recursive block renderer. Walks an `EditorPage.blocks` tree and
// renders each block via its registry-resolved component.
//
// Round 1: simple recursion + missing-type fallback. Round 2 adds:
//   - Split-test resolution (`variantResolver.ts`)
//   - Style overrides + responsive CSS (`blockStyles.ts`)
//   - Animation (AnimateOnScroll wrap)
//   - Visibility gates (member-gate, mobile/desktop, feature flags)
//   - Exposure tracking for split tests

import { Fragment } from "react";
import type { Block } from "../types/block";
import { getBlockEntry } from "./blockRegistry";

export interface BlockRendererProps {
  block: Block;
}

export function BlockRenderer({ block }: BlockRendererProps) {
  const entry = getBlockEntry(block.type);
  if (!entry) {
    return (
      <div
        data-block-missing={block.type}
        data-block-id={block.id}
        style={{
          padding: 16,
          border: "1px dashed #d97706",
          color: "#92400e",
          fontFamily: "monospace",
          fontSize: 12,
        }}
      >
        Unknown block type: <code>{block.type}</code>
      </div>
    );
  }
  const Component = entry.component;
  return <Component block={block} />;
}

export interface BlockTreeRendererProps {
  blocks: Block[];
}

export function BlockTreeRenderer({ blocks }: BlockTreeRendererProps) {
  return (
    <Fragment>
      {blocks.map((block) => (
        <BlockRenderer key={block.id} block={block} />
      ))}
    </Fragment>
  );
}

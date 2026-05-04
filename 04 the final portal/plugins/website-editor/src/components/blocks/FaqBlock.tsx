// FaqBlock — faq
//
// Round 1 placeholder. Renders props.children (so layout blocks compose
// correctly) and a debug data-attribute for Round-2 visual port from
// 02 felicias aqua portal work/src/components/editor/blocks/FaqBlock.tsx.

import type { BlockComponentProps } from "../blockRegistry";
import { BlockRenderer } from "../BlockRenderer";

export function FaqBlock({ block, children }: BlockComponentProps) {
  const childBlocks = block.children ?? [];
  return (
    <div data-block-type="faq" data-block-id={block.id}>
      {children ?? childBlocks.map((c) => <BlockRenderer key={c.id} block={c} />)}
    </div>
  );
}

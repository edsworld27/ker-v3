// MemberGateBlock — member-gate
//
// Round 1 placeholder. Renders props.children (so layout blocks compose
// correctly) and a debug data-attribute for Round-2 visual port from
// 02 felicias aqua portal work/src/components/editor/blocks/MemberGateBlock.tsx.

import type { BlockComponentProps } from "../blockRegistry";
import { BlockRenderer } from "../BlockRenderer";

export function MemberGateBlock({ block, children }: BlockComponentProps) {
  const childBlocks = block.children ?? [];
  return (
    <div data-block-type="member-gate" data-block-id={block.id}>
      {children ?? childBlocks.map((c) => <BlockRenderer key={c.id} block={c} />)}
    </div>
  );
}

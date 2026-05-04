// Split-test variant resolution. Round-1 stub — picks first variant
// deterministically. Round 2 wires real bucketing via cookie + exposure
// tracking (per `aqua-blocks.md:79`).

import type { Block, BlockVariant } from "../types/block";

export function resolveVariant(block: Block): BlockVariant | null {
  if (!block.variants || block.variants.length === 0) return null;
  return block.variants[0] ?? null;
}

export function applyVariantOverrides(block: Block): Block {
  const variant = resolveVariant(block);
  if (!variant) return block;
  return {
    ...block,
    props: { ...(block.props ?? {}), ...(variant.props ?? {}) },
    children: variant.children ?? block.children,
  };
}

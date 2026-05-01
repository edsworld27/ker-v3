"use client";

// Recursive renderer used by both the editor canvas and the host-side
// PortalPageRenderer. Looks up the block component in the registry and
// passes a renderChildren helper down so containers don't have to
// re-import the renderer.

import type { Block } from "@/portal/server/types";
import { getBlockDefinition } from "./blockRegistry";

export interface BlockRendererProps {
  blocks: Block[] | undefined;
  editorMode?: boolean;
}

export default function BlockRenderer({ blocks, editorMode = false }: BlockRendererProps) {
  if (!blocks || blocks.length === 0) return null;
  return (
    <>
      {blocks.map(block => <BlockNode key={block.id} block={block} editorMode={editorMode} />)}
    </>
  );
}

function BlockNode({ block, editorMode }: { block: Block; editorMode: boolean }) {
  const def = getBlockDefinition(block.type);
  if (!def) {
    // Unknown block type — render a visible warning in editor mode so
    // the operator notices, silent fallback (an empty fragment) on live.
    if (editorMode) {
      return (
        <div style={{ padding: 8, border: "1px dashed #ef4444", color: "#ef4444", fontSize: 12, borderRadius: 6 }}>
          Unknown block type: <code>{block.type}</code>
        </div>
      );
    }
    return null;
  }
  const Component = def.Component;
  return (
    <Component
      block={block}
      editorMode={editorMode}
      renderChildren={children => <BlockRenderer blocks={children} editorMode={editorMode} />}
    />
  );
}

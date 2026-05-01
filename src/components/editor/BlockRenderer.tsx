"use client";

// Recursive renderer used by both the editor canvas and the host-side
// PortalPageRenderer. Looks up the block component in the registry and
// passes a renderChildren helper down so containers don't have to
// re-import the renderer.

import type { Block } from "@/portal/server/types";
import { getBlockDefinition } from "./blockRegistry";
import AnimateOnScroll from "./AnimateOnScroll";
import { overridesToCssText } from "./blockStyles";

export interface BlockRendererProps {
  blocks: Block[] | undefined;
  editorMode?: boolean;
  themeId?: string;
}

export default function BlockRenderer({ blocks, editorMode = false, themeId }: BlockRendererProps) {
  if (!blocks || blocks.length === 0) return null;
  return (
    <>
      {blocks.map(block => <BlockNode key={block.id} block={block} editorMode={editorMode} themeId={themeId} />)}
    </>
  );
}

function BlockNode({ block, editorMode, themeId }: { block: Block; editorMode: boolean; themeId?: string }) {
  // Layer themeStyles on top of base styles when a theme is active.
  // Per-theme overrides win; everything else falls through.
  const themeOverlay = themeId ? block.themeStyles?.[themeId] : undefined;
  if (themeOverlay) {
    block = { ...block, styles: { ...(block.styles ?? {}), ...themeOverlay } };
  }
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
  const componentNode = (
    <Component
      block={block}
      editorMode={editorMode}
      renderChildren={children => <BlockRenderer blocks={children} editorMode={editorMode} themeId={themeId} />}
    />
  );
  // A11y wrapper — applies admin-set ARIA attributes to a transparent
  // div around the component. Only emitted when the admin has set at
  // least one attribute, so DOM stays clean by default.
  const a = block.a11y;
  const hasA11y = a && (a.ariaLabel || a.ariaLabelledBy || a.role || a.ariaHidden || a.htmlId || a.tabIndex !== undefined);
  const node = hasA11y ? (
    <div
      id={a!.htmlId || undefined}
      role={a!.role || undefined}
      aria-label={a!.ariaLabel || undefined}
      aria-labelledby={a!.ariaLabelledBy || undefined}
      aria-hidden={a!.ariaHidden ? true : undefined}
      tabIndex={a!.tabIndex}
      style={{ display: "contents" }}
    >
      {componentNode}
    </div>
  ) : componentNode;

  // Per-block responsive override style tag — only when overrides exist.
  // Targets `[data-block-id="<id>"]` which we attach below.
  const tabletCss = !editorMode ? overridesToCssText(block.styles?.tablet) : "";
  const mobileCss = !editorMode ? overridesToCssText(block.styles?.mobile) : "";
  const needsScopedCss = tabletCss || mobileCss;

  let body: React.ReactNode = node;
  if (needsScopedCss) {
    const css = [
      tabletCss && `@media (max-width: 1024px) { [data-block-id="${block.id}"] { ${tabletCss} } }`,
      mobileCss && `@media (max-width: 640px) { [data-block-id="${block.id}"] { ${mobileCss} } }`,
    ].filter(Boolean).join("\n");
    body = (
      <div data-block-id={block.id} style={{ display: "contents" }}>
        <style dangerouslySetInnerHTML={{ __html: css }} />
        {node}
      </div>
    );
  }

  // Scroll animations only apply outside editor mode — the canvas
  // renders the resting state so layout is editable.
  const animate = block.styles?.animate;
  if (animate && !editorMode) {
    return <AnimateOnScroll animate={animate}>{body}</AnimateOnScroll>;
  }
  return <>{body}</>;
}

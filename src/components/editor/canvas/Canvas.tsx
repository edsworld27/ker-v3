"use client";

// The main editing surface. Wraps BlockRenderer with drop-zone overlays
// and click-to-select. Each block is wrapped in an outline + a hover/
// selected ring so the operator sees structure even on a clean design.

import { useState } from "react";
import type { Block, BlockType } from "@/portal/server/types";
import BlockRenderer from "../BlockRenderer";
import { getBlockDefinition } from "../blockRegistry";

interface CanvasProps {
  blocks: Block[];
  selectedId: string | null;
  device: "desktop" | "tablet" | "mobile";
  onSelect: (id: string) => void;
  onDropOnCanvas: (type: BlockType) => void;
  onDropBeside: (targetId: string, type: BlockType, position: "before" | "after" | "inside") => void;
  onMoveBeside: (sourceId: string, targetId: string, position: "before" | "after" | "inside") => void;
}

export default function Canvas({ blocks, selectedId, device, onSelect, onDropOnCanvas, onDropBeside, onMoveBeside }: CanvasProps) {
  const [hover, setHover] = useState<string | null>(null);

  const deviceWidth = device === "desktop" ? "100%" : device === "tablet" ? 768 : 375;

  return (
    <div className="flex-1 min-w-0 overflow-y-auto bg-[#0a0a0a]">
      <div
        className="mx-auto my-6 transition-all duration-200 bg-brand-black rounded-lg shadow-2xl shadow-black/40 overflow-hidden"
        style={{ width: deviceWidth, maxWidth: "100%", minHeight: "calc(100vh - 96px)" }}
      >
        <div
          className="relative"
          onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; }}
          onDrop={e => {
            // Only accept new-block drops at the empty/top-level layer; sibling
            // drops are handled by the BlockWrapper so the per-block handler runs.
            if (e.target !== e.currentTarget && blocks.length !== 0) return;
            const type = e.dataTransfer.getData("application/x-block-type") as BlockType;
            if (type) onDropOnCanvas(type);
          }}
        >
          {blocks.length === 0 ? (
            <EmptyState onDropType={onDropOnCanvas} />
          ) : (
            <BlockTreeWithChrome
              blocks={blocks}
              selectedId={selectedId}
              hover={hover}
              setHover={setHover}
              onSelect={onSelect}
              onDropBeside={onDropBeside}
              onMoveBeside={onMoveBeside}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onDropType }: { onDropType: (type: BlockType) => void }) {
  return (
    <div
      onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; }}
      onDrop={e => {
        const type = e.dataTransfer.getData("application/x-block-type") as BlockType;
        if (type) onDropType(type);
      }}
      className="m-12 p-24 border-2 border-dashed border-brand-orange/30 rounded-2xl text-center"
    >
      <p className="font-display text-2xl text-brand-cream mb-2">Start designing</p>
      <p className="text-[12px] text-brand-cream/55 max-w-md mx-auto">
        Drag a block from the left sidebar onto this canvas, or click any block to insert it at the top level.
      </p>
    </div>
  );
}

function BlockTreeWithChrome({
  blocks, selectedId, hover, setHover, onSelect, onDropBeside, onMoveBeside,
}: {
  blocks: Block[];
  selectedId: string | null;
  hover: string | null;
  setHover: (id: string | null) => void;
  onSelect: (id: string) => void;
  onDropBeside: (targetId: string, type: BlockType, position: "before" | "after" | "inside") => void;
  onMoveBeside: (sourceId: string, targetId: string, position: "before" | "after" | "inside") => void;
}) {
  return (
    <div data-canvas-root>
      {blocks.map(b => (
        <BlockWrapper
          key={b.id}
          block={b}
          selectedId={selectedId}
          hover={hover}
          setHover={setHover}
          onSelect={onSelect}
          onDropBeside={onDropBeside}
          onMoveBeside={onMoveBeside}
        />
      ))}
    </div>
  );
}

function BlockWrapper({
  block, selectedId, hover, setHover, onSelect, onDropBeside, onMoveBeside,
}: {
  block: Block;
  selectedId: string | null;
  hover: string | null;
  setHover: (id: string | null) => void;
  onSelect: (id: string) => void;
  onDropBeside: (targetId: string, type: BlockType, position: "before" | "after" | "inside") => void;
  onMoveBeside: (sourceId: string, targetId: string, position: "before" | "after" | "inside") => void;
}) {
  const def = getBlockDefinition(block.type);
  const selected = block.id === selectedId;
  const hovered = block.id === hover;

  function handleDrop(e: React.DragEvent, position: "before" | "after" | "inside") {
    e.preventDefault();
    e.stopPropagation();
    setHover(null);
    const newType = e.dataTransfer.getData("application/x-block-type") as BlockType;
    const movingId = e.dataTransfer.getData("application/x-block-id");
    if (newType) {
      onDropBeside(block.id, newType, position);
      return;
    }
    if (movingId) {
      onMoveBeside(movingId, block.id, position);
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = e.dataTransfer.types.includes("application/x-block-id") ? "move" : "copy";
  }

  return (
    <div
      data-block-wrapper={block.id}
      onClick={e => { e.stopPropagation(); onSelect(block.id); }}
      onMouseEnter={e => { e.stopPropagation(); setHover(block.id); }}
      onMouseLeave={() => setHover(null)}
      draggable
      onDragStart={e => {
        e.stopPropagation();
        e.dataTransfer.setData("application/x-block-id", block.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      style={{ position: "relative" }}
      className={[
        "outline-offset-[-2px] cursor-pointer transition-shadow",
        selected ? "outline outline-2 outline-brand-orange" : hovered ? "outline outline-1 outline-brand-orange/40" : "",
      ].join(" ")}
    >
      {/* Top drop zone: insert before */}
      <div
        onDragOver={handleDragOver}
        onDrop={e => handleDrop(e, "before")}
        style={{ position: "absolute", top: 0, left: 0, right: 0, height: 8, zIndex: 5 }}
      />
      {/* Bottom drop zone: insert after */}
      <div
        onDragOver={handleDragOver}
        onDrop={e => handleDrop(e, "after")}
        style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 8, zIndex: 5 }}
      />

      {/* Inside drop — only for containers */}
      {def?.isContainer && (
        <div
          onDragOver={handleDragOver}
          onDrop={e => handleDrop(e, "inside")}
          style={{ position: "absolute", top: 8, left: 0, right: 0, bottom: 8, zIndex: 1, pointerEvents: "none" }}
        />
      )}

      {/* Selection chip */}
      {selected && (
        <span style={{ position: "absolute", top: -22, left: 0, fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "var(--brand-orange, #ff6b35)", color: "#fff", zIndex: 10 }}>
          {def?.label ?? block.type}
        </span>
      )}

      {/* Render the block + recurse into children with chrome */}
      {def
        ? <def.Component block={block} editorMode renderChildren={children =>
            children
              ? <>{children.map(c => <BlockWrapper key={c.id} block={c} selectedId={selectedId} hover={hover} setHover={setHover} onSelect={onSelect} onDropBeside={onDropBeside} onMoveBeside={onMoveBeside} />)}</>
              : null
          } />
        : <BlockRenderer blocks={[block]} editorMode />
      }
    </div>
  );
}

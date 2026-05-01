"use client";

// Right-hand properties panel — shows props + style controls for the
// currently-selected block. Updates flow back through onChange so the
// parent canvas can debounce-save the page.

import { useState } from "react";
import type { Block, BlockStyles } from "@/portal/server/types";
import { getBlockDefinition, type PropField } from "../blockRegistry";
import { STYLE_FIELD_GROUPS } from "../blockStyles";
import AssetPicker from "../AssetPicker";

interface PropertiesPanelProps {
  block: Block | null;
  onPatch: (patch: Partial<Block>) => void;
  onDuplicate: () => void;
  onRemove: () => void;
}

const INPUT = "w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-[12px] text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-brand-orange/50";

export default function PropertiesPanel({ block, onPatch, onDuplicate, onRemove }: PropertiesPanelProps) {
  const [tab, setTab] = useState<"props" | "styles" | "code">("props");

  if (!block) {
    return (
      <aside className="w-72 shrink-0 border-l border-white/8 bg-brand-black-soft p-4 text-[12px] text-brand-cream/45 leading-relaxed">
        Select a block on the canvas to edit its properties + styles.
      </aside>
    );
  }

  const def = getBlockDefinition(block.type);

  function setProp(key: string, value: unknown) {
    if (!block) return;
    onPatch({ props: { ...block.props, [key]: value } });
  }

  function setStyle<K extends keyof BlockStyles>(key: K, value: BlockStyles[K]) {
    if (!block) return;
    const styles = { ...(block.styles ?? {}) };
    if (value === "" || value === undefined) {
      delete styles[key];
    } else {
      styles[key] = value;
    }
    onPatch({ styles });
  }

  return (
    <aside className="w-72 shrink-0 border-l border-white/8 bg-brand-black-soft flex flex-col">
      <div className="px-3 pt-3 pb-2 border-b border-white/8">
        <p className="text-[10px] tracking-[0.2em] uppercase text-brand-cream/45">{def?.icon} {def?.label ?? block.type}</p>
        <p className="text-[10px] font-mono text-brand-cream/35 mt-0.5">{block.id}</p>
      </div>
      <div className="flex border-b border-white/8">
        <button onClick={() => setTab("props")}  className={tabClass(tab === "props")}>Props</button>
        <button onClick={() => setTab("styles")} className={tabClass(tab === "styles")}>Styles</button>
        <button onClick={() => setTab("code")}   className={tabClass(tab === "code")}>Code</button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {tab === "props" && (def?.fields ?? []).map(field => <PropFieldRow key={field.key} field={field} value={block.props[field.key]} onChange={v => setProp(field.key, v)} />)}
        {tab === "props" && (def?.fields.length ?? 0) === 0 && (
          <p className="text-[11px] text-brand-cream/45 leading-relaxed">No editable props for this block. Use the Styles tab to tweak appearance.</p>
        )}
        {tab === "styles" && <StyleEditor styles={block.styles ?? {}} onChange={setStyle} />}
        {tab === "code" && <BlockCodeEditor block={block} onPatch={onPatch} />}
      </div>
      <div className="p-3 border-t border-white/8 flex gap-2">
        <button onClick={onDuplicate} className="flex-1 py-1.5 px-2 rounded-lg border border-white/10 hover:bg-white/5 text-[11px] text-brand-cream/70 hover:text-brand-cream">Duplicate</button>
        <button onClick={onRemove} className="flex-1 py-1.5 px-2 rounded-lg border border-red-500/20 text-red-400/80 hover:bg-red-500/10 hover:text-red-400 text-[11px]">Delete</button>
      </div>
    </aside>
  );
}

function tabClass(active: boolean) {
  return `flex-1 py-1.5 text-[10px] font-semibold tracking-[0.18em] uppercase ${active ? "text-brand-orange border-b-2 border-brand-orange" : "text-brand-cream/55 hover:text-brand-cream"}`;
}

// Direct JSON editor for the selected block. Useful when the visual
// controls don't expose a knob you need (custom CSS, exotic props, etc.).
// Saves on blur if the JSON parses; surfaces the parse error otherwise.
function BlockCodeEditor({ block, onPatch }: { block: Block; onPatch: (patch: Partial<Block>) => void }) {
  const initial = JSON.stringify({ props: block.props, styles: block.styles ?? {} }, null, 2);
  const [text, setText] = useState(initial);
  const [error, setError] = useState<string | null>(null);

  function commit() {
    try {
      const parsed = JSON.parse(text) as { props?: Record<string, unknown>; styles?: BlockStyles };
      onPatch({
        props: parsed.props ?? block.props,
        styles: parsed.styles ?? block.styles,
      });
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-[10px] text-brand-cream/45 leading-relaxed">
        Edit this block&apos;s props + styles as JSON. Saves on blur. Children + id + type are read-only.
      </p>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        onBlur={commit}
        spellCheck={false}
        className="w-full h-80 bg-black/40 border border-white/10 rounded-lg p-2 text-[11px] text-brand-cream font-mono leading-relaxed focus:outline-none focus:border-brand-orange/50"
      />
      {error && <p className="text-[11px] text-red-400">JSON: {error}</p>}
      <div className="flex items-center justify-between text-[10px] text-brand-cream/45">
        <span className="font-mono">id: {block.id}</span>
        <span>type: {block.type}</span>
      </div>
    </div>
  );
}

function PropFieldRow({ field, value, onChange }: { field: PropField; value: unknown; onChange: (v: unknown) => void }) {
  const v = value === undefined ? field.default : value;
  switch (field.type) {
    case "text":
    case "url":
      return (
        <Field label={field.label} help={field.help}>
          <input type={field.type === "url" ? "url" : "text"} value={String(v ?? "")} placeholder={field.placeholder} onChange={e => onChange(e.target.value)} className={INPUT} />
        </Field>
      );
    case "image":
      return (
        <Field label={field.label} help={field.help}>
          <AssetPicker value={String(v ?? "")} onChange={onChange} placeholder={field.placeholder} />
        </Field>
      );
    case "textarea":
    case "richtext":
      return (
        <Field label={field.label} help={field.help}>
          <textarea value={String(v ?? "")} onChange={e => onChange(e.target.value)} rows={field.type === "richtext" ? 3 : 4} className={`${INPUT} font-mono`} />
        </Field>
      );
    case "color":
      return (
        <Field label={field.label} help={field.help}>
          <div className="flex gap-2">
            <input type="color" value={typeof v === "string" && v.startsWith("#") ? v : "#000000"} onChange={e => onChange(e.target.value)} className="w-10 h-8 rounded cursor-pointer bg-transparent border border-white/10" />
            <input type="text" value={String(v ?? "")} onChange={e => onChange(e.target.value)} className={`${INPUT} font-mono`} />
          </div>
        </Field>
      );
    case "number":
      return (
        <Field label={field.label} help={field.help}>
          <input type="number" value={v === undefined || v === null ? "" : String(v)} onChange={e => onChange(e.target.value === "" ? undefined : Number(e.target.value))} className={INPUT} />
        </Field>
      );
    case "boolean":
      return (
        <Field label={field.label} help={field.help}>
          <button type="button" onClick={() => onChange(!(v === true))} className={`w-9 h-5 rounded-full flex items-center px-0.5 transition-colors ${v ? "bg-brand-orange justify-end" : "bg-white/15 justify-start"}`}>
            <span className="w-4 h-4 rounded-full bg-white" />
          </button>
        </Field>
      );
    case "select":
      return (
        <Field label={field.label} help={field.help}>
          <select value={String(v ?? "")} onChange={e => onChange(e.target.value)} className={INPUT}>
            {field.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </Field>
      );
  }
}

function StyleEditor<K extends keyof BlockStyles>({ styles, onChange }: { styles: BlockStyles; onChange: (key: K, value: BlockStyles[K]) => void }) {
  const [device, setDevice] = useState<"base" | "mobile" | "tablet">("base");
  const activeStyles: BlockStyles | Partial<BlockStyles> = device === "base" ? styles : (styles[device] ?? {}) as Partial<BlockStyles>;

  function setActive<K2 extends keyof BlockStyles>(key: K2, value: BlockStyles[K2]) {
    if (device === "base") { onChange(key as unknown as K, value as unknown as BlockStyles[K]); return; }
    const nextOverride = { ...((styles[device] as Partial<BlockStyles>) ?? {}), [key]: value };
    if (value === undefined) delete (nextOverride as Record<string, unknown>)[key as string];
    onChange(device as unknown as K, nextOverride as unknown as BlockStyles[K]);
  }

  return (
    <div className="space-y-3">
      {/* Device tabs for responsive overrides */}
      <div className="flex border border-white/10 rounded-lg p-0.5 text-[10px]">
        {(["base", "tablet", "mobile"] as const).map(d => (
          <button
            key={d}
            type="button"
            onClick={() => setDevice(d)}
            className={`flex-1 py-1 rounded ${device === d ? "bg-brand-orange text-white" : "text-brand-cream/55 hover:text-brand-cream"}`}
          >
            {d === "base" ? "Desktop" : d === "tablet" ? "Tablet" : "Mobile"}
          </button>
        ))}
      </div>
      {device !== "base" && (
        <p className="text-[10px] text-brand-cream/45 leading-relaxed">
          Override values for {device}. Empty fields fall back to the desktop value.
        </p>
      )}

      {STYLE_FIELD_GROUPS.map(group => (
        <details key={group.label} className="rounded-lg border border-white/5 bg-white/[0.02] overflow-hidden" open>
          <summary className="cursor-pointer px-2.5 py-1.5 text-[11px] uppercase tracking-[0.18em] text-brand-cream/55 hover:text-brand-cream">{group.label}</summary>
          <div className="p-2.5 pt-0 space-y-2">
            {group.fields.map(key => {
              const valueRaw = (activeStyles as Record<string, unknown>)[key as string];
              const valueStr = (valueRaw ?? "") as string;
              return (
                <Field key={String(key)} label={String(key)}>
                  {String(key) === "background" || String(key) === "textColor" ? (
                    <div className="flex gap-2">
                      <input type="color" value={typeof valueRaw === "string" && (valueRaw as string).startsWith("#") ? (valueRaw as string) : "#000000"} onChange={e => setActive(key, e.target.value as BlockStyles[typeof key])} className="w-10 h-8 rounded cursor-pointer bg-transparent border border-white/10" />
                      <input type="text" value={valueStr} onChange={e => setActive(key, (e.target.value || undefined) as BlockStyles[typeof key])} className={`${INPUT} font-mono`} />
                    </div>
                  ) : (
                    <input type="text" value={valueStr} onChange={e => setActive(key, (e.target.value || undefined) as BlockStyles[typeof key])} placeholder="—" className={`${INPUT} font-mono`} />
                  )}
                </Field>
              );
            })}
          </div>
        </details>
      ))}

      {/* Animation picker — only on the base device tab */}
      {device === "base" && (
        <details className="rounded-lg border border-white/5 bg-white/[0.02] overflow-hidden" open>
          <summary className="cursor-pointer px-2.5 py-1.5 text-[11px] uppercase tracking-[0.18em] text-brand-cream/55 hover:text-brand-cream">Animation</summary>
          <div className="p-2.5 pt-0 space-y-2">
            <Field label="On scroll into view">
              <select value={(styles.animate as string | undefined) ?? ""} onChange={e => onChange("animate" as K, (e.target.value || undefined) as BlockStyles[K])} className={INPUT}>
                <option value="">None</option>
                <option value="fade-in">Fade in</option>
                <option value="slide-up">Slide up</option>
                <option value="slide-left">Slide from left</option>
                <option value="slide-right">Slide from right</option>
                <option value="zoom-in">Zoom in</option>
              </select>
            </Field>
            <p className="text-[10px] text-brand-cream/40 leading-relaxed">Plays once when the block enters the viewport on the live site. The editor canvas shows the resting state.</p>
          </div>
        </details>
      )}
    </div>
  );
}

function Field({ label, help, children }: { label: string; help?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[10px] tracking-[0.18em] uppercase text-brand-cream/45 mb-1">{label}</span>
      {children}
      {help && <span className="block text-[10px] text-brand-cream/35 mt-1">{help}</span>}
    </label>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import Tip from "@/components/admin/Tip";
import { confirm } from "@/components/admin/ConfirmHost";
import { prompt } from "@/components/admin/PromptHost";
import {
  getDraftTheme,
  saveDraft,
  publishTheme,
  discardThemeDraft,
  resetThemeToDefault,
  hasDraftTheme,
  onThemeChange,
  DEFAULT_THEME,
  type ThemeConfig,
  type BackgroundConfig,
} from "@/lib/admin/theme";
import { computeBackground } from "@/components/ThemeInjector";
import {
  listVariants,
  createVariant,
  updateVariant,
  deleteVariant,
  getSiteDefaultVariantId,
  setSiteDefaultVariantId,
  onVariantChange,
  type ThemeVariant,
} from "@/lib/admin/themeVariants";

// ── Google Fonts catalogue ────────────────────────────────────────────────────

const DISPLAY_FONTS = [
  "Playfair Display", "Cormorant Garamond", "Lora", "Merriweather",
  "EB Garamond", "Libre Baskerville", "Crimson Text", "Spectral",
  "Italiana", "Cinzel", "GFS Didot", "Bodoni Moda", "Fraunces",
  "Josefin Slab", "Arvo", "Rokkitt", "Zilla Slab",
];

const BODY_FONTS = [
  "DM Sans", "Inter", "Lato", "Nunito", "Open Sans", "Raleway",
  "Source Sans 3", "Poppins", "Work Sans", "Jost", "Outfit",
  "Plus Jakarta Sans", "Figtree", "Manrope", "Urbanist", "Syne",
  "Space Grotesk", "Barlow", "Karla", "Mulish", "Lexend",
];

const ALL_FONTS = Array.from(new Set([...DISPLAY_FONTS, ...BODY_FONTS])).sort();

// ── Helpers ───────────────────────────────────────────────────────────────────

function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-white/5 last:border-0">
      <span className="text-sm text-brand-cream/70 flex-1">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded-lg border border-white/20 cursor-pointer bg-transparent"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-24 text-xs bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-brand-cream font-mono focus:outline-none focus:border-brand-orange/50"
        />
      </div>
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="py-2.5 border-b border-white/5 last:border-0">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-brand-cream/70">{label}</span>
        <span className="text-xs font-mono text-brand-amber">
          {value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-brand-orange"
      />
    </div>
  );
}

function SelectRow({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-white/5 last:border-0">
      <span className="text-sm text-brand-cream/70 flex-1">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-sm bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-brand-cream focus:outline-none focus:border-brand-orange/50"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function ToggleRow({
  label,
  desc,
  value,
  onChange,
}: {
  label: string;
  desc?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-white/5 last:border-0">
      <div>
        <p className="text-sm text-brand-cream/80">{label}</p>
        {desc && <p className="text-xs text-brand-cream/40 mt-0.5">{desc}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
          value ? "bg-brand-orange" : "bg-white/15"
        }`}
      >
        <span
          className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${
            value ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

// ── Background editor ─────────────────────────────────────────────────────────

function BackgroundEditor({
  label,
  value,
  onChange,
}: {
  label: string;
  value: BackgroundConfig;
  onChange: (v: BackgroundConfig) => void;
}) {
  const types = [
    { value: "solid", label: "Solid" },
    { value: "gradient", label: "Gradient" },
    { value: "image", label: "Image" },
    { value: "transparent", label: "None" },
  ] as const;

  const preview = computeBackground(value);

  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden mb-3">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
        <div
          className="w-8 h-8 rounded-lg shrink-0 border border-white/10"
          style={{
            background: preview === "transparent" ? "repeating-conic-gradient(#555 0% 25%, #333 0% 50%) 0 0 / 12px 12px" : preview,
            backgroundSize: value.type === "image" ? `${value.imageSize}` : undefined,
          }}
        />
        <span className="text-sm font-medium text-brand-cream">{label}</span>
        <div className="flex gap-1 ml-auto">
          {types.map((t) => (
            <button
              key={t.value}
              onClick={() => onChange({ ...value, type: t.value })}
              className={`text-[11px] px-2.5 py-1 rounded-lg transition-colors ${
                value.type === t.value
                  ? "bg-brand-orange text-white"
                  : "bg-white/5 text-brand-cream/60 hover:text-brand-cream hover:bg-white/10"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-3 space-y-0">
        {value.type === "solid" && (
          <ColorRow
            label="Colour"
            value={value.color}
            onChange={(c) => onChange({ ...value, color: c })}
          />
        )}

        {value.type === "gradient" && (
          <>
            <ColorRow
              label="From"
              value={value.gradient.from}
              onChange={(c) => onChange({ ...value, gradient: { ...value.gradient, from: c } })}
            />
            <ColorRow
              label="Via (middle)"
              value={value.gradient.via}
              onChange={(c) => onChange({ ...value, gradient: { ...value.gradient, via: c } })}
            />
            <ColorRow
              label="To"
              value={value.gradient.to}
              onChange={(c) => onChange({ ...value, gradient: { ...value.gradient, to: c } })}
            />
            <SliderRow
              label="Angle"
              value={value.gradient.angle}
              min={0}
              max={360}
              step={5}
              unit="°"
              onChange={(a) => onChange({ ...value, gradient: { ...value.gradient, angle: a } })}
            />
          </>
        )}

        {value.type === "image" && (
          <>
            <div className="py-2.5 border-b border-white/5">
              <label className="text-sm text-brand-cream/70 block mb-1.5">Image URL</label>
              <input
                type="text"
                value={value.image}
                placeholder="/images/hero/my-image.jpg"
                onChange={(e) => onChange({ ...value, image: e.target.value })}
                className="w-full text-sm bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-brand-cream focus:outline-none focus:border-brand-orange/50"
              />
            </div>
            <SelectRow
              label="Size"
              value={value.imageSize}
              options={[
                { value: "cover", label: "Cover (fill)" },
                { value: "contain", label: "Contain (fit)" },
                { value: "repeat", label: "Tile (repeat)" },
              ]}
              onChange={(v) => onChange({ ...value, imageSize: v as BackgroundConfig["imageSize"] })}
            />
            <ColorRow
              label="Overlay colour"
              value={value.overlayColor}
              onChange={(c) => onChange({ ...value, overlayColor: c })}
            />
            <SliderRow
              label="Overlay opacity"
              value={value.overlayOpacity}
              min={0}
              max={1}
              step={0.05}
              onChange={(v) => onChange({ ...value, overlayOpacity: v })}
            />
          </>
        )}

        {value.type === "transparent" && (
          <p className="py-2 text-xs text-brand-cream/35">
            No background — inherits from the page background.
          </p>
        )}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

type Tab = "colors" | "typography" | "backgrounds" | "highlights" | "animations" | "variants";

export default function AdminThemePage() {
  const [theme, setTheme] = useState<ThemeConfig>(DEFAULT_THEME);
  const [tab, setTab] = useState<Tab>("colors");
  const [saved, setSaved] = useState(false);
  const [published, setPublished] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [localFonts, setLocalFonts] = useState<string[]>([]);
  const [variants, setVariants] = useState<ThemeVariant[]>([]);
  const [defaultVariantId, setDefaultVariantId] = useState<string>("dark");

  useEffect(() => {
    const load = () => {
      setTheme(getDraftTheme());
      setHasDraft(hasDraftTheme());
    };
    load();
    return onThemeChange(load);
  }, []);

  useEffect(() => {
    const refreshVariants = () => {
      setVariants(listVariants());
      setDefaultVariantId(getSiteDefaultVariantId());
    };
    refreshVariants();
    return onVariantChange(refreshVariants);
  }, []);

  useEffect(() => {
    fetch("/api/admin/fonts")
      .then((r) => r.json())
      .then((d: { fonts: string[] }) => setLocalFonts(d.fonts ?? []))
      .catch(() => {});
  }, []);

  const update = useCallback((patch: Partial<ThemeConfig>) => {
    setTheme((prev) => {
      const next = { ...prev, ...patch };
      saveDraft(next);
      return next;
    });
    setSaved(false);
    setPublished(false);
  }, []);

  function setColors(patch: Partial<ThemeConfig["colors"]>) {
    update({ colors: { ...theme.colors, ...patch } });
  }
  function setTypography(patch: Partial<ThemeConfig["typography"]>) {
    update({ typography: { ...theme.typography, ...patch } });
  }
  function setBackgrounds(patch: Partial<ThemeConfig["backgrounds"]>) {
    update({ backgrounds: { ...theme.backgrounds, ...patch } });
  }
  function setHighlights(patch: Partial<ThemeConfig["highlights"]>) {
    update({ highlights: { ...theme.highlights, ...patch } });
  }
  function setAnimations(patch: Partial<ThemeConfig["animations"]>) {
    update({ animations: { ...theme.animations, ...patch } });
  }
  function setBorderRadius(patch: Partial<ThemeConfig["borderRadius"]>) {
    update({ borderRadius: { ...theme.borderRadius, ...patch } });
  }

  function handlePublish() {
    publishTheme(theme);
    setPublished(true);
    setHasDraft(false);
    setTimeout(() => setPublished(false), 2500);
  }

  async function handleDiscard() {
    if (!(await confirm({ title: "Discard all unsaved theme changes?", danger: true, confirmLabel: "Discard" }))) return;
    discardThemeDraft();
    setTheme(getDraftTheme());
    setHasDraft(false);
  }

  async function handleReset() {
    if (!(await confirm({ title: "Reset theme to defaults?", message: "Overwrites both draft and published themes.", danger: true, confirmLabel: "Reset" }))) return;
    resetThemeToDefault();
    setTheme(DEFAULT_THEME);
    setHasDraft(false);
  }

  const fontOptions = [
    ...ALL_FONTS.map((f) => ({ value: f, label: f })),
    ...localFonts.map((f) => ({ value: f, label: `${f} (local)` })),
  ];

  const TABS: Array<{ id: Tab; label: string }> = [
    { id: "colors", label: "Colours" },
    { id: "typography", label: "Typography" },
    { id: "backgrounds", label: "Backgrounds" },
    { id: "highlights", label: "Highlights" },
    { id: "animations", label: "Animations" },
    { id: "variants", label: "Themes / Modes" },
  ];

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] tracking-[0.28em] uppercase text-brand-amber mb-2">
            Appearance
          </p>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-3xl sm:text-4xl text-brand-cream">
              Theme &amp; styling
            </h1>
            <Tip id="theme.header" text="Edits here update Tailwind CSS variables at runtime — the storefront re-skins live without a deploy. Use the Variants tab to maintain Light/Earth/Ocean alongside Dark." align="bottom" />
          </div>
          <p className="text-brand-cream/45 text-sm mt-1">
            Customise colours, fonts, backgrounds, animations and effects site-wide.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {hasDraft && (
            <button
              onClick={handleDiscard}
              className="text-xs px-3 py-2 rounded-lg border border-white/10 text-brand-cream/55 hover:text-brand-cream hover:border-white/30 transition-colors"
            >
              Discard
            </button>
          )}
          <button
            onClick={handleReset}
            className="text-xs px-3 py-2 rounded-lg border border-white/10 text-brand-cream/55 hover:text-brand-cream hover:border-white/30 transition-colors"
          >
            Reset defaults
          </button>
          <button
            onClick={handlePublish}
            className={`text-xs px-4 py-2 rounded-lg font-semibold transition-colors ${
              published
                ? "bg-green-600/80 text-white"
                : "bg-brand-orange text-white hover:bg-brand-orange-dark"
            }`}
          >
            {published ? "Published!" : "Publish theme"}
          </button>
        </div>
      </div>

      {hasDraft && !published && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-amber/10 border border-brand-amber/20">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-amber shrink-0" />
          <p className="text-xs text-brand-amber">
            You have unpublished theme changes — publish to make them live.
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/8 overflow-x-auto no-scrollbar">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors -mb-px ${
              tab === t.id
                ? "border-brand-orange text-brand-cream"
                : "border-transparent text-brand-cream/50 hover:text-brand-cream/80"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── COLOURS ──────────────────────────────────────────────────────────── */}
      {tab === "colors" && (
        <div className="space-y-6">
          <Section title="Primary">
            <ColorRow label="Orange (primary)" value={theme.colors.orange} onChange={(v) => setColors({ orange: v })} />
            <ColorRow label="Orange light" value={theme.colors.orangeLight} onChange={(v) => setColors({ orangeLight: v })} />
            <ColorRow label="Orange dark" value={theme.colors.orangeDark} onChange={(v) => setColors({ orangeDark: v })} />
            <ColorRow label="Amber (accent)" value={theme.colors.amber} onChange={(v) => setColors({ amber: v })} />
          </Section>

          <Section title="Purple">
            <ColorRow label="Purple" value={theme.colors.purple} onChange={(v) => setColors({ purple: v })} />
            <ColorRow label="Purple light" value={theme.colors.purpleLight} onChange={(v) => setColors({ purpleLight: v })} />
            <ColorRow label="Purple dark" value={theme.colors.purpleDark} onChange={(v) => setColors({ purpleDark: v })} />
            <ColorRow label="Purple muted" value={theme.colors.purpleMuted} onChange={(v) => setColors({ purpleMuted: v })} />
          </Section>

          <Section title="Dark tones">
            <ColorRow label="Black (darkest)" value={theme.colors.black} onChange={(v) => setColors({ black: v })} />
            <ColorRow label="Black soft" value={theme.colors.blackSoft} onChange={(v) => setColors({ blackSoft: v })} />
            <ColorRow label="Black card" value={theme.colors.blackCard} onChange={(v) => setColors({ blackCard: v })} />
          </Section>

          <Section title="Light tones">
            <ColorRow label="Cream (text / bg)" value={theme.colors.cream} onChange={(v) => setColors({ cream: v })} />
            <ColorRow label="Cream dark" value={theme.colors.creamDark} onChange={(v) => setColors({ creamDark: v })} />
          </Section>

          {/* Live palette preview */}
          <div className="rounded-xl border border-white/8 p-4">
            <p className="text-xs text-brand-cream/40 uppercase tracking-widest mb-3">Palette preview</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(theme.colors).map(([k, v]) => (
                <div key={k} className="flex flex-col items-center gap-1">
                  <div
                    className="w-9 h-9 rounded-lg border border-white/15"
                    style={{ background: v }}
                    title={k}
                  />
                  <span className="text-[9px] text-brand-cream/30 font-mono">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TYPOGRAPHY ───────────────────────────────────────────────────────── */}
      {tab === "typography" && (
        <div className="space-y-6">
          <Section title="Fonts">
            <p className="text-xs text-brand-cream/35 pb-2">
              Choose from Google Fonts or add your own to{" "}
              <code className="text-brand-amber">/public/fonts/</code>.
            </p>
            <SelectRow
              label="Display / headings"
              value={theme.typography.displayFont}
              options={fontOptions}
              onChange={(v) => setTypography({ displayFont: v })}
            />
            <SelectRow
              label="Body text"
              value={theme.typography.bodyFont}
              options={fontOptions}
              onChange={(v) => setTypography({ bodyFont: v })}
            />
            <SelectRow
              label="Display weight"
              value={theme.typography.displayWeight}
              options={[
                { value: "300", label: "300 — Light" },
                { value: "400", label: "400 — Regular" },
                { value: "500", label: "500 — Medium" },
                { value: "600", label: "600 — SemiBold" },
                { value: "700", label: "700 — Bold" },
                { value: "800", label: "800 — ExtraBold" },
                { value: "900", label: "900 — Black" },
              ]}
              onChange={(v) => setTypography({ displayWeight: v })}
            />
            <SelectRow
              label="Body weight"
              value={theme.typography.bodyWeight}
              options={[
                { value: "300", label: "300 — Light" },
                { value: "400", label: "400 — Regular" },
                { value: "500", label: "500 — Medium" },
                { value: "600", label: "600 — SemiBold" },
              ]}
              onChange={(v) => setTypography({ bodyWeight: v })}
            />
          </Section>

          <Section title="Sizing">
            <SliderRow
              label="Base font size"
              value={theme.typography.baseFontSize}
              min={12}
              max={20}
              step={1}
              unit="px"
              onChange={(v) => setTypography({ baseFontSize: v })}
            />
            <SliderRow
              label="Line height"
              value={Number(theme.typography.lineHeight)}
              min={1.2}
              max={2.2}
              step={0.05}
              onChange={(v) => setTypography({ lineHeight: String(v) })}
            />
            <SelectRow
              label="Letter spacing"
              value={theme.typography.letterSpacing}
              options={[
                { value: "tighter", label: "Tighter (−0.05em)" },
                { value: "tight", label: "Tight (−0.025em)" },
                { value: "normal", label: "Normal (0)" },
                { value: "wide", label: "Wide (+0.025em)" },
                { value: "wider", label: "Wider (+0.05em)" },
                { value: "widest", label: "Widest (+0.1em)" },
              ]}
              onChange={(v) => setTypography({ letterSpacing: v })}
            />
          </Section>

          <Section title="Border radius">
            <SliderRow
              label="Buttons"
              value={Number(theme.borderRadius.buttons)}
              min={0}
              max={3}
              step={0.125}
              unit="rem"
              onChange={(v) => setBorderRadius({ buttons: String(v) })}
            />
            <SliderRow
              label="Cards"
              value={Number(theme.borderRadius.cards)}
              min={0}
              max={3}
              step={0.125}
              unit="rem"
              onChange={(v) => setBorderRadius({ cards: String(v) })}
            />
            <SliderRow
              label="Inputs"
              value={Number(theme.borderRadius.inputs)}
              min={0}
              max={2}
              step={0.125}
              unit="rem"
              onChange={(v) => setBorderRadius({ inputs: String(v) })}
            />
            <ToggleRow
              label="Pill badges"
              desc="Fully rounded badge / tag pills"
              value={theme.borderRadius.badges === "9999"}
              onChange={(v) => setBorderRadius({ badges: v ? "9999" : "0.5" })}
            />
          </Section>

          {/* Font preview */}
          <div className="rounded-xl border border-white/8 p-5 space-y-3">
            <p className="text-xs text-brand-cream/40 uppercase tracking-widest mb-1">Preview</p>
            <p
              style={{
                fontFamily: `"${theme.typography.displayFont}", Georgia, serif`,
                fontWeight: theme.typography.displayWeight,
                fontSize: "1.75rem",
              }}
              className="text-brand-cream"
            >
              The soil of Ghana
            </p>
            <p
              style={{
                fontFamily: `"${theme.typography.bodyFont}", system-ui, sans-serif`,
                fontWeight: theme.typography.bodyWeight,
                fontSize: `${theme.typography.baseFontSize}px`,
                lineHeight: theme.typography.lineHeight,
              }}
              className="text-brand-cream/70"
            >
              Pure, natural, hormone-safe soap crafted from Ghanaian ancestral wisdom.
              No parabens, no phthalates, no sulphates. Just the earth in its purest form.
            </p>
          </div>
        </div>
      )}

      {/* ── BACKGROUNDS ──────────────────────────────────────────────────────── */}
      {tab === "backgrounds" && (
        <div className="space-y-4">
          <p className="text-sm text-brand-cream/40">
            Set solid colours, gradients, or images for each section. &quot;None&quot; inherits the page background.
          </p>
          <BackgroundEditor
            label="Page / body"
            value={theme.backgrounds.page}
            onChange={(v) => setBackgrounds({ page: v })}
          />
          <BackgroundEditor
            label="Navbar"
            value={theme.backgrounds.navbar}
            onChange={(v) => setBackgrounds({ navbar: v })}
          />
          <BackgroundEditor
            label="Hero section"
            value={theme.backgrounds.hero}
            onChange={(v) => setBackgrounds({ hero: v })}
          />
          <BackgroundEditor
            label="Featured products"
            value={theme.backgrounds.featured}
            onChange={(v) => setBackgrounds({ featured: v })}
          />
          <BackgroundEditor
            label="The problem section"
            value={theme.backgrounds.problem}
            onChange={(v) => setBackgrounds({ problem: v })}
          />
          <BackgroundEditor
            label="Heritage / solution section"
            value={theme.backgrounds.solution}
            onChange={(v) => setBackgrounds({ solution: v })}
          />
          <BackgroundEditor
            label="Shop section"
            value={theme.backgrounds.shop}
            onChange={(v) => setBackgrounds({ shop: v })}
          />
          <BackgroundEditor
            label="Testimonials section"
            value={theme.backgrounds.testimonials}
            onChange={(v) => setBackgrounds({ testimonials: v })}
          />
          <BackgroundEditor
            label="Footer"
            value={theme.backgrounds.footer}
            onChange={(v) => setBackgrounds({ footer: v })}
          />
        </div>
      )}

      {/* ── HIGHLIGHTS ────────────────────────────────────────────────────────── */}
      {tab === "highlights" && (
        <div className="space-y-6">
          <Section title="Gradient text">
            <p className="text-xs text-brand-cream/35 pb-2">
              Used on headline highlights and the{" "}
              <code className="text-brand-amber">.gradient-text</code> class.
            </p>
            <ColorRow
              label="From colour"
              value={theme.highlights.gradientFrom}
              onChange={(v) => setHighlights({ gradientFrom: v })}
            />
            <ColorRow
              label="Via (middle)"
              value={theme.highlights.gradientVia}
              onChange={(v) => setHighlights({ gradientVia: v })}
            />
            <ColorRow
              label="To colour"
              value={theme.highlights.gradientTo}
              onChange={(v) => setHighlights({ gradientTo: v })}
            />
            <SliderRow
              label="Angle"
              value={theme.highlights.gradientAngle}
              min={0}
              max={360}
              step={5}
              unit="°"
              onChange={(v) => setHighlights({ gradientAngle: v })}
            />
            {/* Live gradient preview */}
            <div className="py-3">
              <div
                className="h-8 rounded-xl"
                style={{
                  background: `linear-gradient(${theme.highlights.gradientAngle}deg, ${theme.highlights.gradientFrom}, ${theme.highlights.gradientVia}, ${theme.highlights.gradientTo})`,
                }}
              />
              <p
                className="text-2xl font-bold mt-3 text-center"
                style={{
                  background: `linear-gradient(${theme.highlights.gradientAngle}deg, ${theme.highlights.gradientFrom}, ${theme.highlights.gradientVia}, ${theme.highlights.gradientTo})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Gradient text preview
              </p>
            </div>
          </Section>

          <Section title="Adinkra decorative line">
            <ColorRow
              label="Colour 1"
              value={theme.highlights.adinkraColor1}
              onChange={(v) => setHighlights({ adinkraColor1: v })}
            />
            <ColorRow
              label="Colour 2"
              value={theme.highlights.adinkraColor2}
              onChange={(v) => setHighlights({ adinkraColor2: v })}
            />
            <ColorRow
              label="Colour 3"
              value={theme.highlights.adinkraColor3}
              onChange={(v) => setHighlights({ adinkraColor3: v })}
            />
            <div className="py-2">
              <div
                className="h-0.5 rounded-full"
                style={{
                  background: `linear-gradient(90deg, transparent, ${theme.highlights.adinkraColor1}, ${theme.highlights.adinkraColor2}, ${theme.highlights.adinkraColor3}, transparent)`,
                }}
              />
            </div>
          </Section>

          <Section title="Glow effects">
            <ColorRow
              label="Hero glow (primary)"
              value={theme.highlights.heroGlowColor1}
              onChange={(v) => setHighlights({ heroGlowColor1: v })}
            />
            <ColorRow
              label="Hero glow (secondary)"
              value={theme.highlights.heroGlowColor2}
              onChange={(v) => setHighlights({ heroGlowColor2: v })}
            />
            <ColorRow
              label="Card hover glow (primary)"
              value={theme.highlights.cardGlowColor1}
              onChange={(v) => setHighlights({ cardGlowColor1: v })}
            />
            <ColorRow
              label="Card hover glow (secondary)"
              value={theme.highlights.cardGlowColor2}
              onChange={(v) => setHighlights({ cardGlowColor2: v })}
            />
          </Section>

          <Section title="Text selection">
            <p className="text-xs text-brand-cream/35 pb-2">
              Colour applied when users highlight / select text on the site.
            </p>
            <ColorRow
              label="Selection background"
              value={theme.highlights.selectionBg}
              onChange={(v) => setHighlights({ selectionBg: v })}
            />
            <ColorRow
              label="Selected text colour"
              value={theme.highlights.selectionText}
              onChange={(v) => setHighlights({ selectionText: v })}
            />
            <div className="py-2">
              <p className="text-sm text-brand-cream/60 mb-1">Preview (select this text):</p>
              <p
                className="text-brand-cream text-sm p-3 rounded-xl border border-white/10"
                style={{
                  ["--preview-sel-bg" as string]: theme.highlights.selectionBg,
                  ["--preview-sel-text" as string]: theme.highlights.selectionText,
                }}
              >
                Odo by Felicia — ancestral Ghanaian skincare.
              </p>
            </div>
          </Section>
        </div>
      )}

      {/* ── ANIMATIONS ────────────────────────────────────────────────────────── */}
      {tab === "animations" && (
        <div className="space-y-6">
          <Section title="Global">
            <ToggleRow
              label="Enable animations"
              desc="Disabling removes all entrance animations (fade-up, fade-in, float). Marquee scrollers still run."
              value={theme.animations.enabled}
              onChange={(v) => setAnimations({ enabled: v })}
            />
          </Section>

          <Section title="Entrance animations">
            <SliderRow
              label="Fade-up duration"
              value={theme.animations.fadeUpDuration}
              min={0.1}
              max={2.0}
              step={0.05}
              unit="s"
              onChange={(v) => setAnimations({ fadeUpDuration: v })}
            />
            <SliderRow
              label="Fade-in duration"
              value={theme.animations.fadeInDuration}
              min={0.1}
              max={3.0}
              step={0.1}
              unit="s"
              onChange={(v) => setAnimations({ fadeInDuration: v })}
            />
            <SliderRow
              label="Float (bob) duration"
              value={theme.animations.floatDuration}
              min={1}
              max={20}
              step={0.5}
              unit="s"
              onChange={(v) => setAnimations({ floatDuration: v })}
            />
          </Section>

          <Section title="Scrolling marquees">
            <SliderRow
              label="Horizontal marquee speed"
              value={theme.animations.marqueeSpeed}
              min={5}
              max={200}
              step={5}
              unit="s"
              onChange={(v) => setAnimations({ marqueeSpeed: v })}
            />
            <p className="text-[11px] text-brand-cream/30 -mt-1 pb-1">
              Higher = slower. Used by testimonials strip.
            </p>
            <SliderRow
              label="Vertical marquee speed"
              value={theme.animations.marqueeUpSpeed}
              min={5}
              max={200}
              step={5}
              unit="s"
              onChange={(v) => setAnimations({ marqueeUpSpeed: v })}
            />
            <p className="text-[11px] text-brand-cream/30 -mt-1">
              Higher = slower. Used by the side scroller.
            </p>
          </Section>

          <div className="rounded-xl border border-white/8 p-4 text-xs text-brand-cream/40 space-y-1">
            <p className="font-medium text-brand-cream/60">Note on accessibility</p>
            <p>Users with &ldquo;prefers reduced motion&rdquo; set in their OS have marquees disabled automatically regardless of this setting.</p>
          </div>
        </div>
      )}

      {/* ── VARIANTS / MODES ──────────────────────────────────────────────── */}
      {tab === "variants" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4 text-sm text-brand-cream/55 leading-relaxed">
            Theme variants let visitors switch between visual modes (e.g. dark, light, earth) using the palette icon in the navbar.
            The &ldquo;Default&rdquo; variant is shown to new visitors. Built-in variants cannot be edited but can be cloned.
          </div>

          {/* Default variant selector */}
          <Section title="Site default variant">
            <div className="py-2">
              <p className="text-xs text-brand-cream/40 mb-3">Choose which variant visitors see when they first arrive.</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {variants.map(v => (
                  <button
                    key={v.id}
                    onClick={() => { setSiteDefaultVariantId(v.id); setDefaultVariantId(v.id); }}
                    className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border transition-colors ${
                      defaultVariantId === v.id
                        ? "border-brand-orange bg-brand-orange/10 text-brand-cream"
                        : "border-white/10 text-brand-cream/55 hover:border-white/25"
                    }`}
                  >
                    <span className="text-2xl">{v.icon}</span>
                    <span className="text-xs font-medium truncate w-full text-center">{v.name}</span>
                    {defaultVariantId === v.id && <span className="text-[10px] text-brand-orange">Default</span>}
                  </button>
                ))}
              </div>
            </div>
          </Section>

          {/* All variants */}
          <Section title="All variants">
            <div className="divide-y divide-white/5">
              {variants.map(v => (
                <div key={v.id} className="flex items-center gap-3 py-3">
                  <span className="text-xl shrink-0">{v.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-brand-cream font-medium">{v.name}</p>
                    {v.description && <p className="text-xs text-brand-cream/40 mt-0.5 truncate">{v.description}</p>}
                    {v.isBuiltIn && <span className="text-[10px] text-brand-cream/30">Built-in</span>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={async () => {
                        const name = await prompt({ title: "Name for cloned variant", defaultValue: `${v.name} copy` });
                        if (name) createVariant(name, v.id);
                      }}
                      className="text-xs px-2.5 py-1 rounded-lg border border-white/10 text-brand-cream/55 hover:text-brand-cream"
                    >
                      Clone
                    </button>
                    {!v.isBuiltIn && (
                      <>
                        <button
                          onClick={async () => {
                            const name = await prompt({ title: "Rename variant", defaultValue: v.name });
                            if (name) updateVariant(v.id, { name });
                          }}
                          className="text-xs px-2.5 py-1 rounded-lg border border-white/10 text-brand-cream/55 hover:text-brand-cream"
                        >
                          Rename
                        </button>
                        <button
                          onClick={async () => {
                            if (await confirm({ title: `Delete "${v.name}"?`, danger: true, confirmLabel: "Delete" })) deleteVariant(v.id);
                          }}
                          className="text-xs px-2.5 py-1 rounded-lg border border-white/10 text-brand-cream/55 hover:text-brand-orange"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-3">
              <button
                onClick={async () => {
                  const name = await prompt({ title: "New variant name", defaultValue: "My theme", placeholder: "Spring 2025" });
                  if (name) createVariant(name);
                }}
                className="text-xs px-4 py-2 rounded-lg bg-brand-orange hover:bg-brand-orange-dark text-white font-semibold"
              >
                + New variant
              </button>
            </div>
          </Section>

          <div className="rounded-xl border border-white/8 p-4 text-xs text-brand-cream/40 space-y-1">
            <p className="font-medium text-brand-cream/60">How it works</p>
            <p>The base theme (all other tabs) is the canvas. Each variant overrides specific colours, backgrounds, and highlights on top of it. Visitors&apos; choices are saved to their browser — they persist across visits.</p>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden">
      <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02]">
        <h3 className="text-xs font-semibold tracking-[0.15em] uppercase text-brand-cream/50">
          {title}
        </h3>
      </div>
      <div className="px-4 py-1">{children}</div>
    </div>
  );
}

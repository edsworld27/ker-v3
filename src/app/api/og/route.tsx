import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

// GET /api/og?title=…&subtitle=…
//
// Generates a 1200x630 social-share PNG using Next 16's ImageResponse (built
// on @vercel/og + satori). The site has plenty of editable per-page social
// images via the CMS, but every page that doesn't override one falls back to
// this generator so links shared on Twitter / LinkedIn / iMessage always look
// branded instead of bare.
//
// Inputs (both optional, both URL-decoded):
//   - title    — primary headline. Truncated to ~80 chars.
//   - subtitle — secondary line under the title. Truncated to ~140 chars.
//
// SiteHead.tsx wires the fallback automatically:
//   /api/og?title=<page title>&subtitle=<page description>
// so an editor never has to think about it. They can still override via the
// `seo.<page>.ogImage` field in the admin and that wins.
//
// We deliberately don't load a custom font file — public/fonts/ is empty —
// so satori falls back to its bundled font (Noto Sans). When the brand wants
// a true Playfair Display social card, drop the font into public/fonts/ and
// pass it via the `fonts` option below.

export const runtime = "edge";

function clamp(input: string, max: number): string {
  const v = input.trim();
  if (v.length <= max) return v;
  return v.slice(0, max - 1).trimEnd() + "…";
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawTitle = searchParams.get("title") ?? "Luv & Ker";
  const rawSubtitle = searchParams.get("subtitle") ?? "Pure Ghanaian heritage soap. Hormone-safe, fertility-friendly, ancestrally crafted.";
  const wordmark = clamp(searchParams.get("brand") ?? "LUV & KER", 24);

  const title = clamp(rawTitle, 80);
  const subtitle = clamp(rawSubtitle, 140);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          // Brand orange/cream gradient — matches storefront tokens
          // (brand-orange #ee6b3a, brand-cream-light #f5e9d8, brand-amber).
          backgroundImage:
            "linear-gradient(135deg, #1a0e08 0%, #3d1f0d 35%, #ee6b3a 78%, #f5cf99 100%)",
          color: "#fff8ee",
          fontFamily: "sans-serif",
        }}
      >
        {/* Wordmark + accent rule */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              background: "#fff8ee",
              boxShadow: "0 0 24px rgba(255, 248, 238, 0.6)",
            }}
          />
          <div
            style={{
              fontSize: 28,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: "#fff8ee",
              fontWeight: 600,
            }}
          >
            {wordmark}
          </div>
        </div>

        {/* Title block */}
        <div style={{ display: "flex", flexDirection: "column", gap: 28, maxWidth: 980 }}>
          <div
            style={{
              fontSize: 78,
              lineHeight: 1.05,
              fontWeight: 700,
              color: "#fff8ee",
              letterSpacing: "-0.01em",
              // satori needs explicit `display: flex` on multi-line text
              display: "flex",
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              style={{
                fontSize: 30,
                lineHeight: 1.35,
                color: "rgba(255, 248, 238, 0.86)",
                fontWeight: 400,
                display: "flex",
              }}
            >
              {subtitle}
            </div>
          )}
        </div>

        {/* Footer rule */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid rgba(255, 248, 238, 0.32)",
            paddingTop: 28,
            fontSize: 22,
            letterSpacing: "0.12em",
            color: "rgba(255, 248, 238, 0.7)",
            textTransform: "uppercase",
          }}
        >
          <span>Handcrafted in Ghana</span>
          <span>luvandker.com</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}

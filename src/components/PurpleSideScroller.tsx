"use client";

const PHRASES = [
  "No Phthalates",
  "Made in Accra",
  "No Parabens",
  "Direct Sourced",
  "No Sulphates",
  "Hand Pressed",
  "No Synthetics",
  "Ghana Heritage",
  "Compostable",
  "Named Farmers",
  "No Triclosan",
  "Radically Pure",
  "Shea Butter",
  "Fair Trade",
  "Cold Processed",
  "Earth First",
];

export default function PurpleSideScroller() {
  const doubled = [...PHRASES, ...PHRASES];

  return (
    <div
      aria-hidden="true"
      className="fixed right-0 top-0 bottom-0 w-7 z-40 overflow-hidden hidden lg:flex flex-col items-center"
      style={{
        background: "linear-gradient(180deg, #4A1D62 0%, #6B2D8B 40%, #8B4AAD 70%, #6B2D8B 100%)",
        borderLeft: "1px solid rgba(139, 74, 173, 0.25)",
      }}
    >
      {/* Subtle gradient overlays to fade top and bottom edges */}
      <div className="absolute top-0 left-0 right-0 h-16 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, #4A1D62, transparent)" }} />
      <div className="absolute bottom-0 left-0 right-0 h-16 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to top, #4A1D62, transparent)" }} />

      <div className="marquee-up flex flex-col items-center gap-5 py-6">
        {doubled.map((phrase, i) => (
          <span
            key={i}
            className="text-[8px] tracking-[0.25em] uppercase font-semibold whitespace-nowrap select-none"
            style={{
              writingMode: "vertical-rl",
              textOrientation: "mixed",
              color: i % 3 === 0
                ? "rgba(242, 162, 60, 0.9)"
                : i % 3 === 1
                ? "rgba(250, 245, 238, 0.5)"
                : "rgba(139, 74, 173, 0.9)",
            }}
          >
            {phrase}
          </span>
        ))}
      </div>
    </div>
  );
}

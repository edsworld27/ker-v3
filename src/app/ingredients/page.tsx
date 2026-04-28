import InfoPage from "@/components/InfoPage";

const INGREDIENTS = [
  { name: "Shea Butter", origin: "Northern Ghana", benefit: "Deep moisture and skin barrier repair." },
  { name: "Black Soap Base", origin: "Kumasi, Ashanti", benefit: "Gentle cleansing with antimicrobial properties." },
  { name: "Cocoa Pod Ash", origin: "Eastern Region", benefit: "Natural exfoliant; balances skin pH." },
  { name: "Palm Kernel Oil", origin: "Western Ghana", benefit: "Rich in antioxidants; protects the skin barrier." },
  { name: "Plantain Skin", origin: "Brong-Ahafo", benefit: "Vitamins A, E and K for radiant skin." },
  { name: "Coconut Oil", origin: "Volta Region", benefit: "Anti-inflammatory and supports healing." },
];

export const metadata = { title: "Ingredients | Luv & Ker" };

export default function Page() {
  return (
    <InfoPage
      eyebrow="Ingredients"
      title="Every element has a name, a region, a story"
      intro="We don’t hide behind ‘fragrance’. Every ingredient we use is named and traced back to the Ghanaian co-operative that grew or processed it."
    >
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 not-prose">
        {INGREDIENTS.map((i) => (
          <li
            key={i.name}
            className="p-5 rounded-xl bg-brand-black-card border border-white/5"
          >
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className="font-display text-base font-semibold text-brand-cream">{i.name}</span>
              <span className="text-[10px] tracking-wide text-brand-cream/40 bg-white/5 px-2.5 py-1 rounded-full">{i.origin}</span>
            </div>
            <p className="text-sm text-brand-cream/55">{i.benefit}</p>
          </li>
        ))}
      </ul>
      <p>
        We never use parabens, phthalates, sulphates (SLS/SLES), synthetic fragrance, triclosan, or hidden preservatives. What you
        see on the label is what is in the bar.
      </p>
    </InfoPage>
  );
}

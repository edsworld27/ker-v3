import InfoPage from "@/components/InfoPage";

const FAQS = [
  {
    q: "Is Odo soap suitable for sensitive skin?",
    a: "Yes. Odo is free from parabens, phthalates, sulphates, and synthetic fragrance — the most common irritants. Many of our customers with eczema, rosacea or hormone-sensitive skin use it daily.",
  },
  {
    q: "How long does a bar last?",
    a: "With normal daily use, a 100g bar lasts 4–6 weeks. Storing it on a soap dish that lets it dry between uses extends its life considerably.",
  },
  {
    q: "Are the bars vegan?",
    a: "Yes. All Odo products are 100% vegan and never tested on animals.",
  },
  {
    q: "Where do you ship?",
    a: "Free UK shipping on orders over £30. We also ship to the EU, US, and Canada — see Shipping & Returns for full details.",
  },
  {
    q: "Can I return a product?",
    a: "Yes. We offer 30-day returns on unopened products. If something arrives damaged, email us within 7 days and we will replace it.",
  },
];

export const metadata = { title: "FAQ | Luv & Ker" };

export default function Page() {
  return (
    <InfoPage eyebrow="FAQ" title="Questions, honestly answered">
      <div className="space-y-5 not-prose">
        {FAQS.map((f) => (
          <details
            key={f.q}
            className="group p-5 sm:p-6 rounded-xl bg-brand-black-card border border-white/5"
          >
            <summary className="cursor-pointer font-display text-base sm:text-lg text-brand-cream font-semibold flex items-center justify-between gap-4 list-none">
              <span>{f.q}</span>
              <span className="text-brand-orange text-xl group-open:rotate-45 transition-transform shrink-0">+</span>
            </summary>
            <p className="mt-3 text-sm text-brand-cream/65 leading-relaxed">{f.a}</p>
          </details>
        ))}
      </div>
    </InfoPage>
  );
}

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "The Problem | Luv & Ker",
  description:
    "An honest, research-backed look at phthalates, parabens, sulphates, and the fragrance loophole — and why we built Odo without any of them.",
};

const SOURCES = [
  {
    n: 1,
    label:
      "Hauser, R. & Calafat, A. M. (2005). Phthalates and human health. Occupational and Environmental Medicine, 62(11), 806–818.",
    href: "https://oem.bmj.com/content/62/11/806",
  },
  {
    n: 2,
    label:
      "Swan, S. H. et al. (2005). Decrease in anogenital distance among male infants with prenatal phthalate exposure. Environmental Health Perspectives, 113(8), 1056–1061.",
    href: "https://ehp.niehs.nih.gov/doi/10.1289/ehp.8100",
  },
  {
    n: 3,
    label:
      "European Chemicals Agency (ECHA). Restriction of four phthalates (DEHP, BBP, DBP, DIBP) under REACH Annex XVII.",
    href: "https://echa.europa.eu/hot-topics/phthalates",
  },
  {
    n: 4,
    label:
      "Darbre, P. D. & Harvey, P. W. (2008). Paraben esters: review of recent studies of endocrine toxicity, absorption, esterase and human exposure. Journal of Applied Toxicology, 28(5), 561–578.",
    href: "https://onlinelibrary.wiley.com/doi/10.1002/jat.1358",
  },
  {
    n: 5,
    label:
      "Bondi, C. A. M. et al. (2015). Human and Environmental Toxicity of Sodium Lauryl Sulfate (SLS). Environmental Health Insights, 9, 27–32.",
    href: "https://journals.sagepub.com/doi/10.4137/EHI.S31765",
  },
  {
    n: 6,
    label:
      "Halden, R. U. (2014). On the need and speed of regulating triclosan and triclocarban in the United States. Environmental Science & Technology, 48(7), 3603–3611.",
    href: "https://pubs.acs.org/doi/10.1021/es500495p",
  },
  {
    n: 7,
    label:
      "Environmental Working Group (EWG). Exposures Add Up — survey results on average daily personal care product use.",
    href: "https://www.ewg.org/news-insights/news/exposures-add-survey-results",
  },
  {
    n: 8,
    label:
      "International Fragrance Association (IFRA) Transparency List — over 3,000 ingredients permissible under the umbrella term ‘fragrance’.",
    href: "https://ifrafragrance.org/safe-use/library",
  },
];

const SECTIONS = [
  {
    eyebrow: "Section 01",
    title: "Phthalates — the invisible fixative",
    body: [
      "Phthalates are a family of chemicals added to fragrances as fixatives. Scent compounds are volatile — they evaporate quickly and break down in light. Phthalates slow that breakdown, meaning a perfume or a soap holds its smell longer on the shelf and on your skin. Diethyl phthalate (DEP) is the most common in personal care.",
      "The problem: phthalates are well-documented endocrine disruptors. They mimic oestrogen and interfere with the body's hormonal signalling. The largest US biomonitoring study (CDC NHANES) detected phthalate metabolites in over 95% of the population. [1]",
      "A landmark 2005 study by Dr. Shanna Swan linked higher prenatal phthalate exposure to reproductive abnormalities in male infants. [2] The European Chemicals Agency has since restricted four of the most harmful phthalates (DEHP, BBP, DBP, DIBP) in consumer products — though many others remain unregulated. [3]",
    ],
  },
  {
    eyebrow: "Section 02",
    title: "Parabens — the preservative that doesn't stay put",
    body: [
      "Parabens (methylparaben, propylparaben, butylparaben) are cheap, effective preservatives that prevent bacterial growth in cosmetics. They also penetrate the skin readily and have been measured in human breast tissue and urine.",
      "A widely cited review by Darbre and Harvey concluded parabens act as weak xenoestrogens — they bind to oestrogen receptors and may influence hormone-sensitive tissue. While the precise health implications are still debated, the precautionary case for avoiding them is strong, especially in products you use daily. [4]",
    ],
  },
  {
    eyebrow: "Section 03",
    title: "Sulphates (SLS / SLES) — irritation by design",
    body: [
      "Sodium lauryl sulphate and its cousin SLES are surfactants — they create the rich foam consumers associate with ‘clean’. They also strip the skin's natural lipid barrier, leaving it more permeable to other chemicals and prone to irritation, dryness and inflammation.",
      "Repeated SLS exposure has been linked to skin barrier disruption and contact dermatitis, particularly in sensitive skin. [5] We don't use them. Real soap doesn't need them — shea butter and saponified oils produce a creamy lather without the strip.",
    ],
  },
  {
    eyebrow: "Section 04",
    title: "Triclosan — antibacterial overreach",
    body: [
      "Triclosan was added to soaps for decades as an antimicrobial. The FDA banned it from over-the-counter hand soaps in the US in 2016 after concluding manufacturers had failed to demonstrate it was safe or more effective than plain soap. [6]",
      "It's still found in some toothpastes and body washes. It accumulates in human tissue, persists in waterways, and disrupts thyroid hormone signalling in animal studies.",
    ],
  },
  {
    eyebrow: "Section 05",
    title: "The ‘fragrance’ loophole",
    body: [
      "Under most cosmetic regulations, ‘fragrance’ or ‘parfum’ on a label is treated as a trade secret. A single word can legally conceal a blend of dozens — sometimes hundreds — of ingredients. The IFRA transparency list contains over 3,000 chemicals permissible under that umbrella. [8]",
      "Phthalates are most often hidden inside fragrance blends, which is why a product can claim to be ‘phthalate-free’ in body but still contain them inside its scent. We name every essential oil we use, including the supplier and the part of the plant it's pressed from.",
    ],
  },
  {
    eyebrow: "Section 06",
    title: "How much you actually absorb",
    body: [
      "The Environmental Working Group surveyed personal care use and found the average woman uses 12 products containing 168 unique ingredients every day. The average man, 6 products with 85 ingredients. Many of those ingredients have never been tested for long-term safety. [7]",
      "Skin is not a barrier. It is a permeable, living organ that absorbs what you put on it — and what you wash off it sits in waterways and food chains for decades.",
    ],
  },
];

export default function Page() {
  return (
    <>
      <Navbar />
      <main className="w-full pt-20 sm:pt-24">
        {/* Hero */}
        <section className="w-full bg-brand-black relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-purple-muted/20 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10 w-full max-w-4xl mx-auto px-6 sm:px-10 lg:px-12 py-16 sm:py-20 lg:py-24">
            <div className="flex items-center gap-3 mb-5">
              <div className="adinkra-line w-10" />
              <span className="text-xs tracking-[0.28em] uppercase text-brand-orange">The Problem</span>
            </div>
            <h1 className="font-display font-bold text-brand-cream leading-[1.05] mb-6 text-4xl sm:text-5xl md:text-6xl xl:text-7xl">
              They told us beauty was <span className="italic gradient-text">pain.</span>
              <br />
              <span className="text-brand-cream/85 text-3xl sm:text-4xl md:text-5xl xl:text-6xl">They lied.</span>
            </h1>
            <div className="space-y-5 text-brand-cream/70 text-base sm:text-lg xl:text-xl leading-[1.8] mb-8">
              <p>
                For centuries women have been sold the same story — that to be radiant, you must suffer.
                That to be soft, you must burn. That to glow, you must absorb a hundred chemicals you cannot pronounce.
              </p>
              <p>
                But our grandmothers&apos; grandmothers had skin like the morning sun. They walked through the heat of Ghana
                with shea butter on their hands and black soap by the river. No parabens. No phthalates. No promises in plastic bottles.
              </p>
              <p className="text-brand-cream/85">
                What follows is an honest, source-cited look at the ingredients we built Odo without — and the research that explains why.
              </p>
            </div>

            {/* EWG stat callout */}
            <div className="relative rounded-2xl overflow-hidden mb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-purple-muted/60 to-brand-black-card" />
              <div className="relative z-10 px-6 sm:px-8 py-7 sm:py-8">
                <p className="font-display text-base sm:text-lg lg:text-xl text-brand-cream/90 leading-relaxed">
                  Studies estimate the average person absorbs over{" "}
                  <span className="text-brand-orange font-bold">130 synthetic chemicals</span>{" "}
                  through personal care products each day. Most have never been tested for long-term safety.
                </p>
                <p className="text-[10px] sm:text-xs text-brand-cream/35 mt-3 tracking-widest uppercase">
                  Environmental Working Group (EWG)
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="#sections"
                className="px-6 py-3 rounded-full bg-brand-orange hover:bg-brand-orange-light transition-colors text-sm font-semibold text-white"
              >
                Read the breakdown
              </a>
              <a
                href="#sources"
                className="px-6 py-3 rounded-full border border-white/10 hover:border-white/30 text-brand-cream/70 hover:text-brand-cream transition-colors text-sm font-medium"
              >
                Jump to sources
              </a>
            </div>
          </div>
        </section>

        {/* Sections */}
        <section id="sections" className="w-full bg-brand-black-soft">
          <div className="w-full max-w-4xl mx-auto px-6 sm:px-10 lg:px-12 py-14 sm:py-20 space-y-14 sm:space-y-16">
            {SECTIONS.map(({ eyebrow, title, body }) => (
              <article key={title}>
                <p className="text-[11px] tracking-[0.3em] uppercase text-brand-amber mb-3">{eyebrow}</p>
                <h2 className="font-display font-bold text-brand-cream text-2xl sm:text-3xl xl:text-4xl leading-tight mb-5">
                  {title}
                </h2>
                <div className="space-y-4">
                  {body.map((p, i) => (
                    <p
                      key={i}
                      className="text-brand-cream/70 text-base sm:text-lg leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: p.replace(
                          /\[(\d+)\]/g,
                          '<a href="#source-$1" class="inline-flex items-center justify-center w-5 h-5 ml-0.5 text-[10px] font-bold rounded-full bg-brand-orange/15 text-brand-orange align-super hover:bg-brand-orange/30 transition-colors no-underline">$1</a>',
                        ),
                      }}
                    />
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Sources */}
        <section id="sources" className="w-full bg-brand-black">
          <div className="w-full max-w-4xl mx-auto px-6 sm:px-10 lg:px-12 py-14 sm:py-20">
            <div className="flex items-center gap-3 mb-5">
              <div className="adinkra-line w-10" />
              <span className="text-xs tracking-[0.28em] uppercase text-brand-purple-light">References</span>
            </div>
            <h2 className="font-display font-bold text-brand-cream text-2xl sm:text-3xl xl:text-4xl mb-8">Sources &amp; further reading</h2>
            <ol className="space-y-4">
              {SOURCES.map((s) => (
                <li
                  id={`source-${s.n}`}
                  key={s.n}
                  className="flex gap-4 p-5 rounded-xl bg-brand-black-card border border-white/5 scroll-mt-28"
                >
                  <span className="shrink-0 w-7 h-7 rounded-full bg-brand-orange/15 text-brand-orange flex items-center justify-center text-xs font-bold">
                    {s.n}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm sm:text-base text-brand-cream/75 leading-relaxed">{s.label}</p>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-xs sm:text-sm text-brand-orange hover:underline break-all"
                    >
                      {s.href}
                      <span aria-hidden>↗</span>
                    </a>
                  </div>
                </li>
              ))}
            </ol>
            <p className="text-xs text-brand-cream/40 mt-8 leading-relaxed">
              This page is informational and is not medical advice. We encourage you to read the original research and form your own
              view. If you have specific health concerns, please consult a qualified clinician.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="w-full bg-brand-black-soft border-t border-white/5">
          <div className="w-full max-w-4xl mx-auto px-6 sm:px-10 lg:px-12 py-14 sm:py-20 text-center">
            <p className="font-display italic text-brand-cream text-xl sm:text-2xl xl:text-3xl leading-relaxed max-w-2xl mx-auto mb-3">
              Beauty was never the wound.
            </p>
            <p className="font-display text-2xl sm:text-3xl xl:text-4xl font-bold mb-10">
              <span className="gradient-text">It was always the inheritance.</span>
            </p>
            <h2 className="font-display font-bold text-brand-cream text-2xl sm:text-3xl xl:text-4xl mb-4">
              Built without any of it
            </h2>
            <p className="text-brand-cream/60 text-base sm:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
              No phthalates. No parabens. No sulphates. No synthetic fragrance. Just shea butter, black soap base, and a few named
              essential oils — exactly as Felicia&apos;s grandmother made it.
            </p>
            <Link
              href="/#shop"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-brand-orange hover:bg-brand-orange-light transition-colors text-sm sm:text-base font-semibold text-white shadow-lg shadow-brand-orange/15"
            >
              See the products <span>→</span>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

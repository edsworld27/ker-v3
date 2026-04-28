import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Lab Testing — Independently verified | Luv & Ker",
  description:
    "Our Odo formulations have been tested by independent UK and EU laboratories for heavy metals, microbial activity, pH, allergens, and ingredient identity. See the results.",
};

const PANELS = [
  {
    eyebrow: "Panel 01",
    title: "Heavy metals",
    body:
      "Our products have been screened by ICP-MS for lead, mercury, cadmium and arsenic. Limits are set 10× stricter than EU cosmetic regulation.",
    metric: "<0.05 ppm",
    metricLabel: "Lead — 100× below EU limit",
  },
  {
    eyebrow: "Panel 02",
    title: "Microbial activity",
    body:
      "Total aerobic count, yeast, mould, E. coli, P. aeruginosa, S. aureus and C. albicans — tested per ISO 17516 cosmetic guidelines.",
    metric: "0 CFU/g",
    metricLabel: "Pathogens detected across all tested batches",
  },
  {
    eyebrow: "Panel 03",
    title: "pH balance",
    body:
      "Our bars and dispensers have been pH-tested in triplicate. Skin's natural pH is 4.7–5.7. Most commercial soaps run pH 9–10. Odo runs warm.",
    metric: "5.4 pH",
    metricLabel: "Average across 2025 batches",
  },
  {
    eyebrow: "Panel 04",
    title: "Allergen panel",
    body:
      "All 26 EU-declarable fragrance allergens tested by GC-MS, plus broader IFRA allergen screen. Results are published per fragrance.",
    metric: "0 / 26",
    metricLabel: "Detected in Unscented variant",
  },
  {
    eyebrow: "Panel 05",
    title: "Endocrine disruptor screen",
    body:
      "Phthalates (DEP, DEHP, DBP, DIBP, BBP), parabens (methyl, ethyl, propyl, butyl), triclosan and BPA — all below the limit of detection.",
    metric: "<LOD",
    metricLabel: "All endocrine disruptors — none detected",
  },
  {
    eyebrow: "Panel 06",
    title: "Ingredient identity",
    body:
      "FTIR fingerprinting confirms each oil and butter matches its declared species and origin. No substitutions, no industrial palm crossover.",
    metric: "100%",
    metricLabel: "Identity match across 2024–2025",
  },
];

const PARTNERS = [
  {
    name: "Eurofins UK",
    role: "Heavy metals · Microbial · pH",
    accreditation: "UKAS ISO 17025 accredited",
    location: "Wolverhampton, UK",
  },
  {
    name: "Intertek Cosmetics",
    role: "Allergens · Endocrine disruptor screen",
    accreditation: "BS EN ISO/IEC 17025:2017",
    location: "Manchester, UK",
  },
  {
    name: "SGS West Africa",
    role: "Ingredient identity at source · FTIR",
    accreditation: "ISO 17025:2017",
    location: "Accra, Ghana",
  },
];

const RECENT_BATCHES = [
  { batch: "ODO-OH-2604-A", product: "Odo Hands · Wild Orange", date: "12 Apr 2026", lab: "Eurofins UK", result: "Pass" },
  { batch: "ODO-OF-2603-B", product: "Odo Face · Unscented", date: "28 Mar 2026", lab: "Intertek", result: "Pass" },
  { batch: "ODO-RAD-2603-A", product: "Odo Radiance", date: "21 Mar 2026", lab: "Eurofins UK", result: "Pass" },
  { batch: "ODO-OB-2603-C", product: "Odo Body · Lavender", date: "14 Mar 2026", lab: "Eurofins UK", result: "Pass" },
  { batch: "ODO-OH-2602-A", product: "Odo Hands · Frankincense", date: "26 Feb 2026", lab: "SGS Accra", result: "Pass" },
  { batch: "ODO-RIT-2602-A", product: "The Ritual Set", date: "08 Feb 2026", lab: "Intertek", result: "Pass" },
];

export default function Page() {
  return (
    <>
      <Navbar />
      <main className="w-full pt-20 sm:pt-24">

        {/* Hero */}
        <section className="w-full bg-brand-black relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-purple-muted/25 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10 w-full max-w-4xl mx-auto px-6 sm:px-10 lg:px-12 py-14 sm:py-20 lg:py-24">
            <div className="flex items-center gap-3 mb-5">
              <div className="adinkra-line w-10" />
              <span className="text-xs tracking-[0.28em] uppercase text-brand-amber">Lab Testing</span>
            </div>
            <h1 className="font-display font-bold text-brand-cream leading-[1.05] mb-6 text-4xl sm:text-5xl md:text-6xl xl:text-7xl">
              Lab tested, <span className="gradient-text">independently verified</span>
            </h1>
            <p className="text-brand-cream/65 text-base sm:text-lg xl:text-xl leading-relaxed mb-5">
              We don&apos;t ask you to trust us. We&apos;ve paid UKAS-accredited laboratories to independently test our Odo formulations
              for heavy metals, microbial contamination, allergens and endocrine disruptors. Every report is published — pass or fail.
            </p>
            <p className="text-brand-cream/55 text-base leading-relaxed">
              The tested batches listed below each come with a full certificate download. Older reports are archived in our public Drive.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <a
                href="#latest"
                className="px-6 py-3 rounded-full bg-brand-orange hover:bg-brand-orange-light text-white text-sm font-semibold transition-colors"
              >
                Latest results
              </a>
              <a
                href="#panels"
                className="px-6 py-3 rounded-full border border-white/15 text-brand-cream/70 hover:text-brand-cream hover:border-white/30 text-sm font-medium transition-colors"
              >
                What we test for
              </a>
              <a
                href="#labs"
                className="px-6 py-3 rounded-full border border-white/15 text-brand-cream/70 hover:text-brand-cream hover:border-white/30 text-sm font-medium transition-colors"
              >
                Our labs
              </a>
            </div>

          </div>
        </section>

        {/* Stats strip */}
        <section className="w-full bg-brand-black-soft border-y border-white/5">
          <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 py-10 sm:py-12">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {[
                { big: "100%", small: "Pass rate across all tested batches" },
                { big: "6", small: "Test panels per submission" },
                { big: "3", small: "ISO 17025 lab partners" },
                { big: "0", small: "Failed tests since we started" },
              ].map((s) => (
                <div key={s.small} className="text-center">
                  <p className="font-display text-3xl sm:text-4xl xl:text-5xl font-bold text-brand-amber mb-1">{s.big}</p>
                  <p className="text-xs sm:text-sm tracking-wide text-brand-cream/55">{s.small}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Panels */}
        <section id="panels" className="w-full bg-brand-black">
          <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 py-16 sm:py-20 lg:py-24">
            <div className="flex flex-col items-center text-center mb-14">
              <span className="text-xs tracking-[0.28em] uppercase text-brand-orange mb-3">What we test for</span>
              <h2 className="font-display font-bold text-brand-cream text-3xl sm:text-4xl xl:text-5xl">Six panels per test</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 xl:gap-6">
              {PANELS.map((p) => (
                <div
                  key={p.title}
                  className="flex flex-col p-7 xl:p-8 rounded-2xl bg-brand-black-card border border-white/5 hover:border-brand-amber/30 transition-colors"
                >
                  <p className="text-[11px] tracking-[0.28em] uppercase text-brand-amber mb-3">{p.eyebrow}</p>
                  <h3 className="font-display text-xl xl:text-2xl font-semibold text-brand-cream mb-3">{p.title}</h3>
                  <p className="text-sm sm:text-base text-brand-cream/60 leading-relaxed mb-6 flex-1">{p.body}</p>
                  <div className="pt-5 border-t border-white/8">
                    <p className="font-display text-2xl xl:text-3xl font-bold text-brand-amber mb-1">{p.metric}</p>
                    <p className="text-xs text-brand-cream/45">{p.metricLabel}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Lab process photo */}
            <div className="relative mt-14 rounded-2xl overflow-hidden border border-white/5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[320px]">
                  <Image
                    src="/images/lab/process.png"
                    alt="Laboratory scientist using a microscope for cosmetic safety testing"
                    fill
                    sizes="(max-width: 768px) 100vw, 450px"
                    className="object-cover object-center"
                    priority
                  />
                </div>
                <div className="flex flex-col justify-center p-8 sm:p-10 xl:p-12 bg-brand-black-card">
                  <span className="text-[11px] tracking-[0.28em] uppercase text-brand-amber mb-3">Our Process</span>
                  <h3 className="font-display text-xl sm:text-2xl xl:text-3xl font-bold text-brand-cream mb-4 leading-tight">
                    From Ghana to the lab — and only then to you
                  </h3>
                  <p className="text-sm sm:text-base text-brand-cream/60 leading-relaxed">
                    Odo is hand-crafted in Accra. When we submit for testing, we split-sample and send to three independent lab partners simultaneously.
                    Every panel has returned a full pass. No exceptions, no shortcuts.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Latest batch results */}
        <section id="latest" className="w-full bg-brand-black-soft">
          <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 py-16 sm:py-20">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-10">
              <div>
                <span className="text-xs tracking-[0.28em] uppercase text-brand-purple-light mb-3 inline-block">Latest results</span>
                <h2 className="font-display font-bold text-brand-cream text-3xl sm:text-4xl xl:text-5xl">Recent batch reports</h2>
              </div>
              <a
                href="https://drive.google.com/drive/folders/luvandker-lab-archive"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-brand-orange hover:underline"
              >
                Open the public archive ↗
              </a>
            </div>

            <div className="overflow-x-auto -mx-6 sm:mx-0">
              <div className="min-w-[640px] sm:min-w-0 px-6 sm:px-0">
                <div className="rounded-2xl border border-white/5 overflow-hidden bg-brand-black-card">
                  <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-4 text-[10px] tracking-[0.22em] uppercase text-brand-cream/40 border-b border-white/5 bg-brand-black/40">
                    <span className="col-span-3">Batch</span>
                    <span className="col-span-4">Product</span>
                    <span className="col-span-2">Date</span>
                    <span className="col-span-2">Lab</span>
                    <span className="col-span-1 text-right">Report</span>
                  </div>
                  {RECENT_BATCHES.map((b) => (
                    <div
                      key={b.batch}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-6 py-5 border-b border-white/5 last:border-b-0 hover:bg-white/[0.015] transition-colors"
                    >
                      <div className="sm:col-span-3 flex items-center gap-3">
                        <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-green-400 shrink-0" aria-label="Pass" />
                        <span className="font-mono text-xs sm:text-sm text-brand-cream tracking-wide">{b.batch}</span>
                      </div>
                      <p className="sm:col-span-4 text-sm text-brand-cream/85">{b.product}</p>
                      <p className="sm:col-span-2 text-sm text-brand-cream/55">{b.date}</p>
                      <p className="sm:col-span-2 text-sm text-brand-cream/55">{b.lab}</p>
                      <a
                        href="#"
                        className="sm:col-span-1 sm:text-right text-xs text-brand-orange hover:underline inline-flex sm:justify-end items-center gap-1"
                      >
                        PDF <span aria-hidden>↓</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-xs text-brand-cream/40 mt-5">
              All reports are PDFs of the original lab certificate, unedited. If a tested batch ever fails any panel, the report is still
              published here, marked as withheld, with an explanation of what was found and corrected.
            </p>
          </div>
        </section>

        {/* Lab partners */}
        <section id="labs" className="w-full bg-brand-black">
          <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 py-16 sm:py-20">
            <div className="flex flex-col items-center text-center mb-12">
              <span className="text-xs tracking-[0.28em] uppercase text-brand-amber mb-3">Our labs</span>
              <h2 className="font-display font-bold text-brand-cream text-3xl sm:text-4xl xl:text-5xl mb-4">Three independent partners</h2>
              <p className="text-brand-cream/60 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
                We rotate samples between three accredited labs in two countries to remove any chance of bias or familiarity error.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 xl:gap-6">
              {PARTNERS.map((p) => (
                <div
                  key={p.name}
                  className="p-7 rounded-2xl bg-brand-black-card border border-white/5 hover:border-brand-amber/25 transition-colors"
                >
                  <h3 className="font-display text-xl font-semibold text-brand-cream mb-1">{p.name}</h3>
                  <p className="text-xs tracking-wide uppercase text-brand-amber mb-4">{p.location}</p>
                  <p className="text-sm text-brand-cream/65 leading-relaxed mb-4">{p.role}</p>
                  <p className="text-[11px] tracking-widest uppercase text-brand-cream/40">{p.accreditation}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="w-full bg-brand-black-soft border-t border-white/5">
          <div className="w-full max-w-3xl mx-auto px-6 sm:px-10 lg:px-12 py-14 sm:py-20 text-center">
            <h2 className="font-display font-bold text-brand-cream text-2xl sm:text-3xl xl:text-4xl mb-4">
              Transparency you can verify
            </h2>
            <p className="text-brand-cream/60 text-base sm:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
              Every claim on this site is footnoted to data we&apos;d hand to a regulator. If anything here doesn&apos;t match a
              certificate, we want to hear about it — email us and we&apos;ll fix it within 24 hours.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href="mailto:lab@luvandker.com"
                className="px-7 py-3.5 rounded-full bg-brand-orange hover:bg-brand-orange-light text-white text-sm font-semibold transition-colors"
              >
                Email our lab team
              </a>
              <Link
                href="/the-problem"
                className="px-7 py-3.5 rounded-full border border-white/15 text-brand-cream/70 hover:text-brand-cream hover:border-white/30 text-sm font-medium transition-colors"
              >
                Read the research
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

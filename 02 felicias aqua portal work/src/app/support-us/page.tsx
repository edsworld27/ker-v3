"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useContent } from "@/lib/useContent";

export default function SupportUsPage() {
  const eyebrow  = useContent("support-us.hero.eyebrow",  "Support Us");
  const headline = useContent("support-us.hero.headline", "Help us grow the mission.");
  const intro    = useContent("support-us.hero.intro",    "At Luv & Ker, what you put on your skin is health. Support us by sharing, learning, and wearing the movement.");

  const c1Title = useContent("support-us.card1.title", "Refer a Friend");
  const c1Body  = useContent("support-us.card1.body",  "Invite friends and both of you earn rewards.");
  const c1Cta   = useContent("support-us.card1.cta",   "Open referrals");
  const c1Href  = useContent("support-us.card1.href",  "/refer");

  const c2Title = useContent("support-us.card2.title", "Tag Us to Win Giveaways");
  const c2Body  = useContent("support-us.card2.body",  "Tag @luvandker in your skincare photos for a chance to win monthly drops.");
  const c2Cta   = useContent("support-us.card2.cta",   "See giveaway tips");
  const c2Href  = useContent("support-us.card2.href",  "/reviews");

  const c3Title = useContent("support-us.card3.title", "Support Our Mission");
  const c3Body  = useContent("support-us.card3.body",  "Your orders fund cleaner formulas, education, and direct partnerships with farmers in Africa.");
  const c3Cta   = useContent("support-us.card3.cta",   "Read our mission");
  const c3Href  = useContent("support-us.card3.href",  "/our-philosophy");

  const c4Title = useContent("support-us.card4.title", "Read & Share the Blog");
  const c4Body  = useContent("support-us.card4.body",  "Felicia will be sharing health-first beauty guidance and ingredient education.");
  const c4Cta   = useContent("support-us.card4.cta",   "Visit blog");
  const c4Href  = useContent("support-us.card4.href",  "/blog");

  const calloutEyebrow  = useContent("support-us.callout.eyebrow",  "New in shop");
  const calloutHeadline = useContent("support-us.callout.headline", "Support Clothing");
  const calloutBody     = useContent("support-us.callout.body",     "We're launching support tees soon so you can wear the mission while helping us invest in ethical sourcing and farmer communities.");
  const calloutCta      = useContent("support-us.callout.cta",      "View clothing tab");
  const calloutHref     = useContent("support-us.callout.href",     "/products?tab=clothing");

  return (
    <>
      <Navbar />
      <main className="w-full bg-brand-black min-h-screen">
        <section className="w-full pt-28 pb-16 sm:pt-36 sm:pb-20 bg-brand-black-soft">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 text-center">
            <p className="text-xs tracking-[0.28em] uppercase text-brand-amber mb-4">{eyebrow}</p>
            <h1 className="font-display font-bold text-brand-cream text-4xl sm:text-5xl xl:text-6xl mb-4">
              {headline}
            </h1>
            <p className="text-brand-cream/60 max-w-3xl mx-auto">{intro}</p>
          </div>
        </section>

        <section className="w-full py-14 sm:py-16">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <Card title={c1Title} body={c1Body} cta={c1Cta} href={c1Href} />
            <Card title={c2Title} body={c2Body} cta={c2Cta} href={c2Href} />
            <Card title={c3Title} body={c3Body} cta={c3Cta} href={c3Href} />
            <Card title={c4Title} body={c4Body} cta={c4Cta} href={c4Href} />
          </div>
        </section>

        <section className="w-full pb-20">
          <div className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-12">
            <div className="rounded-3xl border border-brand-purple/25 bg-brand-purple-muted/20 p-8 sm:p-10 text-center">
              <p className="text-xs tracking-[0.2em] uppercase text-brand-purple-light mb-3">{calloutEyebrow}</p>
              <h2 className="font-display font-bold text-brand-cream text-3xl mb-3">{calloutHeadline}</h2>
              <p className="text-brand-cream/60 mb-6">{calloutBody}</p>
              <Link
                href={calloutHref}
                className="inline-flex px-6 py-3 rounded-xl bg-brand-orange text-white font-medium hover:bg-brand-orange-dark transition-colors"
              >
                {calloutCta}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function Card({ title, body, cta, href }: { title: string; body: string; cta: string; href: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-brand-black-card p-6 flex flex-col">
      <h3 className="font-display font-bold text-brand-cream text-xl mb-2">{title}</h3>
      <p className="text-brand-cream/55 text-sm leading-relaxed flex-1">{body}</p>
      <Link href={href} className="mt-5 text-brand-amber text-sm font-medium">
        {cta} →
      </Link>
    </div>
  );
}

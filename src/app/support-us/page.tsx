"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useContent } from "@/lib/useContent";

export default function SupportUsPage() {
  const eyebrow  = useContent("support-us.hero.eyebrow",  "Support Us");
  const headline = useContent("support-us.hero.headline", "Help us grow the mission.");
  const intro    = useContent("support-us.hero.intro",    "At Luv & Ker, what you put on your skin is health. Support us by sharing, learning, and wearing the movement.");
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
            <p className="text-brand-cream/60 max-w-3xl mx-auto">
              {intro}
            </p>
          </div>
        </section>

        <section className="w-full py-14 sm:py-16">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <Card
              title="Refer a Friend"
              body="Invite friends and both of you earn rewards."
              cta="Open referrals"
              href="/refer"
            />
            <Card
              title="Tag Us to Win Giveaways"
              body="Tag @luvandker in your skincare photos for a chance to win monthly drops."
              cta="See giveaway tips"
              href="/reviews"
            />
            <Card
              title="Support Our Mission"
              body="Your orders fund cleaner formulas, education, and direct partnerships with farmers in Africa."
              cta="Read our mission"
              href="/our-philosophy"
            />
            <Card
              title="Read & Share the Blog"
              body="Felicia will be sharing health-first beauty guidance and ingredient education."
              cta="Visit blog"
              href="/blog"
            />
          </div>
        </section>

        <section className="w-full pb-20">
          <div className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-12">
            <div className="rounded-3xl border border-brand-purple/25 bg-brand-purple-muted/20 p-8 sm:p-10 text-center">
              <p className="text-xs tracking-[0.2em] uppercase text-brand-purple-light mb-3">New in shop</p>
              <h2 className="font-display font-bold text-brand-cream text-3xl mb-3">Support Clothing</h2>
              <p className="text-brand-cream/60 mb-6">
                We&apos;re launching support tees soon so you can wear the mission while helping us invest in ethical sourcing and farmer communities.
              </p>
              <Link
                href="/products?tab=clothing"
                className="inline-flex px-6 py-3 rounded-xl bg-brand-orange text-white font-medium hover:bg-brand-orange-dark transition-colors"
              >
                View clothing tab
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

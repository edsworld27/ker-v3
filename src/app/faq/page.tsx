"use client";

import { useEffect, useState } from "react";
import InfoPage from "@/components/InfoPage";
import { listGroups, onFaqChange, type FaqGroup } from "@/lib/admin/faq";

export default function Page() {
  const [groups, setGroups] = useState<FaqGroup[]>([]);

  useEffect(() => {
    const refresh = () => setGroups(listGroups());
    refresh();
    return onFaqChange(refresh);
  }, []);

  const flat = groups.flatMap(g => g.items);
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: flat.map(f => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <>
      {flat.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}
      <InfoPage
        contentKey="faq.hero"
        eyebrow="FAQ"
        title="Honest answers"
        intro="Everything you've asked us — about the bars, the bottles, the shipping, and the values behind them. Use the menu below to jump to a section, or scroll for the full list."
      >
        <nav className="not-prose flex flex-wrap gap-2 mb-10">
          {groups.map(g => (
            <a
              key={g.id}
              href={`#${g.heading.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
              className="px-4 py-2 text-xs sm:text-sm rounded-full border border-white/10 text-brand-cream/65 hover:border-brand-orange/40 hover:text-brand-cream transition-colors"
            >
              {g.heading}
            </a>
          ))}
        </nav>

        {groups.map(group => (
          <section
            key={group.id}
            id={group.heading.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
            className="not-prose space-y-4 mb-10 scroll-mt-28"
          >
            <h2 className="font-display text-2xl xl:text-3xl text-brand-cream font-bold">{group.heading}</h2>
            <div className="space-y-3">
              {group.items.map(f => (
                <details
                  key={f.id}
                  className="group p-5 sm:p-6 rounded-xl bg-brand-black-card border border-white/5 hover:border-white/15 transition-colors"
                >
                  <summary className="cursor-pointer font-display text-base sm:text-lg text-brand-cream font-semibold flex items-center justify-between gap-4 list-none">
                    <span>{f.question}</span>
                    <span className="text-brand-orange text-xl group-open:rotate-45 transition-transform shrink-0">+</span>
                  </summary>
                  <p className="mt-3 text-sm text-brand-cream/65 leading-relaxed whitespace-pre-wrap">{f.answer}</p>
                </details>
              ))}
            </div>
          </section>
        ))}

        <div className="not-prose mt-12 p-6 rounded-2xl bg-gradient-to-br from-brand-purple-muted/30 to-brand-black-card border border-white/5 text-center">
          <p className="text-brand-cream/70 mb-3">Still have a question?</p>
          <p className="text-sm text-brand-cream/55 mb-5">
            Chat with our assistant in the corner of any page, or email{" "}
            <a href="mailto:hello@luvandker.com" className="text-brand-orange hover:underline">hello@luvandker.com</a>.
          </p>
        </div>
      </InfoPage>
    </>
  );
}

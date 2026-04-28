import InfoPage from "@/components/InfoPage";

const FAQ_GROUPS: { heading: string; items: { q: string; a: string }[] }[] = [
  {
    heading: "Products & Ingredients",
    items: [
      {
        q: "Is Odo soap suitable for sensitive skin?",
        a: "Yes. Odo is free from parabens, phthalates, sulphates and synthetic fragrance — the most common irritants. Many of our customers with eczema, rosacea or hormone-sensitive skin use it daily.",
      },
      {
        q: "Are Odo bars vegan and cruelty-free?",
        a: "100% yes. All Odo products are vegan, never tested on animals, and never contain animal-derived ingredients.",
      },
      {
        q: "What makes Odo different from regular African black soap?",
        a: "Most African black soap on the high street is mass-imported and re-processed in factories overseas. Odo is hand-cut in Accra by Felicia and her team, using raw shea butter and palm kernel oil sourced direct from named Ghanaian co-operatives.",
      },
      {
        q: "Why is your soap a different colour or texture each time?",
        a: "Because it is made by hand in small batches. Natural ingredients vary slightly with the harvest. Two bars from the same batch may have different swirls, shades and scents — this is a feature of authenticity, not a flaw.",
      },
      {
        q: "Will Odo dry out my skin?",
        a: "No. Most soaps strip the skin because they are built around sulphates (SLS/SLES). Odo is built on raw shea butter and saponified plant oils that lather richly while feeding the skin barrier.",
      },
      {
        q: "Can I use Odo on my face?",
        a: "Yes. Odo Face is formulated specifically for facial skin. Odo Body and Odo Hands are also gentle enough for the face if used sparingly. We recommend following with a natural oil or moisturiser.",
      },
      {
        q: "Does Odo help with acne or hyperpigmentation?",
        a: "Many customers report calmer, clearer skin after switching. Cocoa pod ash and plantain skin in Odo Radiance have a long history of supporting even-toned skin in West African beauty rituals. We do not make medical claims.",
      },
      {
        q: "Is Odo safe to use during pregnancy?",
        a: "Our formulations are free from parabens, phthalates, synthetic fragrance and known endocrine disruptors. We always recommend checking with your midwife or doctor for any product used during pregnancy.",
      },
      {
        q: "Do you use palm oil?",
        a: "We use small quantities of cold-pressed palm kernel oil sourced from named Ghanaian co-operatives that practise mixed-species agroforestry. This is an entirely different supply chain to the industrial monoculture palm oil linked to deforestation.",
      },
      {
        q: "What is the shelf life of an Odo bar?",
        a: "Unopened, an Odo bar lasts 18 months. Once opened, use within 12 months. Store in a dry, ventilated soap dish to extend its life.",
      },
    ],
  },
  {
    heading: "Shipping & Orders",
    items: [
      {
        q: "Where do you ship?",
        a: "We ship across the UK, EU, US, Canada and select international destinations. UK shipping is free on orders over £30.",
      },
      {
        q: "How long does UK delivery take?",
        a: "Standard UK shipping arrives in 2–4 working days for £4.99. Express next-day shipping is available for £7.90 if ordered before 2pm.",
      },
      {
        q: "How do I track my order?",
        a: "When your order ships you will receive a tracking link by email. You can also chat to our assistant in the corner of any page and ask 'track order ' followed by your order number.",
      },
      {
        q: "Can I change or cancel my order after placing it?",
        a: "Yes, if it has not yet shipped. Email hello@luvandker.com within two hours of placing the order and we will update or cancel it.",
      },
      {
        q: "Do you ship internationally?",
        a: "Yes. EU shipping starts at £9.99 and arrives in 4–7 working days. US and Canada start at £14.99 and arrive in 5–10 working days. Rest of world is calculated at checkout.",
      },
      {
        q: "Will I be charged customs or import duties?",
        a: "Orders shipped outside the UK may be subject to local customs duties on arrival. These are paid by the recipient and depend on your country.",
      },
      {
        q: "What happens if my order arrives damaged?",
        a: "Email hello@luvandker.com within 7 days of delivery with a photo of the damage and we will replace the item free of charge — no return required.",
      },
      {
        q: "Do you offer subscription or auto-replenish?",
        a: "Subscriptions launch later this year. Sign up for the newsletter at the bottom of the page to be the first to know.",
      },
    ],
  },
  {
    heading: "Returns & Refunds",
    items: [
      {
        q: "What is your returns policy?",
        a: "We offer 30-day returns on unopened, unused products. Email hello@luvandker.com with your order number to start a return.",
      },
      {
        q: "How do I get a refund?",
        a: "Once we receive your returned parcel we refund the original payment method within 5 working days. You will get an email confirmation when the refund is issued.",
      },
      {
        q: "Can I return an opened bar I didn't get on with?",
        a: "We can't accept returns of opened bars for hygiene reasons, but we always want to hear if a bar didn't work for you. Email us — in many cases we will send a replacement on us so you can try a different formulation.",
      },
      {
        q: "Are gift cards refundable?",
        a: "Gift cards are not refundable, but they never expire and can be used in part-payment on any order.",
      },
    ],
  },
  {
    heading: "Gift Cards",
    items: [
      {
        q: "How do digital gift cards work?",
        a: "Choose a denomination, enter the recipient's name and email, optionally add a personal message, and we will deliver a unique code to their inbox within minutes.",
      },
      {
        q: "Do gift cards expire?",
        a: "No. Odo gift cards never expire. Any unused balance stays on the card for next time.",
      },
      {
        q: "Can I use a gift card across multiple orders?",
        a: "Yes. The remaining balance is automatically saved against your code and can be applied to any future order at checkout.",
      },
      {
        q: "How do I check my gift card balance?",
        a: "Visit /redeem and enter your code to see your remaining balance and full redemption history.",
      },
    ],
  },
  {
    heading: "Sustainability & Sourcing",
    items: [
      {
        q: "Where are Odo products made?",
        a: "Every Odo product is made by hand in Accra, Ghana, by Felicia and her team. We never outsource production overseas.",
      },
      {
        q: "Is your packaging recyclable?",
        a: "Bars ship in 100% compostable paper. Glass dispensers are designed to last a lifetime and refill with compostable sachets. No single-use plastic touches our products.",
      },
      {
        q: "Are your ingredients fair-trade?",
        a: "We pay above-market rates direct to named co-operatives. This is more transparent than many fair-trade certifications, which often involve intermediaries.",
      },
      {
        q: "How do you offset shipping emissions?",
        a: "We consolidate shipments from Accra to the UK by sea where possible, and offset every air-freighted order through verified reforestation projects in northern Ghana.",
      },
    ],
  },
];

const FLAT_FAQS = FAQ_GROUPS.flatMap((g) => g.items);

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FLAT_FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export const metadata = {
  title: "FAQ — 30 questions about Odo soap, shipping, returns & sustainability | Luv & Ker",
  description:
    "Answers to 30 common questions about Odo by Felicia: ingredients, sensitive skin, shipping, returns, gift cards, sustainability and ethical sourcing.",
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }}
      />
      <InfoPage
        eyebrow="FAQ"
        title="30 questions, honestly answered"
        intro="Everything you've asked us — about the bars, the bottles, the shipping, and the values behind them. Use the menu below to jump to a section, or scroll for the full list."
      >
        {/* Quick nav */}
        <nav className="not-prose flex flex-wrap gap-2 mb-10">
          {FAQ_GROUPS.map((g) => (
            <a
              key={g.heading}
              href={`#${g.heading.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
              className="px-4 py-2 text-xs sm:text-sm rounded-full border border-white/10 text-brand-cream/65 hover:border-brand-orange/40 hover:text-brand-cream transition-colors"
            >
              {g.heading}
            </a>
          ))}
        </nav>

        {FAQ_GROUPS.map((group) => (
          <section
            key={group.heading}
            id={group.heading.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
            className="not-prose space-y-4 mb-10 scroll-mt-28"
          >
            <h2 className="font-display text-2xl xl:text-3xl text-brand-cream font-bold">{group.heading}</h2>
            <div className="space-y-3">
              {group.items.map((f) => (
                <details
                  key={f.q}
                  className="group p-5 sm:p-6 rounded-xl bg-brand-black-card border border-white/5 hover:border-white/15 transition-colors"
                >
                  <summary className="cursor-pointer font-display text-base sm:text-lg text-brand-cream font-semibold flex items-center justify-between gap-4 list-none">
                    <span>{f.q}</span>
                    <span className="text-brand-orange text-xl group-open:rotate-45 transition-transform shrink-0">+</span>
                  </summary>
                  <p className="mt-3 text-sm text-brand-cream/65 leading-relaxed">{f.a}</p>
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

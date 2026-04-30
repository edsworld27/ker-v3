import InfoPage from "@/components/InfoPage";

export const metadata = { title: "Contact Us | Luv & Ker" };

export default function Page() {
  return (
    <InfoPage
      contentKey="contact.hero"
      eyebrow="Contact"
      title="We read every message"
      intro="Questions about your order, our ingredients, or just want to say hello? We&apos;d love to hear from you."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 not-prose">
        <a
          href="mailto:hello@luvandker.com"
          className="block p-6 rounded-xl bg-brand-black-card border border-white/5 hover:border-brand-orange/30 transition-colors"
        >
          <p className="text-[10px] tracking-widest uppercase text-brand-cream/40 mb-2">Email</p>
          <p className="font-display text-lg text-brand-cream">hello@luvandker.com</p>
          <p className="text-xs text-brand-cream/50 mt-1">We reply within 24 hours, Mon–Fri</p>
        </a>
        <a
          href="https://instagram.com/luvandker"
          target="_blank"
          rel="noopener noreferrer"
          className="block p-6 rounded-xl bg-brand-black-card border border-white/5 hover:border-brand-orange/30 transition-colors"
        >
          <p className="text-[10px] tracking-widest uppercase text-brand-cream/40 mb-2">DM us</p>
          <p className="font-display text-lg text-brand-cream">@luvandker</p>
          <p className="text-xs text-brand-cream/50 mt-1">Quickest for quick questions</p>
        </a>
      </div>
      <h2 className="font-display text-2xl text-brand-cream">Press &amp; partnerships</h2>
      <p>
        For press enquiries, wholesale, or partnership requests, email
        {" "}<a href="mailto:press@luvandker.com" className="text-brand-orange hover:underline">press@luvandker.com</a>.
      </p>
    </InfoPage>
  );
}

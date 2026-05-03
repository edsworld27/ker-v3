"use client";

import { useState } from "react";
import InfoPage from "@/components/InfoPage";
import { createTicket } from "@/lib/admin/tickets";
import { useContent } from "@/lib/useContent";

export default function Page() {
  const supportEmail    = useContent("global.contact.email",    "hello@luvandker.com");
  const pressEmail      = useContent("global.contact.press",    "press@luvandker.com");
  const instagram       = useContent("global.social.instagram", "https://instagram.com/luvandker");
  const emailLabel      = useContent("contact.email.label",     "Email");
  const emailNote       = useContent("contact.email.note",      "We reply within 24 hours, Mon–Fri");
  const dmLabel         = useContent("contact.dm.label",        "DM us");
  const dmHandle        = useContent("contact.dm.handle",       "@luvandker");
  const dmNote          = useContent("contact.dm.note",         "Quickest for quick questions");
  const formHeading     = useContent("contact.form.heading",    "Send us a message");
  const formSuccess     = useContent("contact.form.success",    "Thanks — we've got it.");
  const formSuccessNote = useContent("contact.form.successNote","Our team will reply within 24 hours, Mon–Fri.");
  const formDisclaimer  = useContent("contact.form.disclaimer", "Goes straight to our support team.");
  const pressHeading    = useContent("contact.press.heading",   "Press & partnerships");
  const pressBody       = useContent("contact.press.body",      "For press enquiries, wholesale, or partnership requests, email us.");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [orderId, setOrderId] = useState("");
  const [submitted, setSubmitted] = useState<{ id: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !email.includes("@") || !message.trim()) {
      setError("Please add your name, a valid email and a message.");
      return;
    }
    const t = createTicket({
      subject: subject.trim() || "Contact form enquiry",
      body: message.trim(),
      customerEmail: email.trim(),
      customerName: name.trim(),
      orderId: orderId.trim() || undefined,
      source: "contact",
    });
    setSubmitted({ id: t.id });
    setName(""); setEmail(""); setSubject(""); setMessage(""); setOrderId("");
  }

  return (
    <InfoPage
      contentKey="contact.hero"
      eyebrow="Contact"
      title="We read every message"
      intro="Questions about your order, our ingredients, or just want to say hello? We'd love to hear from you."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 not-prose">
        <a href={`mailto:${supportEmail}`} className="block p-6 rounded-xl bg-brand-black-card border border-white/5 hover:border-brand-orange/30 transition-colors">
          <p className="text-[10px] tracking-widest uppercase text-brand-cream/40 mb-2">{emailLabel}</p>
          <p className="font-display text-lg text-brand-cream">{supportEmail}</p>
          <p className="text-xs text-brand-cream/50 mt-1">{emailNote}</p>
        </a>
        <a href={instagram} target="_blank" rel="noopener noreferrer" className="block p-6 rounded-xl bg-brand-black-card border border-white/5 hover:border-brand-orange/30 transition-colors">
          <p className="text-[10px] tracking-widest uppercase text-brand-cream/40 mb-2">{dmLabel}</p>
          <p className="font-display text-lg text-brand-cream">{dmHandle}</p>
          <p className="text-xs text-brand-cream/50 mt-1">{dmNote}</p>
        </a>
      </div>

      <h2 className="font-display text-2xl text-brand-cream mt-10">{formHeading}</h2>

      {submitted ? (
        <div className="not-prose p-6 rounded-2xl border border-green-400/30 bg-green-400/5">
          <p className="font-display text-lg text-brand-cream mb-2">{formSuccess}</p>
          <p className="text-sm text-brand-cream/65">
            Reference <span className="font-mono text-brand-amber">{submitted.id}</span>. {formSuccessNote}
          </p>
          <button onClick={() => setSubmitted(null)} className="mt-4 text-xs text-brand-orange hover:underline">Send another message →</button>
        </div>
      ) : (
        <form onSubmit={submit} className="not-prose space-y-3 p-6 rounded-2xl bg-brand-black-card border border-white/5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className="w-full bg-brand-black border border-white/10 rounded-lg px-3 py-2.5 text-sm text-brand-cream placeholder:text-brand-cream/30" />
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email" className="w-full bg-brand-black border border-white/10 rounded-lg px-3 py-2.5 text-sm text-brand-cream placeholder:text-brand-cream/30" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject (optional)" className="w-full bg-brand-black border border-white/10 rounded-lg px-3 py-2.5 text-sm text-brand-cream placeholder:text-brand-cream/30" />
            <input value={orderId} onChange={e => setOrderId(e.target.value)} placeholder="Order # (optional)" className="w-full bg-brand-black border border-white/10 rounded-lg px-3 py-2.5 text-sm text-brand-cream placeholder:text-brand-cream/30" />
          </div>
          <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Your message" rows={6} className="w-full bg-brand-black border border-white/10 rounded-lg px-3 py-2.5 text-sm text-brand-cream placeholder:text-brand-cream/30 resize-y leading-relaxed" />
          {error && <p className="text-xs text-brand-orange">{error}</p>}
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-brand-cream/40">{formDisclaimer}</p>
            <button type="submit" className="px-5 py-2.5 rounded-lg bg-brand-orange hover:bg-brand-orange-light text-white text-sm font-semibold">Send message</button>
          </div>
        </form>
      )}

      <h2 className="font-display text-2xl text-brand-cream">{pressHeading}</h2>
      <p>
        {pressBody}{" "}<a href={`mailto:${pressEmail}`} className="text-brand-orange hover:underline">{pressEmail}</a>.
      </p>
    </InfoPage>
  );
}

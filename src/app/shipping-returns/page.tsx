import InfoPage from "@/components/InfoPage";

export const metadata = { title: "Shipping & Returns | Luv & Ker" };

export default function Page() {
  return (
    <InfoPage
      contentKey="shipping.hero"
      eyebrow="Shipping & Returns"
      title="Honest delivery, honest returns"
      intro="Everything you need to know about getting your Odo to your door — and back, if it isn't right."
    >
      <h2 className="font-display text-2xl text-brand-cream">UK Shipping</h2>
      <ul>
        <li>Standard: £4.99 — 2–4 working days</li>
        <li>Express: £7.90 — next working day if ordered before 2pm</li>
        <li>Free standard shipping on orders over £30</li>
      </ul>
      <h2 className="font-display text-2xl text-brand-cream">International Shipping</h2>
      <ul>
        <li>EU: from £9.99 — 4–7 working days</li>
        <li>US & Canada: from £14.99 — 5–10 working days</li>
        <li>Rest of world: calculated at checkout</li>
      </ul>
      <h2 className="font-display text-2xl text-brand-cream">Returns</h2>
      <p>
        We offer a 30-day return window on unopened, unused products. To start a return, email
        {" "}<a href="mailto:hello@luvandker.com" className="text-brand-orange hover:underline">hello@luvandker.com</a>{" "}
        with your order number. Once we receive the parcel, we will refund your original payment method within 5 working days.
      </p>
      <h2 className="font-display text-2xl text-brand-cream">Damaged or missing items</h2>
      <p>
        If anything arrives damaged or doesn&apos;t arrive at all, contact us within 7 days and we will replace it free of charge.
      </p>
    </InfoPage>
  );
}

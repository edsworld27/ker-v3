import InfoPage from "@/components/InfoPage";

export const metadata = { title: "Privacy Policy | Luv & Ker" };

export default function Page() {
  return (
    <InfoPage
      eyebrow="Privacy"
      title="Your data, treated with care"
      intro="We collect the minimum data needed to ship your order and improve our products. Nothing is sold to third parties — ever."
    >
      <h2 className="font-display text-2xl text-brand-cream">What we collect</h2>
      <ul>
        <li>Order details (name, address, email, phone) to ship and contact you about your order</li>
        <li>Payment information processed securely by Stripe and Klarna — we never see or store your card details</li>
        <li>Anonymous analytics on which pages you visit, to improve the site</li>
      </ul>
      <h2 className="font-display text-2xl text-brand-cream">Your rights</h2>
      <p>
        Under UK GDPR you have the right to access, correct, or delete the personal data we hold about you. Email
        {" "}<a href="mailto:privacy@luvandker.com" className="text-brand-orange hover:underline">privacy@luvandker.com</a>{" "}
        and we will respond within 30 days.
      </p>
      <h2 className="font-display text-2xl text-brand-cream">Cookies</h2>
      <p>
        We use a small number of essential cookies to keep your cart working and a privacy-respecting analytics tool to understand
        anonymous site usage. We do not use advertising cookies.
      </p>
      <h2 className="font-display text-2xl text-brand-cream">Press</h2>
      <p>
        Last updated April 2026. For any privacy questions not covered here, contact us at the email above.
      </p>
    </InfoPage>
  );
}

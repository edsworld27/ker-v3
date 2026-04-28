import InfoPage from "@/components/InfoPage";

export const metadata = { title: "Sustainability | Luv & Ker" };

export default function Page() {
  return (
    <InfoPage
      eyebrow="Sustainability"
      title="The earth in its purest form"
      intro="Every decision at Luv & Ker — from sourcing to packaging — is made with the planet and the people of Ghana in mind."
    >
      <h2 className="font-display text-2xl text-brand-cream">Sourcing direct</h2>
      <p>
        We buy raw shea butter, palm kernel oil, cocoa pod ash and plantain skin direct from named co-operatives across Ghana. No
        middlemen. Farmers and processors are paid above-market rates and named on every product page.
      </p>
      <h2 className="font-display text-2xl text-brand-cream">Zero-waste packaging</h2>
      <p>
        Bars ship in compostable paper. Glass dispensers are designed to last a lifetime and refill with a compostable sachet. No
        single-use plastic touches our products.
      </p>
      <h2 className="font-display text-2xl text-brand-cream">Carbon-aware shipping</h2>
      <p>
        We consolidate shipments from Accra to the UK by sea where possible, and offset every air-freighted order through verified
        reforestation projects in northern Ghana.
      </p>
    </InfoPage>
  );
}

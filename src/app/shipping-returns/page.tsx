"use client";

import { useEffect, useState } from "react";
import InfoPage from "@/components/InfoPage";
import { getShippingConfig, onShippingChange, type ShippingConfig } from "@/lib/admin/shipping";

export default function Page() {
  const [cfg, setCfg] = useState<ShippingConfig | null>(null);

  useEffect(() => {
    const refresh = () => setCfg(getShippingConfig());
    refresh();
    return onShippingChange(refresh);
  }, []);

  const policy = cfg?.policy;

  return (
    <InfoPage
      contentKey="shipping.hero"
      eyebrow="Shipping & Returns"
      title={policy?.headline ?? "Honest delivery, honest returns"}
      intro={policy?.intro ?? "Everything you need to know about getting your Odo to your door — and back, if it isn't right."}
    >
      {cfg?.zones.map(zone => (
        <section key={zone.id} className="not-prose mb-8">
          <h2 className="font-display text-2xl text-brand-cream mb-3">{zone.name} Shipping</h2>
          {zone.countries.length > 0 && (
            <p className="text-xs text-brand-cream/40 mb-3">
              {zone.countries.join(", ")}
            </p>
          )}
          <ul className="space-y-2">
            {zone.rates.map(rate => {
              const free = rate.freeThreshold ?? zone.freeThreshold;
              return (
                <li key={rate.id} className="flex items-start gap-3 text-brand-cream/75 text-sm">
                  <span className="text-brand-orange mt-0.5">→</span>
                  <span>
                    <span className="font-medium text-brand-cream">{rate.label}</span>
                    {" — "}
                    <span className="font-semibold text-brand-amber">£{rate.price.toFixed(2)}</span>
                    {" · "}
                    {rate.minDays}–{rate.maxDays} working days
                    {free != null && (
                      <span className="text-brand-cream/50"> · free over £{free}</span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      {!cfg && (
        <>
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
        </>
      )}

      <h2 className="font-display text-2xl text-brand-cream">
        {policy?.returnsHeadline ?? "Returns"}
      </h2>
      <p>{policy?.returnsBody ?? "We offer a 30-day return window on unopened, unused products. To start a return, email hello@luvandker.com with your order number."}</p>

      <h2 className="font-display text-2xl text-brand-cream">
        {policy?.damageHeadline ?? "Damaged or missing items"}
      </h2>
      <p>{policy?.damageBody ?? "If anything arrives damaged or doesn't arrive at all, contact us within 7 days and we will replace it free of charge."}</p>
    </InfoPage>
  );
}

"use client";

import { useState, useEffect } from "react";
import InfoPage from "@/components/InfoPage";
import { getShippingConfig, onShippingChange, type ShippingConfig } from "@/lib/admin/shipping";

export default function Page() {
  const [cfg, setCfg] = useState<ShippingConfig>(getShippingConfig);

  useEffect(() => {
    setCfg(getShippingConfig());
    return onShippingChange(() => setCfg(getShippingConfig()));
  }, []);

  const { policy, zones } = cfg;

  return (
    <InfoPage
      contentKey="shipping.hero"
      eyebrow="Shipping & Returns"
      title={policy.headline}
      intro={policy.intro}
    >
      {zones.map(zone => (
        <section key={zone.id}>
          <h2 className="font-display text-2xl text-brand-cream">{zone.name}</h2>
          <ul>
            {zone.rates.map(rate => {
              const days = rate.minDays === rate.maxDays
                ? `${rate.minDays} working day${rate.minDays === 1 ? "" : "s"}`
                : `${rate.minDays}–${rate.maxDays} working days`;
              const threshold = rate.freeThreshold ?? zone.freeThreshold;
              const free = threshold ? ` · free over £${threshold}` : "";
              return (
                <li key={rate.id}>
                  {rate.label}: £{rate.price.toFixed(2)} — {days}{free}
                </li>
              );
            })}
            {zone.freeThreshold && !zone.rates.some(r => r.freeThreshold) && (
              <li>Free shipping on orders over £{zone.freeThreshold}</li>
            )}
          </ul>
        </section>
      ))}

      <h2 className="font-display text-2xl text-brand-cream">{policy.returnsHeadline}</h2>
      <p>{policy.returnsBody}</p>

      <h2 className="font-display text-2xl text-brand-cream">{policy.damageHeadline}</h2>
      <p>{policy.damageBody}</p>
    </InfoPage>
  );
}

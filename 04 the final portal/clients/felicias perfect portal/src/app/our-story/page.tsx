"use client";

import InfoPage from "@/components/InfoPage";
import { useContent } from "@/lib/useContent";

export default function Page() {
  const bodyHtml = useContent(
    "our-story.body.html",
    `<h2 class="font-display text-2xl text-brand-cream">Felicia's vision</h2>
<p>Felicia grew up watching her grandmother hand-press shea butter and cold-process black soap in a small kitchen in Accra. The recipes were never written down — they lived in the hands and memory of the women who made them. When she moved to the UK and could not find a soap that matched the integrity of what she grew up with, she made her own.</p>
<p>Today, every Odo bar is still made in small batches in Accra. Every ingredient is sourced direct from named Ghanaian farmers — no middlemen, no synthetic shortcuts. The result is a soap that does not just clean. It honours.</p>
<h2 class="font-display text-2xl text-brand-cream">What we stand for</h2>
<p>Pure ingredients. Honest labels. Fair pay for the women and farmers who make our products possible. Heritage, not trend.</p>`
  );

  return (
    <InfoPage
      contentKey="our-story.hero"
      eyebrow="Our Story"
      title="A gift carried across generations"
      intro="Odo is the Twi word for love. Every bar is built on Ghanaian skincare wisdom passed from grandmother to daughter, generation to generation."
    >
      <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
    </InfoPage>
  );
}

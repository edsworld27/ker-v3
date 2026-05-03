"use client";

import { useContent } from "@/lib/useContent";

export default function InfoPageHeader({
  contentKey,
  eyebrow,
  title,
  intro,
}: {
  contentKey?: string;            // e.g. "faq.hero" — when set, fields read from content store
  eyebrow: string;
  title: string;
  intro?: string;
}) {
  const liveEyebrow = useContent(contentKey ? `${contentKey}.eyebrow` : "_unused", eyebrow);
  const liveTitle   = useContent(contentKey ? `${contentKey}.headline` : "_unused", title);
  const liveIntro   = useContent(contentKey ? `${contentKey}.intro` : "_unused", intro ?? "");

  const finalEyebrow = contentKey ? liveEyebrow : eyebrow;
  const finalTitle   = contentKey ? liveTitle   : title;
  const finalIntro   = contentKey ? liveIntro   : intro;

  return (
    <>
      <div className="flex items-center gap-3 mb-5">
        <div className="adinkra-line w-10" />
        <span className="text-xs tracking-[0.28em] uppercase text-brand-amber">{finalEyebrow}</span>
      </div>
      <h1 className="font-display font-bold text-brand-cream text-3xl sm:text-4xl xl:text-5xl leading-tight mb-5">
        {finalTitle}
      </h1>
      {finalIntro && (
        <p className="text-brand-cream/60 text-base sm:text-lg leading-relaxed mb-10">{finalIntro}</p>
      )}
    </>
  );
}

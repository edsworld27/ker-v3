// Per-page <head> tag rendering. Faithful structural port from
// `02/src/components/SiteHead.tsx` (461 lines), trimmed to the meta-tag
// surface. The analytics / script-tag injection portion has been
// EXTRACTED — those belong to a future SEO/analytics plugin's
// `headInjections[]` manifest contribution. See chapter doc.

import type { EditorPage } from "../../types/editorPage";
import type { Site } from "../../types/site";

export interface SiteHeadProps {
  site: Site;
  page: EditorPage;
  defaultLocale?: string;
  defaultDescription?: string;
}

export function SiteHead({ site, page, defaultLocale, defaultDescription }: SiteHeadProps) {
  const title = page.title || site.name;
  const description = page.description || defaultDescription || "";
  const locale = defaultLocale || "en";
  return (
    <>
      <title>{title}</title>
      {description ? <meta name="description" content={description} /> : null}
      <meta property="og:title" content={title} />
      {description ? <meta property="og:description" content={description} /> : null}
      <meta property="og:type" content="website" />
      <meta property="og:locale" content={locale} />
      <meta name="twitter:card" content="summary_large_image" />
      {page.headInjection ? (
        <script
          data-page-head-injection
          dangerouslySetInnerHTML={{ __html: page.headInjection }}
        />
      ) : null}
    </>
  );
}

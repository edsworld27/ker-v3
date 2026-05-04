// ThemeInjector — emits a <style>:root{--brand-…}</style> at the top of
// the per-tenant layout. Server component (no client JS shipped).

import { brandToStyleString } from "@/lib/chrome/brandKit";
import type { BrandKit } from "@/server/types";

interface Props {
  brand: BrandKit;
  scope: "agency" | "client" | "customer";
}

export function ThemeInjector({ brand, scope }: Props) {
  const css = brandToStyleString(brand);
  // Use `data-brand-scope` so devtools can identify which tenant is paint-active.
  return (
    <style
      data-brand-scope={scope}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: css }}
    />
  );
}

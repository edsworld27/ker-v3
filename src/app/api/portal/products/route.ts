import { NextRequest, NextResponse } from "next/server";
import { ecommerce } from "@/portal";

// GET /api/portal/products?range=odo&format=jar
// Returns the storefront product catalog. Hidden products are excluded
// unless ?includeHidden=1 is passed (callers should authenticate).

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const range  = url.searchParams.get("range");
  const format = url.searchParams.get("format");
  const includeHidden = url.searchParams.get("includeHidden") === "1";

  const all = ecommerce.getProducts({ includeHidden });
  const filtered = all.filter(p => {
    if (range && p.range !== range) return false;
    if (format && !p.formats.includes(format as ecommerce.ProductFormat)) return false;
    return true;
  });

  return NextResponse.json({
    count: filtered.length,
    items: filtered.map(p => ({
      slug: p.slug,
      id: p.id,
      range: p.range,
      name: p.name,
      tagline: p.tagline,
      price: p.price,
      salePrice: p.salePrice,
      onSale: p.onSale,
      image: p.image,
      formats: p.formats,
      sizes: p.sizes,
      fragrances: p.fragrances,
      rating: p.rating,
      reviewCount: p.reviewCount,
    })),
  });
}

import { NextResponse } from "next/server";
import { ecommerce } from "@/portal";

// GET /api/portal/products/:slug
// Returns the full product record (description, ingredients, reviews, etc.).

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const product = ecommerce.getProduct(slug);
  if (!product || product.hidden) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(product);
}

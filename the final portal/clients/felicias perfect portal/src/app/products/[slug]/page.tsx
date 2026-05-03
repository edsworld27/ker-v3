import { PRODUCTS } from "@/lib/products";
import ProductPageContent from "./ProductPageContent";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ProductPageContent slug={slug} />;
}

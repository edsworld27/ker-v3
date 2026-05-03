"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductDetail from "@/components/ProductDetail";
import { getProduct, onProductsChange, type Product } from "@/lib/products";

export default function ProductPageContent({ slug }: { slug: string }) {
  const [product, setProduct] = useState<Product | null | "loading">("loading");

  useEffect(() => {
    setProduct(getProduct(slug) ?? null);
    return onProductsChange(() => setProduct(getProduct(slug) ?? null));
  }, [slug]);

  if (product === "loading") {
    return (
      <>
        <Navbar />
        <main className="w-full min-h-screen bg-brand-black pt-20 sm:pt-24" />
        <Footer />
      </>
    );
  }

  if (product === null) {
    return (
      <>
        <Navbar />
        <main className="w-full min-h-screen bg-brand-black flex items-center justify-center">
          <p className="text-brand-cream/60 text-sm">Product not found.</p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="w-full pt-20 sm:pt-24">
        <ProductDetail product={product} />
      </main>
      <Footer />
    </>
  );
}

"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PRODUCTS } from "@/lib/products";
import { ProductCard } from "@/components/Shop";
import { useCart } from "@/context/CartContext";

export default function ProductsPage() {
  const { addItem } = useCart();
  const [added, setAdded] = useState<string | null>(null);

  function handleAdd(product: (typeof PRODUCTS)[0]) {
    addItem({ id: product.id, name: product.name, price: product.price });
    setAdded(product.id);
    setTimeout(() => setAdded(null), 1500);
  }

  return (
    <>
      <Navbar />
      <main className="w-full min-h-screen bg-brand-black pt-32 pb-24 relative">
        <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-brand-purple/10 to-transparent pointer-events-none" />
        
        <div className="w-full max-w-7xl xl:max-w-screen-xl mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 relative z-10">
          
          <div className="flex flex-col items-center text-center mb-16">
            <h1 className="font-display font-bold text-brand-cream text-4xl sm:text-5xl xl:text-6xl 2xl:text-7xl mb-4">
              All Products
            </h1>
            <p className="text-brand-cream/50 text-base sm:text-lg max-w-md mx-auto">
              Explore the complete Odo collection. Handcrafted in Accra, designed for your daily ritual.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 xl:gap-6 2xl:gap-8">
            {PRODUCTS.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                isAdded={added === product.id} 
                onAdd={() => handleAdd(product)} 
              />
            ))}
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}

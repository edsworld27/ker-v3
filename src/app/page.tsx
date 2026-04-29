import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import SocialStrip from "@/components/SocialStrip";
import FeaturedProducts from "@/components/FeaturedProducts";
import Problem from "@/components/Problem";
import Solution from "@/components/Solution";
import Shop from "@/components/Shop";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="w-full">
        <Hero />
        <SocialStrip />
        <FeaturedProducts />
        <Problem />
        <Solution />
        <Shop />
        <Testimonials />
      </main>
      <Footer />
    </>
  );
}

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import SocialStrip from "@/components/SocialStrip";
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
        <Problem />
        <Solution />
        <Shop />
        <Testimonials />
      </main>
      <Footer />
    </>
  );
}

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import Manifesto from "@/components/Manifesto";
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
        <Problem />
        <Manifesto />
        <Solution />
        <Shop />
        <Testimonials />
      </main>
      <Footer />
    </>
  );
}

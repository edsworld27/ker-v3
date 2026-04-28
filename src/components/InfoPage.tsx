import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function InfoPage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="w-full pt-20 sm:pt-24">
        <section className="w-full bg-brand-black">
          <div className="w-full max-w-4xl mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 py-14 sm:py-20">
            <div className="flex items-center gap-3 mb-5">
              <div className="adinkra-line w-10" />
              <span className="text-xs tracking-[0.28em] uppercase text-brand-amber">{eyebrow}</span>
            </div>
            <h1 className="font-display font-bold text-brand-cream text-3xl sm:text-4xl xl:text-5xl leading-tight mb-5">
              {title}
            </h1>
            {intro && (
              <p className="text-brand-cream/60 text-base sm:text-lg leading-relaxed mb-10">{intro}</p>
            )}
            <div className="prose-invert max-w-none text-brand-cream/70 leading-relaxed space-y-6 text-sm sm:text-base">
              {children}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

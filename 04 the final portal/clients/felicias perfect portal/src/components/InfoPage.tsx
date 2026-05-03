import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import InfoPageHeader from "@/components/InfoPageHeader";

export default function InfoPage({
  eyebrow,
  title,
  intro,
  contentKey,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  contentKey?: string;            // e.g. "faq.hero" — enables admin live edits
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="w-full pt-20 sm:pt-24">
        <section className="w-full bg-brand-black">
          <div className="w-full max-w-4xl mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 py-14 sm:py-20">
            <InfoPageHeader contentKey={contentKey} eyebrow={eyebrow} title={title} intro={intro} />
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

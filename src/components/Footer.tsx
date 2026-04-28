import Link from "next/link";

const SHOP_LINKS = [
  { label: "Odo Hands", href: "/products/odo-hands" },
  { label: "Odo Face", href: "/products/odo-face" },
  { label: "Odo Body", href: "/products/odo-body" },
  { label: "The Ritual Set", href: "/products/odo-ritual-set" },
  { label: "Gift Cards", href: "/products/odo-gift-card" },
];

const COMPANY_LINKS = [
  { label: "Our Story", href: "/our-story" },
  { label: "Ingredients", href: "/ingredients" },
  { label: "Sustainability", href: "/sustainability" },
  { label: "Contact", href: "/contact" },
];

const SUPPORT_LINKS = [
  { label: "Shipping & Returns", href: "/shipping-returns" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact Us", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy" },
];

const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://instagram.com/luvandker" },
  { label: "TikTok", href: "https://tiktok.com/@luvandker" },
  { label: "Pinterest", href: "https://pinterest.com/luvandker" },
];

export default function Footer() {
  return (
    <footer className="w-full bg-brand-black border-t border-white/5">
      <div className="w-full max-w-7xl xl:max-w-screen-xl mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 py-14 sm:py-16 lg:py-20">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12 xl:gap-14 mb-14 sm:mb-16">

          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="font-display text-2xl sm:text-3xl font-bold text-brand-cream mb-1.5 inline-block">
              LUV <span className="text-brand-orange">&amp;</span> KER
            </Link>
            <div className="text-[10px] tracking-[0.28em] text-brand-cream/30 uppercase mb-5">Odo by Felicia</div>
            <p className="text-sm xl:text-base text-brand-cream/40 leading-relaxed max-w-xs">
              Pure. Sacred. Alive. Ghanaian heritage skincare for those who demand honesty from everything they put on their skin.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-xs tracking-[0.25em] uppercase text-brand-cream/40 mb-5">Shop</h4>
            <ul className="space-y-3">
              {SHOP_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-sm xl:text-base text-brand-cream/60 hover:text-brand-cream transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs tracking-[0.25em] uppercase text-brand-cream/40 mb-5">Company</h4>
            <ul className="space-y-3">
              {COMPANY_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-sm xl:text-base text-brand-cream/60 hover:text-brand-cream transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support + Newsletter */}
          <div>
            <h4 className="text-xs tracking-[0.25em] uppercase text-brand-cream/40 mb-5">Support</h4>
            <ul className="space-y-3 mb-8">
              {SUPPORT_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-sm xl:text-base text-brand-cream/60 hover:text-brand-cream transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="text-xs text-brand-cream/40 mb-3">Stay connected</p>
            <form
              action="https://luvandker.us21.list-manage.com/subscribe/post"
              method="POST"
              target="_blank"
              className="flex gap-2"
            >
              <input
                type="email"
                name="EMAIL"
                placeholder="your@email.com"
                required
                className="flex-1 min-w-0 bg-brand-black-card border border-white/10 rounded-lg px-4 py-3 text-xs xl:text-sm text-brand-cream placeholder:text-brand-cream/20 focus:outline-none focus:border-brand-orange/40 transition-colors"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="shrink-0 px-4 py-3 rounded-lg bg-brand-orange hover:bg-brand-orange-light transition-colors text-sm text-white font-semibold"
              >
                →
              </button>
            </form>
          </div>
        </div>

        <div className="adinkra-line mb-6" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs xl:text-sm text-brand-cream/25 text-center">
          <p>© {new Date().getFullYear()} Luv &amp; Ker Ltd. All rights reserved.</p>
          <div className="flex items-center gap-1.5">
            <span>Made with</span><span className="text-brand-orange">♥</span><span>from Ghana to the world</span>
          </div>
          <div className="flex items-center gap-4 sm:gap-5">
            {SOCIAL_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-cream transition-colors"
              >
                {label}
              </a>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}

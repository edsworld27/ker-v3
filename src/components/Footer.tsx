import Link from "next/link";

const COLLECTION_LINKS = [
  { label: "Shop For Her · Odo",     href: "/products?range=odo",       colour: "text-brand-orange" },
  { label: "For Him · Nkrabea",      href: "/products?range=nkrabea",   colour: "text-brand-amber" },
  { label: "Black Soap",             href: "/products/black-soap",      colour: "text-brand-cream/80" },
  { label: "Buying for a Friend",    href: "/products?tab=gift-cards",  colour: "text-brand-purple-light" },
  { label: "Shop All",               href: "/products",                 colour: "text-brand-cream/60" },
];

const COMPANY_LINKS = [
  { label: "Our Story", href: "/our-story" },
  { label: "Ingredients", href: "/ingredients" },
  { label: "Sustainability", href: "/sustainability" },
  { label: "Lab Testing", href: "/lab-tests" },
  { label: "Contact", href: "/contact" },
];

const SUPPORT_LINKS = [
  { label: "Shipping & Returns", href: "/shipping-returns" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact Us", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy" },
];

const SOCIAL_LINKS = [
  {
    label: "Instagram",
    href: "https://instagram.com/luvandker",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "https://tiktok.com/@luvandker",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.71a8.22 8.22 0 0 0 4.76 1.52V6.78a4.84 4.84 0 0 1-1-.09z" />
      </svg>
    ),
  },
  {
    label: "X",
    href: "https://x.com/luvandker",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
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
              {COLLECTION_LINKS.map(({ label, href, colour }) => (
                <li key={label}>
                  <Link href={href} className={`text-sm xl:text-base font-medium hover:opacity-80 transition-opacity ${colour}`}>
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
          <div className="flex items-center gap-3 sm:gap-4">
            {SOCIAL_LINKS.map(({ label, href, icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-brand-cream/40 hover:text-brand-cream hover:border-brand-orange/50 hover:bg-brand-orange/10 transition-all duration-300"
              >
                {icon}
              </a>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}

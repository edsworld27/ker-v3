"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

const ABOUT_LINKS = [
  { label: "About Us",      href: "/about",           desc: "The full story — all in one place" },
  { label: "Our Story",     href: "/our-story",       desc: "How Odo came to be" },
  { label: "Our Philosophy", href: "/our-philosophy", desc: "The Luv & Ker way" },
  { label: "Ingredients",   href: "/ingredients",     desc: "What goes inside" },
  { label: "Sustainability", href: "/sustainability",  desc: "Our commitment to the planet" },
  { label: "Lab Tests",     href: "/lab-tests",       desc: "Third-party verified results" },
  { label: "FAQ",           href: "/faq",             desc: "Your questions answered" },
];

const SHOP_LINKS = [
  { label: "All Products",           href: "/products",                  desc: "Browse the full collection" },
  { label: "Odo · For Her",          href: "/products?range=odo",        desc: "Heritage skincare for women" },
  { label: "Nkrabea · For Him",      href: "/products?range=nkrabea",    desc: "Strength rituals for men" },
  { label: "Felicia's Black Soap",    href: "/products/black-soap",       desc: "World renowned. One formula." },
  { label: "Buying for a Friend",    href: "/products?tab=gift-cards",   desc: "Gift cards for any range" },
  { label: "Accessories",            href: "/products?tab=accessories",  desc: "Ritual tools and add-ons" },
];

const TOP_LINKS = [
  { label: "Reviews",        href: "/reviews" },
  { label: "Blog",           href: "/blog" },
  { label: "Support Us", href: "/support-us" },
];

export default function Navbar() {
  const { count } = useCart();
  const [scrolled,        setScrolled]        = useState(false);
  const [menuOpen,        setMenuOpen]        = useState(false);
  const [aboutOpen,       setAboutOpen]       = useState(false);
  const [shopOpen,        setShopOpen]        = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);
  const [mobileShopOpen,  setMobileShopOpen]  = useState(false);
  const aboutRef = useRef<HTMLDivElement>(null);
  const shopRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (aboutRef.current && !aboutRef.current.contains(e.target as Node)) setAboutOpen(false);
      if (shopRef.current  && !shopRef.current.contains(e.target as Node))  setShopOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-brand-black/95 backdrop-blur-md border-b border-white/5"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl 2xl:max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 h-16 sm:h-18 lg:h-20 2xl:h-24 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/#story" scroll={true} className="flex flex-col leading-none shrink-0">
            <span className="font-display text-lg sm:text-xl 2xl:text-2xl font-bold tracking-wide text-brand-cream">
              LUV <span className="text-brand-orange">&amp;</span> KER
            </span>
            <span className="text-[9px] sm:text-[10px] tracking-[0.25em] text-brand-cream/40 uppercase mt-0.5">
              Odo by Felicia
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-5 lg:gap-7 xl:gap-9 2xl:gap-11">

            {/* Shop dropdown */}
            <div ref={shopRef} className="relative">
              <button
                onClick={() => { setShopOpen(v => !v); setAboutOpen(false); }}
                className="flex items-center gap-1.5 text-sm 2xl:text-base tracking-wide text-brand-cream/60 hover:text-brand-cream transition-colors duration-200"
              >
                Shop
                <Chevron open={shopOpen} />
              </button>
              {shopOpen && (
                <Dropdown>
                  {SHOP_LINKS.map(link => (
                    <DropdownItem
                      key={link.label}
                      href={link.href}
                      label={link.label}
                      desc={link.desc}
                      colour={link.label.includes("Nkrabea") ? "text-brand-amber" : link.label.includes("Odo ·") ? "text-brand-orange" : link.label.includes("Black Soap") ? "text-brand-cream/80" : "text-brand-cream"}
                      onClose={() => setShopOpen(false)}
                    />
                  ))}
                </Dropdown>
              )}
            </div>

            {/* About dropdown */}
            <div ref={aboutRef} className="relative">
              <button
                onClick={() => { setAboutOpen(v => !v); setShopOpen(false); }}
                className="flex items-center gap-1.5 text-sm 2xl:text-base tracking-wide text-brand-cream/60 hover:text-brand-cream transition-colors duration-200"
              >
                About
                <Chevron open={aboutOpen} />
              </button>
              {aboutOpen && (
                <Dropdown>
                  {ABOUT_LINKS.map(link => (
                    <DropdownItem
                      key={link.label}
                      href={link.href}
                      label={link.label}
                      desc={link.desc}
                      colour={link.label === "About Us" ? "text-brand-purple-light" : "text-brand-cream"}
                      onClose={() => setAboutOpen(false)}
                    />
                  ))}
                </Dropdown>
              )}
            </div>

            {/* Flat links */}
            {TOP_LINKS.map(link => (
              <Link
                key={link.label}
                href={link.href}
                className={`text-sm 2xl:text-base tracking-wide transition-colors duration-200 whitespace-nowrap ${
                  link.label === "Support Us"
                    ? "text-brand-amber hover:text-brand-orange"
                    : "text-brand-cream/60 hover:text-brand-cream"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/account"
              aria-label="Account"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm tracking-wide text-brand-cream/70 hover:text-brand-cream transition-colors"
            >
              <AccountIcon />
              <span className="hidden lg:inline">Log in</span>
            </Link>

            <Link
              href="/cart"
              className="relative p-2 text-brand-cream/70 hover:text-brand-cream transition-colors"
              aria-label="Open cart"
            >
              <CartIcon />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-brand-orange text-[10px] font-bold text-white flex items-center justify-center">
                  {count}
                </span>
              )}
            </Link>

            <button
              className="md:hidden p-2 text-brand-cream/70"
              onClick={() => setMenuOpen(v => !v)}
              aria-label="Toggle menu"
            >
              <div className="w-5 space-y-1.5">
                <span className={`block h-px bg-current transition-all duration-200 origin-center ${menuOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
                <span className={`block h-px bg-current transition-opacity duration-200 ${menuOpen ? "opacity-0" : ""}`} />
                <span className={`block h-px bg-current transition-all duration-200 origin-center ${menuOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-brand-black-soft border-t border-white/5 px-4 sm:px-6 py-5 flex flex-col gap-1 max-h-[70vh] overflow-y-auto">

            {/* Shop accordion */}
            <MobileAccordion label="Shop" open={mobileShopOpen} onToggle={() => setMobileShopOpen(v => !v)}>
              {SHOP_LINKS.map(link => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`text-sm tracking-wide py-2.5 ${
                    link.label.includes("Nkrabea") ? "text-brand-amber" : link.label.includes("Odo ·") ? "text-brand-orange" : link.label.includes("Gift Cards") ? "text-brand-purple-light" : link.label.includes("Accessories") || link.label.includes("Clothing") ? "text-brand-amber/90" : "text-brand-cream/60 hover:text-brand-cream"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </MobileAccordion>

            {/* About accordion */}
            <MobileAccordion label="About" open={mobileAboutOpen} onToggle={() => setMobileAboutOpen(v => !v)}>
              {ABOUT_LINKS.map(link => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-brand-cream/60 hover:text-brand-cream text-sm tracking-wide py-2.5"
                >
                  {link.label}
                </Link>
              ))}
            </MobileAccordion>

            {TOP_LINKS.map(link => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`text-sm tracking-wide py-3 px-1 ${
                  link.label === "Support Us" ? "text-brand-amber" : "text-brand-cream/70 hover:text-brand-cream"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <Link
              href="/account"
              onClick={() => setMenuOpen(false)}
              className="text-brand-cream/70 hover:text-brand-cream text-sm tracking-wide py-3 px-1 flex items-center gap-2"
            >
              <AccountIcon /> Log in
            </Link>
          </div>
        )}
      </nav>
    </>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function Dropdown({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-64 bg-brand-black-card border border-white/10 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden z-50">
      <div className="p-2">{children}</div>
    </div>
  );
}

function DropdownItem({ href, label, desc, colour, onClose }: {
  href: string; label: string; desc: string; colour: string; onClose: () => void;
}) {
  return (
    <Link href={href} onClick={onClose} className="flex flex-col px-4 py-3 rounded-xl hover:bg-white/5 transition-colors group">
      <span className={`text-sm font-medium transition-colors ${colour}`}>{label}</span>
      <span className="text-[11px] text-brand-cream/40 mt-0.5">{desc}</span>
    </Link>
  );
}

function MobileAccordion({ label, open, onToggle, children }: {
  label: string; open: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <>
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-brand-cream/70 hover:text-brand-cream text-sm tracking-wide py-3 px-1"
      >
        {label}
        <Chevron open={open} />
      </button>
      {open && (
        <div className="flex flex-col ml-3 border-l border-white/10 pl-4 mb-2">
          {children}
        </div>
      )}
    </>
  );
}

function AccountIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  );
}

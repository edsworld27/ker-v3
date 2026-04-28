"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import CartDrawer from "./CartDrawer";

const NAV_LINKS = [
  { label: "Shop", href: "/#shop" },
  { label: "Story", href: "/our-story" },
  { label: "Why Odo", href: "/the-problem" },
  { label: "Heritage", href: "/#heritage" },
  { label: "FAQ", href: "/faq" },
];

export default function Navbar() {
  const { count, openCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <CartDrawer />
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-brand-black/95 backdrop-blur-md border-b border-white/5"
            : "bg-transparent"
        }`}
      >
        {/* Inner bar — scales height and padding across breakpoints */}
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

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-5 lg:gap-7 xl:gap-9 2xl:gap-11">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm 2xl:text-base tracking-wide text-brand-cream/60 hover:text-brand-cream transition-colors duration-200 whitespace-nowrap"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Account / Login */}
            <Link
              href="/account"
              aria-label="Account"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm tracking-wide text-brand-cream/70 hover:text-brand-cream transition-colors"
            >
              <AccountIcon />
              <span className="hidden lg:inline">Log in</span>
            </Link>

            {/* Cart */}
            <button
              onClick={openCart}
              className="relative p-2 text-brand-cream/70 hover:text-brand-cream transition-colors"
              aria-label="Open cart"
            >
              <CartIcon />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-brand-orange text-[10px] font-bold text-white flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 text-brand-cream/70"
              onClick={() => setMenuOpen((v) => !v)}
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

        {/* Mobile dropdown — scrollable so landscape mode doesn't clip it */}
        {menuOpen && (
          <div className="md:hidden bg-brand-black-soft border-t border-white/5 px-4 sm:px-6 py-5 flex flex-col gap-4 sm:gap-5 max-h-[60vh] overflow-y-auto">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-brand-cream/70 hover:text-brand-cream text-sm tracking-wide py-1"
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/account"
              onClick={() => setMenuOpen(false)}
              className="text-brand-cream/70 hover:text-brand-cream text-sm tracking-wide py-1 flex items-center gap-2"
            >
              <AccountIcon /> Log in
            </Link>
          </div>
        )}
      </nav>
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

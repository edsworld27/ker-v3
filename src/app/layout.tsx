import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import ChatBot from "@/components/ChatBot";
import PurpleSideScroller from "@/components/PurpleSideScroller";
import SiteHead from "@/components/SiteHead";
import PreviewBar from "@/components/PreviewBar";
import ThemeInjector from "@/components/ThemeInjector";
import ABTestRunner from "@/components/ABTestRunner";
import ImpersonationBar from "@/components/ImpersonationBar";
import ForcePasswordChange from "@/components/ForcePasswordChange";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Odo by Felicia | Luv & Ker — Ghanaian Heritage Soap",
  description:
    "Pure, natural, hormone-safe soap crafted from Ghanaian ancestral wisdom. No parabens, no phthalates, no sulphates, no synthetic fragrance. Just the earth in its purest form.",
  keywords: [
    "natural soap",
    "Ghanaian soap",
    "African black soap",
    "hormone safe",
    "fertility friendly",
    "organic skincare",
    "shea butter",
  ],
  openGraph: {
    title: "Odo by Felicia — A Gift from Ghana",
    description:
      "Ancestral Ghanaian skincare. 100% natural, hormone-safe, fertility-friendly.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${dmSans.variable} h-full`}
    >
      <body className="min-h-full bg-brand-black text-brand-cream font-body antialiased">
        <CartProvider>
          <ImpersonationBar />
          <ForcePasswordChange />
          <ThemeInjector />
          <ABTestRunner />
          <PreviewBar />
          <SiteHead />
          {children}
          <ChatBot />
          <PurpleSideScroller />
        </CartProvider>
      </body>
    </html>
  );
}

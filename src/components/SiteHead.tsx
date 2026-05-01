"use client";

// Reads global + per-page SEO/tracking settings from the CMS and injects:
//  - meta tags (title, description, OG, Twitter, canonical, robots)
//  - JSON-LD schema (page-level + global organization/website)
//  - analytics scripts (GA4, GTM, Meta pixel, TikTok pixel, Hotjar, Plausible)
//  - custom <head> HTML and end-of-body HTML
//  - cookie consent banner
//
// Analytics scripts only mount once the user has accepted in the cookie
// banner. Editors can disable analytics globally with the master switch.

import { useEffect, useState } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { getValue, onContentChange } from "@/lib/admin/content";
import { resolveMediaRef, onMediaChange } from "@/lib/admin/media";
import { getConsent, onConsentChange, type ConsentState } from "@/lib/admin/seoConsent";
import { getConsentPreferences, onConsentPrefsChange, acceptAll, declineAll } from "@/lib/consent";
import CookiePreferencesModal from "@/components/CookiePreferencesModal";
import { getActiveSeoOverride } from "@/lib/admin/abtests";

function valOr(key: string, fb = "") { return (getValue(key) ?? fb).trim(); }
function boolVal(key: string, fb = false): boolean {
  const v = getValue(key);
  if (v === undefined) return fb;
  return v === "true" || v === "1";
}

// Map URL pathname → the page schema id used by the SEO field keys.
function pageIdFor(pathname: string): string {
  if (!pathname || pathname === "/") return "home";
  const seg = pathname.replace(/^\//, "").split("/")[0];
  // Known page schema ids (mirrors PAGE_SCHEMAS). Fallback to the slug itself
  // so custom pages and blog posts still get global tags applied.
  return seg || "home";
}

export default function SiteHead() {
  const pathname = usePathname() ?? "/";
  const [, setTick] = useState(0);
  const [consent, setConsentState] = useState<ConsentState>("unknown");

  useEffect(() => {
    const refresh = () => setTick(t => t + 1);
    setConsentState(getConsent());
    const o1 = onContentChange(refresh);
    const o2 = onMediaChange(refresh);
    const o3 = onConsentChange(() => { setConsentState(getConsent()); refresh(); });
    return () => { o1(); o2(); o3(); };
  }, []);

  const pageId = pageIdFor(pathname);

  // A/B SEO override for this path (if a running test targets this page).
  const seoAB = getActiveSeoOverride(pathname);

  // Resolve title & description (A/B override → page CMS → global default).
  const siteName = valOr("global.site.name", "Luv & Ker");
  const titleSuffix = getValue("global.site.titleSuffix") ?? ` | ${siteName}`;
  const pageTitle = seoAB?.title || valOr(`seo.${pageId}.title`);
  const finalTitle = pageTitle ? `${pageTitle}${titleSuffix}` : "";

  const desc = seoAB?.description || valOr(`seo.${pageId}.description`) || valOr("global.site.defaultDescription");
  const keywords = valOr(`seo.${pageId}.keywords`);
  const robots = valOr(`seo.${pageId}.robots`, "index,follow");
  const canonical = valOr(`seo.${pageId}.canonical`);
  const ogTitle = seoAB?.ogTitle || valOr(`seo.${pageId}.ogTitle`) || pageTitle;
  const ogDesc = seoAB?.ogDescription || valOr(`seo.${pageId}.ogDescription`) || desc;
  const ogImageRaw = valOr(`seo.${pageId}.ogImage`) || valOr("global.site.defaultOgImage");
  const ogImage = ogImageRaw ? resolveMediaRef(ogImageRaw) : "";
  const twitterCard = valOr(`seo.${pageId}.twitterCard`, "summary_large_image");
  const locale = valOr("global.site.locale", "en_GB");

  // JSON-LD blocks.
  const pageJsonLd = valOr(`seo.${pageId}.jsonld`);
  const orgJsonLd = valOr("global.schema.organization");
  const siteJsonLd = valOr("global.schema.website");

  // Custom HTML (page-level + global).
  const pageHead = valOr(`seo.${pageId}.headHtml`);
  const pageBodyEnd = valOr(`seo.${pageId}.bodyEndHtml`);
  const globalHead = valOr("global.code.headHtml");
  const globalBodyStart = valOr("global.code.bodyStartHtml");
  const globalBodyEnd = valOr("global.code.bodyEndHtml");

  // Analytics IDs.
  const analyticsOn = boolVal("global.analytics.enabled", false);
  const ga4 = valOr("global.analytics.ga4");
  const gtm = valOr("global.analytics.gtm");
  const metaPixel = valOr("global.analytics.metaPixel");
  const tiktokPixel = valOr("global.analytics.tiktokPixel");
  const hotjar = valOr("global.analytics.hotjar");
  const plausible = valOr("global.analytics.plausible");

  const consentGranted = consent === "accepted";
  const trackingActive = analyticsOn && consentGranted;

  // Update <title> and meta tags client-side so per-page CMS overrides win
  // even though the server-rendered <head> from layout.tsx has its own values.
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (finalTitle) document.title = finalTitle;
    setMeta("description", desc);
    setMeta("keywords", keywords);
    setMeta("robots", robots);
    setLink("canonical", canonical);
    setMetaProp("og:title", ogTitle || finalTitle);
    setMetaProp("og:description", ogDesc);
    setMetaProp("og:image", ogImage);
    setMetaProp("og:locale", locale);
    setMetaProp("og:site_name", siteName);
    setMeta("twitter:card", twitterCard);
    setMeta("twitter:title", ogTitle || finalTitle);
    setMeta("twitter:description", ogDesc);
    if (ogImage) setMeta("twitter:image", ogImage);
  }, [finalTitle, desc, keywords, robots, canonical, ogTitle, ogDesc, ogImage, twitterCard, siteName, locale]);

  return (
    <>
      {/* Global custom <head> HTML — rendered as a portal-less inert div
          whose innerHTML is reflected into <head> via effect. */}
      <HtmlInjector target="head" html={[globalHead, pageHead].filter(Boolean).join("\n")} />
      <HtmlInjector target="body-start" html={globalBodyStart} />
      <HtmlInjector target="body-end" html={[globalBodyEnd, pageBodyEnd].filter(Boolean).join("\n")} />

      {/* JSON-LD */}
      {pageJsonLd && <JsonLd raw={pageJsonLd} />}
      {orgJsonLd && <JsonLd raw={orgJsonLd} />}
      {siteJsonLd && <JsonLd raw={siteJsonLd} />}

      {/* Analytics — only mount when consent given and master switch on. */}
      {trackingActive && ga4 && (
        <>
          <Script id="ga4-src" strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${ga4}`} />
          <Script id="ga4-init" strategy="afterInteractive">{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${ga4}', { anonymize_ip: true });
          `}</Script>
        </>
      )}
      {trackingActive && gtm && (
        <Script id="gtm-init" strategy="afterInteractive">{`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
          var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
          j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${gtm}');
        `}</Script>
      )}
      {trackingActive && metaPixel && (
        <Script id="meta-pixel" strategy="afterInteractive">{`
          !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
          n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
          fbq('init','${metaPixel}'); fbq('track','PageView');
        `}</Script>
      )}
      {trackingActive && tiktokPixel && (
        <Script id="tiktok-pixel" strategy="afterInteractive">{`
          !function (w, d, t) { w.TiktokAnalyticsObject=t; var ttq=w[t]=w[t]||[];
          ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];
          ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
          for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
          ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
          ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};
          var o=document.createElement("script");o.type="text/javascript";o.async=!0;o.src=i+"?sdkid="+e+"&lib="+t;
          var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
          ttq.load('${tiktokPixel}'); ttq.page(); }(window, document, 'ttq');
        `}</Script>
      )}
      {trackingActive && hotjar && (
        <Script id="hotjar" strategy="afterInteractive">{`
          (function(h,o,t,j,a,r){h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
          h._hjSettings={hjid:${Number(hotjar) || 0},hjsv:6};a=o.getElementsByTagName('head')[0];
          r=o.createElement('script');r.async=1;r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
          a.appendChild(r);})(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
        `}</Script>
      )}
      {trackingActive && plausible && (
        <Script id="plausible" strategy="afterInteractive" src="https://plausible.io/js/script.js" data-domain={plausible} />
      )}

      <CookieBanner />
    </>
  );
}

function setMeta(name: string, content: string) {
  if (!content) {
    document.head.querySelector(`meta[name="${name}"]`)?.remove();
    return;
  }
  let m = document.head.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!m) { m = document.createElement("meta"); m.setAttribute("name", name); document.head.appendChild(m); }
  m.content = content;
}
function setMetaProp(prop: string, content: string) {
  if (!content) {
    document.head.querySelector(`meta[property="${prop}"]`)?.remove();
    return;
  }
  let m = document.head.querySelector(`meta[property="${prop}"]`) as HTMLMetaElement | null;
  if (!m) { m = document.createElement("meta"); m.setAttribute("property", prop); document.head.appendChild(m); }
  m.content = content;
}
function setLink(rel: string, href: string) {
  if (!href) {
    document.head.querySelector(`link[rel="${rel}"]`)?.remove();
    return;
  }
  let l = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!l) { l = document.createElement("link"); l.rel = rel; document.head.appendChild(l); }
  l.href = href;
}

function JsonLd({ raw }: { raw: string }) {
  // Validate as JSON; fail silent if invalid so bad input doesn't crash render.
  try { JSON.parse(raw); }
  catch { return null; }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: raw }} />;
}

function HtmlInjector({ target, html }: { target: "head" | "body-start" | "body-end"; html: string }) {
  useEffect(() => {
    if (!html || typeof document === "undefined") return;
    const id = `lk-injected-${target}`;
    const old = document.getElementById(id);
    if (old) old.remove();
    const wrap = document.createElement("div");
    wrap.id = id;
    wrap.style.display = "none";
    wrap.innerHTML = html;
    const host = target === "head" ? document.head : document.body;
    if (target === "body-start") host.insertBefore(wrap, host.firstChild);
    else host.appendChild(wrap);
    // Move <script> tags out so they execute. innerHTML doesn't run inline scripts.
    Array.from(wrap.querySelectorAll("script")).forEach(orig => {
      const s = document.createElement("script");
      Array.from(orig.attributes).forEach(a => s.setAttribute(a.name, a.value));
      s.text = orig.text;
      orig.replaceWith(s);
    });
    return () => { wrap.remove(); };
  }, [target, html]);
  return null;
}

function CookieBanner() {
  const [, setTick] = useState(0);
  const [consent, setConsentLocal] = useState<ConsentState>("unknown");
  const [showPrefs, setShowPrefs] = useState(false);
  useEffect(() => {
    setConsentLocal(getConsent());
    const o = onConsentChange(() => { setConsentLocal(getConsent()); setTick(t => t + 1); });
    const o2 = onContentChange(() => setTick(t => t + 1));
    const o3 = onConsentPrefsChange(() => { setConsentLocal(getConsent()); setTick(t => t + 1); });
    return () => { o(); o2(); o3(); };
  }, []);

  const enabled = boolVal("global.cookies.enabled", true);
  if (!enabled) return null;

  // Check granular prefs too
  const prefs = getConsentPreferences();
  if (consent !== "unknown" || prefs.decided) return showPrefs ? (
    <CookiePreferencesModal onClose={() => setShowPrefs(false)} />
  ) : null;

  const headline = valOr("global.cookies.headline", "Cookies & privacy");
  const message = valOr("global.cookies.message", "We use cookies to improve your experience and for analytics.");
  const policyHref = valOr("global.cookies.policyHref", "/privacy");

  return (
    <>
      <div className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-sm z-[350] rounded-2xl bg-brand-black-soft border border-white/10 shadow-2xl p-5">
        <p className="text-[11px] tracking-[0.22em] uppercase text-brand-amber mb-2">{headline}</p>
        <p className="text-sm text-brand-cream/75 leading-relaxed mb-4">
          {message}{" "}
          <a href={policyHref} className="text-brand-orange hover:underline">Privacy policy</a>.
        </p>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              onClick={acceptAll}
              className="flex-1 px-3 py-2 rounded-lg bg-brand-orange hover:bg-brand-orange-light text-white text-xs font-semibold"
            >
              Accept all
            </button>
            <button
              onClick={declineAll}
              className="flex-1 px-3 py-2 rounded-lg border border-white/15 text-brand-cream/70 hover:text-brand-cream text-xs"
            >
              Decline all
            </button>
          </div>
          <button
            onClick={() => setShowPrefs(true)}
            className="text-xs text-brand-cream/40 hover:text-brand-cream text-center py-1"
          >
            Manage preferences
          </button>
        </div>
      </div>
      {showPrefs && <CookiePreferencesModal onClose={() => setShowPrefs(false)} />}
    </>
  );
}

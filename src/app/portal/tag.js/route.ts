import { NextRequest } from "next/server";

// GET /portal/tag.js
// The portal loader. External sites paste a single line into <head>:
//
//   <script src="https://YOUR-PORTAL/portal/tag.js" data-site="luvandker" defer></script>
//
// On boot the loader:
//   1. Heartbeats back to /api/portal/heartbeat (Phase A)
//   2. Fetches /api/portal/config/<siteId> and injects every enabled
//      tracker module (Phase B — GA4, GTM, Meta Pixel, TikTok Pixel,
//      Hotjar, Clarity, Plausible)
//   3. Honours requireConsent: marketing/analytics modules wait for a
//      consent.grant() call before injecting; functional modules load
//      immediately
//
// The loader exposes window.__portal so the host site can drive consent:
//
//   window.__portal.consent.grant();              // load gated trackers
//   window.__portal.consent.deny();               // remember denial
//   window.__portal.beat("custom-event");         // ad-hoc heartbeat
//
// One <script> in <head> covers tracking + connectivity for every Phase
// B+ feature, so callers paste it once.

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const portalOrigin = new URL(req.url).origin;

  const js = `(function(){
  try {
    var s = document.currentScript;
    var siteId = s && s.getAttribute("data-site");
    if (!siteId) { (window.console||{}).warn && console.warn("[portal] missing data-site"); return; }
    var portal = ${JSON.stringify(portalOrigin)};
    var heartbeatUrl = portal + "/api/portal/heartbeat";
    var configUrl    = portal + "/api/portal/config/" + encodeURIComponent(siteId);

    // ── Heartbeat ────────────────────────────────────────────────────
    function payload(event) {
      return JSON.stringify({
        siteId: siteId,
        event: event,
        url: location.href,
        title: document.title,
        referrer: document.referrer || undefined,
        ts: Date.now()
      });
    }
    function beat(event) {
      try {
        var body = payload(event);
        if (navigator.sendBeacon) {
          navigator.sendBeacon(heartbeatUrl, new Blob([body], { type: "text/plain" }));
        } else {
          fetch(heartbeatUrl, {
            method: "POST",
            headers: { "Content-Type": "text/plain" },
            body: body, keepalive: true, mode: "cors", credentials: "omit"
          }).catch(function(){});
        }
      } catch (e) {}
    }
    beat("connect");
    document.addEventListener("visibilitychange", function() {
      if (document.visibilityState === "hidden") beat("hide");
      else if (document.visibilityState === "visible") beat("show");
    });

    // ── Consent gate ─────────────────────────────────────────────────
    var pending = [];
    var granted = false;
    var denied = false;
    var consent = {
      get granted() { return granted; },
      get denied() { return denied; },
      grant: function() {
        if (granted) return;
        granted = true; denied = false;
        var queue = pending; pending = [];
        queue.forEach(function(fn) { try { fn(); } catch (e) {} });
      },
      deny: function() { denied = true; pending = []; }
    };
    function gate(category, fn) {
      // "functional" runs immediately; "analytics"/"marketing" wait for
      // grant when the site is consent-gated.
      if (category === "functional" || granted || !needsConsent) { fn(); return; }
      pending.push(fn);
    }

    // ── Tracker module loaders ───────────────────────────────────────
    function injectScript(attrs, inline) {
      var el = document.createElement("script");
      Object.keys(attrs || {}).forEach(function(k) { el.setAttribute(k, attrs[k]); });
      if (inline) el.text = inline;
      (document.head || document.body).appendChild(el);
      return el;
    }
    var loaded = {};
    function once(key, fn) { if (loaded[key]) return; loaded[key] = true; fn(); }

    function loadGA4(id) {
      once("ga4:" + id, function() {
        injectScript({ async: "true", src: "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id) });
        injectScript({}, "window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config'," + JSON.stringify(id) + ",{anonymize_ip:true});");
      });
    }
    function loadGTM(id) {
      once("gtm:" + id, function() {
        injectScript({}, "(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer'," + JSON.stringify(id) + ");");
      });
    }
    function loadMetaPixel(id) {
      once("meta:" + id, function() {
        injectScript({}, "!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init'," + JSON.stringify(id) + ");fbq('track','PageView');");
      });
    }
    function loadTikTok(id) {
      once("tt:" + id, function() {
        injectScript({}, "!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=['page','track','identify','instances','debug','on','off','once','ready','alias','group','enableCookie','disableCookie'];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i='https://analytics.tiktok.com/i18n/pixel/events.js';ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};var o=document.createElement('script');o.type='text/javascript';o.async=!0;o.src=i+'?sdkid='+e+'&lib='+t;var a=document.getElementsByTagName('script')[0];a.parentNode.insertBefore(o,a)};ttq.load(" + JSON.stringify(id) + ");ttq.page();}(window,document,'ttq');");
      });
    }
    function loadHotjar(id) {
      var n = Number(id) || 0;
      if (!n) return;
      once("hj:" + n, function() {
        injectScript({}, "(function(h,o,t,j,a,r){h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};h._hjSettings={hjid:" + n + ",hjsv:6};a=o.getElementsByTagName('head')[0];r=o.createElement('script');r.async=1;r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;a.appendChild(r);})(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');");
      });
    }
    function loadClarity(id) {
      once("cl:" + id, function() {
        injectScript({}, "(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src='https://www.clarity.ms/tag/'+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,'clarity','script'," + JSON.stringify(id) + ");");
      });
    }
    function loadPlausible(domain) {
      once("pl:" + domain, function() {
        injectScript({ async: "true", src: "https://plausible.io/js/script.js", "data-domain": domain });
      });
    }

    function applyTracker(t) {
      try {
        switch (t.provider) {
          case "ga4":          return loadGA4(t.value);
          case "gtm":          return loadGTM(t.value);
          case "meta-pixel":   return loadMetaPixel(t.value);
          case "tiktok-pixel": return loadTikTok(t.value);
          case "hotjar":       return loadHotjar(t.value);
          case "clarity":      return loadClarity(t.value);
          case "plausible":    return loadPlausible(t.value);
        }
      } catch (e) {}
    }

    // ── Fetch and apply config ───────────────────────────────────────
    var needsConsent = false;
    fetch(configUrl, { mode: "cors", credentials: "omit", cache: "default" })
      .then(function(r) { return r.ok ? r.json() : null; })
      .then(function(cfg) {
        if (!cfg || !cfg.trackers || !cfg.trackers.length) return;
        needsConsent = !!cfg.requireConsent;
        cfg.trackers.forEach(function(t) {
          var category = t.consentCategory || "marketing";
          gate(category, function() { applyTracker(t); });
        });
      })
      .catch(function(){});

    // ── Public API ───────────────────────────────────────────────────
    window.__portal = window.__portal || {};
    window.__portal.siteId = siteId;
    window.__portal.portal = portal;
    window.__portal.beat = beat;
    window.__portal.consent = consent;
    window.__portal.version = 2;

    if (window.console && console.log) console.log("[portal] tag v2 ready (site=" + siteId + ")");
  } catch (e) { /* tag must never throw onto host site */ }
})();`;

  return new Response(js, {
    status: 200,
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=600",
      "Access-Control-Allow-Origin": "*",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

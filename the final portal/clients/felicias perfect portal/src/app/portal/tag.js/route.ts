import { NextRequest } from "next/server";

// GET /portal/tag.js
// The portal loader. External sites paste a single line into <head>:
//
//   <script src="https://YOUR-PORTAL/portal/tag.js" data-site="luvandker" defer></script>
//
// On boot the loader:
//   1. Heartbeats back to /api/portal/heartbeat with the keys it scanned
//      from `[data-portal-edit]` so the portal auto-discovers what's
//      editable (Phase A + C).
//   2. Fetches /api/portal/config/<siteId> and injects every enabled
//      tracker module (Phase B — GA4, GTM, Meta Pixel, TikTok Pixel,
//      Hotjar, Clarity, Plausible).
//   3. Fetches /api/portal/content/<siteId> and rewrites the matching
//      DOM nodes with admin-configured values (Phase C). A
//      MutationObserver re-applies on subsequent renders so SPA route
//      changes don't lose edits.
//   4. Honours requireConsent: marketing/analytics modules wait for a
//      consent.grant() call before injecting; functional modules load
//      immediately.
//
// The loader exposes window.__portal so the host site can drive things:
//
//   window.__portal.consent.grant();              // load gated trackers
//   window.__portal.consent.deny();               // remember denial
//   window.__portal.beat("custom-event");         // ad-hoc heartbeat
//   window.__portal.applyOverrides();             // force re-apply
//   window.__portal.refresh();                    // re-fetch + re-apply
//   window.__portal.disable();                    // stop beats + observer
//
// Stability knobs (T1 #9):
//   - data-sample="0.25"    → only 25% of post-connect beats are sent
//   - max 1 beat per 2s     → per-page rate cap
//   - failure backoff       → doubles up to 5min on /heartbeat errors
//   - 5s fetch abort        → config + content fetches cancel on timeout
//   - re-apply storm guard  → > 50 applies / 5s disables observer
//
// One <script> in <head> covers tracking + connectivity + content
// overrides — callers paste it once and never touch it again.

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
    var configUrl    = portal + "/api/portal/config/"  + encodeURIComponent(siteId);
    var contentUrl   = portal + "/api/portal/content/" + encodeURIComponent(siteId);

    // ── Sampling + rate limiting ─────────────────────────────────────
    // data-sample defaults to 1.0 (always send). Lower values drop a
    // random fraction of visibility-driven beats AFTER the initial
    // connect — connectivity reporting must always go through.
    var sampleAttr = s && s.getAttribute("data-sample");
    var sampleNum  = sampleAttr == null ? 1 : parseFloat(sampleAttr);
    if (!isFinite(sampleNum) || sampleNum > 1) sampleNum = 1;
    if (sampleNum < 0) sampleNum = 0;
    var sample = sampleNum;
    var lastBeat = 0;
    // Failure backoff: doubles on a non-ok / rejected fetch (cap 5min),
    // resets to 0 on a successful round-trip. The visibilitychange beat
    // path checks Date.now() - lastBeat < failureBackoffMs and skips
    // when still cooling down.
    var failureBackoffMs = 0;
    var FAILURE_BACKOFF_MAX = 5 * 60 * 1000;
    // Set to true when window.__portal.disable() is called — kills all
    // future heartbeats and disconnects the MutationObserver.
    var disabled = false;

    // Preview mode (D-2): when the page URL carries portal_preview=draft and
    // a signed pt token, point the content fetch at the draft endpoint. The
    // token is captured at boot so it survives client-side navigation that
    // strips query params from the address bar.
    var previewMode  = (function() {
      try {
        var p = new URLSearchParams(location.search);
        var mode = p.get("portal_preview");
        var token = p.get("pt");
        if (mode === "draft" && token) return { mode: "draft", token: token };
      } catch (e) {}
      return null;
    })();
    if (previewMode) {
      contentUrl += "?preview=" + encodeURIComponent(previewMode.mode)
                  + "&pt="     + encodeURIComponent(previewMode.token);
    }

    // ── DOM scan ─────────────────────────────────────────────────────
    // Collect every [data-portal-edit] key on the page, with its declared
    // type. Used both for heartbeat-driven auto-discovery and for the
    // override application pass below.
    function scanKeys() {
      var els = document.querySelectorAll("[data-portal-edit]");
      var seen = Object.create(null);
      var out = [];
      for (var i = 0; i < els.length; i++) {
        var key = els[i].getAttribute("data-portal-edit");
        if (!key || seen[key]) continue;
        seen[key] = true;
        var type = els[i].getAttribute("data-portal-type") || "text";
        out.push({ key: key, type: type });
      }
      return out;
    }

    // ── Heartbeat ────────────────────────────────────────────────────
    function payload(event) {
      return JSON.stringify({
        siteId: siteId,
        event: event,
        url: location.href,
        path: location.pathname,
        title: document.title,
        referrer: document.referrer || undefined,
        discoveredKeys: scanKeys(),
        ts: Date.now()
      });
    }
    function beat(event) {
      try {
        if (disabled) return;
        var now = Date.now();
        var isConnect = event === "connect";
        // Per-page rate cap: max 1 beat / 2s. The initial connect
        // bypasses both the cap and the sampling gate.
        if (!isConnect) {
          if (now - lastBeat < 2000) return;
          if (sample < 1 && Math.random() > sample) return;
          if (failureBackoffMs && now - lastBeat < failureBackoffMs) return;
        }
        lastBeat = now;
        var body = payload(event);
        // Backoff state machine. sendBeacon is fire-and-forget (no
        // status), so we only adjust failureBackoffMs on the fetch path.
        if (navigator.sendBeacon) {
          navigator.sendBeacon(heartbeatUrl, new Blob([body], { type: "text/plain" }));
        } else {
          fetch(heartbeatUrl, {
            method: "POST",
            headers: { "Content-Type": "text/plain" },
            body: body, keepalive: true, mode: "cors", credentials: "omit"
          }).then(function(r) {
            if (r && r.ok) failureBackoffMs = 0;
            else bumpBackoff();
          }).catch(function(){ bumpBackoff(); });
        }
      } catch (e) {}
    }
    function bumpBackoff() {
      failureBackoffMs = failureBackoffMs ? Math.min(failureBackoffMs * 2, FAILURE_BACKOFF_MAX) : 2000;
    }
    beat("connect");
    document.addEventListener("visibilitychange", function() {
      if (disabled) return;
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

    // ── Content overrides ────────────────────────────────────────────
    // The override map: { "<key>": { value, type } }. Updated when the
    // content endpoint resolves and replayed by applyOverrides().
    var overrides = Object.create(null);

    function applyTo(el) {
      var key = el.getAttribute("data-portal-edit");
      if (!key) return;
      var rule = overrides[key];
      if (!rule) return;
      // Host-declared type wins — instrumented sites know what they exposed.
      var hostType = el.getAttribute("data-portal-type") || rule.type || "text";
      try {
        switch (hostType) {
          case "html":      el.innerHTML = rule.value; break;
          case "image-src": el.setAttribute("src", rule.value); break;
          case "href":      el.setAttribute("href", rule.value); break;
          default:          el.textContent = rule.value; break;
        }
        el.setAttribute("data-portal-applied", "1");
      } catch (e) {}
    }
    function applyOverrides() {
      var els = document.querySelectorAll("[data-portal-edit]");
      for (var i = 0; i < els.length; i++) applyTo(els[i]);
    }

    // ── Defensive fetch (5s abort timeout) ───────────────────────────
    // The portal host can hang or be unreachable; an abort guarantees
    // the host page never carries a hanging request indefinitely. The
    // AbortController's signal is fed into every fetch we make for
    // config + content, both at boot and on refresh().
    function fetchWithTimeout(url, opts, ms) {
      var init = {};
      if (opts) {
        init.mode = opts.mode;
        init.credentials = opts.credentials;
        init.cache = opts.cache;
      }
      try {
        if (typeof AbortController !== "undefined") {
          var ctrl = new AbortController();
          init.signal = ctrl.signal;
          var t = setTimeout(function() { try { ctrl.abort(); } catch (e) {} }, ms);
          return fetch(url, init).then(function(r) {
            clearTimeout(t);
            return r;
          }, function(err) {
            clearTimeout(t);
            throw err;
          });
        }
      } catch (e) {}
      return fetch(url, init);
    }

    // ── Fetch and apply config + content (in parallel) ───────────────
    var needsConsent = false;
    fetchWithTimeout(configUrl, { mode: "cors", credentials: "omit", cache: "default" }, 5000)
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

    fetchWithTimeout(contentUrl, { mode: "cors", credentials: "omit", cache: "default" }, 5000)
      .then(function(r) { return r.ok ? r.json() : null; })
      .then(function(map) {
        if (!map || typeof map !== "object") return;
        overrides = map;
        applyOverrides();
      })
      .catch(function(){});

    // Re-apply on subsequent DOM additions (SPA route changes, hydration
    // mismatches, etc.). Coalesce bursts so a render storm doesn't loop.
    // Hard cap: > 50 applies in 5s ⇒ host is in a render loop, log once
    // and stop further re-applies (don't crash the host page).
    var reapplyTimer = null;
    var applyCount = 0;
    var applyWindowStart = 0;
    var reapplyDisabled = false;
    var obs = null;
    if (typeof MutationObserver !== "undefined") {
      obs = new MutationObserver(function(records) {
        if (disabled || reapplyDisabled) return;
        var hit = false;
        for (var i = 0; i < records.length; i++) {
          if (records[i].addedNodes && records[i].addedNodes.length) { hit = true; break; }
        }
        if (!hit || reapplyTimer) return;
        reapplyTimer = setTimeout(function() {
          reapplyTimer = null;
          if (disabled || reapplyDisabled) return;
          var now = Date.now();
          if (now - applyWindowStart > 5000) {
            applyWindowStart = now;
            applyCount = 0;
          }
          applyCount++;
          if (applyCount > 50) {
            reapplyDisabled = true;
            try { obs && obs.disconnect(); } catch (e) {}
            if (window.console && console.warn) {
              console.warn("[portal] re-apply storm detected (>50/5s) — disabling further re-applies for this page");
            }
            return;
          }
          applyOverrides();
        }, 50);
      });
      try { obs.observe(document.documentElement, { childList: true, subtree: true }); }
      catch (e) {}
    }

    function refresh() {
      fetchWithTimeout(contentUrl, { mode: "cors", credentials: "omit", cache: "no-store" }, 5000)
        .then(function(r) { return r.ok ? r.json() : null; })
        .then(function(map) {
          if (!map || typeof map !== "object") return;
          overrides = map;
          applyOverrides();
        })
        .catch(function(){});
    }

    // ── Per-page opt-out ─────────────────────────────────────────────
    // Hosts can call window.__portal.disable() on /admin pages or other
    // contexts where the tag should sit silent. Disconnects the
    // observer, clears any pending re-apply timer, and gates beat().
    function disable() {
      if (disabled) return;
      disabled = true;
      reapplyDisabled = true;
      try { obs && obs.disconnect(); } catch (e) {}
      if (reapplyTimer) { try { clearTimeout(reapplyTimer); } catch (e) {} reapplyTimer = null; }
    }

    // ── Public API ───────────────────────────────────────────────────
    window.__portal = window.__portal || {};
    window.__portal.siteId = siteId;
    window.__portal.portal = portal;
    window.__portal.beat = beat;
    window.__portal.consent = consent;
    window.__portal.applyOverrides = applyOverrides;
    window.__portal.refresh = refresh;
    window.__portal.preview = previewMode;
    window.__portal.disable = disable;
    window.__portal.version = 5;

    if (window.console && console.log) {
      console.log("[portal] tag v5 ready (site=" + siteId + (previewMode ? ", preview=" + previewMode.mode : "") + ")");
    }
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

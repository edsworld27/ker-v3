import { NextRequest } from "next/server";

// GET /portal/tag.js
// The portal loader script. External sites paste a single line into <head>:
//
//   <script src="https://YOUR-PORTAL/portal/tag.js" data-site="luvandker" defer></script>
//
// Phase A: connect + heartbeat only. Phases B/C add tracking module loading
// and content-override merging on top of this same loader, so callers never
// need to touch the snippet again.

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const portalOrigin = new URL(req.url).origin;

  // The tag itself: small, defensive, no third-party deps. Beacons via
  // sendBeacon() with a text/plain Blob to avoid a CORS preflight on every
  // page load. Falls back to fetch+keepalive when sendBeacon is missing.
  const js = `(function(){
  try {
    var s = document.currentScript;
    var siteId = s && s.getAttribute("data-site");
    if (!siteId) { (window.console||{}).warn && console.warn("[portal] missing data-site"); return; }
    var portal = ${JSON.stringify(portalOrigin)};
    var endpoint = portal + "/api/portal/heartbeat";

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
          navigator.sendBeacon(endpoint, new Blob([body], { type: "text/plain" }));
        } else {
          fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "text/plain" },
            body: body,
            keepalive: true,
            mode: "cors",
            credentials: "omit"
          }).catch(function(){});
        }
      } catch (e) { /* ignore */ }
    }

    beat("connect");
    document.addEventListener("visibilitychange", function() {
      if (document.visibilityState === "hidden") beat("hide");
      else if (document.visibilityState === "visible") beat("show");
    });

    // Public API for Phase B (tracking aggregator). Sites can call
    // window.__portal.beat("custom-event") once it ships.
    window.__portal = window.__portal || {
      siteId: siteId,
      portal: portal,
      beat: beat,
      version: 1
    };
  } catch (e) { /* tag must never throw onto host site */ }
})();`;

  return new Response(js, {
    status: 200,
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      // Short cache so updates roll out within minutes; the loader is tiny.
      "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=600",
      "Access-Control-Allow-Origin": "*",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

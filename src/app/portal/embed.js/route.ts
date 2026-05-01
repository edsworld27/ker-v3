import { NextRequest } from "next/server";

// GET /portal/embed.js
// JS loader for the portal sign-in widget — chatbot-style. Host sites
// drop ONE line into <head>:
//
//   <script src="https://your-portal.app/portal/embed.js"
//           data-site="luvandker" defer></script>
//
// The script reads its own data-* attributes, creates a floating button
// in the bottom-right (or mounts at a target element when data-mount is
// set), and lazy-loads /embed/login inside an iframe when clicked. All
// auth state lives inside the iframe (portal origin); the host never
// touches tokens.
//
// Modes (data-mode):
//   "floating" (default) — fixed-position bubble button, panel opens on click
//   "inline"             — replaces an element by id in the page
//
// Postmessages from the iframe (resize, auth-changed) drive cosmetic
// updates: panel height, badge "signed in as <name>", etc. None of it
// is required for sign-in to work — it's all polish.

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const portalOrigin = new URL(req.url).origin;

  const js = `(function(){
  try {
    var script = document.currentScript;
    var siteId  = script && script.getAttribute("data-site");
    if (!siteId) { (window.console||{}).warn && console.warn("[portal-embed] missing data-site"); return; }

    var mode    = (script && script.getAttribute("data-mode")) || "floating";
    var mountId = script && script.getAttribute("data-mount");
    var label   = (script && script.getAttribute("data-label")) || "Sign in";
    var portal  = ${JSON.stringify(portalOrigin)};
    var iframeSrc = portal + "/embed/login?site=" + encodeURIComponent(siteId);

    function makeIframe() {
      var f = document.createElement("iframe");
      f.src = iframeSrc;
      f.title = "Portal sign-in";
      f.allow = "clipboard-write";
      f.style.cssText = "border:0;width:100%;height:100%;background:transparent;color-scheme:dark";
      return f;
    }

    if (mode === "inline") {
      var target = mountId ? document.getElementById(mountId) : null;
      if (!target) {
        console.warn("[portal-embed] mode=inline but no element with id=" + mountId);
        return;
      }
      target.innerHTML = "";
      target.style.position = target.style.position || "relative";
      var iframe = makeIframe();
      iframe.style.minHeight = (target.style.minHeight || "480") + "px";
      target.appendChild(iframe);
      return;
    }

    // Floating mode: fixed bubble + slide-out panel.
    var ROOT_ID = "portal-embed-root";
    if (document.getElementById(ROOT_ID)) return; // already mounted

    var root = document.createElement("div");
    root.id = ROOT_ID;
    root.style.cssText = "position:fixed;bottom:20px;right:20px;z-index:2147483646;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif";

    var button = document.createElement("button");
    button.type = "button";
    button.setAttribute("aria-label", "Open portal sign-in");
    button.textContent = label;
    button.style.cssText = "all:initial;cursor:pointer;display:inline-flex;align-items:center;gap:8px;padding:12px 16px;border-radius:9999px;background:#FF6B35;color:#fff;font-weight:600;font-size:14px;box-shadow:0 8px 24px rgba(0,0,0,.25);font-family:inherit";

    var panel = document.createElement("div");
    panel.style.cssText = "display:none;position:absolute;bottom:60px;right:0;width:360px;height:480px;background:#0E0F12;border:1px solid rgba(255,255,255,.1);border-radius:16px;overflow:hidden;box-shadow:0 24px 64px rgba(0,0,0,.5);transform-origin:bottom right";

    var iframe = makeIframe();
    panel.appendChild(iframe);

    var open = false;
    function setOpen(v) {
      open = !!v;
      panel.style.display = open ? "block" : "none";
      button.setAttribute("aria-expanded", open ? "true" : "false");
    }
    button.addEventListener("click", function() { setOpen(!open); });

    // Close on Escape and on outside click for nicer UX.
    document.addEventListener("keydown", function(e) {
      if (e.key === "Escape" && open) setOpen(false);
    });
    document.addEventListener("click", function(e) {
      if (!open) return;
      if (root.contains(e.target)) return;
      setOpen(false);
    });

    // Listen for the iframe's signals (resize, auth-changed) so we can
    // reflect state in the host UI.
    window.addEventListener("message", function(e) {
      if (e.origin !== portal) return;
      if (!e.data || e.data.source !== "portal-embed") return;
      if (e.data.type === "resize" && typeof e.data.height === "number") {
        panel.style.height = Math.max(320, Math.min(720, e.data.height)) + "px";
      }
      if (e.data.type === "auth-changed") {
        if (e.data.authed && e.data.name) {
          button.textContent = "✓ " + e.data.name;
        } else if (!e.data.authed) {
          button.textContent = label;
        }
      }
    });

    root.appendChild(button);
    root.appendChild(panel);
    (document.body || document.documentElement).appendChild(root);

    // Public API for the host to drive the widget if they want a custom
    // trigger ("Open portal" link in their own UI, etc.).
    window.portalEmbed = {
      open:  function() { setOpen(true); },
      close: function() { setOpen(false); },
      toggle: function() { setOpen(!open); },
      siteId: siteId,
      portal: portal
    };
  } catch (e) { /* never throw onto the host */ }
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

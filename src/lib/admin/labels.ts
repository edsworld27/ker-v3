"use client";

// Shipping label printing. Stub-mode by default — generates a fake tracking
// number and a data-URL "label" so Felicia can click "Print" today and the
// flow works end-to-end. Swap the createLabel implementation for the real
// carrier when you wire credentials.
//
// Recommended carrier: EasyPost — single API for Royal Mail, Evri, DPD, UPS,
// USPS. One key, one createShipment call, you get back rate options + the
// PDF/PNG label URL.
//
// TODO Carrier (EasyPost):
//   const easypost = require("@easypost/api")(process.env.EASYPOST_API_KEY);
//   const shipment = await easypost.Shipment.create({
//     to_address:   { name, street1, city, zip, country },
//     from_address: { /* warehouse */ },
//     parcel:       { length, width, height, weight },
//   });
//   const rate = shipment.lowestRate(["RoyalMail"], ["Tracked24"]);
//   const bought = await shipment.buy(rate.id);
//   return { code: bought.tracking_code, labelUrl: bought.postage_label.label_url };

import { attachTracking, getOrder, type Order } from "./orders";

export type Carrier = "Royal Mail" | "Evri" | "DPD" | "UPS";

export interface LabelOptions {
  carrier: Carrier;
  service?: string; // e.g. "Tracked24", "Tracked48"
  weightGrams?: number;
}

export interface LabelResult {
  carrier: Carrier;
  service: string;
  trackingCode: string;
  labelUrl: string;   // PDF/PNG — opens in a new tab for printing
  cost: number;       // £
}

function fakeTrackingCode(carrier: Carrier): string {
  const rand = Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 9);
  switch (carrier) {
    case "Royal Mail": return `${rand}GB`;
    case "Evri":       return `H${rand}`;
    case "DPD":        return `15${rand}`;
    case "UPS":        return `1Z${rand}`;
  }
}

// Build a printable label as a data-URL. Real implementation returns a remote
// PDF — we just generate an inline SVG so the print flow is complete.
function buildStubLabelDataUrl(order: Order, carrier: Carrier, service: string, code: string): string {
  const addr = order.shippingAddress;
  const lines = [
    addr?.name ?? order.customerName,
    addr?.line1 ?? "",
    addr?.line2 ?? "",
    addr ? `${addr.city} ${addr.postcode}` : "",
    addr?.country ?? "",
  ].filter(Boolean);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
    <rect width="600" height="400" fill="#fff" stroke="#000" stroke-width="2"/>
    <text x="20" y="40" font-family="monospace" font-size="14" font-weight="bold">LUV &amp; KER · ${carrier} ${service}</text>
    <line x1="20" y1="55" x2="580" y2="55" stroke="#000"/>
    <text x="20" y="90" font-family="sans-serif" font-size="13" font-weight="bold">SHIP TO</text>
    ${lines.map((l, i) => `<text x="20" y="${115 + i * 20}" font-family="sans-serif" font-size="14">${escape(l)}</text>`).join("")}
    <line x1="20" y1="240" x2="580" y2="240" stroke="#000"/>
    <text x="20" y="270" font-family="sans-serif" font-size="13">Order ${order.id} · ${new Date(order.createdAt).toLocaleDateString()}</text>
    <text x="20" y="320" font-family="monospace" font-size="20" font-weight="bold" letter-spacing="3">${code}</text>
    <text x="20" y="345" font-family="sans-serif" font-size="11" fill="#666">Tracking number — ${carrier}</text>
    <rect x="380" y="280" width="200" height="80" fill="#000"/>
    <text x="480" y="328" text-anchor="middle" font-family="monospace" font-size="22" font-weight="bold" fill="#fff">${code.slice(-6)}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function escape(s: string) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

export async function createLabel(orderId: string, opts: LabelOptions): Promise<LabelResult | { ok: false; error: string }> {
  const order = getOrder(orderId);
  if (!order) return { ok: false, error: "Order not found." };

  // Simulate network so the spinner has something to show.
  await new Promise(r => setTimeout(r, 600));

  const carrier = opts.carrier;
  const service = opts.service ?? (carrier === "Royal Mail" ? "Tracked 24" : "Standard");
  const trackingCode = fakeTrackingCode(carrier);
  const labelUrl = buildStubLabelDataUrl(order, carrier, service, trackingCode);
  const cost = carrier === "Royal Mail" ? 4.5 : carrier === "Evri" ? 3.2 : 6.0;

  attachTracking(orderId, { carrier, code: trackingCode, labelUrl, printedAt: Date.now() });
  return { carrier, service, trackingCode, labelUrl, cost };
}

// Open the label in a new tab and trigger the browser's print dialog. The user
// can then print on their thermal label printer or save to PDF.
export function printLabel(labelUrl: string) {
  if (typeof window === "undefined") return;
  const w = window.open(labelUrl, "_blank", "width=700,height=520");
  if (!w) return;
  w.addEventListener("load", () => { try { w.print(); } catch { /* noop */ } });
}

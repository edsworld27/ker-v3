// Inventory v2 plugin — advanced stock management beyond what the
// E-commerce plugin's basic toggle provides.
//
// Multi-warehouse, batch tracking with expiry, supplier management,
// purchase orders, low-stock auto-reorder. For clients that outgrow
// the basic feature.

import type { AquaPlugin } from "../_types";

const plugin: AquaPlugin = {
  id: "inventory",
  name: "Inventory (advanced)",
  version: "0.1.0",
  status: "alpha",
  category: "commerce",
  tagline: "Multi-warehouse, batches, suppliers, purchase orders.",
  description: "Beyond the basic stock counter built into E-commerce. Multi-warehouse stock distribution, batch tracking with expiry dates, supplier database, purchase orders with receive/return flows, automatic low-stock alerts and reorder triggers.",

  requires: ["ecommerce"],

  navItems: [
    { id: "inventory-warehouses",  label: "Warehouses",     href: "/admin/inventory/warehouses",  order: 0 },
    { id: "inventory-suppliers",   label: "Suppliers",      href: "/admin/inventory/suppliers",   order: 1 },
    { id: "inventory-purchase-orders", label: "Purchase orders", href: "/admin/inventory/purchase-orders", order: 2 },
    { id: "inventory-batches",     label: "Batches",        href: "/admin/inventory/batches",     order: 3, requiresFeature: "batchTracking" },
  ],

  pages: [],
  api: [],

  features: [
    { id: "multiWarehouse", label: "Multi-warehouse",            default: true },
    { id: "suppliers",      label: "Supplier database",          default: true },
    { id: "purchaseOrders", label: "Purchase orders",            default: true },
    { id: "batchTracking",  label: "Batch + expiry tracking",    default: false, plans: ["pro", "enterprise"] },
    { id: "autoReorder",    label: "Auto-reorder low stock",     default: false, plans: ["pro", "enterprise"] },
    { id: "barcodeScanning", label: "Barcode scanning support",  default: false, plans: ["enterprise"] },
    { id: "stockTransfers", label: "Inter-warehouse transfers",  default: false },
  ],

  settings: {
    groups: [
      {
        id: "alerts",
        label: "Alerts",
        fields: [
          { id: "lowStockThreshold", label: "Low-stock threshold", type: "number", default: 5 },
          { id: "alertEmail",        label: "Alert email recipient", type: "email" },
        ],
      },
      {
        id: "expiry",
        label: "Expiry",
        description: "Only used when Batch tracking feature is on.",
        fields: [
          { id: "expiryWarningDays", label: "Warn this many days before expiry", type: "number", default: 30 },
          { id: "blockExpiredSales", label: "Block sales of expired stock", type: "boolean", default: true },
        ],
      },
    ],
  },
};

export default plugin;

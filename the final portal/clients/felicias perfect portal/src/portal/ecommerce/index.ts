// Ecommerce: orders, inventory, products, collections, payments.
// All re-exports from existing modules — see src/portal/README.md.

export * from "@/lib/admin/orders";
export * from "@/lib/admin/inventory";
export * from "@/lib/admin/customers";
export * from "@/lib/admin/customProducts";
export * from "@/lib/admin/productOverrides";
export * from "@/lib/admin/collections";
export * from "@/lib/admin/reviews";
export * from "@/lib/admin/shipping";
export * from "@/lib/admin/stats";

// Storefront-side product catalog
export {
  PRODUCTS, getProduct, getProducts,
  CHANGE_EVENT as PRODUCTS_CHANGE_EVENT,
  onProductsChange,
  type Product, type ProductSize, type ProductFormat, type ProductReview,
} from "@/lib/products";
export * from "@/lib/discounts";
export * from "@/lib/giftCards";
export * from "@/lib/referralCodes";

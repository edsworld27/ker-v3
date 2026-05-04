// Products data hook used by commerce blocks. Round-1 returns an empty
// list — the ecommerce plugin (Round 2) will provide the real data via
// `ctx.services.products` once that port lands.
//
// Commerce blocks (product-card, product-grid, collection-grid, etc.)
// render placeholder skeletons until that plugin is installed.

export interface MinimalProduct {
  id: string;
  slug: string;
  title: string;
  priceCents: number;
  imageUrl?: string;
}

export function useProducts(_collectionId?: string): {
  products: MinimalProduct[];
  loading: boolean;
} {
  return { products: [], loading: false };
}

export const SHOPIFY_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
export const SHOPIFY_STOREFRONT_ACCESS_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

export async function shopifyFetch<T>({
  query,
  variables,
}: {
  query: string;
  variables?: Record<string, unknown>;
}): Promise<{ status: number; body: T } | never> {
  if (!SHOPIFY_DOMAIN || !SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
    throw new Error(
      "Shopify environment variables are missing. Please add NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN and NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN to your .env.local"
    );
  }

  const endpoint = `https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`;

  try {
    const result = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_ACCESS_TOKEN,
      },
      body: JSON.stringify({
        ...(query && { query }),
        ...(variables && { variables }),
      }),
    });

    const body = await result.json();

    if (body.errors) {
      throw body.errors[0];
    }

    return {
      status: result.status,
      body,
    };
  } catch (e) {
    console.error("Shopify fetch error:", e);
    throw {
      error: e,
      query,
    };
  }
}

// Create a Cart
export async function createCart() {
  const query = `
    mutation cartCreate {
      cartCreate {
        cart {
          id
          checkoutUrl
        }
      }
    }
  `;

  const response = await shopifyFetch<{ data: { cartCreate: { cart: { id: string; checkoutUrl: string } } } }>({
    query,
  });

  return response.body.data.cartCreate.cart;
}

export interface ShopifyCartLine {
  id: string;
  quantity: number;
  merchandise: { id: string };
}

export interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  lines?: { edges: { node: ShopifyCartLine }[] };
}

// Add an item to the Cart
export async function addToCart(cartId: string, lines: { merchandiseId: string; quantity: number }[]): Promise<ShopifyCart> {
  const query = `
    mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          id
          checkoutUrl
          lines(first: 100) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const response = await shopifyFetch<{ data: { cartLinesAdd: { cart: ShopifyCart } } }>({
    query,
    variables: {
      cartId,
      lines,
    },
  });

  return response.body.data.cartLinesAdd.cart;
}

// Update item quantity in Cart
export async function updateCart(cartId: string, lines: { id: string; quantity: number }[]): Promise<ShopifyCart> {
  const query = `
    mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart {
          id
          checkoutUrl
        }
      }
    }
  `;

  const response = await shopifyFetch<{ data: { cartLinesUpdate: { cart: ShopifyCart } } }>({
    query,
    variables: {
      cartId,
      lines,
    },
  });

  return response.body.data.cartLinesUpdate.cart;
}

// Remove item from Cart
export async function removeFromCart(cartId: string, lineIds: string[]): Promise<ShopifyCart> {
  const query = `
    mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart {
          id
          checkoutUrl
        }
      }
    }
  `;

  const response = await shopifyFetch<{ data: { cartLinesRemove: { cart: ShopifyCart } } }>({
    query,
    variables: {
      cartId,
      lineIds,
    },
  });

  return response.body.data.cartLinesRemove.cart;
}

// Get Cart details
export async function getCart(cartId: string): Promise<ShopifyCart> {
  const query = `
    query getCart($cartId: ID!) {
      cart(id: $cartId) {
        id
        checkoutUrl
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                }
              }
            }
          }
        }
      }
    }
  `;

  const response = await shopifyFetch<{ data: { cart: ShopifyCart } }>({
    query,
    variables: {
      cartId,
    },
  });

  return response.body.data.cart;
}

// Shopify Customer Account / Storefront API queries.
//
// SCAFFOLD ONLY — none of these functions are imported anywhere yet. They are
// pre-written so that when Shopify env vars are wired up you can import and
// call them from src/lib/auth.ts and src/app/account/page.tsx with no
// guesswork.
//
// Required env vars (already referenced in src/lib/shopify.ts):
//   NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN
//   NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN
//
// Reference:
//   https://shopify.dev/docs/api/storefront/latest/objects/Customer
//   https://shopify.dev/docs/api/storefront/latest/mutations/customerCreate
//   https://shopify.dev/docs/api/storefront/latest/mutations/customerAccessTokenCreate

import { shopifyFetch } from "./shopify";

// ── Types matching Shopify's Storefront API ──────────────────────────────────

export interface ShopifyUserError { field?: string[] | null; message: string; }
export interface ShopifyCustomerAccessToken { accessToken: string; expiresAt: string; }
export interface ShopifyCustomer {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  acceptsMarketing: boolean;
  defaultAddress?: { id: string; formatted: string[]; } | null;
}

export interface ShopifyOrder {
  id: string;
  orderNumber: number;
  processedAt: string;
  fulfillmentStatus: string | null;
  financialStatus: string | null;
  currentTotalPrice: { amount: string; currencyCode: string };
  statusUrl: string;
  lineItems: { edges: { node: {
    title: string;
    quantity: number;
    variant?: { title: string | null; price: { amount: string; currencyCode: string } } | null;
  } }[] };
}

// ── Mutations / queries ──────────────────────────────────────────────────────

export async function customerCreate(input: {
  email: string; password: string; firstName?: string; lastName?: string;
}): Promise<{ customer: ShopifyCustomer | null; userErrors: ShopifyUserError[] }> {
  const query = /* GraphQL */ `
    mutation customerCreate($input: CustomerCreateInput!) {
      customerCreate(input: $input) {
        customer { id email firstName lastName acceptsMarketing }
        customerUserErrors { field message }
      }
    }
  `;
  const r = await shopifyFetch<{ data: { customerCreate: {
    customer: ShopifyCustomer | null;
    customerUserErrors: ShopifyUserError[];
  } } }>({ query, variables: { input } });
  return {
    customer: r.body.data.customerCreate.customer,
    userErrors: r.body.data.customerCreate.customerUserErrors,
  };
}

export async function customerAccessTokenCreate(input: { email: string; password: string }):
  Promise<{ token: ShopifyCustomerAccessToken | null; userErrors: ShopifyUserError[] }> {
  const query = /* GraphQL */ `
    mutation tokenCreate($input: CustomerAccessTokenCreateInput!) {
      customerAccessTokenCreate(input: $input) {
        customerAccessToken { accessToken expiresAt }
        customerUserErrors { field message }
      }
    }
  `;
  const r = await shopifyFetch<{ data: { customerAccessTokenCreate: {
    customerAccessToken: ShopifyCustomerAccessToken | null;
    customerUserErrors: ShopifyUserError[];
  } } }>({ query, variables: { input } });
  return {
    token: r.body.data.customerAccessTokenCreate.customerAccessToken,
    userErrors: r.body.data.customerAccessTokenCreate.customerUserErrors,
  };
}

export async function customerAccessTokenDelete(accessToken: string) {
  const query = /* GraphQL */ `
    mutation tokenDelete($customerAccessToken: String!) {
      customerAccessTokenDelete(customerAccessToken: $customerAccessToken) {
        deletedAccessToken
        userErrors { field message }
      }
    }
  `;
  await shopifyFetch({ query, variables: { customerAccessToken: accessToken } });
}

export async function customerRecover(email: string): Promise<{ userErrors: ShopifyUserError[] }> {
  const query = /* GraphQL */ `
    mutation recover($email: String!) {
      customerRecover(email: $email) {
        customerUserErrors { field message }
      }
    }
  `;
  const r = await shopifyFetch<{ data: { customerRecover: { customerUserErrors: ShopifyUserError[] } } }>({
    query, variables: { email },
  });
  return { userErrors: r.body.data.customerRecover.customerUserErrors };
}

export async function customerResetByUrl(input: { resetUrl: string; password: string }):
  Promise<{ token: ShopifyCustomerAccessToken | null; userErrors: ShopifyUserError[] }> {
  const query = /* GraphQL */ `
    mutation reset($resetUrl: URL!, $password: String!) {
      customerResetByUrl(resetUrl: $resetUrl, password: $password) {
        customerAccessToken { accessToken expiresAt }
        customerUserErrors { field message }
      }
    }
  `;
  const r = await shopifyFetch<{ data: { customerResetByUrl: {
    customerAccessToken: ShopifyCustomerAccessToken | null;
    customerUserErrors: ShopifyUserError[];
  } } }>({ query, variables: input });
  return {
    token: r.body.data.customerResetByUrl.customerAccessToken,
    userErrors: r.body.data.customerResetByUrl.customerUserErrors,
  };
}

export async function customerActivateByUrl(input: { activationUrl: string; password: string }):
  Promise<{ token: ShopifyCustomerAccessToken | null; userErrors: ShopifyUserError[] }> {
  const query = /* GraphQL */ `
    mutation activate($activationUrl: URL!, $password: String!) {
      customerActivateByUrl(activationUrl: $activationUrl, password: $password) {
        customerAccessToken { accessToken expiresAt }
        customerUserErrors { field message }
      }
    }
  `;
  const r = await shopifyFetch<{ data: { customerActivateByUrl: {
    customerAccessToken: ShopifyCustomerAccessToken | null;
    customerUserErrors: ShopifyUserError[];
  } } }>({ query, variables: input });
  return {
    token: r.body.data.customerActivateByUrl.customerAccessToken,
    userErrors: r.body.data.customerActivateByUrl.customerUserErrors,
  };
}

export async function fetchCustomer(accessToken: string): Promise<ShopifyCustomer | null> {
  const query = /* GraphQL */ `
    query me($token: String!) {
      customer(customerAccessToken: $token) {
        id email firstName lastName acceptsMarketing
        defaultAddress { id formatted }
      }
    }
  `;
  const r = await shopifyFetch<{ data: { customer: ShopifyCustomer | null } }>({
    query, variables: { token: accessToken },
  });
  return r.body.data.customer;
}

export async function fetchCustomerOrders(accessToken: string, first = 25): Promise<ShopifyOrder[]> {
  const query = /* GraphQL */ `
    query orders($token: String!, $first: Int!) {
      customer(customerAccessToken: $token) {
        orders(first: $first, sortKey: PROCESSED_AT, reverse: true) {
          edges { node {
            id
            orderNumber
            processedAt
            fulfillmentStatus
            financialStatus
            currentTotalPrice { amount currencyCode }
            statusUrl
            lineItems(first: 10) { edges { node {
              title quantity
              variant { title price { amount currencyCode } }
            } } }
          } }
        }
      }
    }
  `;
  const r = await shopifyFetch<{ data: { customer: { orders: { edges: { node: ShopifyOrder }[] } } | null } }>({
    query, variables: { token: accessToken, first },
  });
  return r.body.data.customer?.orders.edges.map(e => e.node) ?? [];
}

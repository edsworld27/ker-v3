// Server-side barrel + container builder.
//
// `buildEcommerceContainer(deps)` is the integration handshake — the
// foundation calls it per request (or once at boot) with concrete port
// implementations and gets back the bundle of services that pages + API
// handlers consume.

export { OrderService } from "./orders";
export type { ServerOrder, ServerOrderItem, OrderStatus } from "./orders";

export { BillingService, PLANS } from "./billing";
export type { Plan, PlanId, Subscription, SubscriptionStatus } from "./billing";

export { ProductService } from "./productsStore";
export type { ProductListOptions } from "./productsStore";

export { GiftCardService } from "./giftCards";
export type { GiftCard } from "./giftCards";

export { ReferralCodeService } from "./referralCodes";
export type { ReferralCode } from "./referralCodes";

export { DiscountService } from "./discounts";
export type {
  AppliedDiscount,
  CustomDiscountCode,
  DiscountType,
  PromoEntry,
} from "./discounts";

export type {
  ActivityPort,
  EcommerceEventName,
  EventBusPort,
  ListActivityFilter,
  LogActivityInput,
  PluginInstallStorePort,
  StoragePort,
  TenantPort,
} from "./ports";

import type {
  ActivityPort,
  EventBusPort,
  PluginInstallStorePort,
  StoragePort,
  TenantPort,
} from "./ports";
import { OrderService } from "./orders";
import { BillingService } from "./billing";
import { ProductService } from "./productsStore";
import { GiftCardService } from "./giftCards";
import { ReferralCodeService } from "./referralCodes";
import { DiscountService } from "./discounts";

export interface EcommerceDeps {
  storage: StoragePort;
  tenant: TenantPort;
  activity: ActivityPort;
  events: EventBusPort;
  pluginInstalls: PluginInstallStorePort;
}

export interface EcommerceContainer {
  orders: OrderService;
  billing: BillingService;
  products: ProductService;
  giftCards: GiftCardService;
  referrals: ReferralCodeService;
  discounts: DiscountService;
  // Cross-cutting refs surfaced to handlers/pages so they don't reach
  // back into the deps bag separately.
  activity: ActivityPort;
  events: EventBusPort;
  tenant: TenantPort;
  pluginInstalls: PluginInstallStorePort;
}

export function buildEcommerceContainer(deps: EcommerceDeps): EcommerceContainer {
  const orders = new OrderService(deps.storage);
  const billing = new BillingService(deps.storage);
  const products = new ProductService(deps.storage);
  const giftCards = new GiftCardService(deps.storage);
  const referrals = new ReferralCodeService(deps.storage);
  const discounts = new DiscountService(deps.storage, giftCards, referrals);
  return {
    orders,
    billing,
    products,
    giftCards,
    referrals,
    discounts,
    activity: deps.activity,
    events: deps.events,
    tenant: deps.tenant,
    pluginInstalls: deps.pluginInstalls,
  };
}

// Reviews v2 plugin — beyond the basic E-commerce product reviews.
//
// Generic reviews for anything: services, businesses, blog posts,
// app features. With photo attachments, verified-buyer badges,
// reply threads, and aggregation widgets.

import type { AquaPlugin } from "../_types";

const plugin: AquaPlugin = {
  id: "reviews-v2",
  name: "Reviews (universal)",
  version: "0.1.0",
  status: "alpha",
  category: "marketing",
  tagline: "Reviews for anything — products, services, posts, businesses.",
  description: "More flexible than E-commerce's product-only reviews. Attach a review thread to any URL or content id. Photos, verified-buyer badges, threaded replies, aggregate ratings, schema.org JSON-LD for rich snippets in search.",

  navItems: [
    { id: "reviews-v2",       label: "Reviews",     href: "/admin/reviews-v2",       order: 0 },
    { id: "reviews-v2-pending", label: "Pending",   href: "/admin/reviews-v2/pending", order: 1 },
  ],

  pages: [],
  api: [],

  features: [
    { id: "photos",         label: "Photo attachments",                default: true },
    { id: "verifiedBuyer",  label: "Verified-buyer badge",             default: true },
    { id: "replyThreads",   label: "Reply threads",                    default: true },
    { id: "moderation",     label: "Moderation queue",                 default: true },
    { id: "structuredData", label: "Schema.org JSON-LD output",        default: true },
    { id: "averageWidget",  label: "Aggregate-rating widget block",    default: true },
    { id: "anonymous",      label: "Allow anonymous reviews",          default: false },
  ],

  settings: {
    groups: [
      {
        id: "moderation",
        label: "Moderation",
        fields: [
          { id: "preApprove", label: "Pre-approve all reviews", type: "boolean", default: false,
            helpText: "When off, reviews are queued until an admin approves." },
          { id: "minTextLength", label: "Min review text length", type: "number", default: 10 },
        ],
      },
      {
        id: "display",
        label: "Display",
        fields: [
          { id: "showAuthorName", label: "Show reviewer names",  type: "boolean", default: true },
          { id: "sortDefault",    label: "Default sort", type: "select", default: "recent",
            options: [
              { value: "recent",  label: "Most recent" },
              { value: "helpful", label: "Most helpful" },
              { value: "rating",  label: "Highest rated" },
            ] },
        ],
      },
    ],
  },
};

export default plugin;

import type { AquaPlugin } from "../_types";

const plugin: AquaPlugin = {
  id: "blog",
  name: "Blog",
  version: "1.0.0",
  status: "stable",
  category: "content",
  tagline: "Content engine — posts, scheduling, RSS, tags, featured images.",
  description: "Add a blog to the site with admin authoring (rich editor, scheduling, featured images, tags), public storefront posts at /blog, and an RSS feed. Comments are off by default and can be enabled with a moderation queue.",

  requires: ["website"],

  navItems: [
    { id: "blog", label: "Blog", href: "/admin/blog", order: 0 },
    { id: "blog-new", label: "Write post", href: "/admin/blog/new", order: 1 },
  ],

  pages: [],
  api: [],

  features: [
    { id: "scheduling", label: "Schedule posts", default: true },
    { id: "featuredImage", label: "Featured images", default: true },
    { id: "tags", label: "Tags", default: true },
    { id: "rss", label: "RSS feed", default: true },
    { id: "comments", label: "Comments", description: "With moderation queue.", default: false, plans: ["pro", "enterprise"] },
    { id: "newsletter", label: "Newsletter export", description: "Push new posts to the Email plugin's newsletter.", default: false },
  ],

  settings: {
    groups: [
      {
        id: "general",
        label: "Blog settings",
        fields: [
          { id: "blogTitle", label: "Blog title", type: "text", default: "Blog" },
          { id: "blogPath", label: "URL path", type: "text", default: "/blog" },
          { id: "postsPerPage", label: "Posts per page", type: "number", default: 10 },
          { id: "rssDescription", label: "RSS description", type: "textarea" },
        ],
      },
    ],
  },
};

export default plugin;

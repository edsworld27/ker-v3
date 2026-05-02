"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { listPosts, createPost, deletePost, setFeatured, onBlogChange, type BlogPost } from "@/lib/admin/blog";
import PluginRequired from "@/components/admin/PluginRequired";
import { confirm } from "@/components/admin/ConfirmHost";
import AdminTabs from "@/components/admin/AdminTabs";
import { CONTENT_TABS } from "@/lib/admin/tabSets";

export default function AdminBlogIndex() {
  return <PluginRequired plugin="blog"><AdminBlogIndexInner /></PluginRequired>;
}

function AdminBlogIndexInner() {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filter, setFilter] = useState<"all" | "published" | "draft" | "scheduled">("all");

  useEffect(() => {
    const refresh = () => setPosts(listPosts());
    refresh();
    return onBlogChange(refresh);
  }, []);

  const filtered = filter === "all" ? posts : posts.filter(p => p.status === filter);
  const draftCount = posts.filter(p => p.status === "draft").length;
  const publishedCount = posts.filter(p => p.status === "published").length;
  const scheduledCount = posts.filter(p => p.status === "scheduled").length;

  function newPost() {
    const p = createPost({ title: "Untitled draft" });
    router.push(`/admin/blog/${p.id}`);
  }

  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-6 max-w-6xl">
      <AdminTabs tabs={CONTENT_TABS} ariaLabel="Content" />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] tracking-[0.28em] uppercase text-brand-amber mb-2">Blog</p>
          <h1 className="font-display text-3xl sm:text-4xl text-brand-cream">Journal posts</h1>
          <p className="text-brand-cream/45 text-sm mt-1">
            Write, edit, schedule and publish stories. {publishedCount} live · {draftCount} draft{draftCount === 1 ? "" : "s"}.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/blog" target="_blank" className="text-xs px-3 py-2 rounded-lg border border-white/10 text-brand-cream/60 hover:text-brand-cream">View live →</Link>
          <button onClick={newPost} className="text-xs px-4 py-2 rounded-lg bg-brand-orange hover:bg-brand-orange-light text-white font-semibold">+ New post</button>
        </div>
      </div>

      <div className="flex gap-1 text-xs flex-wrap">
        {(["all", "published", "scheduled", "draft"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full ${filter === f ? "bg-brand-orange/20 text-brand-orange border border-brand-orange/30" : "border border-white/10 text-brand-cream/55 hover:text-brand-cream"}`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === "draft" && draftCount > 0 && <span className="ml-1.5 text-brand-amber font-semibold">{draftCount}</span>}
            {f === "scheduled" && scheduledCount > 0 && <span className="ml-1.5 text-brand-purple-light font-semibold">{scheduledCount}</span>}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/8 bg-brand-black-card px-6 py-10 text-center">
          <p className="text-brand-cream/45 text-sm">No posts yet.</p>
          <button onClick={newPost} className="mt-4 text-xs px-4 py-2 rounded-lg bg-brand-orange text-white font-semibold">Write your first post</button>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/8 bg-brand-black-card overflow-hidden divide-y divide-white/5">
          {filtered.map(p => (
            <div key={p.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors">
              <Link href={`/admin/blog/${p.id}`} className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-sm font-medium text-brand-cream truncate">{p.title}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    p.status === "published" ? "bg-green-400/20 text-green-300" :
                    p.status === "scheduled" ? "bg-brand-purple/25 text-brand-purple-light" :
                    "bg-white/10 text-brand-cream/55"
                  }`}>{p.status}</span>
                  {p.featured && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-brand-orange/20 text-brand-orange">featured</span>}
                </div>
                <p className="text-xs text-brand-cream/40">
                  /blog/{p.slug} · {p.category} · {p.readTime} · updated {new Date(p.updatedAt).toLocaleDateString()}
                </p>
              </Link>
              <div className="flex items-center gap-2 shrink-0">
                {!p.featured && p.status === "published" && (
                  <button
                    onClick={() => setFeatured(p.id)}
                    className="text-[11px] text-brand-cream/40 hover:text-brand-orange"
                  >
                    Feature
                  </button>
                )}
                <Link href={`/blog/${p.slug}`} target="_blank" className="text-[11px] text-brand-cream/40 hover:text-brand-cream">View</Link>
                <button
                  onClick={async () => { if (await confirm({ title: `Delete "${p.title}"?`, message: "This post will be removed from the blog.", danger: true, confirmLabel: "Delete" })) deletePost(p.id); }}
                  className="text-[11px] text-brand-cream/40 hover:text-brand-orange"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

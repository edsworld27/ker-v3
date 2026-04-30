"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getPost, updatePost, publishPost, unpublishPost, deletePost, onBlogChange,
  type BlogPost,
} from "@/lib/admin/blog";
import {
  listMedia, addMedia, fileToDataUrl, formatBytes, resolveMediaRef, onMediaChange, type MediaItem,
} from "@/lib/admin/media";
import RichEditor from "@/components/admin/RichEditor";

const MAX_BYTES = 1.5 * 1024 * 1024;
const CATEGORIES = ["Ingredients", "Our Story", "Skin Education", "Sourcing", "Nkrabea", "Sustainability", "Journal"];

export default function BlogEditor() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) ?? "";
  const [post, setPost] = useState<BlogPost | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    const refresh = () => setPost(getPost(id));
    refresh();
    return onBlogChange(refresh);
  }, [id]);

  if (!post) {
    return (
      <div className="p-6 sm:p-8 lg:p-10 max-w-3xl">
        <Link href="/admin/blog" className="text-[11px] text-brand-cream/40 hover:text-brand-cream">← Blog</Link>
        <p className="mt-6 text-brand-cream/60">Post not found.</p>
      </div>
    );
  }

  function patch(p: Partial<BlogPost>) {
    if (!post) return;
    updatePost(post.id, p);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 700);
  }

  function publish() {
    publishPost(post!.id);
    alert("Published. Live on /blog/" + post!.slug);
  }
  function unpublish() {
    unpublishPost(post!.id);
  }
  function schedule(forIso: string) {
    const ts = forIso ? new Date(forIso).getTime() : NaN;
    if (!isFinite(ts) || ts <= Date.now()) {
      alert("Pick a future date and time.");
      return;
    }
    updatePost(post!.id, { status: "scheduled", scheduledFor: ts, publishedAt: undefined });
  }
  function clearSchedule() {
    updatePost(post!.id, { status: "draft", scheduledFor: undefined });
  }
  function remove() {
    if (!confirm(`Delete "${post!.title}"? This can't be undone.`)) return;
    deletePost(post!.id);
    router.push("/admin/blog");
  }

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/admin/blog" className="text-[11px] text-brand-cream/40 hover:text-brand-cream">← Blog</Link>
        <div className="text-[11px] text-brand-cream/40 flex items-center gap-3">
          <span className={`px-2 py-0.5 rounded-full font-bold ${post.status === "published" ? "bg-green-400/20 text-green-300" : "bg-white/10 text-brand-cream/55"}`}>{post.status}</span>
          {savedFlash && <span className="text-brand-amber">saved</span>}
          <span>updated {new Date(post.updatedAt).toLocaleString()}</span>
        </div>
      </div>

      <div className="space-y-3">
        <input
          value={post.title}
          onChange={e => setPost({ ...post, title: e.target.value })}
          onBlur={() => patch({ title: post.title })}
          placeholder="Post title"
          className="w-full bg-transparent border-0 px-0 py-2 text-3xl sm:text-4xl font-display font-bold text-brand-cream placeholder:text-brand-cream/25 focus:outline-none"
        />
        <input
          value={post.slug}
          onChange={e => setPost({ ...post, slug: e.target.value })}
          onBlur={() => patch({ slug: post.slug })}
          placeholder="post-slug"
          className="w-full bg-transparent border-0 px-0 py-1 text-xs text-brand-cream/40 font-mono focus:outline-none"
        />
        <textarea
          value={post.excerpt}
          onChange={e => setPost({ ...post, excerpt: e.target.value })}
          onBlur={() => patch({ excerpt: post.excerpt })}
          rows={2}
          placeholder="Short excerpt for the listing card and social preview…"
          className="w-full bg-brand-black border border-white/10 rounded-lg px-3 py-2.5 text-sm text-brand-cream/80 focus:outline-none focus:border-brand-orange/40 resize-y leading-relaxed"
        />
      </div>

      <CoverImageEditor post={post} onChange={src => patch({ coverImage: src })} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Field label="Category">
          <select
            value={post.category}
            onChange={e => patch({ category: e.target.value })}
            className="w-full bg-brand-black border border-white/10 rounded-lg px-3 py-2 text-sm text-brand-cream"
          >
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Author">
          <input
            value={post.author}
            onChange={e => setPost({ ...post, author: e.target.value })}
            onBlur={() => patch({ author: post.author })}
            className="w-full bg-brand-black border border-white/10 rounded-lg px-3 py-2 text-sm text-brand-cream"
          />
        </Field>
        <Field label="Read time">
          <input
            value={post.readTime}
            onChange={e => setPost({ ...post, readTime: e.target.value })}
            onBlur={() => patch({ readTime: post.readTime })}
            placeholder="5 min read"
            className="w-full bg-brand-black border border-white/10 rounded-lg px-3 py-2 text-sm text-brand-cream"
          />
        </Field>
      </div>

      <div>
        <p className="text-xs text-brand-cream/60 mb-2">Body</p>
        <RichEditor
          value={post.bodyHtml}
          onChange={html => patch({ bodyHtml: html })}
          placeholder="Start writing the post…"
        />
      </div>

      {/* Schedule panel */}
      <details className="rounded-2xl border border-white/8 bg-brand-black-card overflow-hidden group" open={post.status === "scheduled"}>
        <summary className="cursor-pointer px-5 py-3 border-b border-white/5 bg-brand-black-soft/40 text-xs tracking-[0.22em] uppercase text-brand-cream/60 list-none flex items-center justify-between">
          Schedule
          {post.status === "scheduled" && post.scheduledFor && (
            <span className="text-brand-amber normal-case tracking-normal text-[11px]">
              Goes live {new Date(post.scheduledFor).toLocaleString()}
            </span>
          )}
          <span className="text-brand-cream/40 group-open:rotate-90 transition-transform">›</span>
        </summary>
        <div className="p-5 space-y-3">
          <p className="text-xs text-brand-cream/55 leading-relaxed">
            Pick a future date &amp; time to auto-publish. The post will start showing on /blog as soon as the time passes (no server cron needed — the public page filters on read).
          </p>
          <Field label="Publish at">
            <input
              type="datetime-local"
              value={post.scheduledFor ? toLocalInput(post.scheduledFor) : ""}
              onChange={e => schedule(e.target.value)}
              min={toLocalInput(Date.now() + 60_000)}
              className="bg-brand-black border border-white/10 rounded-lg px-3 py-2 text-sm text-brand-cream"
            />
          </Field>
          {post.status === "scheduled" && (
            <button
              onClick={clearSchedule}
              className="text-[11px] text-brand-cream/50 hover:text-brand-orange underline underline-offset-4"
            >
              Clear schedule (revert to draft)
            </button>
          )}
        </div>
      </details>

      {/* SEO panel */}
      <details className="rounded-2xl border border-white/8 bg-brand-black-card overflow-hidden group" open={false}>
        <summary className="cursor-pointer px-5 py-3 border-b border-white/5 bg-brand-black-soft/40 text-xs tracking-[0.22em] uppercase text-brand-cream/60 list-none flex items-center justify-between">
          SEO &amp; sharing
          <span className="text-brand-cream/40 group-open:rotate-90 transition-transform">›</span>
        </summary>
        <div className="p-5 space-y-3">
          <Field label="SEO title (defaults to post title)">
            <input
              value={post.seo.title ?? ""}
              onChange={e => setPost({ ...post, seo: { ...post.seo, title: e.target.value } })}
              onBlur={() => patch({ seo: post.seo })}
              className="w-full bg-brand-black border border-white/10 rounded-lg px-3 py-2 text-sm text-brand-cream"
            />
          </Field>
          <Field label="SEO description (defaults to excerpt)">
            <textarea
              value={post.seo.description ?? ""}
              onChange={e => setPost({ ...post, seo: { ...post.seo, description: e.target.value } })}
              onBlur={() => patch({ seo: post.seo })}
              rows={2}
              className="w-full bg-brand-black border border-white/10 rounded-lg px-3 py-2 text-sm text-brand-cream"
            />
          </Field>
          <Field label="Canonical URL">
            <input
              value={post.seo.canonical ?? ""}
              onChange={e => setPost({ ...post, seo: { ...post.seo, canonical: e.target.value } })}
              onBlur={() => patch({ seo: post.seo })}
              placeholder="Leave empty to use /blog/<slug>"
              className="w-full bg-brand-black border border-white/10 rounded-lg px-3 py-2 text-sm text-brand-cream"
            />
          </Field>
          <Field label="JSON-LD schema (optional)">
            <textarea
              value={post.seo.jsonld ?? ""}
              onChange={e => setPost({ ...post, seo: { ...post.seo, jsonld: e.target.value } })}
              onBlur={() => patch({ seo: post.seo })}
              rows={5}
              spellCheck={false}
              placeholder='{ "@context": "https://schema.org", "@type": "Article", "headline": "..." }'
              className="w-full bg-brand-black border border-white/10 rounded-lg px-3 py-2 text-xs text-brand-cream font-mono"
            />
          </Field>
        </div>
      </details>

      {/* Action footer */}
      <div className="sticky bottom-0 -mx-6 sm:-mx-8 lg:-mx-10 px-6 sm:px-8 lg:px-10 py-4 bg-brand-black-soft/95 backdrop-blur border-t border-white/8 flex flex-wrap items-center justify-between gap-3">
        <button onClick={remove} className="text-xs text-brand-cream/40 hover:text-brand-orange">Delete post</button>
        <div className="flex items-center gap-2">
          {post.status === "scheduled" && post.scheduledFor && (
            <span className="text-[11px] text-brand-amber px-3 py-2">
              ⏱ Scheduled · {new Date(post.scheduledFor).toLocaleString()}
            </span>
          )}
          <Link href={`/blog/${post.slug}`} target="_blank" className="text-xs px-3 py-2 rounded-lg border border-white/10 text-brand-cream/65 hover:text-brand-cream">Preview →</Link>
          {post.status === "published" ? (
            <button onClick={unpublish} className="text-xs px-4 py-2 rounded-lg border border-white/15 text-brand-cream/75 hover:text-brand-cream">Unpublish</button>
          ) : (
            <button onClick={publish} className="text-xs px-5 py-2 rounded-lg bg-brand-orange hover:bg-brand-orange-light text-white font-semibold">Publish now</button>
          )}
        </div>
      </div>
    </div>
  );
}

// Convert epoch ms to a "yyyy-MM-ddThh:mm" string for <input type="datetime-local">.
function toLocalInput(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] tracking-widest uppercase text-brand-cream/45">{label}</label>
      {children}
    </div>
  );
}

function CoverImageEditor({ post, onChange }: { post: BlogPost; onChange: (src: string) => void }) {
  const [picking, setPicking] = useState(false);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  useEffect(() => {
    setMedia(listMedia());
    return onMediaChange(() => setMedia(listMedia()));
  }, []);
  const preview = post.coverImage ? resolveMediaRef(post.coverImage) : "";

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > MAX_BYTES) { alert(`Too large. Max ${formatBytes(MAX_BYTES)}.`); return; }
    setUploading(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      const item = addMedia(file.name, dataUrl, file.size, file.type);
      onChange(`media:${item.id}`);
    } finally { setUploading(false); }
  }

  return (
    <div className="space-y-2">
      <p className="text-[11px] tracking-widest uppercase text-brand-cream/45">Cover image</p>
      <div className="flex gap-3 items-start">
        <div className="w-32 h-20 rounded-lg overflow-hidden bg-brand-black border border-white/10 shrink-0">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] text-brand-cream/30">no cover</div>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <input
            value={post.coverImage}
            onChange={e => onChange(e.target.value)}
            placeholder="/path.png · media:abc · https://…"
            className="w-full bg-brand-black border border-white/10 rounded-lg px-3 py-2 text-xs text-brand-cream font-mono"
          />
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setPicking(p => !p)} className="text-[11px] px-3 py-1.5 rounded-md border border-brand-amber/30 text-brand-amber hover:bg-brand-amber/10">
              {picking ? "Hide library" : "Pick from library"}
            </button>
            <label className={`text-[11px] px-3 py-1.5 rounded-md border cursor-pointer ${uploading ? "border-white/10 text-brand-cream/40" : "border-brand-orange/30 text-brand-orange hover:bg-brand-orange/10"}`}>
              {uploading ? "Uploading…" : "Upload new"}
              <input type="file" accept="image/*" onChange={handleFile} className="hidden" disabled={uploading} />
            </label>
            {post.coverImage && (
              <button onClick={() => onChange("")} className="text-[11px] px-3 py-1.5 rounded-md text-brand-cream/40 hover:text-brand-orange">Remove</button>
            )}
          </div>
        </div>
      </div>
      {picking && (
        <div className="rounded-lg border border-white/8 bg-brand-black p-3 max-h-72 overflow-y-auto">
          {media.length === 0 ? (
            <p className="text-[11px] text-brand-cream/40 text-center py-4">Library empty.</p>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {media.map(item => (
                <button
                  key={item.id}
                  onClick={() => { onChange(`media:${item.id}`); setPicking(false); }}
                  className="relative aspect-square rounded-md overflow-hidden border border-white/10 hover:border-brand-orange/50"
                  title={item.name}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.dataUrl} alt={item.name} className="absolute inset-0 w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

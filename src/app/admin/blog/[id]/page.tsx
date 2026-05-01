"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getPost, updatePost, publishPost, unpublishPost, schedulePost, saveBlogDraft,
  deletePost, onBlogChange, slugify, parseTags, estimatedReadTime, wordCount,
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
  // The slug auto-derives from the title until the user explicitly edits it.
  // Tracked locally so the auto-derive doesn't fight against manual overrides.
  const [slugAuto, setSlugAuto] = useState(true);
  // Comma-separated tag input is buffered locally so commas don't disappear
  // between keystrokes; committed to the post on blur.
  const [tagsInput, setTagsInput] = useState("");
  // Schedule picker draft, only persisted when the user clicks "Schedule".
  const [scheduleDraft, setScheduleDraft] = useState("");

  useEffect(() => {
    let firstLoad = true;
    const refresh = () => {
      const p = getPost(id);
      setPost(p);
      if (p) {
        setTagsInput((p.tags ?? []).join(", "));
        setScheduleDraft(p.scheduledFor ? toLocalInput(p.scheduledFor) : "");
        if (firstLoad) {
          // Treat slug as auto if it still matches the title slugified, or
          // if the title is the placeholder draft text.
          setSlugAuto(p.slug === slugify(p.title) || p.title === "Untitled draft");
          firstLoad = false;
        }
      }
    };
    refresh();
    return onBlogChange(refresh);
  }, [id]);

  const readStats = useMemo(() => {
    if (!post) return { words: 0, minutes: 1, label: "1 min read" };
    const words = wordCount(post.bodyHtml);
    const { minutes, label } = estimatedReadTime(post.bodyHtml);
    return { words, minutes, label };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post?.bodyHtml]);

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

  function commitTitle(title: string) {
    if (!post) return;
    const next: Partial<BlogPost> = { title };
    if (slugAuto) next.slug = slugify(title);
    patch(next);
  }

  function commitTags() {
    if (!post) return;
    const tags = parseTags(tagsInput);
    setTagsInput(tags.join(", "));
    patch({ tags });
  }

  function publish() {
    publishPost(post!.id);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 700);
  }
  function unpublish() {
    unpublishPost(post!.id);
  }
  function draft() {
    saveBlogDraft(post!.id);
  }
  function applySchedule() {
    const ts = scheduleDraft ? new Date(scheduleDraft).getTime() : NaN;
    if (!isFinite(ts) || ts <= Date.now()) {
      alert("Pick a future date and time.");
      return;
    }
    schedulePost(post!.id, ts);
  }
  function clearSchedule() {
    setScheduleDraft("");
    saveBlogDraft(post!.id);
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
          <span className={`px-2 py-0.5 rounded-full font-bold ${
            post.status === "published" ? "bg-green-400/20 text-green-300" :
            post.status === "scheduled" ? "bg-brand-purple/25 text-brand-purple-light" :
            "bg-white/10 text-brand-cream/55"
          }`}>{post.status}</span>
          {savedFlash && <span className="text-brand-amber">saved</span>}
          <span>updated {new Date(post.updatedAt).toLocaleString()}</span>
        </div>
      </div>

      <div className="space-y-3">
        <input
          value={post.title}
          onChange={e => setPost({ ...post, title: e.target.value })}
          onBlur={() => commitTitle(post.title)}
          placeholder="Post title"
          className="w-full bg-transparent border-0 px-0 py-2 text-3xl sm:text-4xl font-display font-bold text-brand-cream placeholder:text-brand-cream/25 focus:outline-none"
        />
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-brand-cream/35 font-mono">/blog/</span>
          <input
            value={post.slug}
            onChange={e => { setSlugAuto(false); setPost({ ...post, slug: e.target.value }); }}
            onBlur={() => patch({ slug: post.slug })}
            placeholder="post-slug"
            className="flex-1 bg-transparent border-0 px-0 py-1 text-xs text-brand-cream/55 font-mono focus:outline-none"
          />
          {!slugAuto && (
            <button
              type="button"
              onClick={() => { setSlugAuto(true); const s = slugify(post.title); setPost({ ...post, slug: s }); patch({ slug: s }); }}
              className="text-[10px] text-brand-cream/35 hover:text-brand-orange underline underline-offset-4"
              title="Re-derive slug from title"
            >
              auto from title
            </button>
          )}
        </div>
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
        <Field label={`Read time (auto: ${readStats.label})`}>
          <input
            value={post.readTime}
            onChange={e => setPost({ ...post, readTime: e.target.value })}
            onBlur={() => patch({ readTime: post.readTime })}
            placeholder={readStats.label}
            className="w-full bg-brand-black border border-white/10 rounded-lg px-3 py-2 text-sm text-brand-cream"
          />
        </Field>
      </div>

      <Field label="Tags (comma separated)">
        <input
          value={tagsInput}
          onChange={e => setTagsInput(e.target.value)}
          onBlur={commitTags}
          placeholder="black soap, ingredients, skincare"
          className="w-full bg-brand-black border border-white/10 rounded-lg px-3 py-2 text-sm text-brand-cream"
        />
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {post.tags.map(t => (
              <span key={t} className="text-[10px] tracking-wide px-2 py-0.5 rounded-full bg-brand-amber/12 text-brand-amber border border-brand-amber/20">
                #{t}
              </span>
            ))}
          </div>
        )}
      </Field>

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-brand-cream/60">Body</p>
          <p className="text-[11px] text-brand-cream/40">
            <span className="text-brand-cream/65 font-medium">{readStats.words.toLocaleString()}</span> words
            <span className="mx-2 text-brand-cream/20">·</span>
            <span className="text-brand-cream/65 font-medium">~{readStats.minutes}</span> min read
          </p>
        </div>
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
            Pick a future date &amp; time and click <em>Schedule</em>. The post becomes visible on /blog as soon as the time passes — no server cron, the public page filters on read.
          </p>
          <div className="flex flex-wrap items-end gap-3">
            <Field label="Publish at">
              <input
                type="datetime-local"
                value={scheduleDraft}
                onChange={e => setScheduleDraft(e.target.value)}
                min={toLocalInput(Date.now() + 60_000)}
                className="bg-brand-black border border-white/10 rounded-lg px-3 py-2 text-sm text-brand-cream"
              />
            </Field>
            <button
              type="button"
              onClick={applySchedule}
              className="text-xs px-4 py-2 rounded-lg bg-brand-purple/30 hover:bg-brand-purple/50 text-brand-purple-light font-semibold border border-brand-purple/40"
            >
              Schedule
            </button>
            {(post.status === "scheduled" || scheduleDraft) && (
              <button
                onClick={clearSchedule}
                className="text-[11px] text-brand-cream/50 hover:text-brand-orange underline underline-offset-4"
              >
                Clear schedule (revert to draft)
              </button>
            )}
          </div>
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
        <div className="flex items-center gap-2 flex-wrap">
          {post.status === "scheduled" && post.scheduledFor && (
            <span className="text-[11px] text-brand-amber px-3 py-2">
              ⏱ Scheduled · {new Date(post.scheduledFor).toLocaleString()}
            </span>
          )}
          <Link href={`/blog/${post.slug}`} target="_blank" className="text-xs px-3 py-2 rounded-lg border border-white/10 text-brand-cream/65 hover:text-brand-cream">Preview →</Link>
          <button onClick={draft} className="text-xs px-4 py-2 rounded-lg border border-white/15 text-brand-cream/75 hover:text-brand-cream">Save draft</button>
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

  // Paste a data: URI directly into the field — useful for quick screenshots
  // without going through the file dialog.
  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getData("text") || "";
    if (text.startsWith("data:image/")) {
      e.preventDefault();
      const item = addMedia("pasted-image", text, text.length, text.slice(5, text.indexOf(";")));
      onChange(`media:${item.id}`);
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-[11px] tracking-widest uppercase text-brand-cream/45">Featured image</p>
      <div className="flex gap-3 items-start">
        <div className="w-32 h-20 rounded-lg overflow-hidden bg-brand-black border border-white/10 shrink-0">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] text-brand-cream/30">no image</div>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <input
            value={post.coverImage}
            onChange={e => onChange(e.target.value)}
            onPaste={handlePaste}
            placeholder="/path.png · media:abc · https://… · paste data: URI"
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

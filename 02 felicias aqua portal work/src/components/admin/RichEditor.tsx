"use client";

// Minimal contentEditable rich editor. Felicia gets bold / italic / heading /
// link / list / quote, plus inline image upload (writes to media library) and
// raw embed insertion (YouTube, Vimeo, Spotify, generic iframe).
//
// Output is HTML — stored on the post and dangerouslySetInnerHTML'd at render
// time. We trust admin authors; visitor-submitted HTML never reaches this.

import { useEffect, useRef, useState } from "react";
import { addMedia, fileToDataUrl, formatBytes } from "@/lib/admin/media";

const MAX_BYTES = 1.5 * 1024 * 1024;

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

function exec(cmd: string, arg?: string) {
  // execCommand is deprecated but it's the simplest working contentEditable
  // toolbar — and for an admin-only editor that's fine.
  document.execCommand(cmd, false, arg);
}

export default function RichEditor({ value, onChange, placeholder, minHeight = 320 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value;
    }
  }, [value]);

  function handleInput() {
    if (!ref.current) return;
    onChange(ref.current.innerHTML);
  }

  function wrapLink() {
    const url = prompt("Link URL");
    if (!url) return;
    exec("createLink", url);
    handleInput();
  }

  function insertEmbed() {
    const url = prompt("Paste a YouTube, Vimeo, Spotify or other embed URL");
    if (!url) return;
    let html = "";
    const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{6,})/);
    const vm = url.match(/vimeo\.com\/(\d+)/);
    const sp = url.match(/open\.spotify\.com\/(track|album|playlist|episode|show)\/([\w]+)/);
    if (yt) {
      html = `<div class="embed-wrap" style="position:relative;padding-bottom:56.25%;height:0;margin:1.5rem 0;"><iframe src="https://www.youtube.com/embed/${yt[1]}" style="position:absolute;inset:0;width:100%;height:100%;border:0;border-radius:12px;" allowfullscreen></iframe></div>`;
    } else if (vm) {
      html = `<div class="embed-wrap" style="position:relative;padding-bottom:56.25%;height:0;margin:1.5rem 0;"><iframe src="https://player.vimeo.com/video/${vm[1]}" style="position:absolute;inset:0;width:100%;height:100%;border:0;border-radius:12px;" allowfullscreen></iframe></div>`;
    } else if (sp) {
      html = `<iframe src="https://open.spotify.com/embed/${sp[1]}/${sp[2]}" style="width:100%;height:152px;border:0;border-radius:12px;margin:1.5rem 0;" allow="encrypted-media"></iframe>`;
    } else if (/^https?:\/\//.test(url)) {
      html = `<iframe src="${url}" style="width:100%;height:480px;border:0;border-radius:12px;margin:1.5rem 0;" allowfullscreen></iframe>`;
    } else {
      alert("Couldn't parse that URL");
      return;
    }
    exec("insertHTML", html);
    handleInput();
  }

  function insertHr() {
    exec("insertHTML", "<hr style='margin:2rem 0;border:0;border-top:1px solid rgba(255,255,255,0.1)' />");
    handleInput();
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > MAX_BYTES) {
      alert(`Image too large (${formatBytes(file.size)}). Max ${formatBytes(MAX_BYTES)}.`);
      return;
    }
    setUploading(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      addMedia(file.name, dataUrl, file.size, file.type);
      exec("insertHTML", `<img src="${dataUrl}" alt="" style="max-width:100%;height:auto;border-radius:12px;margin:1.5rem 0;" />`);
      handleInput();
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1 p-1.5 rounded-lg bg-brand-black border border-white/10">
        <Btn onClick={() => { exec("formatBlock", "h2"); handleInput(); }}>H2</Btn>
        <Btn onClick={() => { exec("formatBlock", "h3"); handleInput(); }}>H3</Btn>
        <Btn onClick={() => { exec("formatBlock", "p"); handleInput(); }}>¶</Btn>
        <Sep />
        <Btn onClick={() => { exec("bold"); handleInput(); }}><b>B</b></Btn>
        <Btn onClick={() => { exec("italic"); handleInput(); }}><i>I</i></Btn>
        <Btn onClick={() => { exec("underline"); handleInput(); }}><u>U</u></Btn>
        <Sep />
        <Btn onClick={() => { exec("insertUnorderedList"); handleInput(); }}>• List</Btn>
        <Btn onClick={() => { exec("insertOrderedList"); handleInput(); }}>1. List</Btn>
        <Btn onClick={() => { exec("formatBlock", "blockquote"); handleInput(); }}>“ Quote</Btn>
        <Sep />
        <Btn onClick={wrapLink}>🔗 Link</Btn>
        <Btn onClick={insertEmbed}>▶ Embed</Btn>
        <Btn onClick={insertHr}>— HR</Btn>
        <Sep />
        <label className={`px-2.5 py-1 text-[11px] rounded-md border cursor-pointer ${uploading ? "border-white/10 text-brand-cream/40" : "border-brand-orange/30 text-brand-orange hover:bg-brand-orange/10"}`}>
          {uploading ? "Uploading…" : "🖼 Image"}
          <input type="file" accept="image/*" onChange={handleFile} className="hidden" disabled={uploading} />
        </label>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onBlur={handleInput}
        data-placeholder={placeholder}
        className="w-full bg-brand-black border border-white/10 rounded-lg px-4 py-3 text-sm text-brand-cream/90 leading-relaxed focus:outline-none focus:border-brand-orange/40 prose-editor"
        style={{ minHeight }}
      />
      <style jsx>{`
        .prose-editor :global(h2) { font-family: var(--font-playfair); font-size: 1.5rem; font-weight: 700; margin: 1.25rem 0 0.5rem; color: #f5e9d4; }
        .prose-editor :global(h3) { font-family: var(--font-playfair); font-size: 1.2rem; font-weight: 600; margin: 1rem 0 0.5rem; color: #f5e9d4; }
        .prose-editor :global(p)  { margin: 0.5rem 0; }
        .prose-editor :global(ul), .prose-editor :global(ol) { padding-left: 1.5rem; margin: 0.5rem 0; }
        .prose-editor :global(blockquote) { border-left: 3px solid var(--color-brand-orange, #ff6b35); padding-left: 1rem; color: rgba(245,233,212,0.7); font-style: italic; margin: 1rem 0; }
        .prose-editor :global(a) { color: #ff6b35; text-decoration: underline; }
        .prose-editor:empty::before { content: attr(data-placeholder); color: rgba(245,233,212,0.3); }
      `}</style>
    </div>
  );
}

function Btn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onMouseDown={e => e.preventDefault()}
      onClick={onClick}
      className="px-2.5 py-1 text-[11px] rounded-md text-brand-cream/70 hover:bg-white/5 hover:text-brand-cream transition-colors"
    >
      {children}
    </button>
  );
}
function Sep() {
  return <span className="w-px self-stretch bg-white/10 mx-0.5" />;
}

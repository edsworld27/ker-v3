"use client";

// Floating bar that appears whenever preview mode is on. Lets the admin
// jump back to the panel or exit preview without going through localStorage.

import { useEffect, useState } from "react";
import Link from "next/link";
import { isPreviewMode, setPreviewMode, onContentChange } from "@/lib/admin/content";

export default function PreviewBar() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const refresh = () => setOn(isPreviewMode());
    refresh();
    return onContentChange(refresh);
  }, []);
  if (!on) return null;
  return (
    <div className="fixed top-0 inset-x-0 z-[60] bg-brand-amber/90 text-brand-black text-[12px] sm:text-sm font-medium flex items-center justify-center gap-3 py-1.5 backdrop-blur-sm">
      <span className="font-bold tracking-wide uppercase text-[10px]">Preview mode</span>
      <span className="hidden sm:inline opacity-80">Drafts visible — public visitors still see published content.</span>
      <Link href="/admin/website" className="underline underline-offset-2 hover:no-underline">Back to admin</Link>
      <button
        onClick={() => setPreviewMode(false)}
        className="px-2 py-0.5 rounded bg-brand-black/15 hover:bg-brand-black/25"
      >
        Exit preview
      </button>
    </div>
  );
}

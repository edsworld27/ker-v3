"use client";

import { useEffect, useState } from "react";
import { getValue, onContentChange } from "@/lib/admin/content";
import { resolveMediaRef, onMediaChange } from "@/lib/admin/media";

// Returns an editable text/value. Initial render uses the fallback (so SSR
// matches the first client paint), then on hydration we swap in any admin
// override. Subscribes to live changes — admin saves reflect in <1 second.
export function useContent(key: string, fallback: string): string {
  const [value, setValue] = useState(fallback);

  useEffect(() => {
    const update = () => setValue(getValue(key) ?? fallback);
    update();
    return onContentChange(update);
  }, [key, fallback]);

  return value;
}

// Same as useContent, but also resolves media library refs ("media:abc123")
// to the actual data URL. Use for image src strings.
export function useContentImage(key: string, fallback: string): string {
  const [value, setValue] = useState(fallback);

  useEffect(() => {
    const update = () => {
      const raw = getValue(key) ?? fallback;
      setValue(resolveMediaRef(raw));
    };
    update();
    const off1 = onContentChange(update);
    const off2 = onMediaChange(update);
    return () => { off1(); off2(); };
  }, [key, fallback]);

  return value;
}

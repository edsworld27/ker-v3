"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface Props {
  embedded?: boolean;
}

export function LoginForm({ embedded = false }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/portal";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Sign-in failed.");
        setBusy(false);
        return;
      }
      // Embedded login: navigate the parent frame instead of the iframe.
      if (embedded && typeof window !== "undefined" && window.parent !== window) {
        window.parent.location.href = next;
      } else {
        router.replace(next);
        router.refresh();
      }
    } catch {
      setError("Network error. Try again.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-black/70">Email</span>
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="rounded-md border border-black/15 bg-white px-3 py-2 outline-none focus:border-[var(--brand-primary)]"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-black/70">Password</span>
        <input
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="rounded-md border border-black/15 bg-white px-3 py-2 outline-none focus:border-[var(--brand-primary)]"
        />
      </label>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="mt-2 rounded-md bg-[var(--brand-primary)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

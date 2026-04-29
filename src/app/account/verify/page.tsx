"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { consumeVerifyToken } from "@/lib/auth";

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyContent />
    </Suspense>
  );
}

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [state, setState] = useState<
    | { kind: "pending" }
    | { kind: "ok"; email: string }
    | { kind: "error"; message: string }
  >({ kind: "pending" });

  useEffect(() => {
    if (!token) { setState({ kind: "error", message: "This link is missing its verification token." }); return; }
    const r = consumeVerifyToken(token);
    if (r.ok) setState({ kind: "ok", email: r.email });
    else      setState({ kind: "error", message: r.error });
  }, [token]);

  return (
    <>
      <Navbar />
      <main className="w-full pt-20 sm:pt-24 bg-brand-black min-h-screen">
        <div className="w-full max-w-md mx-auto px-6 sm:px-8 py-14 sm:py-20">
          <div className="flex items-center gap-3 mb-5">
            <div className="adinkra-line w-10" />
            <span className="text-xs tracking-[0.28em] uppercase text-brand-amber">Email verification</span>
          </div>

          {state.kind === "pending" && (
            <>
              <h1 className="font-display font-bold text-brand-cream text-3xl sm:text-4xl leading-tight mb-3">
                Verifying your email…
              </h1>
              <p className="text-brand-cream/55 text-sm">Hold on a second.</p>
            </>
          )}

          {state.kind === "ok" && (
            <>
              <h1 className="font-display font-bold text-brand-cream text-3xl sm:text-4xl leading-tight mb-3">
                You&apos;re verified ✓
              </h1>
              <p className="text-brand-cream/65 leading-relaxed mb-8">
                Thanks — <span className="text-brand-amber">{state.email}</span> is confirmed.
                You can now access referral payouts and checkout perks.
              </p>
              <Link
                href="/account"
                className="inline-block px-6 py-3 rounded-xl bg-brand-orange hover:bg-brand-orange-light text-white text-sm font-semibold tracking-wide transition-colors"
              >
                Go to your account →
              </Link>
            </>
          )}

          {state.kind === "error" && (
            <>
              <h1 className="font-display font-bold text-brand-cream text-3xl sm:text-4xl leading-tight mb-3">
                We couldn&apos;t verify this link
              </h1>
              <p className="text-brand-cream/65 leading-relaxed mb-6">{state.message}</p>
              <p className="text-brand-cream/40 text-sm mb-8">
                Sign in and we&apos;ll send a fresh verification email from your dashboard.
              </p>
              <Link
                href="/account"
                className="inline-block px-6 py-3 rounded-xl border border-white/15 text-brand-cream hover:bg-white/[0.04] text-sm font-medium transition-colors"
              >
                Back to log in
              </Link>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

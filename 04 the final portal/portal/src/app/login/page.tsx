import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export const metadata = {
  title: "Sign in · Aqua portal",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <Link href="/" className="text-xs uppercase tracking-wide text-black/50 hover:text-black/80">
            ← Aqua portal
          </Link>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-black/90">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-black/60">
            Sign in to your agency or client portal.
          </p>
        </div>
        <Suspense fallback={<div className="h-40" aria-hidden />}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}

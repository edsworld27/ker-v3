// Topbar — tenant title, role badge, sign-out. Server-rendered.

import Link from "next/link";
import type { Role } from "@/server/types";

interface Props {
  title: string;
  subtitle?: string;
  role: Role;
  email: string;
}

const ROLE_LABEL: Record<Role, string> = {
  "agency-owner":   "Agency owner",
  "agency-manager": "Agency manager",
  "agency-staff":   "Agency staff",
  "client-owner":   "Client owner",
  "client-staff":   "Client staff",
  "freelancer":     "Freelancer",
  "end-customer":   "Customer",
};

export function Topbar({ title, subtitle, role, email }: Props) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-black/10 bg-white/40 px-6">
      <div>
        <div className="text-base font-semibold text-black/90">{title}</div>
        {subtitle && <div className="text-xs text-black/50">{subtitle}</div>}
      </div>
      <div className="flex items-center gap-3 text-xs">
        <span className="rounded-full bg-black/5 px-2 py-1 text-black/70">{ROLE_LABEL[role]}</span>
        <span className="text-black/60">{email}</span>
        <form action="/api/auth/logout" method="post">
          <button
            type="submit"
            className="rounded-md border border-black/10 bg-white px-2 py-1 text-black/70 hover:bg-black/5"
          >
            Sign out
          </button>
        </form>
        <Link href="/" className="text-black/40 hover:text-black/70">
          ↗ Marketing
        </Link>
      </div>
    </header>
  );
}

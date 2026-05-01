import { NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { getCurrentUser } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureHydrated();
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  return NextResponse.json({ ok: true, user: { email: user.email, name: user.name, role: user.role } });
}

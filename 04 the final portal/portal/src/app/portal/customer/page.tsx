import { ensureHydrated } from "@/server/storage";
import { requireRole } from "@/lib/server/auth";

export default async function CustomerHome() {
  await ensureHydrated();
  const session = await requireRole("end-customer");
  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight text-black/90">
        Hi {session.email.split("@")[0]}.
      </h1>
      <p className="mt-2 text-sm text-black/60">
        Your account view ships when the memberships / orders plugins port over from
        <code className="mx-1 rounded bg-black/5 px-1">02 felicias aqua portal work/</code>.
      </p>
    </div>
  );
}

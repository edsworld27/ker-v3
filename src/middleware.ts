import { NextResponse, type NextRequest } from "next/server";

// Edge middleware can't access our cloud storage (different runtime). It
// only checks for the cookie's PRESENCE; full validation happens at the
// API layer via verifySession(). Goal: send unsigned visitors to /login
// before they see /admin chrome.

const COOKIE = "lk_session_v1";

export function middleware(req: NextRequest) {
  // Default unset → "dev" so the Dev bypass works out of the box. Flip
  // env to "true" / "strict" in production to lock /admin behind auth.
  const env = process.env.NEXT_PUBLIC_PORTAL_SECURITY;
  const isStrict = env === "strict" || env === "true";
  const legacy = process.env.NEXT_PUBLIC_PORTAL_DEV_BYPASS === "1";
  if (!isStrict || legacy) return NextResponse.next();

  const path = req.nextUrl.pathname;
  if (!path.startsWith("/admin")) return NextResponse.next();

  const token = req.cookies.get(COOKIE)?.value;
  if (token) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", path);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*"],
};

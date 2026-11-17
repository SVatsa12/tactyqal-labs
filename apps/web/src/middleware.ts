import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "tq_admin";

/**
 * Cheap gate for /admin: no session cookie -> login page.
 * The API verifies the token itself on every call; this only avoids rendering
 * admin pages for visitors who are obviously signed out.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = Boolean(req.cookies.get(SESSION_COOKIE)?.value);

  if (pathname === "/admin/logout") return NextResponse.next();

  if (pathname === "/admin/login") {
    return hasSession ? NextResponse.redirect(new URL("/admin", req.url)) : NextResponse.next();
  }

  if (!hasSession) {
    const url = new URL("/admin/login", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  const res = NextResponse.next();
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};

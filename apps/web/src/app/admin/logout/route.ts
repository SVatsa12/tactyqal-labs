import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/admin/session";

/** Clears the session cookie and goes to the login page. GET so redirects can land here. */
export function GET(req: NextRequest) {
  const url = new URL("/admin/login", req.url);
  if (req.nextUrl.searchParams.get("expired")) url.searchParams.set("expired", "1");
  const res = NextResponse.redirect(url);
  res.cookies.delete(SESSION_COOKIE);
  return res;
}

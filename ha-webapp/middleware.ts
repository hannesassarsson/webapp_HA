import { NextResponse, NextRequest } from "next/server";
import { verifySession } from "./src/lib/auth";

const publicPaths = ["/login", "/api/auth/login", "/favicon.ico", "/_next", "/api/ha"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublic = publicPaths.some((path) => pathname.startsWith(path));
  if (isPublic) {
    return NextResponse.next();
  }

  const token = req.cookies.get("ha_app_session")?.value;
  const valid = token ? verifySession(token) : null;
  if (valid) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("redirect", pathname);
  return NextResponse.redirect(loginUrl);
}

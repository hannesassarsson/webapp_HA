import { NextResponse, NextRequest } from "next/server";

const publicPaths = ["/login", "/api/auth/login", "/favicon.ico", "/_next", "/api/ha"];

const base64url = {
  decode(input: string) {
    const b64 = input.replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4 === 0 ? 0 : 4 - (b64.length % 4);
    return Uint8Array.from(atob(b64 + "=".repeat(pad)), (c) => c.charCodeAt(0));
  },
};

async function verifySessionEdge(token: string) {
  try {
    const secret = process.env.AUTH_SECRET;
    if (!secret) return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, payload, sig] = parts;
    const data = `${header}.${payload}`;
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const ok = await crypto.subtle.verify(
      "HMAC",
      key,
      base64url.decode(sig),
      new TextEncoder().encode(data)
    );
    if (!ok) return null;
    const decoded = JSON.parse(new TextDecoder().decode(base64url.decode(payload)));
    if (typeof decoded.exp !== "number" || Date.now() > decoded.exp) return null;
    if (decoded.sub !== "hannes" && decoded.sub !== "elvira") return null;
    return { user: decoded.sub as "hannes" | "elvira" };
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublic = publicPaths.some((path) => pathname.startsWith(path));
  if (isPublic) {
    return NextResponse.next();
  }

  const token = req.cookies.get("ha_app_session")?.value;
  const valid = token ? await verifySessionEdge(token) : null;
  if (valid) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("redirect", pathname);
  return NextResponse.redirect(loginUrl);
}

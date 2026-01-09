"use server";

import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie") ?? "";
    const token = cookieHeader
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("ha_app_session="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json({ ok: false, error: "No session" }, { status: 401 });
    }

    const valid = verifySession(token);
    if (!valid) {
      return NextResponse.json({ ok: false, error: "Invalid session" }, { status: 401 });
    }

    return NextResponse.json({ ok: true, user: valid.user });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}

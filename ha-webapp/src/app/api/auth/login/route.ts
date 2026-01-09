"use server";

import { NextResponse } from "next/server";
import { signSession, validatePin } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const user = body?.user as "hannes" | "elvira";
    const pin = body?.pin as string;

    if (user !== "hannes" && user !== "elvira") {
      return NextResponse.json({ ok: false, error: "Ogiltig användare" }, { status: 400 });
    }
    if (typeof pin !== "string" || pin.length < 4) {
      return NextResponse.json({ ok: false, error: "Ogiltig PIN" }, { status: 400 });
    }

    const isValid = validatePin(user, pin);
    if (!isValid) {
      return NextResponse.json({ ok: false, error: "Fel PIN" }, { status: 401 });
    }

    const token = signSession(user);
    const res = NextResponse.json({ ok: true, user });
    res.cookies.set("ha_app_session", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });
    return res;
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Okänt fel" }, { status: 500 });
  }
}

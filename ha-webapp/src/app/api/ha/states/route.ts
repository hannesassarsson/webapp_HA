// src/app/api/ha/states/route.ts
import { NextResponse } from "next/server";
import { getStates } from "@/lib/ha";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const prefix = searchParams.get("prefix"); // ex: light., switch., sensor.
    const ids = searchParams.getAll("id"); // ?id=light.hall&id=switch.golvlampa

    const states = await getStates();

    let filtered = states;

    if (ids.length > 0) {
      const set = new Set(ids);
      filtered = filtered.filter((s) => set.has(s.entity_id));
    }

    if (prefix) {
      filtered = filtered.filter((s) => s.entity_id.startsWith(prefix));
    }

    return NextResponse.json({ ok: true, states: filtered });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}

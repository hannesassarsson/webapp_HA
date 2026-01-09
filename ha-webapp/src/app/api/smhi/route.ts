"use server";

import { NextResponse } from "next/server";

const SMHI_BASE =
  "https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point";

function getCoords() {
  const lat = process.env.SMHI_LAT;
  const lon = process.env.SMHI_LON;
  if (!lat || !lon) throw new Error("SMHI_LAT och SMHI_LON saknas i .env.local");
  return { lat, lon };
}

export async function GET() {
  try {
    const { lat, lon } = getCoords();
    const url = `${SMHI_BASE}/lon/${lon}/lat/${lat}/data.json`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`SMHI ${res.status}: ${text}`);
    }
    const json = await res.json();
    const ts = json?.timeSeries?.[0];
    if (!ts) throw new Error("Ingen timeSeries från SMHI");
    const params = ts.parameters ?? [];
    const get = (name: string) => params.find((p: any) => p.name === name)?.values?.[0];
    const temp = get("t");
    const wind = get("ws");
    const precip = get("pmedian");
    const cloud = get("tcc_mean");
    return NextResponse.json({
      ok: true,
      data: {
        temp,
        wind,
        precip,
        cloud,
        validTime: ts.validTime,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "SMHI-fel" }, { status: 500 });
  }
}

// src/app/api/ha/service/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { callService } from "@/lib/ha";

const BodySchema = z.object({
  domain: z.string().min(1),
  service: z.string().min(1),
  entity_id: z.string().optional(),
  entity_ids: z.array(z.string()).optional(),
  data: z.record(z.string(), z.any()).optional(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const body = BodySchema.parse(json);

    const payload: any = {
      ...(body.data ?? {}),
    };

    if (body.entity_id) payload.entity_id = body.entity_id;
    if (body.entity_ids) payload.entity_id = body.entity_ids; // HA accepterar array under nyckeln entity_id

    const result = await callService(body.domain, body.service, payload);
    return NextResponse.json({ ok: true, result });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}

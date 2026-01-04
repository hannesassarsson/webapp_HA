"use client";

import Link from "next/link";

export default function ScenerPage() {
  return (
    <div className="relative min-h-screen text-white pb-20 overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.12),transparent_35%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_10%,rgba(130,188,255,0.12),transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_85%,rgba(255,200,160,0.12),transparent_40%)]" />
      </div>

      <div className="mx-auto max-w-5xl px-4 pt-10 space-y-8 relative">
        <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.08] backdrop-blur-3xl p-8 shadow-[0_26px_70px_rgba(0,0,0,0.48)] space-y-3">
          <div className="text-sm text-white/70 uppercase tracking-[0.18em]">
            Hem · Scener
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Scener
          </h1>
          <p className="text-white/70 max-w-2xl">
            Här kan du lägga till dina scener och rutiner. Lägg till knappar som
            startar script, justerar lampor eller kör kombinationer.
          </p>
          <Link
            href="/lampor"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur hover:border-white/30 transition-all"
          >
            Till lampor
          </Link>
        </div>

        <div className="text-white/70">
          Scenvyn är ännu tom. Lägg till kort när du vet vilka scener du vill visa.
        </div>
      </div>
    </div>
  );
}

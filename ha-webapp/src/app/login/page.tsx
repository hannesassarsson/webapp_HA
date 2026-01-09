"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const users = [
  { id: "hannes", label: "Hannes" },
  { id: "elvira", label: "Elvira" },
] as const;

export default function LoginPage() {
  const router = useRouter();
  const [user, setUser] = useState<"hannes" | "elvira">("hannes");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, pin }),
      });
      const json = await res.json();
      if (!json.ok) {
        setError(json.error ?? "Fel inloggning");
        return;
      }
      const redirect = new URLSearchParams(window.location.search).get("redirect") ?? "/";
      router.push(redirect);
      router.refresh();
    } catch (err: any) {
      setError(err?.message ?? "Kunde inte logga in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="relative w-full max-w-sm overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.08] backdrop-blur-2xl shadow-[0_28px_70px_rgba(0,0,0,0.55)] p-6 space-y-6">
        <div className="space-y-2">
          <div className="text-sm uppercase tracking-[0.18em] text-white/60">
            Inloggning
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Välkommen
          </h1>
          <p className="text-white/70 text-sm">
            Välj användare och ange PIN-kod.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="flex gap-3">
            {users.map((u) => (
              <button
                type="button"
                key={u.id}
                onClick={() => setUser(u.id)}
                className={`flex-1 rounded-2xl border px-4 py-3 text-sm font-semibold backdrop-blur transition-all ${
                  user === u.id
                    ? "bg-white text-neutral-900 border-white/40 shadow-[0_12px_28px_rgba(255,255,255,0.35)]"
                    : "bg-white/10 border-white/15 text-white hover:border-white/30"
                }`}
              >
                {u.label}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/70">PIN</label>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full rounded-2xl bg-white/10 border border-white/15 px-4 py-3 text-white outline-none focus:border-white/40"
              placeholder="••••"
            />
          </div>

          {error && (
            <div className="rounded-2xl border border-amber-300/40 bg-amber-100/10 px-4 py-3 text-sm text-amber-50">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-white text-neutral-900 font-semibold py-3 border border-white/40 shadow-[0_18px_45px_rgba(255,255,255,0.35)] disabled:opacity-60"
          >
            {loading ? "Loggar in..." : "Logga in"}
          </button>
        </form>
      </div>
    </div>
  );
}

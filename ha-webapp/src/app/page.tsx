"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Moon, Sparkles, Lightbulb, Power, SunMedium, CalendarDays } from "lucide-react";
import { staggerContainer, fadeInUp } from "@/components/animations";

type HAState = {
  entity_id: string;
  state: string;
  attributes: Record<string, any>;
};

const trackedIds = [
  "calendar.hannes_elvira",
  "input_boolean.borta_lage",
  "sensor.hannes_iphone_steps",
  "sensor.elviras_iphone_2_steps",
  "device_tracker.hannes_iphone",
  "device_tracker.elviras_iphone_2",
];

const lampEntityIds = [
  // Vardagsrum
  "light.vardagsrumlampa",
  "switch.golvlampa",
  "switch.golvlampa_2",
  "switch.julgran",
  // Sovrum
  "switch.elviras_sida",
  "switch.hannes_sida_sovrum",
  "switch.lampa_sovrum",
  // Kök
  "light.0x348d13fffe819c79",
  "switch.lampa_fonster_kok",
  // Hall
  "light.hall",
  // Badrum
  "light.0xbc8d7efffec2aba3",
  "switch.shelly1minig3_5432045a6cd4_switch_0",
  // Kontor
  "switch.lampa_fonster_kontor",
];

const actionCards = [
  {
    label: "Godnatt",
    icon: Moon,
    domain: "script",
    service: "turn_on",
    entity_id: "script.godnatt_slack_allt",
    gradient: "linear-gradient(135deg, rgba(255,255,255,0.16), rgba(255,255,255,0.08))",
  },
  {
    label: "Mysbelysning",
    icon: Sparkles,
    domain: "script",
    service: "turn_on",
    entity_id: "script.godmorgon_tand_mysbelysning",
    gradient: "linear-gradient(135deg, rgba(255,214,164,0.35), rgba(255,255,255,0.08))",
  },
  {
    label: "Släck allt",
    icon: Power,
    domain: "homeassistant",
    service: "turn_off",
    entity_ids: ["light.all", "switch.all"],
    gradient: "linear-gradient(135deg, rgba(255,188,188,0.32), rgba(255,255,255,0.06))",
  },
  {
    label: "Tänd allt",
    icon: Lightbulb,
    domain: "homeassistant",
    service: "turn_on",
    entity_ids: ["light.all", "switch.all"],
    gradient: "linear-gradient(135deg, rgba(255,238,168,0.38), rgba(255,255,255,0.08))",
  },
];

function formatCalendar(state?: HAState, dayOffset = 0) {
  if (!state) return "Ingen kalender kopplad";
  const startRaw = state.attributes?.start_time as string | undefined;
  const message = state.attributes?.message as string | undefined;
  if (!startRaw || !message) return "Inget planerat";
  const start = new Date(startRaw);
  if (Number.isNaN(start.getTime())) return message;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(today);
  target.setDate(today.getDate() + dayOffset);

  if (start.toDateString() !== target.toDateString()) {
    return "Inget planerat";
  }

  const isAllDay = Boolean(state.attributes?.all_day);
  const timeLabel = isAllDay ? "Heldag" : start.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" });
  return `${message} • ${timeLabel}`;
}

export default function Page() {
  const [keyStates, setKeyStates] = useState<Record<string, HAState | undefined>>({});
  const [lightsOn, setLightsOn] = useState<number | null>(null);
  const [totalLights, setTotalLights] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [smhi, setSmhi] = useState<{ temp?: number; wind?: number; precip?: number; cloud?: number } | null>(null);

  useEffect(() => {
    const loadKeyStates = async () => {
      try {
        const qs = trackedIds.map((id) => `id=${encodeURIComponent(id)}`).join("&");
        const res = await fetch(`/api/ha/states?${qs}`, { cache: "no-store" });
        const json = await res.json();
        if (!json.ok) throw new Error(json.error ?? "Okänt fel från /states");
        const map: Record<string, HAState> = {};
        (json.states as HAState[]).forEach((s) => {
          map[s.entity_id] = s;
        });
        setKeyStates(map);
        setError(null);
      } catch (e: any) {
        setError(e?.message ?? "Kunde inte hämta status");
      }
    };

    const loadLights = async () => {
      try {
        const qs = lampEntityIds.map((id) => `id=${encodeURIComponent(id)}`).join("&");
        const res = await fetch(`/api/ha/states?${qs}`, { cache: "no-store" });
        const json = await res.json();
        if (!json.ok) throw new Error(json.error ?? "Okänt fel från /states");

        const map = new Map<string, HAState>();
        (json.states as HAState[]).forEach((s) => map.set(s.entity_id, s));

        // Räkna endast de vi bryr oss om, men visa även om några saknas i svaret
        const resolved = lampEntityIds.map((id) => map.get(id)).filter(Boolean) as HAState[];
        setTotalLights(lampEntityIds.length);
        setLightsOn(resolved.filter((s) => s.state === "on").length);
      } catch (e: any) {
        setError((prev) => prev ?? e?.message ?? "Kunde inte hämta lampor");
      }
    };

    loadKeyStates();
    loadLights();
    const interval = setInterval(() => {
      loadKeyStates();
      loadLights();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        const json = await res.json();
        if (json.ok) setCurrentUser(json.user);
      } catch {
        setCurrentUser(null);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const loadSmhi = async () => {
      try {
        const res = await fetch("/api/smhi", { cache: "no-store" });
        const json = await res.json();
        if (json.ok) {
          setSmhi(json.data);
        }
      } catch {
        setSmhi(null);
      }
    };
    loadSmhi();
    const interval = setInterval(loadSmhi, 180000); // 3 minuter
    return () => clearInterval(interval);
  }, []);

  const todayPlan = useMemo(() => formatCalendar(keyStates["calendar.hannes_elvira"], 0), [keyStates]);
  const tomorrowPlan = useMemo(() => formatCalendar(keyStates["calendar.hannes_elvira"], 1), [keyStates]);
  const awayMode = keyStates["input_boolean.borta_lage"]?.state === "on";
  const hannesHome = keyStates["device_tracker.hannes_iphone"]?.state === "home";
  const elviraHome = keyStates["device_tracker.elviras_iphone_2"]?.state === "home";

  const triggerAction = async (action: typeof actionCards[number]) => {
    try {
      setActionLoading(action.label);
      setStatusMessage(null);
      const res = await fetch("/api/ha/service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: action.domain,
          service: action.service,
          entity_id: action.entity_id,
          entity_ids: action.entity_ids,
        }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error ?? "Okänt fel");
      setStatusMessage(`${action.label} skickat`);
    } catch (e: any) {
      setStatusMessage(`Fel: ${e?.message ?? "gick inte att köra"}`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="relative min-h-screen text-white pb-12 overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.12),transparent_35%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_10%,rgba(130,188,255,0.12),transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_85%,rgba(255,200,160,0.12),transparent_40%)]" />
      </div>

      <div className="mx-auto max-w-5xl px-4 pt-10 space-y-10 relative">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.08] backdrop-blur-3xl p-8 shadow-[0_26px_70px_rgba(0,0,0,0.48)]"
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_45%)]" />
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/6 to-transparent" />
            <div className="absolute inset-x-12 top-6 h-[120%] bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.18),transparent_40%)] opacity-80" />
          </div>

          <div className="relative space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <div className="text-sm text-white/70 uppercase tracking-[0.18em]">Hem</div>
                <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
                  Hej {currentUser ? currentUser.charAt(0).toUpperCase() + currentUser.slice(1) : ""}!
                </h1>
                <p className="text-white/70 max-w-2xl">
                  Snabb överblick och genvägar.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur shadow-[0_12px_28px_rgba(0,0,0,0.35)]">
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <SunMedium className="h-4 w-4" /> SMHI
                </div>
                <div className="mt-2 text-3xl font-semibold">
                  {typeof smhi?.temp === "number" ? `${smhi.temp.toFixed(1)}°C` : "–"}
                </div>
                <div className="text-sm text-white/70">
                  {typeof smhi?.precip === "number" ? `${smhi.precip} mm` : "Ingen data"}
                  {typeof smhi?.wind === "number" ? ` · ${smhi.wind} m/s` : ""}
                </div>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur shadow-[0_12px_28px_rgba(0,0,0,0.35)]">
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <Lightbulb className="h-4 w-4" /> Lampor
                </div>
                <div className="mt-2 text-3xl font-semibold">
                  {lightsOn ?? "–"}<span className="text-lg text-white/60"> / {totalLights ?? "–"}</span>
                </div>
                <div className="text-sm text-white/70">tända just nu</div>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur shadow-[0_12px_28px_rgba(0,0,0,0.35)]">
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <CalendarDays className="h-4 w-4" /> Kalender
                </div>
                <div className="mt-2 text-base font-semibold">Idag</div>
                <div className="text-sm text-white/70">{todayPlan}</div>
              </div>
            </div>

            {error && (
              <div className="rounded-2xl border border-amber-300/40 bg-amber-100/10 px-4 py-3 text-sm text-amber-50 backdrop-blur">
                Kunde inte hämta status: {error}
              </div>
            )}

            {statusMessage && !error && (
              <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white/85 backdrop-blur">
                {statusMessage}
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-px w-10 bg-white/30 rounded-full" />
              <h2 className="text-xl font-semibold tracking-tight">Snabbåtgärder</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {actionCards.map((action) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.label}
                  variants={fadeInUp}
                  onClick={() => triggerAction(action)}
                  disabled={actionLoading === action.label}
                  className="relative overflow-hidden rounded-2xl border border-white/12 bg-white/[0.08] backdrop-blur-2xl p-4 text-left shadow-[0_18px_45px_rgba(0,0,0,0.4)] transition-all disabled:opacity-60 hover:border-white/25"
                >
                  <div className="pointer-events-none absolute inset-0 opacity-90" style={{ background: action.gradient }} />
                  <div className="relative flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 border border-white/20 text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-base font-semibold">{action.label}</div>
                      <div className="text-xs text-white/70">
                        {actionLoading === action.label ? "Skickar..." : "Tryck för att köra"}
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <motion.div
            variants={fadeInUp}
            className="rounded-3xl border border-white/10 bg-white/[0.08] p-6 backdrop-blur-2xl shadow-[0_18px_45px_rgba(0,0,0,0.4)] space-y-4"
          >
            <div className="flex items-center gap-2 text-sm text-white/70 uppercase tracking-[0.18em]">
              <CalendarDays className="h-4 w-4" /> Planer
            </div>
            <div className="space-y-3">
              <div className="rounded-2xl bg-white/10 border border-white/10 px-4 py-3">
                <div className="text-xs text-white/60 uppercase tracking-[0.14em]">Idag</div>
                <div className="text-sm text-white/85">{todayPlan}</div>
              </div>
              <div className="rounded-2xl bg-white/10 border border-white/10 px-4 py-3">
                <div className="text-xs text-white/60 uppercase tracking-[0.14em]">Imorgon</div>
                <div className="text-sm text-white/85">{tomorrowPlan}</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="rounded-3xl border border-white/10 bg-white/[0.08] p-6 backdrop-blur-2xl shadow-[0_18px_45px_rgba(0,0,0,0.4)] space-y-4"
          >
            <div className="flex items-center gap-2 text-sm text-white/70 uppercase tracking-[0.18em]">
              <Lightbulb className="h-4 w-4" /> Hemstatus
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/10 border border-white/10 px-4 py-3">
                <div className="text-xs text-white/60 uppercase tracking-[0.14em]">Lampor på</div>
                <div className="text-lg font-semibold">{lightsOn ?? "–"}</div>
              </div>
              <div className="rounded-2xl bg-white/10 border border-white/10 px-4 py-3">
                <div className="text-xs text-white/60 uppercase tracking-[0.14em]">Totalt</div>
                <div className="text-lg font-semibold">{totalLights ?? "–"}</div>
              </div>
              <div className="rounded-2xl bg-white/10 border border-white/10 px-4 py-3">
                <div className="text-xs text-white/60 uppercase tracking-[0.14em]">Borta-läge</div>
                <div className="text-lg font-semibold">{awayMode ? "På" : "Av"}</div>
              </div>
              <div className="rounded-2xl bg-white/10 border border-white/10 px-4 py-3 space-y-1">
                <div className="text-xs text-white/60 uppercase tracking-[0.14em]">Steg</div>
                <div className="text-sm text-white/80">
                  Hannes: {keyStates["sensor.hannes_iphone_steps"]?.state ?? "–"}
                </div>
                <div className="text-sm text-white/80">
                  Elvira: {keyStates["sensor.elviras_iphone_2_steps"]?.state ?? "–"}
                </div>
              </div>
              <div className="rounded-2xl bg-white/10 border border-white/10 px-4 py-3">
                <div className="text-xs text-white/60 uppercase tracking-[0.14em]">Hannes</div>
                <div className="text-lg font-semibold">
                  {hannesHome ? "Hemma" : "Borta"}
                </div>
              </div>
              <div className="rounded-2xl bg-white/10 border border-white/10 px-4 py-3">
                <div className="text-xs text-white/60 uppercase tracking-[0.14em]">Elvira</div>
                <div className="text-lg font-semibold">
                  {elviraHome ? "Hemma" : "Borta"}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

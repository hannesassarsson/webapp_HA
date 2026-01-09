"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { LightTile } from "@/components/LightTile";
import { LightModal } from "@/components/LightModal";
import { RoomSection } from "@/components/RoomSection";
import { motion } from "framer-motion";
import { Moon, Sparkles, Lightbulb, Power } from "lucide-react";
import { staggerContainer, fadeInUp } from "@/components/animations";

type LightItem = {
  id: string;
  name: string;
  room: string;
  type: "light" | "switch";
  brightness: number;
  isOn: boolean;
};

const entityCatalog: Array<Omit<LightItem, "brightness" | "isOn">> = [
  // Vardagsrum
  { id: "light.vardagsrumlampa", name: "Taklampa", room: "Vardagsrum", type: "light" },
  { id: "switch.golvlampa", name: "Golvlampa", room: "Vardagsrum", type: "switch" },
  { id: "switch.golvlampa_2", name: "Balkongbelysning", room: "Vardagsrum", type: "switch" },
  // Sovrum
  { id: "switch.elviras_sida", name: "Elviras sida", room: "Sovrum", type: "switch" },
  { id: "switch.hannes_sida_sovrum", name: "Hannes sida", room: "Sovrum", type: "switch" },
  { id: "switch.lampa_sovrum", name: "Byrålampa", room: "Sovrum", type: "switch" },
  // Kök
  { id: "light.0x348d13fffe819c79", name: "Bänkbelysning", room: "Kök", type: "light" },
  { id: "switch.lampa_fonster_kok", name: "Fönsterlampa", room: "Kök", type: "switch" },
  // Hall
  { id: "light.hall", name: "Taklampa", room: "Hall", type: "light" },
  // Badrum
  { id: "light.0xbc8d7efffec2aba3", name: "Spegellampa", room: "Badrum", type: "light" },
  { id: "switch.shelly1minig3_5432045a6cd4_switch_0", name: "Vägglampa", room: "Badrum", type: "switch" },
  // Kontor
  { id: "switch.lampa_fonster_kontor", name: "Fönsterlampa", room: "Kontor", type: "switch" },
];

export default function LamporPage() {
  const [lights, setLights] = useState<LightItem[]>(
    entityCatalog.map((e) => ({
      ...e,
      brightness: 180,
      isOn: false,
    }))
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [tileLoading, setTileLoading] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const map = new Map<string, LightItem[]>();
    lights.forEach((light) => {
      map.set(light.room, [...(map.get(light.room) ?? []), light]);
    });
    return Array.from(map.entries()).map(([room, items]) => ({ room, items }));
  }, [lights]);

  const selected = lights.find((l) => l.id === selectedId);
  const activeCount = lights.filter((l) => l.isOn).length;
  const allEntityIds = useMemo(() => entityCatalog.map((e) => e.id), []);
  const lightIdsOnly = useMemo(
    () => entityCatalog.filter((e) => e.type === "light").map((e) => e.id),
    []
  );

  const runLightService = async (
    light: LightItem,
    service: "turn_on" | "turn_off",
    data?: Record<string, any>
  ) => {
    try {
      setTileLoading(light.id);
      const res = await fetch("/api/ha/service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: light.type === "light" ? "light" : "switch",
          service,
          entity_id: light.id,
          data,
        }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error ?? "Okänt fel");

      setLights((prev) =>
        prev.map((l) =>
          l.id === light.id
            ? {
                ...l,
                isOn: service === "turn_on" ? true : false,
                brightness:
                  typeof data?.brightness === "number"
                    ? data.brightness
                    : l.brightness,
              }
            : l
        )
      );
      setActionMessage(`${light.name}: ${service === "turn_on" ? "på" : "av"}`);
    } catch (e: any) {
      setActionMessage(`Fel för ${light.name}: ${e?.message ?? "okänt fel"}`);
    } finally {
      setTileLoading(null);
    }
  };

  const changeBrightness = (light: LightItem, brightness: number) => {
    if (light.type !== "light") return;
    // Optimistisk uppdatering för mjuk slider-känsla
    setLights((prev) =>
      prev.map((l) =>
        l.id === light.id ? { ...l, brightness, isOn: true } : l
      )
    );
    runLightService({ ...light, brightness, isOn: true }, "turn_on", {
      brightness,
    });
  };

  const toggleLight = (light: LightItem) => {
    runLightService(light, light.isOn ? "turn_off" : "turn_on");
  };

  const runGroupAction = async (
    label: string,
    service: "turn_on" | "turn_off",
    ids: string[],
    data?: Record<string, any>
  ) => {
    try {
      setActionLoading(label);
      setActionMessage(null);
      const res = await fetch("/api/ha/service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: "homeassistant",
          service,
          entity_ids: ids,
          data,
        }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error ?? "Okänt fel");

      setLights((prev) =>
        prev.map((l) =>
          ids.includes(l.id)
            ? {
                ...l,
                isOn: service === "turn_on",
                brightness:
                  typeof data?.brightness === "number" && l.type === "light"
                    ? data.brightness
                    : l.brightness,
              }
            : l
        )
      );
      setActionMessage(`${label} skickat`);
    } catch (e: any) {
      setActionMessage(`Fel: ${e?.message ?? "okänt fel"}`);
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    const loadStates = async () => {
      try {
        const query = entityCatalog.map((e) => `id=${encodeURIComponent(e.id)}`).join("&");
        const res = await fetch(`/api/ha/states?${query}`, { cache: "no-store" });
        const json = await res.json();
        if (!json.ok) throw new Error(json.error ?? "Okänt fel från /states");

        const states: Array<{ entity_id: string; state: string; attributes: any }> = json.states;
        setLights((prev) =>
          prev.map((light) => {
            const match = states.find((s) => s.entity_id === light.id);
            if (!match) return light;
            const isOn = match.state === "on";
            const brightness =
              typeof match.attributes?.brightness === "number"
                ? match.attributes.brightness
                : light.brightness;
            return { ...light, isOn, brightness };
          })
        );
        setFetchError(null);
      } catch (e: any) {
        setFetchError(e?.message ?? "Kunde inte hämta HA-states");
      }
    };

    loadStates();
    const interval = setInterval(loadStates, 15000);
    return () => clearInterval(interval);
  }, []);

  const triggerAction = async ({
    label,
    domain,
    service,
    entity_id,
    entity_ids,
  }: {
    label: string;
    domain: string;
    service: string;
    entity_id?: string;
    entity_ids?: string[];
  }) => {
    try {
      setActionLoading(label);
      setActionMessage(null);
      const res = await fetch("/api/ha/service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain,
          service,
          entity_id,
          entity_ids,
        }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error ?? "Okänt fel");
      setActionMessage(`${label} skickat`);
    } catch (e: any) {
      setActionMessage(`Fel: ${e?.message ?? "gick inte att köra"}`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="relative min-h-screen text-white pb-14 overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.12),transparent_35%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_10%,rgba(130,188,255,0.12),transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_85%,rgba(255,200,160,0.12),transparent_40%)]" />
      </div>

      <div className="mx-auto max-w-5xl px-4 pt-10 space-y-10 relative">
        <motion.div
          layout
          className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.08] backdrop-blur-3xl p-8 shadow-[0_26px_70px_rgba(0,0,0,0.48)]"
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_45%)]" />
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/6 to-transparent" />
            <div className="absolute inset-x-12 top-6 h-[120%] bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.18),transparent_40%)] opacity-80" />
          </div>

          <div className="relative space-y-4">
            <div className="flex items-center gap-3 text-sm text-white/70 uppercase tracking-[0.18em]">
              <span>Hem</span>
              <span className="text-white/40">•</span>
              <span>Lampor</span>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
                  Lampor
                </h1>
                <p className="text-white/70 max-w-2xl">
                  Snabb kontroll. Tryck för på/av, långtryck för fler val.
                </p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="rounded-2xl bg-white/12 backdrop-blur px-4 py-3 border border-white/15 shadow-[0_12px_28px_rgba(0,0,0,0.35)]">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-white/60">
                    Aktiva
                  </div>
                  <div className="text-2xl font-semibold">{activeCount}</div>
                </div>
                <div className="rounded-2xl bg-white/12 backdrop-blur px-4 py-3 border border-white/15 shadow-[0_12px_28px_rgba(0,0,0,0.35)]">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-white/60">
                    Totalt
                  </div>
                  <div className="text-2xl font-semibold">{lights.length}</div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => runGroupAction("Tänd alla", "turn_on", allEntityIds)}
                className="rounded-full border border-white/10 bg-white/12 px-4 py-2 text-sm font-semibold backdrop-blur hover:border-white/30 transition-all"
              >
                Tänd alla
              </button>
              <button
                onClick={() => runGroupAction("Släck alla", "turn_off", allEntityIds)}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold backdrop-blur hover:border-white/25 transition-all"
              >
                Släck alla
              </button>
              <button
                onClick={() => runGroupAction("Kvällsstämning", "turn_on", lightIdsOnly, { brightness: 140 })}
                className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur hover:border-white/30 transition-all"
              >
                Kvällsstämning
              </button>
            </div>

            {fetchError && (
              <div className="mt-3 rounded-2xl border border-amber-300/40 bg-amber-100/10 px-4 py-3 text-sm text-amber-50 backdrop-blur">
                Kunde inte hämta status från HA: {fetchError}
              </div>
            )}

            {!fetchError && actionMessage && (
              <div className="mt-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white/85 backdrop-blur">
                {actionMessage}
              </div>
            )}
          </div>
        </motion.div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-px w-10 bg-white/30 rounded-full" />
              <h2 className="text-xl font-semibold tracking-tight">
                Snabbåtgärder
              </h2>
            </div>
            {actionMessage && (
              <div className="text-sm text-white/70 bg-white/10 border border-white/10 rounded-full px-3 py-1 backdrop-blur">
                {actionMessage}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Godnatt",
                icon: Moon,
                gradient: "linear-gradient(135deg, rgba(255,255,255,0.16), rgba(255,255,255,0.08))",
                onClick: () =>
                  triggerAction({
                    label: "Godnatt",
                    domain: "script",
                    service: "turn_on",
                    entity_id: "script.godnatt_slack_allt",
                  }),
              },
              {
                label: "Mysbelysning",
                icon: Sparkles,
                gradient: "linear-gradient(135deg, rgba(255,214,164,0.35), rgba(255,255,255,0.08))",
                onClick: () =>
                  triggerAction({
                    label: "Mysbelysning",
                    domain: "script",
                    service: "turn_on",
                    entity_id: "script.godmorgon_tand_mysbelysning",
                  }),
              },
              {
                label: "Släck allt",
                icon: Power,
                gradient: "linear-gradient(135deg, rgba(255,188,188,0.32), rgba(255,255,255,0.06))",
                onClick: () =>
                  triggerAction({
                    label: "Släck allt",
                    domain: "homeassistant",
                    service: "turn_off",
                    entity_ids: allEntityIds,
                  }),
              },
              {
                label: "Tänd allt",
                icon: Lightbulb,
                gradient: "linear-gradient(135deg, rgba(255,238,168,0.38), rgba(255,255,255,0.08))",
                onClick: () =>
                  triggerAction({
                    label: "Tänd allt",
                    domain: "homeassistant",
                    service: "turn_on",
                    entity_ids: allEntityIds,
                  }),
              },
            ].map(({ label, icon: Icon, gradient, onClick }) => (
              <motion.button
                key={label}
                whileTap={{ scale: 0.98 }}
                whileHover={{ scale: 1.01 }}
                onClick={onClick}
                disabled={actionLoading === label}
                className="relative overflow-hidden rounded-2xl border border-white/12 bg-white/[0.08] backdrop-blur-2xl p-4 text-left shadow-[0_18px_45px_rgba(0,0,0,0.4)] transition-all disabled:opacity-60"
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-90"
                  style={{ background: gradient }}
                />
                <div className="relative flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 border border-white/20 text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-base font-semibold">{label}</div>
                    <div className="text-xs text-white/70">
                      {actionLoading === label ? "Skickar..." : "Tryck för att köra"}
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="space-y-10">
          {grouped.map(({ room, items }) => (
            <RoomSection key={room} title={room}>
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 sm:grid-cols-3 gap-4"
              >
                {items.map((light) => (
                  <motion.div variants={fadeInUp} key={light.id}>
                    <LightTile
                      title={light.name}
                      subtitle={light.type === "light" ? "Lampa" : "Switch"}
                      active={light.isOn}
                      brightness={light.type === "light" ? light.brightness : undefined}
                      onToggle={() => toggleLight(light)}
                      onLongPress={() => setSelectedId(light.id)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </RoomSection>
          ))}
        </div>
      </div>

      {selected && (
        <LightModal
          open
          onClose={() => setSelectedId(null)}
          name={selected.name}
          room={selected.room}
          isLight={selected.type === "light"}
          isOn={selected.isOn}
          brightness={selected.brightness ?? 1}
          onTurnOn={() => runLightService(selected, "turn_on")}
          onTurnOff={() => runLightService(selected, "turn_off")}
          onBrightnessChange={(value) => changeBrightness(selected, value)}
        />
      )}
    </div>
  );
}

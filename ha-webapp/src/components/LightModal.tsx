"use client";

import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { Slider } from "@/components/ui/slider";
import { useMemo } from "react";

export function LightModal({
  open,
  onClose,
  name,
  room,
  isLight,
  isOn,
  brightness,
  onTurnOn,
  onTurnOff,
  onBrightnessChange,
}: {
  open: boolean;
  onClose: () => void;
  name: string;
  room: string;
  isLight: boolean;
  isOn: boolean;
  brightness: number;
  onTurnOn: () => void;
  onTurnOff: () => void;
  onBrightnessChange: (v: number) => void;
}) {
  const brightnessPercent = useMemo(
    () => Math.round((brightness / 255) * 100),
    [brightness]
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            onMouseDown={onClose}
            onTouchStart={onClose}
            aria-label="Stäng dialog genom att trycka utanför"
          />

          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            onClick={onClose}
            onTouchStart={onClose}
            onMouseDown={onClose}
          >
            <div className="w-full max-w-lg px-4 pb-6 sm:px-0 sm:pb-0" onClick={(e) => e.stopPropagation()}>
              <div className="relative overflow-hidden rounded-[32px] border border-white/12 bg-white/[0.12] backdrop-blur-3xl shadow-[0_28px_70px_rgba(0,0,0,0.55)]">
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute inset-0 bg-gradient-to-b from-white/14 via-white/8 to-black/25" />
                  <div className="absolute -inset-x-16 -top-28 h-56 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.35),transparent_55%)]" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(130,188,255,0.15),transparent_40%)]" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,200,160,0.14),transparent_45%)]" />
                </div>

                <div className="relative p-6 space-y-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="text-sm text-white/60">{room}</div>
                      <div className="text-2xl font-semibold tracking-tight">
                        {name}
                      </div>
                    </div>
                    <span
                      className={clsx(
                        "rounded-full px-3 py-1 text-xs font-semibold border backdrop-blur",
                        isOn
                          ? "bg-white text-neutral-900 border-white/40 shadow-[0_10px_30px_rgba(255,255,255,0.35)]"
                          : "bg-white/10 border-white/10 text-white/75"
                      )}
                    >
                      {isOn ? "På" : "Av"}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={onTurnOn}
                      className={clsx(
                        "flex-1 rounded-2xl py-3 text-sm font-semibold transition-all border",
                        isOn
                          ? "bg-white text-neutral-900 border-white/30 shadow-[0_12px_28px_rgba(255,255,255,0.35)]"
                          : "bg-white/15 border-white/10 text-white hover:border-white/25"
                      )}
                    >
                      Slå på
                    </button>
                    <button
                      onClick={onTurnOff}
                      className={clsx(
                        "flex-1 rounded-2xl py-3 text-sm font-semibold transition-all border",
                        !isOn
                          ? "bg-white/8 border-white/25 text-white/90"
                          : "bg-white/8 border-white/10 text-white hover:border-white/25"
                      )}
                    >
                      Stäng av
                    </button>
                  </div>

                  {isLight && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm text-white/70">
                        <span>Ljusstyrka</span>
                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80 border border-white/10 backdrop-blur">
                          {brightnessPercent}%
                        </span>
                      </div>
                      <Slider
                        min={1}
                        max={255}
                        value={[brightness]}
                        onValueChange={(values) =>
                          onBrightnessChange(values[0] ?? brightness)
                        }
                      />
                      <div className="flex justify-between text-[11px] uppercase tracking-[0.16em] text-white/50">
                        <span>Mjuk</span>
                        <span>Klar</span>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2">
                        {[
                          { label: "Mjuk kväll", value: 110 },
                          { label: "Läsning", value: 180 },
                          { label: "Fullt", value: 255 },
                        ].map((preset) => (
                          <button
                            key={preset.label}
                            onClick={() => onBrightnessChange(preset.value)}
                            className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold text-white/85 backdrop-blur hover:border-white/30 transition-all"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between text-sm text-white/55">
                    <button
                      onClick={onClose}
                      className="rounded-full px-4 py-2 text-white/80 hover:bg-white/10 transition-colors"
                    >
                      Stäng
                    </button>
                    <div className="text-white/50">Tryck utanför för att stänga</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

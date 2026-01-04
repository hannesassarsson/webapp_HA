"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";

export function LightTile({
  title,
  subtitle,
  active,
  brightness,
  onToggle,
  onLongPress,
}: {
  title: string;
  subtitle?: string;
  active?: boolean;
  brightness?: number;
  onToggle: () => void;
  onLongPress?: () => void;
}) {
  const brightnessPercent =
    typeof brightness === "number"
      ? Math.max(6, Math.min(100, Math.round((brightness / 255) * 100)))
      : null;

  const longPressTimer = useRef<number | null>(null);
  const longPressFired = useRef(false);

  const handlePointerDown = () => {
    if (!onLongPress) return;
    longPressFired.current = false;
    longPressTimer.current = window.setTimeout(() => {
      longPressFired.current = true;
      onLongPress();
    }, 500);
  };

  const handlePointerUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (!longPressFired.current) {
      onToggle();
    }
  };

  return (
    <motion.button
      aria-pressed={active}
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.015 }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={() => {
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
      }}
      className={clsx(
        "group relative overflow-hidden rounded-[24px] border border-white/8",
        "min-h-[140px] flex flex-col justify-between gap-5 p-5 text-left",
        "bg-white/[0.08] backdrop-blur-2xl shadow-[0_20px_55px_rgba(0,0,0,0.45)] transition-all",
        active
          ? "ring-2 ring-white/60 shadow-[0_32px_80px_rgba(0,0,0,0.5)]"
          : "hover:border-white/20 hover:shadow-[0_24px_65px_rgba(0,0,0,0.45)]"
      )}
    >
      {/* Glow & glass layers */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className={clsx(
            "absolute inset-0 bg-gradient-to-br from-white/16 via-white/8 to-white/6",
            active ? "opacity-100" : "opacity-70"
          )}
        />
        <div className="absolute inset-x-4 top-0 h-[120%] bg-[radial-gradient(circle_at_50%_-10%,rgba(255,255,255,0.2),transparent_40%)] opacity-70" />
        {active && (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.26),transparent_45%)] opacity-85" />
        )}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/20 via-black/5 to-transparent" />
      </div>

      <div className="relative flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            {subtitle && (
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/60">
                {subtitle}
              </div>
            )}
            <div className="text-xl font-semibold leading-tight tracking-tight">
              {title}
            </div>
          </div>

          <span
            className={clsx(
              "rounded-full px-3 py-1 text-xs font-semibold",
              "backdrop-blur-md border transition-all",
              active
                ? "bg-white text-neutral-900/90 border-white/40 shadow-[0_6px_20px_rgba(255,255,255,0.28)]"
                : "bg-white/10 border-white/10 text-white/80"
            )}
          >
            {active ? "På" : "Av"}
          </span>
        </div>

        {brightnessPercent !== null && (
          <div className="space-y-2">
            <div className="text-[11px] uppercase tracking-[0.18em] text-white/60">
              Ljusstyrka
            </div>
            <div className="h-2 rounded-full bg-white/8 ring-1 ring-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-white via-white/80 to-white/50"
                style={{ width: `${brightnessPercent}%` }}
              />
            </div>
          </div>
        )}

        {brightnessPercent === null && (
          <div className="text-sm text-white/55">Tryck för att justera</div>
        )}
      </div>
    </motion.button>
  );
}

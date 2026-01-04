"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Lightbulb, Sparkles } from "lucide-react";
import clsx from "clsx";

const items = [
  { label: "Hem", href: "/", icon: Home },
  { label: "Lampor", href: "/lampor", icon: Lightbulb },
  { label: "Scener", href: "/scener", icon: Sparkles },
];

export function BottomNav() {
  const pathname = usePathname();
  const activeIndex = items.findIndex((item) => item.href === pathname) ?? 0;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 bg-black/70 backdrop-blur-2xl border-t border-white/10 shadow-[0_-8px_30px_rgba(0,0,0,0.45)]">
      <div className="relative mx-auto max-w-5xl px-3 py-3 grid grid-cols-3 gap-2">
        <div
          className="absolute inset-y-2 left-3 w-1/3 rounded-2xl bg-white/10 border border-white/20 transition-transform duration-300"
          style={{ transform: `translateX(${activeIndex * 100}%)` }}
        />
        {items.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex flex-col items-center gap-1 rounded-2xl px-3 py-2 transition-all",
                active
                  ? "bg-white/15 border border-white/25 shadow-[0_14px_30px_rgba(0,0,0,0.35)] text-white"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-semibold">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

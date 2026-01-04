// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { BottomNav } from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "HA Webapp",
  description: "Home Assistant Webapp",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <body className="min-h-screen bg-background text-foreground pb-20">
        <div className="relative min-h-screen">
          {children}
          <BottomNav />
        </div>
      </body>
    </html>
  );
}

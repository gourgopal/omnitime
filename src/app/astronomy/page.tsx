"use client";

import { useState } from "react";
import { Moon, Star } from "lucide-react";

// Demo data for Ekadashi 2026
const ekadashi2026 = [
  { date: "2026-01-04", name: "Putrada Ekadashi" },
  { date: "2026-01-19", name: "Shattila Ekadashi" },
  { date: "2026-02-02", name: "Jaya Ekadashi" },
  { date: "2026-02-17", name: "Vijaya Ekadashi" },
  { date: "2026-03-04", name: "Amalaki Ekadashi" },
  { date: "2026-03-19", name: "Papmochani Ekadashi" },
  // Truncated for demo purposes
];

const fullMoons2026 = [
  { date: "2026-01-03", name: "Wolf Moon" },
  { date: "2026-02-01", name: "Snow Moon" },
  { date: "2026-03-03", name: "Worm Moon" },
  { date: "2026-04-02", name: "Pink Moon" },
  // Truncated for demo purposes
];

export default function Astronomy() {
  const [tab, setTab] = useState<"ekadashi" | "moon">("ekadashi");
  const [year, setYear] = useState(2026);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center flex items-center justify-center gap-2">
        <Star className="text-primary" /> Astronomy & Culture
      </h1>

      <div className="flex justify-center gap-4 mb-8">
        <button
          className={`px-6 py-2 rounded-full font-medium transition-colors flex items-center gap-2 ${tab === "ekadashi" ? "bg-primary text-white shadow-lg" : "bg-[var(--glass-bg)] hover:bg-black/10 dark:hover:bg-white/10"}`}
          onClick={() => setTab("ekadashi")}
        >
          Ekadashi Dates
        </button>
        <button
          className={`px-6 py-2 rounded-full font-medium transition-colors flex items-center gap-2 ${tab === "moon" ? "bg-primary text-white shadow-lg" : "bg-[var(--glass-bg)] hover:bg-black/10 dark:hover:bg-white/10"}`}
          onClick={() => setTab("moon")}
        >
          <Moon size={18} /> Full Moons
        </button>
      </div>

      <div className="glass-panel p-8 min-h-[400px]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">
            {tab === "ekadashi" ? "Ekadashi Calendar" : "Full Moon Calendar"}
          </h2>
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="p-2 rounded-lg border border-[var(--glass-border)] bg-[var(--background)]/50 focus:ring-2 focus:ring-primary outline-none"
          >
            {[2026, 2027, 2028, 2029, 2030].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {tab === "ekadashi" && (
          <div className="space-y-4">
            {year === 2026 ? (
              ekadashi2026.map((eka, i) => (
                <div key={i} className="flex justify-between items-center p-4 rounded-xl bg-[var(--background)]/50 border border-[var(--glass-border)]">
                  <span className="font-bold text-lg">{new Date(eka.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', weekday: 'long' })}</span>
                  <span className="text-primary font-medium">{eka.name}</span>
                </div>
              ))
            ) : (
              <p className="text-center text-[var(--muted-foreground)]">Data for {year} will be updated soon.</p>
            )}
          </div>
        )}

        {tab === "moon" && (
          <div className="space-y-4">
            {year === 2026 ? (
              fullMoons2026.map((moon, i) => (
                <div key={i} className="flex justify-between items-center p-4 rounded-xl bg-[var(--background)]/50 border border-[var(--glass-border)]">
                  <span className="font-bold text-lg">{new Date(moon.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', weekday: 'long' })}</span>
                  <span className="text-primary font-medium flex items-center gap-2"><Moon size={16} /> {moon.name}</span>
                </div>
              ))
            ) : (
              <p className="text-center text-[var(--muted-foreground)]">Data for {year} will be updated soon.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

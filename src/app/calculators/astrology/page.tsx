"use client";

import { useState, useEffect } from "react";
import { Sparkles, Sun, Moon, ArrowLeftRight, Hash } from "lucide-react";
import { getAstrologyChart, AstrologyChart } from "@/lib/astrology";
import { getLifePathNumber, getLifePathMeaning } from "@/lib/numerology";
import { format } from "date-fns";

export default function AstrologyCalculator() {
  const [mounted, setMounted] = useState(false);
  const [birthDate, setBirthDate] = useState<string>("1990-01-01");
  const [chart, setChart] = useState<AstrologyChart | null>(null);
  const [lifePath, setLifePath] = useState<{ number: number, meaning: string } | null>(null);
  const [currentSky, setCurrentSky] = useState<AstrologyChart | null>(null);
  const [savedPeople, setSavedPeople] = useState<{id: string, name: string, dob: string}[]>([]);
  useEffect(() => {
    setMounted(true);
    setCurrentSky(getAstrologyChart(new Date()));
    handleCalculate("1990-01-01");
    try {
      const people = JSON.parse(localStorage.getItem("omnitime_people") || "[]");
      setSavedPeople(people);
    } catch(e) {}
  }, []);

  const handleCalculate = (dateStr: string) => {
    if (!dateStr) return;
    const date = new Date(dateStr);
    setChart(getAstrologyChart(date));
    const lpNumber = getLifePathNumber(date);
    setLifePath({
      number: lpNumber,
      meaning: getLifePathMeaning(lpNumber)
    });
  };

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl text-center min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <Sparkles className="w-12 h-12 text-purple-500 opacity-50 mb-4 animate-spin-slow" />
          <div className="text-xl text-[var(--muted-foreground)]">Aligning the Stars...</div>
        </div>
      </div>
    );
  }

  const retrogrades = currentSky?.planets.filter(p => p.isRetrograde) || [];

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
          <Sparkles className="text-purple-500 w-10 h-10" />
          Astrology & Numerology Engine
        </h1>
        <p className="text-lg text-[var(--muted-foreground)]">
          Discover your Natal Chart, Life Path Number, and current Planetary Retrogrades.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Input and Numerology */}
        <div className="space-y-8">
          <div className="glass-panel p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-xl">Enter Birth Date</h3>
              {savedPeople.length > 0 && (
                <select 
                  className="bg-[var(--background)] border border-[var(--glass-border)] rounded px-2 py-1 text-sm outline-none cursor-pointer"
                  onChange={(e) => {
                    const person = savedPeople.find(p => p.id === e.target.value);
                    if (person) {
                      setBirthDate(person.dob);
                      handleCalculate(person.dob);
                    }
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>Load Saved Person</option>
                  {savedPeople.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              )}
            </div>
            <input 
              type="date" 
              value={birthDate}
              onChange={(e) => {
                setBirthDate(e.target.value);
                handleCalculate(e.target.value);
              }}
              className="w-full bg-[var(--background)] border border-[var(--glass-border)] rounded-md px-4 py-3 outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {lifePath && (
            <div className="glass-panel p-6 bg-gradient-to-br from-background to-pink-500/10 border-t-4 border-pink-500">
              <h3 className="text-sm uppercase tracking-wider text-[var(--muted-foreground)] mb-2 flex items-center gap-2">
                <Hash className="w-4 h-4" /> Numerology
              </h3>
              <div className="text-xl font-bold mb-1">Life Path {lifePath.number}</div>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                {lifePath.meaning}
              </p>
            </div>
          )}

          {currentSky && (
            <div className="glass-panel p-6 border-t-4 border-indigo-500">
              <h3 className="text-sm uppercase tracking-wider text-[var(--muted-foreground)] mb-4">Current Sky Retrogrades</h3>
              {retrogrades.length > 0 ? (
                <div className="space-y-3">
                  {retrogrades.map((r, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-indigo-500/10 rounded-lg">
                      <span className="font-bold text-indigo-400 capitalize">{r.name}</span>
                      <span className="text-sm text-indigo-300 flex items-center gap-1">
                        <ArrowLeftRight className="w-3 h-3" /> Retrograde in {r.sign}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-[var(--muted-foreground)] p-4 bg-[var(--background)] rounded-lg text-center">
                  No planets currently in retrograde.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Natal Chart */}
        <div className="lg:col-span-2 space-y-8">
          {chart && (
            <div className="glass-panel p-8 bg-gradient-to-br from-background to-purple-500/5">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Sparkles className="text-purple-500" />
                Your Natal Chart
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <div className="p-6 rounded-xl bg-[var(--glass-bg)] border border-yellow-500/30 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center">
                    <Sun className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm text-[var(--muted-foreground)] uppercase tracking-wider">Sun Sign</div>
                    <div className="text-2xl font-bold">{chart.sunSign}</div>
                  </div>
                </div>
                
                <div className="p-6 rounded-xl bg-[var(--glass-bg)] border border-blue-500/30 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center">
                    <Moon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm text-[var(--muted-foreground)] uppercase tracking-wider">Moon Sign</div>
                    <div className="text-2xl font-bold">{chart.moonSign}</div>
                  </div>
                </div>
              </div>

              <h3 className="font-bold text-lg mb-4">Planetary Placements</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {chart.planets.map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                    <span className="font-semibold capitalize">{p.name}</span>
                    <div className="text-right">
                      <div className="text-sm font-medium">{p.sign}</div>
                      {p.isRetrograde && (
                        <div className="text-xs text-red-400 flex items-center gap-1 mt-1 justify-end">
                          <ArrowLeftRight className="w-3 h-3" /> Retrograde
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

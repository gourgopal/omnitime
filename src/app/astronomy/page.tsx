"use client";

import { useState, useEffect } from "react";
import { Moon, Star, Calendar } from "lucide-react";
import { getMoonStatus, getNextMajorMoons, getNextEkadashis, getFunDistancePhrase, MoonStatus } from "@/lib/astronomy";
import { format } from "date-fns";

export default function AstronomyDashboard() {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<Date>(new Date());
  
  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setNow(new Date()), 1000 * 60); // update every minute
    return () => clearInterval(timer);
  }, []);

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-5xl text-center min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <Moon className="w-12 h-12 text-primary opacity-50 mb-4 animate-spin-slow" />
          <div className="text-xl text-[var(--muted-foreground)]">Aligning Telescopes...</div>
        </div>
      </div>
    );
  }

  const moonStatus: MoonStatus = getMoonStatus(now);
  const majorMoons = getNextMajorMoons(now);
  const ekadashis = getNextEkadashis(now);

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
          <Moon className="text-primary w-10 h-10" />
          Astronomy & Lunar Dashboard
        </h1>
        <p className="text-lg text-[var(--muted-foreground)]">
          Real-time, high-precision mathematical tracking of the Moon and Vedic Tithis.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Current Moon Phase Card */}
        <div className="glass-panel p-8 text-center flex flex-col items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6 overflow-hidden relative border border-primary/20 shadow-lg shadow-primary/10">
            <div 
              className="absolute top-0 left-0 h-full bg-primary/30 transition-all duration-1000" 
              style={{ width: `${moonStatus.illumination * 100}%` }}
            />
            <Moon className="text-primary w-12 h-12 relative z-10" />
          </div>
          <h2 className="text-3xl font-bold mb-2">{moonStatus.phaseName}</h2>
          <div className="text-[var(--muted-foreground)] mb-4">
            {(moonStatus.illumination * 100).toFixed(1)}% Illuminated
          </div>
          
          <div className="bg-background/50 rounded-lg p-4 w-full mt-4">
            <h3 className="font-semibold mb-1">Vedic Tithi</h3>
            <p className="text-sm">
              Currently on Tithi {moonStatus.tithi} ({moonStatus.paksha} Paksha)
            </p>
          </div>
        </div>

        {/* Upcoming Major Events */}
        <div className="flex flex-col gap-4">
          <div className="glass-panel p-6 border-l-4 border-blue-500">
            <h3 className="text-sm uppercase tracking-wider text-[var(--muted-foreground)] mb-1">Next Full Moon (Purnima)</h3>
            <div className="text-2xl font-bold mb-1">{format(majorMoons.nextFullMoon, "MMMM do, yyyy")}</div>
            <div className="text-sm text-blue-500 font-medium">
              {getFunDistancePhrase(majorMoons.nextFullMoon, now)}
            </div>
            <div className="text-xs text-[var(--muted-foreground)] mt-1">
              Exact peak: {format(majorMoons.nextFullMoon, "hh:mm a")}
            </div>
          </div>

          <div className="glass-panel p-6 border-l-4 border-slate-500">
            <h3 className="text-sm uppercase tracking-wider text-[var(--muted-foreground)] mb-1">Next New Moon (Amavasya)</h3>
            <div className="text-2xl font-bold mb-1">{format(majorMoons.nextNewMoon, "MMMM do, yyyy")}</div>
            <div className="text-sm text-slate-500 font-medium">
              {getFunDistancePhrase(majorMoons.nextNewMoon, now)}
            </div>
            <div className="text-xs text-[var(--muted-foreground)] mt-1">
              Exact peak: {format(majorMoons.nextNewMoon, "hh:mm a")}
            </div>
          </div>
        </div>
      </div>

      {/* Ekadashi Section */}
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
        <Star className="text-yellow-500 w-8 h-8" />
        Upcoming Ekadashi Fasting Days
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 bg-gradient-to-br from-background to-primary/5">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-xl mb-1">{ekadashis.nextEkadashi.type}</h3>
              <div className="text-[var(--muted-foreground)] text-sm">
                {ekadashis.nextEkadashi.date.getDate() !== ekadashis.nextEkadashi.astronomicalStart.getDate() ? 
                  "Shifted to Dwadashi (Vaishnava Rule)" : "Traditional Fasting Day"}
              </div>
            </div>
            <Calendar className="text-primary w-6 h-6 opacity-50" />
          </div>
          <div className="text-3xl font-bold mb-2 text-primary">
            {format(ekadashis.nextEkadashi.date, "MMM do, yyyy")}
          </div>
          <div className="text-sm font-medium">
            {getFunDistancePhrase(ekadashis.nextEkadashi.date, now)}
          </div>
          <div className="text-xs mt-2 opacity-70">
            Tithi start: {format(ekadashis.nextEkadashi.astronomicalStart, "MMM do, hh:mm a")}
          </div>
        </div>

        <div className="glass-panel p-6 bg-gradient-to-br from-background to-secondary/5 opacity-80">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-xl mb-1">{ekadashis.followingEkadashi.type}</h3>
              <div className="text-[var(--muted-foreground)] text-sm">
                {ekadashis.followingEkadashi.date.getDate() !== ekadashis.followingEkadashi.astronomicalStart.getDate() ? 
                  "Shifted to Dwadashi (Vaishnava Rule)" : "Traditional Fasting Day"}
              </div>
            </div>
            <Calendar className="text-secondary w-6 h-6 opacity-50" />
          </div>
          <div className="text-3xl font-bold mb-2">
            {format(ekadashis.followingEkadashi.date, "MMM do, yyyy")}
          </div>
          <div className="text-sm font-medium">
            {getFunDistancePhrase(ekadashis.followingEkadashi.date, now)}
          </div>
          <div className="text-xs mt-2 opacity-70">
            Tithi start: {format(ekadashis.followingEkadashi.astronomicalStart, "MMM do, hh:mm a")}
          </div>
        </div>
      </div>
      
      <div className="mt-12 text-center">
        <a href="/calculators/astronomy" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full hover:opacity-90 transition-opacity font-medium">
          Open Full Lunar Calculator
          <Calendar className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}

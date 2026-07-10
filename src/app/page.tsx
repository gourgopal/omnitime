"use client";

import { useState, useEffect } from "react";
import { format, formatInTimeZone } from "date-fns-tz";
import { useTimeFormat } from "@/components/time-format-provider";

const CITIES = [
  { name: "New York", timezone: "America/New_York" },
  { name: "London", timezone: "Europe/London" },
  { name: "Tokyo", timezone: "Asia/Tokyo" },
  { name: "Mumbai", timezone: "Asia/Kolkata" },
  { name: "Sydney", timezone: "Australia/Sydney" },
  { name: "Dubai", timezone: "Asia/Dubai" },
  { name: "Paris", timezone: "Europe/Paris" },
  { name: "Singapore", timezone: "Asia/Singapore" },
  { name: "Beijing", timezone: "Asia/Shanghai" },
  { name: "Los Angeles", timezone: "America/Los_Angeles" }
];

export default function Home() {
  const [time, setTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const { formatString, toggleFormat, format: currentFormat } = useTimeFormat();

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  const shortFormatString = currentFormat === "12h" ? "hh:mm a" : "HH:mm";

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-end mb-4">
        <button 
          onClick={toggleFormat}
          className="px-4 py-2 text-sm font-medium rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        >
          {currentFormat === "12h" ? "Switch to 24h" : "Switch to 12h"}
        </button>
      </div>
      
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
          Supercharge Your Time
        </h1>
        <p className="text-lg md:text-xl text-[var(--muted-foreground)] max-w-2xl mx-auto">
          The ultimate utility for calculators, timezone conversions, fun astrology, and everything related to time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Local Time */}
        <div className="glass-panel p-8 text-center flex flex-col justify-center items-center">
          <h2 className="text-2xl font-medium mb-2">Local Time</h2>
          <div className="text-5xl md:text-7xl font-bold font-mono tracking-tighter text-primary">
            {format(time, formatString)}
          </div>
          <div className="text-xl mt-4 text-[var(--muted-foreground)]">
            {format(time, "EEEE, MMMM do, yyyy")}
          </div>
        </div>

        {/* UTC Time */}
        <div className="glass-panel p-8 text-center flex flex-col justify-center items-center">
          <h2 className="text-2xl font-medium mb-2">UTC Time</h2>
          <div className="text-5xl md:text-7xl font-bold font-mono tracking-tighter">
            {formatInTimeZone(time, "UTC", formatString)}
          </div>
          <div className="text-xl mt-4 text-[var(--muted-foreground)]">
            {formatInTimeZone(time, "UTC", "EEEE, MMMM do, yyyy")}
          </div>
        </div>
      </div>

      {/* Trending Cities */}
      <h2 className="text-3xl font-bold mb-6">Trending Cities</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
        {CITIES.map((city) => (
          <div key={city.name} className="glass-panel p-4 flex flex-col justify-center">
            <h3 className="font-semibold mb-1">{city.name}</h3>
            <div className="text-2xl font-bold font-mono text-primary">
              {formatInTimeZone(time, city.timezone, shortFormatString)}
            </div>
            <div className="text-sm text-[var(--muted-foreground)]">
              {formatInTimeZone(time, city.timezone, "MMM do, yyyy")}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <h2 className="text-3xl font-bold mb-6">Explore OmniTime</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <a href="/calculators" className="glass-panel p-6 text-center hover:bg-[var(--glass-bg)] hover:scale-105 transition-all">
          <h3 className="font-bold text-lg mb-2">Calculators</h3>
          <p className="text-sm text-[var(--muted-foreground)]">Date & EV charging</p>
        </a>
        <a href="/world-clock" className="glass-panel p-6 text-center hover:bg-[var(--glass-bg)] hover:scale-105 transition-all">
          <h3 className="font-bold text-lg mb-2">World Clock</h3>
          <p className="text-sm text-[var(--muted-foreground)]">Interactive map</p>
        </a>
        <a href="/fun" className="glass-panel p-6 text-center hover:bg-[var(--glass-bg)] hover:scale-105 transition-all">
          <h3 className="font-bold text-lg mb-2">Fun & Age</h3>
          <p className="text-sm text-[var(--muted-foreground)]">Countdowns & Events</p>
        </a>
        <a href="/astronomy" className="glass-panel p-6 text-center hover:bg-[var(--glass-bg)] hover:scale-105 transition-all">
          <h3 className="font-bold text-lg mb-2">Astronomy</h3>
          <p className="text-sm text-[var(--muted-foreground)]">Moons & Ekadashi</p>
        </a>
        <a href="/explore" className="glass-panel p-6 text-center hover:bg-[var(--glass-bg)] hover:scale-105 transition-all">
          <h3 className="font-bold text-lg mb-2">Explore</h3>
          <p className="text-sm text-[var(--muted-foreground)]">Weather & Currency</p>
        </a>
      </div>
    </div>
  );
}

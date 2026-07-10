"use client";

import { useState, useEffect } from "react";
import { format, formatInTimeZone } from "date-fns-tz";

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

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
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
            {format(time, "HH:mm:ss")}
          </div>
          <div className="text-xl mt-4 text-[var(--muted-foreground)]">
            {format(time, "EEEE, MMMM do, yyyy")}
          </div>
        </div>

        {/* UTC Time */}
        <div className="glass-panel p-8 text-center flex flex-col justify-center items-center">
          <h2 className="text-2xl font-medium mb-2">UTC Time</h2>
          <div className="text-5xl md:text-7xl font-bold font-mono tracking-tighter">
            {formatInTimeZone(time, "UTC", "HH:mm:ss")}
          </div>
          <div className="text-xl mt-4 text-[var(--muted-foreground)]">
            {formatInTimeZone(time, "UTC", "EEEE, MMMM do, yyyy")}
          </div>
        </div>
      </div>

      {/* Trending Cities */}
      <h2 className="text-3xl font-bold mb-6">Trending Cities</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {CITIES.map((city) => (
          <div key={city.name} className="glass-panel p-4 flex flex-col justify-center">
            <h3 className="font-semibold mb-1">{city.name}</h3>
            <div className="text-2xl font-bold font-mono text-primary">
              {formatInTimeZone(time, city.timezone, "HH:mm")}
            </div>
            <div className="text-sm text-[var(--muted-foreground)]">
              {formatInTimeZone(time, city.timezone, "MMM do, yyyy")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

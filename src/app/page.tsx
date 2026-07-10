"use client";

import { useState, useEffect } from "react";
import { format, formatInTimeZone } from "date-fns-tz";
import { useTimeFormat } from "@/components/time-format-provider";
import { usePreferences } from "@/components/preferences-provider";
// @ts-ignore
import { Lunar, Solar } from 'lunar-javascript';
import Link from "next/link";
import { MapPin, BatteryCharging, CalendarDays, Rocket, Sun, Moon, Sparkles, Cloud, ArrowRightLeft } from "lucide-react";

const CITIES = [
  { name: "New York", timezone: "America/New_York" },
  { name: "London", timezone: "Europe/London" },
  { name: "Tokyo", timezone: "Asia/Tokyo" },
  { name: "Mumbai", timezone: "Asia/Kolkata" },
  { name: "Sydney", timezone: "Australia/Sydney" },
  { name: "Dubai", timezone: "Asia/Dubai" },
  { name: "Paris", timezone: "Europe/Paris" },
  { name: "Singapore", timezone: "Asia/Singapore" },
];

export default function Home() {
  const [time, setTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const [weather, setWeather] = useState<{temp: number, desc: string} | null>(null);
  const { formatString, toggleFormat, format: currentFormat } = useTimeFormat();
  const { dob } = usePreferences();

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    // Fetch simple mock/approximate weather based on a default city for demonstration
    // Using Open-Meteo for free no-key weather
    fetch("https://api.open-meteo.com/v1/forecast?latitude=28.6139&longitude=77.2090&current=temperature_2m,weather_code")
      .then(res => res.json())
      .then(data => {
        if(data.current) {
          setWeather({ temp: data.current.temperature_2m, desc: "New Delhi" });
        }
      }).catch(e => console.log(e));

    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  const shortFormatString = currentFormat === "12h" ? "hh:mm a" : "HH:mm";
  
  // Lunar/Astrology Calc
  const solar = Solar.fromDate(time);
  const lunar = Lunar.fromDate(time);
  const panchang = `${lunar.getYearInGanZhi()} Year • ${lunar.getMonthInChinese()} Month • Day ${lunar.getDayInChinese()}`;
  
  // Age Calc
  let ageString = "";
  if (dob) {
    const dobDate = new Date(dob);
    const diffTime = Math.abs(time.getTime() - dobDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    ageString = `${(diffDays / 365.25).toFixed(4)} yrs`;
  }

  return (
    <div className="container mx-auto px-4 py-4 h-full flex flex-col justify-center max-w-7xl" style={{ minHeight: "calc(100vh - 8rem)" }}>
      
      {/* Header Row */}
      <div className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 dark:to-blue-400">
            OmniTime
          </h1>
        </div>
        <button 
          onClick={toggleFormat}
          className="px-3 py-1.5 text-xs font-medium rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        >
          {currentFormat === "12h" ? "24h Mode" : "12h Mode"}
        </button>
      </div>

      {/* Main Dashboard Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-4 flex-1 auto-rows-min">
        
        {/* Core Time - Local (Spans 4 cols on lg) */}
        <div className="glass-panel p-6 flex flex-col justify-center relative overflow-hidden group lg:col-span-4 md:col-span-2 col-span-1 min-h-[160px]">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-1 relative z-10 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span> Local Time
          </h2>
          <div className="text-4xl md:text-5xl font-black font-mono tracking-tighter text-primary relative z-10 whitespace-nowrap">
            {format(time, formatString)}
          </div>
          <div className="text-xs mt-1 font-medium relative z-10 opacity-70">
            {format(time, "EEEE, MMMM do")}
          </div>
        </div>

        {/* Core Time - UTC (Spans 4 cols on lg) */}
        <div className="glass-panel p-6 flex flex-col justify-center relative overflow-hidden group lg:col-span-4 md:col-span-2 col-span-1 min-h-[160px]">
           <div className="absolute inset-0 bg-gradient-to-bl from-green-500/10 to-teal-500/10 opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-1 relative z-10 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> UTC Time
          </h2>
          <div className="text-4xl md:text-5xl font-black font-mono tracking-tighter relative z-10 whitespace-nowrap">
            {formatInTimeZone(time, "UTC", formatString)}
          </div>
          <div className="text-xs mt-1 font-medium relative z-10 opacity-70">
            {formatInTimeZone(time, "UTC", "EEEE, MMMM do")}
          </div>
        </div>

        {/* Environment / Weather (Spans 4 cols on lg) */}
        <div className="glass-panel p-6 flex flex-col justify-center lg:col-span-4 md:col-span-2 col-span-1 min-h-[160px] relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/5 rounded-bl-full -z-10"></div>
          <div className="flex flex-col h-full justify-between">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cloud className="text-blue-400" size={24} />
                  <span className="text-2xl font-black">{weather ? `${weather.temp}°C` : "--°C"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRightLeft className="text-green-500" size={18} />
                  <span className="font-bold text-lg">₹83.4 / $</span>
                </div>
             </div>
             <div className="text-xs font-bold text-[var(--muted-foreground)] mt-2 uppercase tracking-wider">
               Weather ({weather?.desc || "Loading"}) & Markets
             </div>
          </div>
        </div>

        {/* Global Pulse Ticker (Spans 8 cols on lg) */}
        <div className="glass-panel p-4 flex flex-col justify-center lg:col-span-8 md:col-span-4 col-span-1 overflow-hidden relative">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-yellow-500" /> Global Pulse
            </h3>
            <Link href="/world-clock" className="text-xs font-bold text-primary hover:underline">View Map &rarr;</Link>
          </div>
          {/* Custom auto-scrolling marquee wrapper */}
          <div className="relative w-full overflow-hidden flex hide-scrollbar">
            <div className="flex gap-8 whitespace-nowrap animate-[marquee_25s_linear_infinite] hover:[animation-play-state:paused]">
              {[...CITIES, ...CITIES].map((city, idx) => (
                <div key={city.name + idx} className="inline-flex flex-col border-l-2 border-[var(--glass-border)] hover:border-primary pl-3 transition-colors cursor-crosshair">
                  <span className="text-[10px] text-[var(--muted-foreground)] font-bold uppercase tracking-wider">{city.name}</span>
                  <span className="text-base font-black font-mono">{formatInTimeZone(time, city.timezone, shortFormatString)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Age Widget (Spans 4 cols on lg) */}
        <div className="glass-panel p-5 flex flex-col justify-between relative overflow-hidden group lg:col-span-4 md:col-span-2 col-span-1">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity"><Moon size={80}/></div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-2">Your Journey</h3>
          {dob ? (
            <div className="mt-auto">
              <div className="text-3xl font-black font-mono bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500">{ageString}</div>
              <div className="text-[10px] uppercase font-bold text-[var(--muted-foreground)] mt-1">Time elapsed since {format(new Date(dob), "MMM d, yyyy")}</div>
            </div>
          ) : (
            <div className="mt-auto flex flex-col items-start">
              <p className="text-xs font-medium mb-3">Set your birthdate to track your exact age down to the millisecond.</p>
              <Link href="/fun" className="px-3 py-1.5 text-[10px] uppercase font-black bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors">Setup Profile</Link>
            </div>
          )}
        </div>

        {/* Cosmic Snapshot (Spans 4 cols on lg) */}
        <div className="glass-panel p-5 flex flex-col justify-between lg:col-span-4 md:col-span-2 col-span-1">
           <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-2">Cosmic Snapshot</h3>
           <div className="mt-auto">
             <div className="text-xl font-black tracking-tight">{lunar.getYearShengXiao()} Year</div>
             <div className="text-sm font-semibold opacity-80 mt-1">{panchang}</div>
           </div>
        </div>

        {/* Tools Dock (Spans 8 cols on lg) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:col-span-8 md:col-span-4 col-span-1">
          <Link href="/calculators/ev-charging" className="glass-panel p-4 flex flex-col items-center justify-center gap-2 hover:bg-[var(--glass-bg)] hover:-translate-y-1 transition-all group border border-transparent hover:border-green-500/30">
            <div className="p-3 bg-green-500/10 rounded-2xl text-green-500 group-hover:scale-110 transition-transform"><BatteryCharging size={24}/></div>
            <div className="text-center">
              <div className="font-bold text-sm">EV Engine</div>
              <div className="text-[10px] uppercase tracking-wider font-semibold text-[var(--muted-foreground)]">Charge & Range</div>
            </div>
          </Link>
          
          <Link href="/calculators/date" className="glass-panel p-4 flex flex-col items-center justify-center gap-2 hover:bg-[var(--glass-bg)] hover:-translate-y-1 transition-all group border border-transparent hover:border-blue-500/30">
            <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500 group-hover:scale-110 transition-transform"><CalendarDays size={24}/></div>
            <div className="text-center">
              <div className="font-bold text-sm">Date Calc</div>
              <div className="text-[10px] uppercase tracking-wider font-semibold text-[var(--muted-foreground)]">Add, Sub, Diff</div>
            </div>
          </Link>
          
          <Link href="/world-clock" className="glass-panel p-4 flex flex-col items-center justify-center gap-2 hover:bg-[var(--glass-bg)] hover:-translate-y-1 transition-all group border border-transparent hover:border-purple-500/30">
            <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-500 group-hover:scale-110 transition-transform"><MapPin size={24}/></div>
            <div className="text-center">
              <div className="font-bold text-sm">World Map</div>
              <div className="text-[10px] uppercase tracking-wider font-semibold text-[var(--muted-foreground)]">Live Timezones</div>
            </div>
          </Link>
          
          <Link href="/explore" className="glass-panel p-4 flex flex-col items-center justify-center gap-2 hover:bg-[var(--glass-bg)] hover:-translate-y-1 transition-all group border border-transparent hover:border-amber-500/30">
            <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500 group-hover:scale-110 transition-transform"><Rocket size={24}/></div>
            <div className="text-center">
              <div className="font-bold text-sm">Explore</div>
              <div className="text-[10px] uppercase tracking-wider font-semibold text-[var(--muted-foreground)]">All Utilities</div>
            </div>
          </Link>
        </div>

      </div>
    </div>
  );
}

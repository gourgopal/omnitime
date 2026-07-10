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
    <div className="container mx-auto px-4 py-6 h-full flex flex-col justify-center max-w-7xl" style={{ minHeight: "calc(100vh - 8rem)" }}>
      
      {/* Header Row */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 dark:to-blue-400">
            OmniTime
          </h1>
          <p className="text-sm md:text-base text-[var(--muted-foreground)] mt-1">
            Your single pane of glass for time, life, and the universe.
          </p>
        </div>
        <button 
          onClick={toggleFormat}
          className="px-3 py-1.5 text-xs font-medium rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        >
          {currentFormat === "12h" ? "24h Mode" : "12h Mode"}
        </button>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1">
        
        {/* Core Time - Left Column (Cols 1-8) */}
        <div className="md:col-span-8 flex flex-col gap-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-48">
            {/* Local Time Widget */}
            <div className="glass-panel p-6 flex flex-col justify-center items-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-2 relative z-10">Local Time</h2>
              <div className="text-5xl md:text-6xl font-bold font-mono tracking-tighter text-primary relative z-10">
                {format(time, formatString)}
              </div>
              <div className="text-sm mt-2 font-medium relative z-10">
                {format(time, "EEEE, MMMM do")}
              </div>
            </div>

            {/* UTC Widget */}
            <div className="glass-panel p-6 flex flex-col justify-center items-center relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-bl from-green-500/10 to-teal-500/10 opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-2 relative z-10">UTC</h2>
              <div className="text-5xl md:text-6xl font-bold font-mono tracking-tighter relative z-10">
                {formatInTimeZone(time, "UTC", formatString)}
              </div>
              <div className="text-sm mt-2 font-medium relative z-10">
                {formatInTimeZone(time, "UTC", "EEEE, MMMM do")}
              </div>
            </div>
          </div>

          {/* Compact Trending Cities */}
          <div className="glass-panel p-4 flex flex-col justify-center">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Global Pulse</h3>
              <Link href="/world-clock" className="text-xs text-primary hover:underline">Interactive Map &rarr;</Link>
            </div>
            <div className="flex overflow-x-auto pb-2 gap-6 snap-x hide-scrollbar">
              {CITIES.map((city) => (
                <div key={city.name} className="flex-none snap-start group cursor-pointer border-l-2 border-transparent hover:border-primary pl-2 transition-all">
                  <div className="text-xs text-[var(--muted-foreground)] font-medium mb-0.5">{city.name}</div>
                  <div className="text-lg font-bold font-mono group-hover:text-primary transition-colors">
                    {formatInTimeZone(time, city.timezone, shortFormatString)}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Life Widgets - Right Column (Cols 9-12) */}
        <div className="md:col-span-4 flex flex-col gap-4">
           
           {/* Age Widget */}
           <div className="glass-panel p-5 flex flex-col justify-between flex-1 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-10"><Sparkles size={64}/></div>
             <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-1">Your Journey</h3>
             {dob ? (
               <div className="mt-auto">
                 <div className="text-4xl font-bold font-mono">{ageString}</div>
                 <div className="text-xs text-[var(--muted-foreground)] mt-1">Time elapsed since {format(new Date(dob), "MMM d, yyyy")}</div>
               </div>
             ) : (
               <div className="mt-auto flex flex-col items-start">
                 <p className="text-sm mb-3">Set your birthdate to track your exact age down to the millisecond.</p>
                 <Link href="/fun" className="px-3 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors">Setup Profile</Link>
               </div>
             )}
           </div>

           {/* Environment Widget */}
           <div className="glass-panel p-5 flex flex-col justify-between flex-1">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cloud className="text-blue-400" size={18} />
                  <span className="font-bold">{weather ? `${weather.temp}°C` : "--°C"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRightLeft className="text-green-500" size={18} />
                  <span className="font-bold">₹83.4 / $</span>
                </div>
             </div>
             <div className="text-xs text-[var(--muted-foreground)] mt-2">Live Weather ({weather?.desc || "Loading"}) & Markets</div>
           </div>

           {/* Astro Widget */}
           <div className="glass-panel p-5 flex flex-col justify-between flex-1">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-2">Cosmic Snapshot</h3>
              <div>
                <div className="font-bold">{lunar.getYearShengXiao()} Year</div>
                <div className="text-sm font-medium mt-1">{panchang}</div>
              </div>
           </div>

        </div>

      </div>

      {/* Main Tools Dock */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/calculators/ev-charging" className="glass-panel p-4 flex items-center gap-3 hover:bg-[var(--glass-bg)] hover:scale-[1.02] transition-all group border border-transparent hover:border-green-500/30">
          <div className="p-2 bg-green-500/10 rounded-lg text-green-500"><BatteryCharging size={20}/></div>
          <div>
            <div className="font-semibold text-sm">EV Engine</div>
            <div className="text-xs text-[var(--muted-foreground)]">Charge & Range</div>
          </div>
        </Link>
        
        <Link href="/calculators/date" className="glass-panel p-4 flex items-center gap-3 hover:bg-[var(--glass-bg)] hover:scale-[1.02] transition-all group border border-transparent hover:border-blue-500/30">
          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><CalendarDays size={20}/></div>
          <div>
            <div className="font-semibold text-sm">Date Calc</div>
            <div className="text-xs text-[var(--muted-foreground)]">Add, Sub, Diff</div>
          </div>
        </Link>
        
        <Link href="/world-clock" className="glass-panel p-4 flex items-center gap-3 hover:bg-[var(--glass-bg)] hover:scale-[1.02] transition-all group border border-transparent hover:border-purple-500/30">
          <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500"><MapPin size={20}/></div>
          <div>
            <div className="font-semibold text-sm">World Map</div>
            <div className="text-xs text-[var(--muted-foreground)]">Live Timezones</div>
          </div>
        </Link>
        
        <Link href="/explore" className="glass-panel p-4 flex items-center gap-3 hover:bg-[var(--glass-bg)] hover:scale-[1.02] transition-all group border border-transparent hover:border-amber-500/30">
          <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500"><Rocket size={20}/></div>
          <div>
            <div className="font-semibold text-sm">Explore</div>
            <div className="text-xs text-[var(--muted-foreground)]">All Utilities</div>
          </div>
        </Link>
      </div>

    </div>
  );
}

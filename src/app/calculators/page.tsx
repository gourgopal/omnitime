import Link from "next/link";
import { Calculator, Calendar, BatteryCharging } from "lucide-react";

export const metadata = {
  title: "Calculators | OmniTime",
  description: "A collection of precise calculators for time, dates, and EVs.",
};

export default function CalculatorsHub() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
          <Calculator className="text-primary w-10 h-10" />
          OmniTime Calculators
        </h1>
        <p className="text-lg text-[var(--muted-foreground)]">
          Select a calculator below to get started.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link 
          href="/calculators/date" 
          className="glass-panel p-8 flex flex-col items-center text-center hover:bg-[var(--glass-bg)] transition-all hover:scale-[1.02] cursor-pointer"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <Calendar className="text-primary w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Date Calculators</h2>
          <p className="text-[var(--muted-foreground)]">
            Instantly add or subtract days, weeks, and months from any date. Calculate the exact duration between two dates.
          </p>
        </Link>

        <Link 
          href="/calculators/ev-charging" 
          className="glass-panel p-8 flex flex-col items-center text-center hover:bg-[var(--glass-bg)] transition-all hover:scale-[1.02] cursor-pointer"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <BatteryCharging className="text-primary w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-3">EV Charging Calculator</h2>
          <p className="text-[var(--muted-foreground)]">
            Advanced charging time estimations with power loss and non-linear tapering curves for your electric vehicle.
          </p>
        </Link>

        <Link 
          href="/calculators/astronomy" 
          className="glass-panel p-8 flex flex-col items-center text-center hover:bg-[var(--glass-bg)] transition-all hover:scale-[1.02] cursor-pointer md:col-span-2 lg:col-span-1"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          </div>
          <h2 className="text-2xl font-bold mb-3">Lunar Calculator</h2>
          <p className="text-[var(--muted-foreground)]">
            Calculate precise Moon Phases, Purnima, Amavasya, and Ekadashi dates for any given month or year.
          </p>
        </Link>
        <Link 
          href="/calculators/lunisolar" 
          className="glass-panel p-8 flex flex-col items-center text-center hover:bg-[var(--glass-bg)] transition-all hover:scale-[1.02] cursor-pointer"
        >
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
          </div>
          <h2 className="text-2xl font-bold mb-3">Lunisolar Engine</h2>
          <p className="text-[var(--muted-foreground)]">
            Explore East-Asian solar terms, Stem-Branch years, and traditional Lunisolar festivals.
          </p>
        </Link>
        <Link 
          href="/calculators/abrahamic" 
          className="glass-panel p-8 flex flex-col items-center text-center hover:bg-[var(--glass-bg)] transition-all hover:scale-[1.02] cursor-pointer"
        >
          <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          </div>
          <h2 className="text-2xl font-bold mb-3">Abrahamic Engine</h2>
          <p className="text-[var(--muted-foreground)]">
            Explore Islamic Hijri and Jewish Hebrew traditional calendars and festivals.
          </p>
        </Link>
        <Link 
          href="/calculators/astrology" 
          className="glass-panel p-8 flex flex-col items-center text-center hover:bg-[var(--glass-bg)] transition-all hover:scale-[1.02] cursor-pointer"
        >
          <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
          </div>
          <h2 className="text-2xl font-bold mb-3">Astrology Engine</h2>
          <p className="text-[var(--muted-foreground)]">
            Calculate your Natal Chart, Numerology Life Path, and current planetary retrogrades.
          </p>
        </Link>
      </div>
    </div>
  );
}

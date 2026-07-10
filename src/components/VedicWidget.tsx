"use client";

import { useEffect, useState } from "react";
import { getVedicPanchang, getPlanetaryHour } from "@/lib/vedic";
import { useLocation } from "@/components/location-provider";
import { Moon, Sun, Sparkles, AlertCircle } from "lucide-react";

export default function VedicWidget() {
  const [time, setTime] = useState(new Date());
  const { location } = useLocation();

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const hasCoords = location?.latitude !== undefined && location?.longitude !== undefined;
  
  // Calculate Panchang (does not strictly require coords)
  const panchang = getVedicPanchang(time);
  
  // Calculate Planetary Hour (strictly requires coords for sunrise/sunset)
  let hora = null;
  if (hasCoords) {
    try {
      hora = getPlanetaryHour(time, location.latitude, location.longitude);
    } catch (e) {
      console.warn("Could not calculate planetary hour", e);
    }
  }

  return (
    <div className="glass-panel p-5 flex flex-col justify-between relative overflow-hidden group lg:col-span-4 md:col-span-2 col-span-1 h-full min-h-[160px]">
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-orange-500/10 opacity-50 group-hover:opacity-100 transition-opacity" />
      
      <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-3 relative z-10 flex justify-between items-center">
        <span className="flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-indigo-400" /> Vedic Panchang</span>
        {hora && <span className="bg-[var(--glass-bg)] px-2 py-0.5 rounded text-[10px] text-primary border border-primary/20">
          Vara: {hora.dayLord.name}
        </span>}
      </h3>
      
      <div className="relative z-10 flex-1 flex flex-col justify-between">
        
        {/* Panchang Info */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl font-black tracking-tight">{panchang.tithiName}</span>
            <span className="text-xs font-medium bg-background/50 px-2 py-0.5 rounded-full border border-[var(--glass-border)]">
              {panchang.paksha} Paksha
            </span>
          </div>
          <div className="text-sm font-semibold opacity-80 flex items-center gap-1">
            <Moon className="w-3 h-3" /> Nakshatra: {panchang.nakshatraName}
          </div>
        </div>

        {/* Planetary Hour Info */}
        {hora ? (
          <div className="bg-background/40 p-3 rounded-lg border border-[var(--glass-border)]">
            <div className="text-[10px] uppercase font-bold text-[var(--muted-foreground)] mb-1 flex items-center gap-1">
              {hora.isDaytime ? <Sun className="w-3 h-3 text-yellow-500" /> : <Moon className="w-3 h-3 text-blue-300" />}
              {hora.isDaytime ? "Day" : "Night"} Hora {hora.hourIndex}/12
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-black ${hora.currentRuler.color}`}>
                  {hora.currentRuler.icon}
                </span>
                <div>
                  <div className="text-sm font-bold leading-tight">Hour of {hora.currentRuler.name}</div>
                  <div className="text-xs text-[var(--muted-foreground)] font-mono">
                    {Math.floor(hora.timeRemainingMs / 60000)}m remaining
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-background/40 p-3 rounded-lg border border-[var(--glass-border)] flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Enable location to see your precise Planetary Hour.</span>
          </div>
        )}
        
      </div>
    </div>
  );
}

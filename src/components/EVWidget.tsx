"use client";

import { useEV } from "./ev-provider";
import { BatteryCharging, Clock3, PlayCircle, StopCircle, Zap } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export default function EVWidget() {
  const { isSimulating, isPaused, simSoc, pauseSimulation, resumeSimulation, stopSimulation } = useEV();
  const pathname = usePathname();
  const router = useRouter();

  // Don't show widget if we are already on the EV page, or if not simulating
  if (!isSimulating || pathname === '/calculators/ev-charging') return null;

  return (
    <div className="animate-in slide-in-from-bottom-4 fade-in">
      <div 
        className="glass-panel p-3 pr-4 rounded-full flex items-center gap-4 shadow-lg shadow-black/20 border border-primary/20 bg-[var(--card-bg)]/90 backdrop-blur-xl cursor-pointer hover:border-primary/50 transition-colors"
        onClick={() => router.push('/calculators/ev-charging')}
      >
        <div className="relative flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
          <BatteryCharging className="w-5 h-5 text-primary animate-pulse" />
          <svg className="absolute inset-0 w-full h-full -rotate-90">
             <circle 
               cx="20" cy="20" r="18" 
               stroke="currentColor" 
               strokeWidth="2" 
               fill="none" 
               className="text-primary/20"
             />
             <circle 
               cx="20" cy="20" r="18" 
               stroke="currentColor" 
               strokeWidth="2" 
               fill="none" 
               strokeDasharray="113" 
               strokeDashoffset={113 - (113 * simSoc) / 100}
               className="text-primary transition-all duration-1000"
             />
          </svg>
        </div>
        
        <div className="flex flex-col min-w-[70px]">
          <span className="text-sm font-bold flex items-center gap-1.5 font-mono">
             {simSoc}%
          </span>
          <span className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider flex items-center gap-1">
             <Zap className="w-3 h-3 text-yellow-500" /> Charging
          </span>
        </div>

        <div className="flex items-center gap-1 border-l border-[var(--glass-border)] pl-3" onClick={(e) => e.stopPropagation()}>
          <button 
            onClick={isPaused ? resumeSimulation : pauseSimulation}
            className="p-2 rounded-full hover:bg-[var(--glass-border)] transition-colors text-amber-500 hover:text-amber-400"
          >
            {isPaused ? <PlayCircle className="w-4 h-4" /> : <Clock3 className="w-4 h-4" />}
          </button>
          <button 
            onClick={stopSimulation}
            className="p-2 rounded-full hover:bg-red-500/20 transition-colors text-red-500 hover:text-red-400"
          >
            <StopCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { BatteryCharging, Zap, Info } from "lucide-react";

type CarPreset = { name: string; capacity: number };
const PRESETS: CarPreset[] = [
  { name: "Custom", capacity: 40 },
  { name: "Tata Nexon EV Max", capacity: 40.5 },
  { name: "Tata Punch EV Long Range", capacity: 35 },
  { name: "MG ZS EV", capacity: 50.3 },
  { name: "Tesla Model 3 Long Range", capacity: 82 },
  { name: "Hyundai Ioniq 5", capacity: 72.6 },
];

export default function EVChargingCalculator() {
  const [preset, setPreset] = useState<number>(40.5); // Default Nexon EV Max
  const [capacity, setCapacity] = useState<number>(40.5);
  const [startSoc, setStartSoc] = useState<number>(10);
  const [endSoc, setEndSoc] = useState<number>(100);
  const [chargerKw, setChargerKw] = useState<number>(7.2);
  const [efficiency, setEfficiency] = useState<number>(90); // 10% loss = 90% efficient
  const [curveType, setCurveType] = useState<"conservative" | "aggressive" | "linear">("conservative");

  // Handles preset selection
  const handlePreset = (val: number) => {
    setPreset(val);
    if (val > 0) setCapacity(val);
  };

  const calculateTime = () => {
    if (startSoc >= endSoc) return null;
    
    // Effective kW after charger losses
    const effectiveKw = chargerKw * (efficiency / 100);
    
    // Different phases of charging based on the selected curve
    // returns time in hours
    const calculatePhase = (start: number, end: number, powerMultiplier: number) => {
      if (startSoc >= end || endSoc <= start) return 0;
      const effectiveStart = Math.max(startSoc, start);
      const effectiveEnd = Math.min(endSoc, end);
      const percentToCharge = (effectiveEnd - effectiveStart) / 100;
      const energyNeeded = capacity * percentToCharge;
      const power = effectiveKw * powerMultiplier;
      return energyNeeded / power;
    };

    let totalHours = 0;
    let phases = [];

    if (curveType === "conservative") {
      // Conservative (e.g. Tata Power EZ Charge)
      // 0-80% @ 100% power
      // 80-90% @ 50% power
      // 90-100% @ 25% power
      const phase1 = calculatePhase(0, 80, 1);
      const phase2 = calculatePhase(80, 90, 0.5);
      const phase3 = calculatePhase(90, 100, 0.25);
      
      totalHours = phase1 + phase2 + phase3;
      phases = [
        { name: "Bulk Charge (to 80%)", time: phase1 },
        { name: "Taper (80-90%)", time: phase2 },
        { name: "Trickle (90-100%)", time: phase3 }
      ];
    } else if (curveType === "aggressive") {
      // Aggressive (e.g. Relux Chargers)
      // 0-95% @ 100% power
      // 95-100% @ 50% power
      const phase1 = calculatePhase(0, 95, 1);
      const phase2 = calculatePhase(95, 100, 0.5);
      
      totalHours = phase1 + phase2;
      phases = [
        { name: "Bulk Charge (to 95%)", time: phase1 },
        { name: "Trickle (95-100%)", time: phase2 }
      ];
    } else {
      // Linear (Home AC charging usually doesn't taper much until the very end, effectively linear for math purposes)
      totalHours = calculatePhase(0, 100, 1);
      phases = [{ name: "Constant Charge", time: totalHours }];
    }

    const hrs = Math.floor(totalHours);
    const mins = Math.round((totalHours - hrs) * 60);

    return { hrs, mins, totalHours, phases: phases.filter(p => p.time > 0) };
  };

  const result = calculateTime();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2 text-center flex items-center justify-center gap-2">
        <BatteryCharging className="text-primary" /> EV Charging Time
      </h1>
      <p className="text-center text-[var(--muted-foreground)] mb-8 max-w-2xl mx-auto">
        Calculate precise charging times including power loss, battery taper, and charger limits.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="glass-panel p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">Vehicle Preset</label>
            <select 
              value={preset} 
              onChange={(e) => handlePreset(parseFloat(e.target.value))}
              className="w-full p-2.5 rounded-lg border border-[var(--glass-border)] bg-[var(--background)]/50 focus:ring-2 focus:ring-primary outline-none"
            >
              {PRESETS.map(p => <option key={p.name} value={p.capacity}>{p.name} ({p.capacity} kWh)</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Battery Capacity (kWh)</label>
            <input
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(parseFloat(e.target.value) || 0)}
              className="w-full p-2.5 rounded-lg border border-[var(--glass-border)] bg-[var(--background)]/50 focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start SoC (%)</label>
              <input
                type="number" min="0" max="99"
                value={startSoc}
                onChange={(e) => setStartSoc(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 rounded-lg border border-[var(--glass-border)] bg-[var(--background)]/50 focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End SoC (%)</label>
              <input
                type="number" min="1" max="100"
                value={endSoc}
                onChange={(e) => setEndSoc(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 rounded-lg border border-[var(--glass-border)] bg-[var(--background)]/50 focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Charger Output (kW)</label>
              <input
                type="number" step="0.1"
                value={chargerKw}
                onChange={(e) => setChargerKw(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 rounded-lg border border-[var(--glass-border)] bg-[var(--background)]/50 focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Efficiency (%)</label>
              <input
                type="number" min="50" max="100"
                value={efficiency}
                onChange={(e) => setEfficiency(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 rounded-lg border border-[var(--glass-border)] bg-[var(--background)]/50 focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Charging Curve / Taper</label>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm p-2 rounded border border-[var(--glass-border)] hover:bg-[var(--glass-border)]">
                <input type="radio" checked={curveType === "conservative"} onChange={() => setCurveType("conservative")} className="text-primary" />
                <div>
                  <span className="font-semibold block">Conservative (e.g., Tata EZ Charge)</span>
                  <span className="text-[var(--muted-foreground)] text-xs">Slows at 80%, drops heavily at 90%</span>
                </div>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm p-2 rounded border border-[var(--glass-border)] hover:bg-[var(--glass-border)]">
                <input type="radio" checked={curveType === "aggressive"} onChange={() => setCurveType("aggressive")} className="text-primary" />
                <div>
                  <span className="font-semibold block">Aggressive (e.g., Relux)</span>
                  <span className="text-[var(--muted-foreground)] text-xs">Full speed until 95%, then slows</span>
                </div>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm p-2 rounded border border-[var(--glass-border)] hover:bg-[var(--glass-border)]">
                <input type="radio" checked={curveType === "linear"} onChange={() => setCurveType("linear")} className="text-primary" />
                <div>
                  <span className="font-semibold block">Linear (Home AC)</span>
                  <span className="text-[var(--muted-foreground)] text-xs">Constant speed, ignores tapering</span>
                </div>
              </label>
            </div>
          </div>

        </div>

        {/* Results */}
        <div>
          {result ? (
            <div className="glass-panel p-8 sticky top-24">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Zap className="text-yellow-500" /> Estimated Time
              </h2>
              
              <div className="flex items-end gap-2 mb-8">
                <span className="text-6xl font-bold text-primary font-mono">{result.hrs}</span>
                <span className="text-xl font-medium mb-2 text-[var(--muted-foreground)]">h</span>
                <span className="text-6xl font-bold text-primary font-mono">{result.mins}</span>
                <span className="text-xl font-medium mb-2 text-[var(--muted-foreground)]">m</span>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-sm text-[var(--muted-foreground)] uppercase tracking-wider">Charging Timeline</h3>
                {result.phases.map((phase, i) => (
                  <div key={i} className="flex justify-between items-center border-b border-[var(--glass-border)] pb-2 last:border-0">
                    <span className="font-medium">{phase.name}</span>
                    <span className="font-mono bg-[var(--background)] px-2 py-1 rounded text-sm">
                      {Math.floor(phase.time)}h {Math.round((phase.time - Math.floor(phase.time)) * 60)}m
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 rounded bg-blue-500/10 border border-blue-500/20 text-sm flex gap-3">
                <Info className="shrink-0 text-blue-500 h-5 w-5" />
                <p className="text-[var(--muted-foreground)]">
                  Total energy required is <strong>{((endSoc - startSoc) / 100 * capacity).toFixed(1)} kWh</strong>. 
                  Due to {100 - efficiency}% efficiency loss, you will pull <strong>{((endSoc - startSoc) / 100 * capacity / (efficiency/100)).toFixed(1)} kWh</strong> from the grid.
                </p>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-8 flex items-center justify-center h-full min-h-[300px] text-[var(--muted-foreground)]">
              Start SoC must be less than End SoC
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

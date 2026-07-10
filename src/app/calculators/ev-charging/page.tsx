"use client";

import { useState, useRef, useEffect } from "react";
import { BatteryCharging, Zap, Info, Search, ChevronDown, Activity, PlayCircle, StopCircle, Fuel, AlertTriangle, TrendingDown } from "lucide-react";
import { EV_CARS, EVCar } from "@/lib/ev-cars";

export default function EVChargingCalculator() {
  const [capacity, setCapacity] = useState<number>(40.5);
  const [startSoc, setStartSoc] = useState<number>(10);
  const [endSoc, setEndSoc] = useState<number>(100);
  const [chargerKw, setChargerKw] = useState<number>(7.2);
  const [efficiency, setEfficiency] = useState<number>(90);
  const [curveType, setCurveType] = useState<"conservative" | "aggressive" | "linear">("conservative");

  // Economics
  const [costPerKwh, setCostPerKwh] = useState<number>(8);
  const [currency, setCurrency] = useState<string>("₹");
  const [petrolPrice, setPetrolPrice] = useState<number>(100); // 100 per liter
  const [iceEfficiency, setIceEfficiency] = useState<number>(15); // 15 km/l

  // Searchable Dropdown State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCar, setSelectedCar] = useState<EVCar | null>(null);
  
  // Simulation State
  const [isSimulating, setIsSimulating] = useState(false);
  const [simSoc, setSimSoc] = useState<number>(10);
  const simIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Smart defaults for charger cost
  useEffect(() => {
    if (chargerKw <= 11) {
      setCostPerKwh(8); // Home AC
    } else {
      setCostPerKwh(24); // Fast DC
    }
  }, [chargerKw]);

  const filteredCars = EV_CARS.filter(car => 
    `${car.brand} ${car.model}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCarSelect = (car: EVCar | null) => {
    setSelectedCar(car);
    if (car) {
      setCapacity(car.capacity);
    }
    setIsDropdownOpen(false);
    setSearchQuery("");
  };

  const calculateTime = () => {
    if (startSoc >= endSoc) return null;
    const effectiveKw = chargerKw * (efficiency / 100);
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
      const phase1 = calculatePhase(0, 95, 1);
      const phase2 = calculatePhase(95, 100, 0.5);
      totalHours = phase1 + phase2;
      phases = [
        { name: "Bulk Charge (to 95%)", time: phase1 },
        { name: "Trickle (95-100%)", time: phase2 }
      ];
    } else {
      totalHours = calculatePhase(0, 100, 1);
      phases = [{ name: "Constant Charge", time: totalHours }];
    }

    const hrs = Math.floor(totalHours);
    const mins = Math.round((totalHours - hrs) * 60);
    
    // Economics calculations
    const energyRequiredGrid = ((endSoc - startSoc) / 100) * capacity / (efficiency/100);
    const totalCost = energyRequiredGrid * costPerKwh;
    
    // Range calculations
    const defaultRange = capacity * 6.5; 
    const carRange = selectedCar?.range || defaultRange;
    const rangeGained = carRange * ((endSoc - startSoc) / 100);
    
    // ICE Savings
    const iceFuelRequired = rangeGained / iceEfficiency;
    const iceCost = iceFuelRequired * petrolPrice;
    const savings = iceCost - totalCost;

    return { 
      hrs, 
      mins, 
      totalHours, 
      phases: phases.filter(p => p.time > 0),
      totalCost,
      rangeGained,
      iceCost,
      savings
    };
  };

  const result = calculateTime();

  // Simulation Logic
  const toggleSimulation = async () => {
    if (isSimulating) {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
      setIsSimulating(false);
      return;
    }

    if (!result) return;

    // Check notification permissions
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission !== "granted") {
        await Notification.requestPermission();
      }
    }

    setIsSimulating(true);
    setSimSoc(startSoc);
    
    let currentSoc = startSoc;
    const targetSoc = endSoc;
    
    // Total hours to simulate. We'll map this so that full charge takes ~30 seconds of simulation.
    // So 1 hour of real charging = roughly X seconds in simulation.
    // Instead, we just increase SoC by 1% every interval, adjusting interval speed.
    const intervalSpeed = 500; // ms per tick

    simIntervalRef.current = setInterval(() => {
      currentSoc += 1;
      setSimSoc(currentSoc);

      // Send notification every 10%
      if (currentSoc % 10 === 0 && currentSoc <= targetSoc) {
        if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
          const energyUsedSoFar = ((currentSoc - startSoc) / 100) * capacity / (efficiency/100);
          const currentCost = (energyUsedSoFar * costPerKwh).toFixed(2);
          
          new Notification(`Charging: ${currentSoc}%`, {
            body: `Cost Incurred: ${currency}${currentCost}\nRange Gained: Math.round(..)\nPowering up...`,
            icon: "/favicon.ico"
          });
        }
      }

      if (currentSoc >= targetSoc) {
        if (simIntervalRef.current) clearInterval(simIntervalRef.current);
        setIsSimulating(false);
        if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
           new Notification(`Charging Complete! 🔋`, {
            body: `Reached ${targetSoc}% SoC. Total Cost: ${currency}${result.totalCost.toFixed(2)}`,
            icon: "/favicon.ico"
          });
        }
      }
    }, intervalSpeed);
  };

  useEffect(() => {
    return () => {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-2 text-center flex items-center justify-center gap-2">
        <BatteryCharging className="text-primary" /> EV charging Economics & Dashboard
      </h1>
      <p className="text-center text-[var(--muted-foreground)] mb-8 max-w-2xl mx-auto">
        Calculate precise charging times, realistic range gained, and estimate savings against ICE vehicles.
      </p>

      {startSoc < 20 && (
        <div className="mb-6 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 flex gap-3 items-start animate-in slide-in-from-top-4 fade-in">
          <AlertTriangle className="shrink-0 h-5 w-5 mt-0.5" />
          <div>
            <h4 className="font-semibold">Low Battery Warning (Voltage Sag)</h4>
            <p className="text-sm opacity-90">
              Your starting SoC is {startSoc}%. Driving below 15-20% causes voltage sag, meaning your actual range will drain faster than estimated.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Inputs */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Vehicle Details */}
          <div className="glass-panel p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Zap className="text-primary w-5 h-5"/> Vehicle Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--muted-foreground)] mb-1">Select Vehicle Model</label>
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full text-left bg-background border border-input rounded-xl px-4 py-2 flex items-center justify-between hover:border-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <span className="truncate">{selectedCar ? `${selectedCar.brand} ${selectedCar.model} (${selectedCar.capacity} kWh)` : "Custom Vehicle"}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isDropdownOpen && (
                    <div className="absolute z-10 top-full left-0 right-0 mt-2 bg-background/90 backdrop-blur-2xl border border-[var(--glass-border)] rounded-xl shadow-2xl overflow-hidden max-h-72 flex flex-col ring-1 ring-primary/20">
                      <div className="p-2 border-b border-[var(--glass-border)] bg-background/50">
                        <div className="relative">
                          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <input 
                            type="text" 
                            placeholder="Search Make or Model..."
                            className="w-full bg-background/50 border border-input rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                          />
                        </div>
                      </div>
                      <div className="overflow-y-auto p-2">
                        <button
                          onClick={() => handleCarSelect(null)}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-primary/10 text-sm font-medium transition-colors mb-1"
                        >
                          Custom Vehicle
                        </button>
                        {filteredCars.length === 0 ? (
                          <div className="p-4 text-center text-sm text-muted-foreground">No vehicles found</div>
                        ) : (
                          filteredCars.map((car, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleCarSelect(car)}
                              className="w-full text-left px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors flex justify-between items-center group"
                            >
                              <div className="flex flex-col">
                                <span className="font-semibold text-sm group-hover:text-primary transition-colors">{car.brand} {car.model}</span>
                                <span className="text-xs text-muted-foreground">{car.country} • Est. Range: {car.range}km</span>
                              </div>
                              <span className="text-sm font-mono bg-background px-2 py-1 rounded border border-border">{car.capacity} kWh</span>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Battery Capacity (kWh)</label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-lg border border-[var(--glass-border)] bg-[var(--background)]/50 focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                   <label className="block text-sm font-medium mb-1">Max Range (km)</label>
                    <input
                      type="number" disabled
                      value={selectedCar?.range || Math.round(capacity * 6.5)}
                      className="w-full p-2.5 rounded-lg border border-[var(--glass-border)] bg-[var(--background)]/30 opacity-70 outline-none cursor-not-allowed"
                    />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start SoC (%)</label>
                  <input
                    type="number" min="0" max="99"
                    value={isSimulating ? simSoc : startSoc}
                    onChange={(e) => !isSimulating && setStartSoc(parseFloat(e.target.value) || 0)}
                    disabled={isSimulating}
                    className={`w-full p-2.5 rounded-lg border border-[var(--glass-border)] bg-[var(--background)]/50 focus:ring-2 focus:ring-primary outline-none ${isSimulating ? 'text-primary font-bold animate-pulse' : ''}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End SoC (%)</label>
                  <input
                    type="number" min="1" max="100"
                    value={endSoc}
                    onChange={(e) => setEndSoc(parseFloat(e.target.value) || 0)}
                    disabled={isSimulating}
                    className="w-full p-2.5 rounded-lg border border-[var(--glass-border)] bg-[var(--background)]/50 focus:ring-2 focus:ring-primary outline-none disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Grid & Economics */}
          <div className="glass-panel p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Activity className="text-primary w-5 h-5"/> Grid & Economics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <label className="block text-sm font-medium mb-1">Electricity Cost ({currency}/kWh)</label>
                  <input
                    type="number" step="0.1"
                    value={costPerKwh}
                    onChange={(e) => setCostPerKwh(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-lg border border-[var(--glass-border)] bg-[var(--background)]/50 focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Petrol/ICE Cost ({currency}/L)</label>
                  <input
                    type="number" step="1"
                    value={petrolPrice}
                    onChange={(e) => setPetrolPrice(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-lg border border-[var(--glass-border)] bg-[var(--background)]/50 focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">ICE Efficiency (km/L)</label>
                  <input
                    type="number" step="1"
                    value={iceEfficiency}
                    onChange={(e) => setIceEfficiency(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-lg border border-[var(--glass-border)] bg-[var(--background)]/50 focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
            </div>
          </div>
          
        </div>

        {/* Right Column: Results Dashboard */}
        <div className="lg:col-span-5">
          {result ? (
            <div className="glass-panel p-6 lg:p-8 sticky top-24 flex flex-col h-full space-y-8">
              
              {/* Primary Time Result */}
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Zap className="text-yellow-500" /> Estimated Time
                </h2>
                <div className="flex items-end gap-2">
                  <span className="text-6xl font-bold text-primary font-mono">{result.hrs}</span>
                  <span className="text-xl font-medium mb-2 text-[var(--muted-foreground)]">h</span>
                  <span className="text-6xl font-bold text-primary font-mono">{result.mins}</span>
                  <span className="text-xl font-medium mb-2 text-[var(--muted-foreground)]">m</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-[var(--card-bg)] border border-[var(--glass-border)] p-4 rounded-xl">
                    <p className="text-sm text-[var(--muted-foreground)] mb-1 uppercase tracking-wider">Range Gained</p>
                    <p className="text-2xl font-bold text-green-500 font-mono">+{Math.round(result.rangeGained)} km</p>
                 </div>
                 <div className="bg-[var(--card-bg)] border border-[var(--glass-border)] p-4 rounded-xl">
                    <p className="text-sm text-[var(--muted-foreground)] mb-1 uppercase tracking-wider">Total Cost</p>
                    <p className="text-2xl font-bold text-red-400 font-mono">{currency}{result.totalCost.toFixed(2)}</p>
                 </div>
              </div>

              {/* ICE Savings */}
              <div className="bg-[var(--card-bg)] border border-[var(--glass-border)] p-5 rounded-xl shadow-inner relative overflow-hidden">
                <div className="absolute -right-4 -top-4 opacity-10">
                  <TrendingDown className="w-24 h-24 text-green-500" />
                </div>
                <h3 className="font-semibold text-[var(--muted-foreground)] flex items-center gap-2 mb-3">
                  <Fuel className="w-4 h-4" /> ICE Comparison
                </h3>
                {result.savings > 0 ? (
                  <>
                    <p className="text-4xl font-bold text-green-500 font-mono mb-2">+{currency}{Math.round(result.savings)}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">Saved compared to driving the same {Math.round(result.rangeGained)}km in an ICE vehicle (which would cost {currency}{Math.round(result.iceCost)}).</p>
                  </>
                ) : (
                  <>
                    <p className="text-4xl font-bold text-red-500 font-mono mb-2">{currency}{Math.round(result.savings)}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">EV Charging is currently more expensive than ICE fuel for this session.</p>
                  </>
                )}
              </div>

              <div className="flex-grow" />

              <button 
                onClick={toggleSimulation}
                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                  isSimulating 
                    ? 'bg-red-500/20 text-red-500 border border-red-500 hover:bg-red-500/30' 
                    : 'bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/25 hover:shadow-primary/40'
                }`}
              >
                {isSimulating ? (
                  <><StopCircle className="w-6 h-6 animate-pulse" /> Stop Simulation</>
                ) : (
                  <><PlayCircle className="w-6 h-6" /> Simulate Charging Now</>
                )}
              </button>

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

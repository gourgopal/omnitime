"use client";

import { useEV } from "./ev-provider";
import { BatteryCharging, Clock, DollarSign, X, Zap } from "lucide-react";
import { useEffect, useState } from "react";

export default function EVSummaryModal() {
  const { completedSummary, setCompletedSummary } = useEV();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (completedSummary) {
      setIsVisible(true);
    }
  }, [completedSummary]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      setCompletedSummary(null);
    }, 300); // Wait for fade out animation
  };

  if (!completedSummary && !isVisible) return null;

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className={`relative w-full max-w-md bg-[var(--card-bg)] border border-[var(--glass-border)] shadow-2xl rounded-2xl overflow-hidden transition-transform duration-300 ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
        
        {/* Header */}
        <div className="bg-gradient-to-br from-green-500/20 to-primary/20 p-6 flex flex-col items-center justify-center border-b border-[var(--glass-border)]">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-3">
            <BatteryCharging className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold">Charging Complete!</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Reached {completedSummary?.endSoc}% SoC
          </p>
        </div>

        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-background/50 hover:bg-background/80 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Details */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-background/50 border border-[var(--glass-border)] rounded-xl p-4 flex flex-col items-center justify-center text-center">
              <Zap className="w-6 h-6 text-yellow-500 mb-2" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Energy</span>
              <span className="text-lg font-bold font-mono">+{completedSummary?.energy} kWh</span>
            </div>
            <div className="bg-background/50 border border-[var(--glass-border)] rounded-xl p-4 flex flex-col items-center justify-center text-center">
              <DollarSign className="w-6 h-6 text-green-500 mb-2" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Cost</span>
              <span className="text-lg font-bold font-mono">₹{completedSummary?.cost}</span>
            </div>
            <div className="bg-background/50 border border-[var(--glass-border)] rounded-xl p-4 flex flex-col items-center justify-center text-center">
              <Clock className="w-6 h-6 text-blue-500 mb-2" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Time Taken</span>
              <span className="text-lg font-bold font-mono">{completedSummary?.timeMins} min</span>
            </div>
            <div className="bg-background/50 border border-[var(--glass-border)] rounded-xl p-4 flex flex-col items-center justify-center text-center">
              <BatteryCharging className="w-6 h-6 text-purple-500 mb-2" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Range Added</span>
              <span className="text-lg font-bold font-mono">+{completedSummary?.rangeGained} km</span>
            </div>
          </div>
          
          <button 
            onClick={handleClose}
            className="w-full mt-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
          >
            Dismiss
          </button>
        </div>
        
      </div>
    </div>
  );
}

"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type ChargeHistoryItem = {
  id: string;
  date: Date;
  startSoc: number;
  endSoc: number;
  cost: string;
  energy: string;
  timeMins: number;
  rangeGained: number;
};

type EVContextType = {
  isSimulating: boolean;
  isPaused: boolean;
  simSoc: number;
  chargeHistory: ChargeHistoryItem[];
  setChargeHistory: React.Dispatch<React.SetStateAction<ChargeHistoryItem[]>>;
  startSimulation: (payload: any) => void;
  stopSimulation: () => void;
  pauseSimulation: () => void;
  resumeSimulation: () => void;
  clearHistory: () => void;
};

const EVContext = createContext<EVContextType | undefined>(undefined);

export function EVProvider({ children }: { children: React.ReactNode }) {
  const [isSimulating, setIsSimulating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [simSoc, setSimSoc] = useState(10);
  const [chargeHistory, setChargeHistory] = useState<ChargeHistoryItem[]>([]);
  
  const [activeSession, setActiveSession] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('evChargeHistory');
    if (saved) {
      try {
        const parsed = JSON.parse(saved).map((item: any) => ({
          ...item,
          date: new Date(item.date)
        }));
        setChargeHistory(parsed);
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (chargeHistory.length > 0) {
      localStorage.setItem('evChargeHistory', JSON.stringify(chargeHistory));
    }
  }, [chargeHistory]);

  const postToSW = (type: string, payload: any = {}) => {
    if (typeof window !== "undefined" && navigator.serviceWorker) {
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type, payload });
      } else {
        navigator.serviceWorker.ready.then(reg => {
          if (reg.active) {
            reg.active.postMessage({ type, payload });
          }
        });
      }
    }
  };

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    
    const handleMessage = (event: MessageEvent) => {
      const { type, payload } = event.data;
      if (type === 'SYNC_STATE') {
        setIsSimulating(payload.isSimulating);
        setIsPaused(payload.isPaused);
        if (payload.currentSoc !== undefined) setSimSoc(payload.currentSoc);
        if (payload.payload) setActiveSession(payload.payload); // Sync active payload too
      } else if (type === 'PROGRESS') {
        setSimSoc(payload.currentSoc);
      } else if (type === 'STOPPED') {
        setIsSimulating(false);
        setIsPaused(false);
        setSimSoc(payload.finalSoc);
        window.dispatchEvent(new CustomEvent('stop-music'));
        
        setActiveSession((currentSession: any) => {
          if (currentSession && currentSession.startSoc < payload.finalSoc) {
             const startSoc = currentSession.startSoc;
             const finalSoc = payload.finalSoc;
             const capacity = currentSession.capacity;
             const efficiency = currentSession.efficiency;
             const customRange = currentSession.customRange;
             const chargerKw = currentSession.chargerKw;
             const costPerKwh = currentSession.costPerKwh;
             
             const energyUsedSoFar = ((finalSoc - startSoc) / 100) * capacity / (efficiency/100);
             const currentCost = (energyUsedSoFar * costPerKwh).toFixed(2);
             const rangeGained = Math.round(((finalSoc - startSoc) / 100) * customRange);
             const effectiveKw = chargerKw * (efficiency / 100);
             const timeHrs = energyUsedSoFar / effectiveKw;
             const mins = Math.round(timeHrs * 60);
             
             setChargeHistory(prev => [{
                id: Date.now().toString(),
                date: new Date(),
                startSoc,
                endSoc: finalSoc,
                cost: currentCost,
                energy: energyUsedSoFar.toFixed(1),
                timeMins: mins,
                rangeGained
             }, ...prev]);
          }
          return null; 
        });
      } else if (type === 'PAUSED') {
        setIsPaused(true);
      } else if (type === 'RESUMED') {
        setIsPaused(false);
      }
    };
    
    navigator.serviceWorker.addEventListener('message', handleMessage);
    postToSW('SYNC');
    
    return () => navigator.serviceWorker.removeEventListener('message', handleMessage);
  }, []);

  const startSimulation = async (payload: any) => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission !== "granted") {
        await Notification.requestPermission();
      }
    }
    setIsSimulating(true);
    setIsPaused(false);
    setSimSoc(payload.startSoc);
    setActiveSession(payload);
    postToSW('START', payload);
    window.dispatchEvent(new CustomEvent('play-music'));
  };

  const stopSimulation = () => {
    postToSW('STOP');
  };

  const pauseSimulation = () => {
    postToSW('PAUSE');
  };

  const resumeSimulation = () => {
    postToSW('RESUME');
  };

  const clearHistory = () => {
    setChargeHistory([]);
    localStorage.removeItem('evChargeHistory');
  }

  return (
    <EVContext.Provider value={{
      isSimulating,
      isPaused,
      simSoc,
      chargeHistory,
      setChargeHistory,
      startSimulation,
      stopSimulation,
      pauseSimulation,
      resumeSimulation,
      clearHistory
    }}>
      {children}
    </EVContext.Provider>
  );
}

export function useEV() {
  const context = useContext(EVContext);
  if (context === undefined) {
    throw new Error("useEV must be used within an EVProvider");
  }
  return context;
}

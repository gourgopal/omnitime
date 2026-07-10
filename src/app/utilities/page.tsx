"use client";

import { useState, useEffect, useRef } from "react";
import { Timer as TimerIcon, Play, Pause, Square, RotateCcw } from "lucide-react";

export default function Utilities() {
  const [tab, setTab] = useState<"stopwatch" | "timer">("stopwatch");

  // Stopwatch State
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
  const stopwatchRef = useRef<NodeJS.Timeout | null>(null);

  // Timer State
  const [timerInput, setTimerInput] = useState({ h: 0, m: 5, s: 0 });
  const [timerTime, setTimerTime] = useState(300); // in seconds
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Stopwatch Logic
  useEffect(() => {
    if (isStopwatchRunning) {
      stopwatchRef.current = setInterval(() => {
        setStopwatchTime((prev) => prev + 10);
      }, 10);
    } else {
      if (stopwatchRef.current) clearInterval(stopwatchRef.current);
    }
    return () => {
      if (stopwatchRef.current) clearInterval(stopwatchRef.current);
    };
  }, [isStopwatchRunning]);

  const formatStopwatch = (time: number) => {
    const ms = Math.floor((time % 1000) / 10);
    const s = Math.floor((time / 1000) % 60);
    const m = Math.floor((time / 60000) % 60);
    const h = Math.floor(time / 3600000);

    return `${h > 0 ? `${h.toString().padStart(2, "0")}:` : ""}${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
  };

  // Timer Logic
  useEffect(() => {
    if (isTimerRunning && timerTime > 0) {
      timerRef.current = setInterval(() => {
        setTimerTime((prev) => prev - 1);
      }, 1000);
    } else if (timerTime <= 0) {
      setIsTimerRunning(false);
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, timerTime]);

  const setTimerFromInput = () => {
    setTimerTime(timerInput.h * 3600 + timerInput.m * 60 + timerInput.s);
  };

  const formatTimer = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? `${h.toString().padStart(2, "0")}:` : ""}${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center flex items-center justify-center gap-2">
        <TimerIcon className="text-primary" /> Timers & Stopwatch
      </h1>

      <div className="flex justify-center gap-4 mb-8">
        <button
          className={`px-6 py-2 rounded-full font-medium transition-colors ${tab === "stopwatch" ? "bg-primary text-white shadow-lg" : "bg-[var(--glass-bg)] hover:bg-black/10 dark:hover:bg-white/10"}`}
          onClick={() => setTab("stopwatch")}
        >
          Stopwatch
        </button>
        <button
          className={`px-6 py-2 rounded-full font-medium transition-colors ${tab === "timer" ? "bg-primary text-white shadow-lg" : "bg-[var(--glass-bg)] hover:bg-black/10 dark:hover:bg-white/10"}`}
          onClick={() => setTab("timer")}
        >
          Timer
        </button>
      </div>

      <div className="glass-panel p-8 text-center flex flex-col items-center">
        {tab === "stopwatch" && (
          <div className="space-y-8 w-full max-w-md mx-auto">
            <div className="text-6xl md:text-8xl font-bold font-mono tracking-tighter text-primary">
              {formatStopwatch(stopwatchTime)}
            </div>
            
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setIsStopwatchRunning(!isStopwatchRunning)}
                className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center hover:bg-blue-600 transition-colors shadow-lg"
              >
                {isStopwatchRunning ? <Pause size={24} /> : <Play size={24} />}
              </button>
              <button
                onClick={() => {
                  setIsStopwatchRunning(false);
                  setStopwatchTime(0);
                }}
                className="w-16 h-16 rounded-full bg-[var(--background)] border border-[var(--glass-border)] flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors shadow-lg"
              >
                <Square size={20} />
              </button>
            </div>
          </div>
        )}

        {tab === "timer" && (
          <div className="space-y-8 w-full max-w-md mx-auto">
            {!isTimerRunning && timerTime === 0 ? (
              <div className="flex justify-center gap-4 text-left">
                <div>
                  <label className="block text-xs mb-1">Hrs</label>
                  <input type="number" min="0" value={timerInput.h} onChange={(e) => setTimerInput({ ...timerInput, h: parseInt(e.target.value) || 0 })} className="w-16 p-2 rounded-lg bg-[var(--background)] border border-[var(--glass-border)] text-center text-xl" />
                </div>
                <div>
                  <label className="block text-xs mb-1">Min</label>
                  <input type="number" min="0" max="59" value={timerInput.m} onChange={(e) => setTimerInput({ ...timerInput, m: parseInt(e.target.value) || 0 })} className="w-16 p-2 rounded-lg bg-[var(--background)] border border-[var(--glass-border)] text-center text-xl" />
                </div>
                <div>
                  <label className="block text-xs mb-1">Sec</label>
                  <input type="number" min="0" max="59" value={timerInput.s} onChange={(e) => setTimerInput({ ...timerInput, s: parseInt(e.target.value) || 0 })} className="w-16 p-2 rounded-lg bg-[var(--background)] border border-[var(--glass-border)] text-center text-xl" />
                </div>
              </div>
            ) : (
              <div className="text-6xl md:text-8xl font-bold font-mono tracking-tighter text-primary">
                {formatTimer(timerTime)}
              </div>
            )}
            
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  if (!isTimerRunning && timerTime === 0) setTimerFromInput();
                  setIsTimerRunning(!isTimerRunning);
                }}
                className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center hover:bg-blue-600 transition-colors shadow-lg"
              >
                {isTimerRunning ? <Pause size={24} /> : <Play size={24} />}
              </button>
              <button
                onClick={() => {
                  setIsTimerRunning(false);
                  setTimerTime(0);
                }}
                className="w-16 h-16 rounded-full bg-[var(--background)] border border-[var(--glass-border)] flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors shadow-lg"
              >
                <RotateCcw size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

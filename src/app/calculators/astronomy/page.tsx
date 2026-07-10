"use client";

import { useState, useEffect } from "react";
import { Moon, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { getMonthEvents } from "@/lib/astronomy";
import { format } from "date-fns";

export default function LunarCalculator() {
  const [mounted, setMounted] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl text-center min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse">Loading Lunar Data...</div>
      </div>
    );
  }

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const events = getMonthEvents(year, month);

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
          <Moon className="text-primary w-10 h-10" />
          Lunar & Ekadashi Calculator
        </h1>
        <p className="text-lg text-[var(--muted-foreground)]">
          Explore Moon Phases and Ekadashi fasting dates for any month in history or the future.
        </p>
      </div>

      <div className="glass-panel p-8">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-[var(--glass-border)]">
          <button 
            onClick={handlePrevMonth}
            className="p-2 hover:bg-[var(--glass-bg)] rounded-full transition-colors flex items-center gap-2"
          >
            <ChevronLeft /> <span className="hidden sm:inline">Previous</span>
          </button>
          
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <CalendarIcon className="text-primary" />
            {format(currentDate, "MMMM yyyy")}
          </h2>

          <button 
            onClick={handleNextMonth}
            className="p-2 hover:bg-[var(--glass-bg)] rounded-full transition-colors flex items-center gap-2"
          >
            <span className="hidden sm:inline">Next</span> <ChevronRight />
          </button>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-12 text-[var(--muted-foreground)]">
            No major lunar events found in this month.
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-[var(--background)] transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    event.type === 'ekadashi' ? 'bg-yellow-500/10 text-yellow-500' : 
                    event.type === 'sankranti' ? 'bg-orange-500/10 text-orange-500' : 
                    'bg-blue-500/10 text-blue-500'
                  }`}>
                    {event.type === 'ekadashi' ? <StarIcon /> : event.type === 'sankranti' ? <SunIcon /> : <MoonIcon />}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{event.name}</h3>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {event.type === 'ekadashi' ? (
                        event.astronomicalStart && event.date.getDate() !== event.astronomicalStart.getDate() 
                          ? "Shifted to Dwadashi (Vaishnava Rule)" 
                          : "Traditional Fasting Day"
                      ) : "Astronomical Peak"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">{format(event.date, "MMM do, yyyy")}</div>
                  <div className="text-sm text-[var(--muted-foreground)]">
                    {event.type === 'ekadashi' && event.astronomicalStart ? (
                      `Tithi Starts: ${format(event.astronomicalStart, "hh:mm a")}`
                    ) : (
                      format(event.date, "hh:mm a")
                    )}
                  </div>
              </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
  );
}

function MoonIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
  );
}

function SunIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
  );
}

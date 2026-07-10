"use client";

import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Moon, Star, Hexagon } from "lucide-react";
import { format } from "date-fns";
import { getMonthlyAbrahamicEvents, getAbrahamicInfo } from "@/lib/abrahamic";

export default function AbrahamicCalculator() {
  const [mounted, setMounted] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl text-center min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <Moon className="w-12 h-12 text-blue-500 opacity-50 mb-4 animate-spin-slow" />
          <div className="text-xl text-[var(--muted-foreground)]">Aligning Calendars...</div>
        </div>
      </div>
    );
  }

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const events = getMonthlyAbrahamicEvents(year, month);
  const currentInfo = getAbrahamicInfo(new Date());

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
          <Moon className="text-emerald-500 w-10 h-10" />
          <Hexagon className="text-blue-500 w-10 h-10" />
          The Abrahamic Engine
        </h1>
        <p className="text-lg text-[var(--muted-foreground)]">
          Explore the Islamic Hijri and Jewish Hebrew traditional calendars and festivals.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="glass-panel p-6 bg-gradient-to-br from-background to-emerald-500/10 border-l-4 border-emerald-500">
          <h3 className="text-sm uppercase tracking-wider text-[var(--muted-foreground)] mb-4">Today's Islamic Date (Hijri)</h3>
          <div className="text-2xl font-bold mb-2 text-emerald-600 dark:text-emerald-400">
            {currentInfo.islamicDate}
          </div>
          <p className="text-md opacity-80">
            Umm al-Qura Calendar
          </p>
        </div>

        <div className="glass-panel p-6 bg-gradient-to-br from-background to-blue-500/10 border-l-4 border-blue-500">
          <h3 className="text-sm uppercase tracking-wider text-[var(--muted-foreground)] mb-4">Today's Jewish Date (Hebrew)</h3>
          <div className="text-2xl font-bold mb-2 text-blue-600 dark:text-blue-400">
            {currentInfo.hebrewDate}
          </div>
          <p className="text-md opacity-80">
            Traditional Hebrew Calendar
          </p>
        </div>
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
            No major calendar events found in this month.
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-[var(--background)] transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    event.type === 'festival' ? 'bg-amber-500/10 text-amber-500' : 
                    event.type === 'islamic-month' ? 'bg-emerald-500/10 text-emerald-500' :
                    'bg-blue-500/10 text-blue-500'
                  }`}>
                    {event.type === 'festival' ? <Star className="w-6 h-6" /> : 
                     event.type === 'islamic-month' ? <Moon className="w-6 h-6" /> :
                     <Hexagon className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{event.name}</h3>
                    <p className="text-sm text-[var(--muted-foreground)] capitalize">
                      {event.type.replace("-", " ")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">{format(event.date, "MMM do, yyyy")}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

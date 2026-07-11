"use client";

import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Leaf, Star, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { getMonthlyLunisolarEvents, getLunisolarInfo } from "@/lib/lunisolar";
import { useLocation } from "@/components/location-provider";

export default function LunisolarCalculator() {
  const [mounted, setMounted] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const { location, isLoading: locationLoading } = useLocation();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl text-center min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <Leaf className="w-12 h-12 text-green-500 opacity-50 mb-4 animate-spin-slow" />
          <div className="text-xl text-[var(--muted-foreground)]">Aligning Stems and Branches...</div>
        </div>
      </div>
    );
  }

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // If no location, we fallback to a central location for rough calculation
  const lat = location?.latitude ?? 23.42; 
  const lon = location?.longitude ?? 88.39;

  const events = getMonthlyLunisolarEvents(year, month, lat, lon);
  const currentInfo = getLunisolarInfo(new Date());

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
          <Leaf className="text-green-500 w-10 h-10" />
          East-Asian Lunisolar Engine
        </h1>
        <p className="text-lg text-[var(--muted-foreground)]">
          Explore Traditional Chinese, Korean, and Japanese Solar Terms, Stem-Branch years, and Festivals.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="glass-panel p-6 bg-gradient-to-br from-background to-green-500/10">
          <h3 className="text-sm uppercase tracking-wider text-[var(--muted-foreground)] mb-4">Current Year Element & Zodiac</h3>
          <div className="text-4xl font-bold mb-2 text-green-600 dark:text-green-400">
            {currentInfo.yearStemBranch}
          </div>
          <p className="text-lg opacity-80">
            The Year of the {currentInfo.yearZodiac}
          </p>
        </div>

        <div className="glass-panel p-6 border-l-4 border-red-500">
          <h3 className="text-sm uppercase tracking-wider text-[var(--muted-foreground)] mb-4">Today's Traditional Date</h3>
          <div className="text-2xl font-bold mb-2">
            Month {currentInfo.lunarMonthName}, Day {currentInfo.lunarDayName}
          </div>
          {currentInfo.festivals.length > 0 && (
            <div className="mt-4 p-3 bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg inline-block font-semibold">
              <Star className="inline w-4 h-4 mr-2" />
              {currentInfo.festivals.join(", ")}
            </div>
          )}
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
            <CalendarIcon className="text-green-500" />
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
            No solar terms or festivals found in this month.
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-[var(--background)] transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    event.type === 'festival' ? 'bg-red-500/10 text-red-500' : 
                    event.type === 'vedic-festival' ? 'bg-amber-500/20 text-amber-500' :
                    'bg-green-500/10 text-green-500'
                  }`}>
                    {event.type === 'festival' ? <Star className="w-6 h-6" /> : 
                     event.type === 'vedic-festival' ? <Sparkles className="w-6 h-6 animate-pulse" /> :
                     <Sparkles className="w-6 h-6" />}
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

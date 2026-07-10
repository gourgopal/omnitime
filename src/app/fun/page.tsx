"use client";

import { useState, useEffect } from "react";
import { differenceInDays, differenceInYears, format } from "date-fns";
import { Heart, Sparkles, Gift } from "lucide-react";

export default function FunCalculators() {
  const [tab, setTab] = useState<"age" | "relationship" | "countdown">("age");

  // Age State
  const [dob, setDob] = useState("1995-01-01");
  const [ageDays, setAgeDays] = useState(0);
  const [ageYears, setAgeYears] = useState(0);

  // Relationship State
  const [relationshipDate, setRelationshipDate] = useState("2020-01-01");
  const [relDays, setRelDays] = useState(0);

  // Countdown State
  const [targetDate, setTargetDate] = useState(format(new Date(new Date().getFullYear(), 11, 31), "yyyy-MM-dd"));
  const [daysToGo, setDaysToGo] = useState(0);

  useEffect(() => {
    // Calculate Age
    if (dob) {
      const birth = new Date(dob);
      const today = new Date();
      setAgeDays(differenceInDays(today, birth));
      setAgeYears(differenceInYears(today, birth));
    }
  }, [dob]);

  useEffect(() => {
    if (relationshipDate) {
      const start = new Date(relationshipDate);
      const today = new Date();
      setRelDays(differenceInDays(today, start));
    }
  }, [relationshipDate]);

  useEffect(() => {
    if (targetDate) {
      const target = new Date(targetDate);
      const today = new Date();
      setDaysToGo(differenceInDays(target, today));
    }
  }, [targetDate]);

  const getRelationshipAdvice = (days: number) => {
    if (days < 0) return "Not yet started!";
    if (days < 100) return "Still in the honeymoon phase! Enjoy every moment.";
    if (days % 1000 === 0 && days > 0) return `Wow! ${days} days! Time for a massive celebration or a special trip!`;
    if (days % 100 === 0 && days > 0) return `Happy ${days} days! Go for a nice dinner.`;
    return `Every day is a gift. You've been together for ${days} days. Keep the spark alive with a coffee date!`;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center flex items-center justify-center gap-2">
        <Sparkles className="text-primary" /> Fun & Life Events
      </h1>

      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <button
          className={`px-6 py-2 rounded-full font-medium transition-colors ${tab === "age" ? "bg-primary text-white shadow-lg" : "bg-[var(--glass-bg)] hover:bg-black/10 dark:hover:bg-white/10"}`}
          onClick={() => setTab("age")}
        >
          Age Calculator
        </button>
        <button
          className={`px-6 py-2 rounded-full font-medium transition-colors ${tab === "relationship" ? "bg-primary text-white shadow-lg" : "bg-[var(--glass-bg)] hover:bg-black/10 dark:hover:bg-white/10"}`}
          onClick={() => setTab("relationship")}
        >
          Relationship Counter
        </button>
        <button
          className={`px-6 py-2 rounded-full font-medium transition-colors ${tab === "countdown" ? "bg-primary text-white shadow-lg" : "bg-[var(--glass-bg)] hover:bg-black/10 dark:hover:bg-white/10"}`}
          onClick={() => setTab("countdown")}
        >
          Days to Go
        </button>
      </div>

      <div className="glass-panel p-8">
        {tab === "age" && (
          <div className="space-y-6 text-center">
            <h2 className="text-2xl font-semibold mb-6">How old are you really?</h2>
            <div className="flex justify-center mb-6">
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full md:w-1/2 p-3 rounded-lg border border-[var(--glass-border)] bg-[var(--background)]/50 focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            {dob && (
              <div className="animate-in fade-in zoom-in duration-500 mt-8">
                <div className="text-5xl md:text-7xl font-bold text-primary mb-2">
                  {ageDays.toLocaleString()}
                </div>
                <div className="text-xl text-[var(--muted-foreground)]">days old</div>
                <div className="mt-4 text-lg">
                  That's approximately <span className="font-bold text-[var(--foreground)]">{ageYears}</span> years!
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "relationship" && (
          <div className="space-y-6 text-center">
            <h2 className="text-2xl font-semibold flex items-center justify-center gap-2 mb-6">
              <Heart className="text-red-500" fill="currentColor" /> Relationship Counter
            </h2>
            <div className="flex justify-center mb-6">
              <input
                type="date"
                value={relationshipDate}
                onChange={(e) => setRelationshipDate(e.target.value)}
                className="w-full md:w-1/2 p-3 rounded-lg border border-[var(--glass-border)] bg-[var(--background)]/50 focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            {relationshipDate && (
              <div className="animate-in fade-in zoom-in duration-500 mt-8">
                <div className="text-xl mb-2">Together for</div>
                <div className="text-5xl md:text-7xl font-bold text-red-500 mb-6">
                  {relDays.toLocaleString()} <span className="text-3xl">days</span>
                </div>
                <div className="p-6 bg-[var(--background)]/50 rounded-xl border border-[var(--glass-border)]">
                  <p className="text-lg italic font-medium">"{getRelationshipAdvice(relDays)}"</p>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "countdown" && (
          <div className="space-y-6 text-center">
            <h2 className="text-2xl font-semibold flex items-center justify-center gap-2 mb-6">
              <Gift className="text-primary" /> Countdown to Special Date
            </h2>
            <div className="flex justify-center mb-6">
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full md:w-1/2 p-3 rounded-lg border border-[var(--glass-border)] bg-[var(--background)]/50 focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            {targetDate && (
              <div className="animate-in fade-in zoom-in duration-500 mt-8">
                {daysToGo > 0 ? (
                  <>
                    <div className="text-5xl md:text-7xl font-bold text-primary mb-2">
                      {daysToGo.toLocaleString()}
                    </div>
                    <div className="text-xl text-[var(--muted-foreground)]">days to go!</div>
                  </>
                ) : daysToGo === 0 ? (
                  <div className="text-5xl font-bold text-green-500">It's Today!</div>
                ) : (
                  <>
                    <div className="text-5xl md:text-7xl font-bold text-primary mb-2">
                      {Math.abs(daysToGo).toLocaleString()}
                    </div>
                    <div className="text-xl text-[var(--muted-foreground)]">days ago</div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

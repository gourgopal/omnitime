"use client";

import { useState } from "react";
import { add, sub, differenceInDays, differenceInWeeks, differenceInMonths, differenceInYears, format } from "date-fns";
import { Calendar, Calculator, Plus, Minus, CalendarDays, Clock, ArrowRight } from "lucide-react";

export default function DateCalculator() {
  const [tab, setTab] = useState<"add-sub" | "diff">("add-sub");

  // State for Add/Subtract
  const [baseDate, setBaseDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [operation, setOperation] = useState<"add" | "sub">("add");
  const [amount, setAmount] = useState({ years: 0, months: 0, weeks: 0, days: 0 });
  const [resultDate, setResultDate] = useState<Date | null>(null);

  // State for Difference
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const calculateAddSub = () => {
    try {
      const date = new Date(baseDate);
      const res = operation === "add" ? add(date, amount) : sub(date, amount);
      setResultDate(res);
    } catch (e) {
      setResultDate(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
          <CalendarDays className="text-primary w-10 h-10" />
          Date Calculator
        </h1>
        <p className="text-lg text-[var(--muted-foreground)]">
          Easily compute future/past dates or find the exact difference between two days.
        </p>
      </div>

      <div className="flex justify-center mb-8 space-x-4">
        <button
          className={`px-6 py-3 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${tab === "add-sub" ? "bg-primary text-white shadow-lg" : "bg-[var(--glass-bg)] hover:bg-black/10 dark:hover:bg-white/10"}`}
          onClick={() => setTab("add-sub")}
        >
          <Calculator className="w-4 h-4" /> Add / Subtract Days
        </button>
        <button
          className={`px-6 py-3 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${tab === "diff" ? "bg-primary text-white shadow-lg" : "bg-[var(--glass-bg)] hover:bg-black/10 dark:hover:bg-white/10"}`}
          onClick={() => setTab("diff")}
        >
          <Clock className="w-4 h-4" /> Date Difference
        </button>
      </div>

      <div className="glass-panel p-8 max-w-2xl mx-auto">
        {tab === "add-sub" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <div>
              <label className="block text-sm font-medium mb-3 text-[var(--muted-foreground)] uppercase tracking-wider">Start Date</label>
              <input
                type="date"
                value={baseDate}
                onChange={(e) => setBaseDate(e.target.value)}
                className="w-full p-4 rounded-xl border border-[var(--glass-border)] bg-[var(--background)]/80 focus:ring-2 focus:ring-primary outline-none text-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-3 text-[var(--muted-foreground)] uppercase tracking-wider">Operation</label>
              <div className="flex gap-4">
                <button 
                  onClick={() => setOperation("add")}
                  className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${operation === "add" ? "border-green-500 bg-green-500/10 text-green-600 dark:text-green-400 font-bold" : "border-[var(--glass-border)] bg-[var(--background)]/50 hover:bg-black/5 dark:hover:bg-white/5"}`}
                >
                  <Plus className="w-5 h-5" /> Add Time
                </button>
                <button 
                  onClick={() => setOperation("sub")}
                  className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${operation === "sub" ? "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400 font-bold" : "border-[var(--glass-border)] bg-[var(--background)]/50 hover:bg-black/5 dark:hover:bg-white/5"}`}
                >
                  <Minus className="w-5 h-5" /> Subtract Time
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-3 text-[var(--muted-foreground)] uppercase tracking-wider">Amount</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {['years', 'months', 'weeks', 'days'].map((unit) => (
                  <div key={unit} className="bg-[var(--background)]/50 p-3 rounded-xl border border-[var(--glass-border)] focus-within:ring-2 ring-primary">
                    <label className="block text-xs font-medium mb-1 text-[var(--muted-foreground)] capitalize">{unit}</label>
                    <input
                      type="number"
                      min="0"
                      value={amount[unit as keyof typeof amount] || ''}
                      placeholder="0"
                      onChange={(e) => setAmount({ ...amount, [unit]: parseInt(e.target.value) || 0 })}
                      className="w-full bg-transparent border-none focus:outline-none text-xl font-bold"
                    />
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={calculateAddSub}
              className="w-full py-4 text-lg bg-primary text-white rounded-xl hover:opacity-90 transition-opacity font-bold shadow-lg flex justify-center items-center gap-2"
            >
              Calculate New Date <ArrowRight className="w-5 h-5" />
            </button>

            {resultDate && (
              <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 text-center animate-in zoom-in duration-300">
                <p className="text-sm text-[var(--muted-foreground)] uppercase tracking-wider mb-2">The resulting date is</p>
                <p className="text-3xl sm:text-4xl font-bold text-primary">{format(resultDate, "EEEE, MMMM do, yyyy")}</p>
              </div>
            )}
          </div>
        )}

        {tab === "diff" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-3 text-[var(--muted-foreground)] uppercase tracking-wider">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-4 rounded-xl border border-[var(--glass-border)] bg-[var(--background)]/80 focus:ring-2 focus:ring-primary outline-none text-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-3 text-[var(--muted-foreground)] uppercase tracking-wider">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-4 rounded-xl border border-[var(--glass-border)] bg-[var(--background)]/80 focus:ring-2 focus:ring-primary outline-none text-lg"
                />
              </div>
            </div>

            {startDate && endDate && (() => {
              const start = new Date(startDate);
              const end = new Date(endDate);
              const totalDays = Math.abs(differenceInDays(end, start));
              const years = Math.abs(differenceInYears(end, start));
              const months = Math.abs(differenceInMonths(end, start)) % 12;
              const weeks = Math.floor(totalDays / 7);
              const remainingDays = totalDays % 7;
              
              return (
                <div className="mt-8 p-6 rounded-2xl bg-[var(--background)]/50 border border-[var(--glass-border)]">
                  <h3 className="text-center font-bold text-lg mb-6">Duration Between Dates</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] text-center shadow-sm">
                      <div className="text-3xl font-bold text-primary mb-1">{totalDays.toLocaleString()}</div>
                      <div className="text-sm font-medium text-[var(--muted-foreground)] uppercase tracking-wider">Total Days</div>
                    </div>
                    <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] text-center shadow-sm">
                      <div className="text-3xl font-bold text-primary mb-1">{weeks.toLocaleString()}</div>
                      <div className="text-sm font-medium text-[var(--muted-foreground)] uppercase tracking-wider">Weeks</div>
                    </div>
                    <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] text-center shadow-sm">
                      <div className="text-2xl font-bold text-primary mb-1 flex justify-center items-baseline gap-1">
                        {years}<span className="text-base font-normal">y</span> 
                        {months}<span className="text-base font-normal">m</span>
                      </div>
                      <div className="text-sm font-medium text-[var(--muted-foreground)] uppercase tracking-wider">Yrs & Mos</div>
                    </div>
                  </div>
                  {totalDays > 0 && (
                    <div className="text-center mt-6 text-[var(--muted-foreground)]">
                      That is precisely <span className="font-semibold text-[var(--foreground)]">{years} years, {months} months, and {Math.floor(totalDays - (years * 365.25) - (months * 30.44))} days</span>.
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}

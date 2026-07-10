"use client";

import { useState } from "react";
import { add, sub, differenceInDays, differenceInWeeks, differenceInMonths, differenceInYears, format } from "date-fns";
import { Calendar, Calculator } from "lucide-react";

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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Date Calculators</h1>

      <div className="flex justify-center mb-8 space-x-4">
        <button
          className={`px-6 py-2 rounded-full font-medium transition-colors ${tab === "add-sub" ? "bg-primary text-white shadow-lg" : "bg-[var(--glass-bg)] hover:bg-black/10 dark:hover:bg-white/10"}`}
          onClick={() => setTab("add-sub")}
        >
          Add / Subtract
        </button>
        <button
          className={`px-6 py-2 rounded-full font-medium transition-colors ${tab === "diff" ? "bg-primary text-white shadow-lg" : "bg-[var(--glass-bg)] hover:bg-black/10 dark:hover:bg-white/10"}`}
          onClick={() => setTab("diff")}
        >
          Date Difference
        </button>
      </div>

      <div className="glass-panel p-8">
        {tab === "add-sub" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold flex items-center gap-2 mb-6">
              <Calculator className="h-6 w-6 text-primary" /> Add to or Subtract from a Date
            </h2>
            
            <div>
              <label className="block text-sm font-medium mb-2">Start Date</label>
              <input
                type="date"
                value={baseDate}
                onChange={(e) => setBaseDate(e.target.value)}
                className="w-full md:w-1/2 p-3 rounded-lg border border-[var(--glass-border)] bg-[var(--background)]/50 focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            <div className="flex gap-4 items-center my-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={operation === "add"} onChange={() => setOperation("add")} className="text-primary" />
                <span>Add</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={operation === "sub"} onChange={() => setOperation("sub")} className="text-primary" />
                <span>Subtract</span>
              </label>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['years', 'months', 'weeks', 'days'].map((unit) => (
                <div key={unit}>
                  <label className="block text-sm font-medium mb-2 capitalize">{unit}</label>
                  <input
                    type="number"
                    min="0"
                    value={amount[unit as keyof typeof amount]}
                    onChange={(e) => setAmount({ ...amount, [unit]: parseInt(e.target.value) || 0 })}
                    className="w-full p-3 rounded-lg border border-[var(--glass-border)] bg-[var(--background)]/50 focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={calculateAddSub}
              className="mt-6 w-full md:w-auto px-8 py-3 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Calculate New Date
            </button>

            {resultDate && (
              <div className="mt-8 p-6 rounded-xl bg-primary/10 border border-primary/20 text-center">
                <p className="text-sm text-[var(--muted-foreground)] mb-1">Result Date</p>
                <p className="text-3xl font-bold text-primary">{format(resultDate, "EEEE, MMMM do, yyyy")}</p>
              </div>
            )}
          </div>
        )}

        {tab === "diff" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold flex items-center gap-2 mb-6">
              <Calendar className="h-6 w-6 text-primary" /> Calculate Duration Between Dates
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-3 rounded-lg border border-[var(--glass-border)] bg-[var(--background)]/50 focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-3 rounded-lg border border-[var(--glass-border)] bg-[var(--background)]/50 focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>

            {startDate && endDate && (() => {
              const start = new Date(startDate);
              const end = new Date(endDate);
              const totalDays = Math.abs(differenceInDays(end, start));
              const years = Math.abs(differenceInYears(end, start));
              const months = Math.abs(differenceInMonths(end, start)) % 12;
              
              return (
                <div className="mt-8 p-6 rounded-xl bg-[var(--background)]/50 border border-[var(--glass-border)]">
                  <h3 className="text-xl font-semibold mb-4">Result</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 text-center glass-panel">
                      <div className="text-3xl font-bold text-primary">{totalDays}</div>
                      <div className="text-sm text-[var(--muted-foreground)]">Total Days</div>
                    </div>
                    <div className="p-4 text-center glass-panel">
                      <div className="text-3xl font-bold text-primary">{Math.floor(totalDays / 7)}</div>
                      <div className="text-sm text-[var(--muted-foreground)]">Weeks</div>
                    </div>
                    <div className="p-4 text-center glass-panel">
                      <div className="text-3xl font-bold text-primary">{years}y {months}m</div>
                      <div className="text-sm text-[var(--muted-foreground)]">Years & Months</div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}

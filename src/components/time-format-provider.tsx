"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type TimeFormat = "12h" | "24h";

interface TimeFormatContextType {
  format: TimeFormat;
  toggleFormat: () => void;
  formatString: string;
}

const TimeFormatContext = createContext<TimeFormatContextType | undefined>(undefined);

export function TimeFormatProvider({ children }: { children: React.ReactNode }) {
  const [format, setFormat] = useState<TimeFormat>("24h");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("omnitime-format") as TimeFormat;
    if (saved === "12h" || saved === "24h") {
      setFormat(saved);
    }
  }, []);

  const toggleFormat = () => {
    const newFormat = format === "24h" ? "12h" : "24h";
    setFormat(newFormat);
    localStorage.setItem("omnitime-format", newFormat);
  };

  const formatString = format === "12h" ? "hh:mm:ss a" : "HH:mm:ss";

  // Prevent hydration mismatch by rendering default/nothing on server
  if (!mounted) {
    return (
      <TimeFormatContext.Provider value={{ format: "24h", toggleFormat, formatString: "HH:mm:ss" }}>
        <div style={{ visibility: "hidden" }}>{children}</div>
      </TimeFormatContext.Provider>
    );
  }

  return (
    <TimeFormatContext.Provider value={{ format, toggleFormat, formatString }}>
      {children}
    </TimeFormatContext.Provider>
  );
}

export function useTimeFormat() {
  const context = useContext(TimeFormatContext);
  if (context === undefined) {
    throw new Error("useTimeFormat must be used within a TimeFormatProvider");
  }
  return context;
}

"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface PreferencesContextType {
  locale: string;
  setLocale: (locale: string) => void;
  dob: string | null;
  setDob: (dob: string | null) => void;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<string>("GLB");
  const [dob, setDobState] = useState<string | null>(null);

  useEffect(() => {
    // Load from local storage on mount
    const savedLocale = localStorage.getItem("omnitime_locale");
    if (savedLocale) setLocaleState(savedLocale);

    const savedDob = localStorage.getItem("omnitime_dob");
    if (savedDob) setDobState(savedDob);
  }, []);

  const setLocale = (newLocale: string) => {
    setLocaleState(newLocale);
    localStorage.setItem("omnitime_locale", newLocale);
  };

  const setDob = (newDob: string | null) => {
    setDobState(newDob);
    if (newDob) {
      localStorage.setItem("omnitime_dob", newDob);
    } else {
      localStorage.removeItem("omnitime_dob");
    }
  };

  return (
    <PreferencesContext.Provider value={{ locale, setLocale, dob, setDob }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error("usePreferences must be used within a PreferencesProvider");
  }
  return context;
}

"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface LocationData {
  country_name: string;
  country_code: string;
  timezone: string;
  currency: string;
  latitude: number;
  longitude: number;
}

interface LocationContextType {
  location: LocationData | null;
  setLocation: (loc: LocationData) => void;
  isLoading: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocationState] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const cached = localStorage.getItem("omnitime_location");
        const cachedTime = localStorage.getItem("omnitime_location_time");
        const now = new Date().getTime();

        if (cached && cachedTime && now - parseInt(cachedTime) < 24 * 60 * 60 * 1000) {
          setLocationState(JSON.parse(cached));
          setIsLoading(false);
          return;
        }

        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        
        if (data && data.country_name) {
          const newLoc = {
            country_name: data.country_name,
            country_code: data.country_code,
            timezone: data.timezone,
            currency: data.currency,
            latitude: data.latitude,
            longitude: data.longitude
          };
          setLocationState(newLoc);
          localStorage.setItem("omnitime_location", JSON.stringify(newLoc));
          localStorage.setItem("omnitime_location_time", now.toString());
        }
      } catch (error) {
        console.warn("Failed to fetch location", error);
        // Fallback gracefully without throwing
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocation();
  }, []);

  const setLocation = (loc: LocationData) => {
    setLocationState(loc);
    localStorage.setItem("omnitime_location", JSON.stringify(loc));
    localStorage.setItem("omnitime_location_time", new Date().getTime().toString());
  };

  return (
    <LocationContext.Provider value={{ location, setLocation, isLoading }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
}

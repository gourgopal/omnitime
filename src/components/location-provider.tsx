"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface LocationData {
  country_name: string;
  country_code: string;
  timezone: string;
  currency: string;
  latitude: number;
  longitude: number;
  isPrecise?: boolean;
}

interface LocationContextType {
  location: LocationData | null;
  setLocation: (loc: LocationData) => void;
  requestPreciseLocation: () => void;
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

        let hasValidCoords = false;
        if (cached && cachedTime && now - parseInt(cachedTime) < 24 * 60 * 60 * 1000) {
          const parsedCache = JSON.parse(cached);
          setLocationState(parsedCache);
          if (parsedCache.latitude !== undefined && parsedCache.longitude !== undefined) {
             hasValidCoords = true;
          }
          setIsLoading(false);
        }
        
        if (hasValidCoords) {
           return;
        }

        // Only use IP API for automatic coarse location to avoid browser prompt on load
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
        setIsLoading(false);
      } catch (error) {
        console.warn("Failed to fetch location", error);
        setIsLoading(false);
      }
    };

    fetchLocation();
  }, []);

  const requestPreciseLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          // Merge exact GPS coords with existing IP data or refetch
          const currentLoc = localStorage.getItem("omnitime_location");
          let newLoc: any = currentLoc ? JSON.parse(currentLoc) : {};
          
          if (!newLoc.country_name) {
             try {
                const res = await fetch("https://ipapi.co/json/");
                const data = await res.json();
                if (data && data.country_name) newLoc = data;
             } catch(e) {}
          }
          
          newLoc.latitude = position.coords.latitude;
          newLoc.longitude = position.coords.longitude;
          newLoc.isPrecise = true; // flag to indicate user gave permission
          
          setLocationState(newLoc as LocationData);
          localStorage.setItem("omnitime_location", JSON.stringify(newLoc));
          localStorage.setItem("omnitime_location_time", new Date().getTime().toString());
        },
        (error) => {
          console.warn("User denied geolocation or it failed", error);
        },
        { timeout: 5000, maximumAge: 60000 }
      );
    }
  };

  const setLocation = (loc: LocationData) => {
    setLocationState(loc);
    localStorage.setItem("omnitime_location", JSON.stringify(loc));
    localStorage.setItem("omnitime_location_time", new Date().getTime().toString());
  };

  return (
    <LocationContext.Provider value={{ location, setLocation, requestPreciseLocation, isLoading }}>
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

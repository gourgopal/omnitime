"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { format, differenceInDays } from "date-fns";
import { NotificationModal } from "./notification-modal";

export type NotificationPrefs = {
  birthdays: boolean;
  dailyWeather: boolean;
  dailyForex: boolean;
  dailyMotivation: boolean;
  dailyJoke: boolean;
  spiritual: boolean;
};

interface NotificationContextType {
  notifGranted: boolean;
  prefs: NotificationPrefs;
  updatePrefs: (newPrefs: Partial<NotificationPrefs>) => void;
  requestPermission: (onGranted?: () => void) => void;
  triggerModalWithContext: (context: keyof NotificationPrefs) => void;
  setIsModalOpen: (open: boolean) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [notifGranted, setNotifGranted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [prefs, setPrefs] = useState<NotificationPrefs>({
    birthdays: true,
    dailyWeather: false,
    dailyForex: false,
    dailyMotivation: false,
    dailyJoke: false,
    spiritual: false,
  });

  useEffect(() => {
    setMounted(true);
    if ("Notification" in window) {
      setNotifGranted(Notification.permission === "granted");
    }
    const savedPrefs = localStorage.getItem("omnitime_notif_prefs");
    if (savedPrefs) {
      setPrefs(JSON.parse(savedPrefs));
    }
  }, []);

  const updatePrefs = (newPrefs: Partial<NotificationPrefs>) => {
    const updated = { ...prefs, ...newPrefs };
    setPrefs(updated);
    localStorage.setItem("omnitime_notif_prefs", JSON.stringify(updated));
  };

  const requestPermission = (onGranted?: () => void) => {
    if ("Notification" in window) {
      Notification.requestPermission().then(perm => {
        setNotifGranted(perm === "granted");
        if (perm === "granted") {
          new Notification("OmniTime Notifications Enabled!", { body: "Your preferences have been saved." });
          if (onGranted) onGranted();
        }
      });
    }
  };

  const triggerModalWithContext = (context: keyof NotificationPrefs) => {
    updatePrefs({ [context]: true });
    if (Notification.permission !== "granted") {
      setIsModalOpen(true);
    }
  };

  // Background Check Engine
  useEffect(() => {
    if (!mounted || !notifGranted) return;

    const checkInterval = setInterval(() => {
      const now = new Date();
      
      // 1. Daily Notifications (After 8 AM)
      if (now.getHours() >= 8) {
        const todayStr = format(now, "yyyy-MM-dd");
        
        // Multi-notification Engine
        const greetings = ["Explorer", "Time Traveler", "Captain", "Trailblazer", "Legend", "Friend", "Visionary", "Achiever"];
        const greeting = greetings[Math.floor(Math.random() * greetings.length)];
        
        // Weather
        if (prefs.dailyWeather && localStorage.getItem("omnitime_last_weather") !== todayStr) {
          const locStr = localStorage.getItem("omnitime_location");
          if (locStr) {
            try {
              const loc = JSON.parse(locStr);
              fetch(`https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,weather_code`)
                .then(r => r.json())
                .then(d => {
                  if (d && d.current) {
                    new Notification(`Weather Update, ${greeting} 🌤️`, {
                      body: `${d.current.temperature_2m}°C currently in ${loc.city || loc.country_name || 'your area'}.`,
                      icon: "/icon-192x192.png"
                    });
                    localStorage.setItem("omnitime_last_weather", todayStr);
                  }
                });
            } catch(e) {}
          }
        }
        
        // Forex
        if (prefs.dailyForex && localStorage.getItem("omnitime_last_forex") !== todayStr) {
          fetch("https://open.er-api.com/v6/latest/USD")
            .then(r => r.json())
            .then(d => {
              if (d && d.rates && d.rates.INR && d.rates.EUR) {
                new Notification(`Daily Forex, ${greeting} 💵`, {
                  body: `1 USD = ${d.rates.INR} INR\n1 EUR = ${(d.rates.INR / d.rates.EUR).toFixed(2)} INR`,
                  icon: "/icon-192x192.png"
                });
                localStorage.setItem("omnitime_last_forex", todayStr);
              }
            });
        }
        
        // Motivation
        if (prefs.dailyMotivation && localStorage.getItem("omnitime_last_motivation") !== todayStr) {
          fetch("https://dummyjson.com/quotes/random")
            .then(res => res.json())
            .then(data => {
              if (data && data.quote) {
                new Notification(`Good Morning, ${greeting}! 🌅`, {
                  body: `Today is ${format(now, "do MMM yyyy")}.\n\n"${data.quote}"\n- ${data.author || "Unknown"}`,
                  icon: "/icon-192x192.png"
                });
                localStorage.setItem("omnitime_last_motivation", todayStr);
              }
            });
        }

        // Joke
        if (prefs.dailyJoke && localStorage.getItem("omnitime_last_joke") !== todayStr) {
          fetch("https://v2.jokeapi.dev/joke/Programming,Miscellaneous,Pun?blacklistFlags=nsfw,religious,political,racist,sexist,explicit&type=single")
            .then(res => res.json())
            .then(data => {
              if (data && data.joke) {
                new Notification(`Joke of the Day 🤡`, {
                  body: data.joke,
                  icon: "/icon-192x192.png"
                });
                localStorage.setItem("omnitime_last_joke", todayStr);
              }
            });
        }
      }

      // 2. Countdowns & Birthdays (Check once every 12 hours)
      if (prefs.birthdays) {
         const lastEventCheck = localStorage.getItem("omnitime_last_event_check");
         const nowTime = now.getTime();
         if (!lastEventCheck || nowTime - parseInt(lastEventCheck) > 12 * 60 * 60 * 1000) {
            
            // Re-read storage
            const people = JSON.parse(localStorage.getItem("omnitime_people") || "[]");
            const rels = JSON.parse(localStorage.getItem("omnitime_rels") || "[]");
            const counts = JSON.parse(localStorage.getItem("omnitime_counts") || "[]");
            
            const getNextOccurrence = (dateStr: string) => {
               const d = new Date(dateStr);
               const n = new Date();
               n.setHours(0,0,0,0);
               const cy = new Date(n.getFullYear(), d.getMonth(), d.getDate());
               return cy < n ? new Date(n.getFullYear() + 1, d.getMonth(), d.getDate()) : cy;
            };

            const allEvents = [
              ...people.map((p: any) => ({ name: `${p.name}'s Birthday`, date: getNextOccurrence(p.dob) })),
              ...rels.map((r: any) => ({ name: `${r.name} Anniversary`, date: getNextOccurrence(r.date) })),
              ...counts.map((c: any) => ({ name: c.name, date: new Date(c.date) }))
            ];

            let fired = false;
            allEvents.forEach(e => {
              const days = differenceInDays(e.date, new Date());
              if ([15, 7, 3, 1, 0].includes(days)) {
                new Notification("OmniTime Reminder", {
                   body: `${e.name} is ${days === 0 ? 'Today!' : `in ${days} days!`}`,
                   icon: "/favicon.ico"
                });
                fired = true;
              }
            });

            if (fired) {
              localStorage.setItem("omnitime_last_event_check", nowTime.toString());
            }
         }
      }

    }, 60 * 1000); // Check every minute, but internal logic gates it

    return () => clearInterval(checkInterval);
  }, [mounted, notifGranted, prefs]);

  return (
    <NotificationContext.Provider value={{ notifGranted, prefs, updatePrefs, requestPermission, triggerModalWithContext, setIsModalOpen }}>
      {children}
      
      {/* Notification Modal */}
      {isModalOpen && (
        <NotificationModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          prefs={prefs}
          updatePrefs={updatePrefs}
          onRequestPermission={() => {
            requestPermission(() => setIsModalOpen(false));
          }}
        />
      )}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}

"use client";

import { useState, useEffect } from "react";
import { Cloud, DollarSign, History, Search, Trash2, TrendingUp, Bitcoin, MapPin, Wind } from "lucide-react";

import { useLocation } from "@/components/location-provider";

interface SavedLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  weather?: any;
}

export default function Explore() {
  const { location } = useLocation();
  const [tab, setTab] = useState<"weather" | "currency" | "history">("weather");
  
  // Weather State
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [weatherLoading, setWeatherLoading] = useState(false);

  // Currency State
  const [exchangeRates, setExchangeRates] = useState<any>(null);
  const [btcPrice, setBtcPrice] = useState<number | null>(null);
  const [amount, setAmount] = useState(1);
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");

  // History State
  const [historyData, setHistoryData] = useState<any>(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    if (location?.currency) {
      // Ensure the currency is one of our MAJOR_CURRENCIES, otherwise fallback to EUR
      const valid = ["USD", "EUR", "GBP", "JPY", "INR", "AUD", "CAD", "CHF", "CNY", "SGD", "NZD", "BTC"];
      if (valid.includes(location.currency)) {
        setToCurrency(location.currency);
      }
    }
  }, [location]);

  useEffect(() => {
    // Load Saved Weather Locations
    const saved = localStorage.getItem("omnitime_weather_locations");
    if (saved) {
      const parsed = JSON.parse(saved);
      setSavedLocations(parsed);
      refreshAllWeather(parsed);
    } else {
      // Default to London if empty
      const defaultLoc = [{ id: "def1", name: "London, United Kingdom", latitude: 51.5085, longitude: -0.1257 }];
      setSavedLocations(defaultLoc);
      refreshAllWeather(defaultLoc);
    }

    // Fetch Currency & BTC
    const fetchCurrency = async () => {
      const cached = localStorage.getItem("omnitime_currency");
      const cachedTime = localStorage.getItem("omnitime_currency_time");
      const now = new Date().getTime();
      
      let rates = null;
      if (cached && cachedTime && now - parseInt(cachedTime) < 24 * 60 * 60 * 1000) {
        rates = JSON.parse(cached);
        setExchangeRates(rates);
      } else {
        try {
          const res = await fetch("https://open.er-api.com/v6/latest/USD");
          const data = await res.json();
          if (data && data.rates) {
            rates = data.rates;
            setExchangeRates(rates);
            localStorage.setItem("omnitime_currency", JSON.stringify(rates));
            localStorage.setItem("omnitime_currency_time", now.toString());
          }
        } catch (e) { console.error(e); }
      }

      // Fetch Live BTC (Bypassing er-api cache for live crypto)
      try {
        const btcRes = await fetch("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT");
        const btcData = await btcRes.json();
        const price = parseFloat(btcData.price);
        setBtcPrice(price);
        
        // Inject BTC into our exchange rates relative to USD
        if (rates && price > 0) {
          const updatedRates = { ...rates, BTC: 1 / price };
          setExchangeRates(updatedRates);
        }
      } catch (e) { console.warn("Failed to fetch BTC", e); }
    };

    // Fetch History
    const fetchHistory = async () => {
      setHistoryLoading(true);
      try {
        const today = new Date();
        const res = await fetch(`https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/${today.getMonth() + 1}/${today.getDate()}`);
        const data = await res.json();
        if (data && data.events) setHistoryData(data.events.slice(0, 5));
      } catch (e) { console.error(e); }
      setHistoryLoading(false);
    };

    fetchCurrency();
    fetchHistory();
  }, []);

  // Weather Logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length > 2) {
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5`);
        const data = await res.json();
        setSuggestions(data.results || []);
      } else {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const refreshAllWeather = async (locations: SavedLocation[]) => {
    setWeatherLoading(true);
    const updated = await Promise.all(locations.map(async (loc) => {
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current_weather=true`);
        const data = await res.json();
        return { ...loc, weather: data.current_weather };
      } catch (e) { return loc; }
    }));
    setSavedLocations(updated);
    setWeatherLoading(false);
  };

  const addLocation = (loc: any) => {
    const newLoc: SavedLocation = {
      id: Math.random().toString(36).substr(2, 9),
      name: `${loc.name}, ${loc.country || ""}`,
      latitude: loc.latitude,
      longitude: loc.longitude
    };
    const newList = [newLoc, ...savedLocations];
    setSavedLocations(newList);
    localStorage.setItem("omnitime_weather_locations", JSON.stringify(newList));
    setQuery("");
    setSuggestions([]);
    refreshAllWeather(newList);
  };

  const removeLocation = (id: string) => {
    const newList = savedLocations.filter(loc => loc.id !== id);
    setSavedLocations(newList);
    localStorage.setItem("omnitime_weather_locations", JSON.stringify(newList));
  };

  const convertCurrency = () => {
    if (!exchangeRates) return 0;
    const usdAmount = amount / exchangeRates[fromCurrency];
    const finalAmount = usdAmount * exchangeRates[toCurrency];
    
    // Format appropriately (BTC needs more decimals)
    if (toCurrency === "BTC") return finalAmount.toFixed(6);
    return finalAmount.toFixed(2);
  };

  // Top Currencies for Dropdown to keep UI clean
  const MAJOR_CURRENCIES = ["USD", "EUR", "GBP", "JPY", "INR", "AUD", "CAD", "CHF", "CNY", "SGD", "NZD", "BTC"];

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-4xl font-bold mb-8 text-center flex items-center justify-center gap-3">
        Explore Utilities
      </h1>

      <div className="flex flex-wrap justify-center gap-4 mb-10">
        <button className={`px-6 py-3 rounded-full font-medium transition-colors flex items-center gap-2 ${tab === "weather" ? "bg-primary text-white shadow-lg" : "bg-[var(--glass-bg)] hover:bg-black/10 dark:hover:bg-white/10"}`} onClick={() => setTab("weather")}>
          <Cloud className="w-5 h-5" /> Weather
        </button>
        <button className={`px-6 py-3 rounded-full font-medium transition-colors flex items-center gap-2 ${tab === "currency" ? "bg-primary text-white shadow-lg" : "bg-[var(--glass-bg)] hover:bg-black/10 dark:hover:bg-white/10"}`} onClick={() => setTab("currency")}>
          <DollarSign className="w-5 h-5" /> Currency & Crypto
        </button>
        <button className={`px-6 py-3 rounded-full font-medium transition-colors flex items-center gap-2 ${tab === "history" ? "bg-primary text-white shadow-lg" : "bg-[var(--glass-bg)] hover:bg-black/10 dark:hover:bg-white/10"}`} onClick={() => setTab("history")}>
          <History className="w-5 h-5" /> On This Day
        </button>
      </div>

      <div className="min-h-[500px]">
        {/* WEATHER TAB */}
        {tab === "weather" && (
          <div className="max-w-5xl mx-auto">
            <div className="relative mb-8 z-10 max-w-xl mx-auto">
              <div className="flex items-center bg-[var(--background)] border border-[var(--glass-border)] rounded-full px-6 py-3 focus-within:ring-2 ring-primary shadow-sm">
                <Search className="w-5 h-5 text-[var(--muted-foreground)] mr-3" />
                <input 
                  type="text" 
                  placeholder="Search for a city..." 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none font-medium text-lg"
                />
              </div>
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--background)] border border-[var(--glass-border)] rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl">
                  {suggestions.map((s, i) => (
                    <button 
                      key={i} 
                      onClick={() => addLocation(s)}
                      className="w-full text-left px-6 py-4 hover:bg-[var(--glass-bg)] transition-colors border-b border-[var(--glass-border)] last:border-0 flex items-center justify-between"
                    >
                      <div className="font-medium text-lg">{s.name}</div>
                      <div className="text-sm text-[var(--muted-foreground)]">{s.admin1 ? `${s.admin1}, ` : ''}{s.country}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {weatherLoading && savedLocations.length > 0 && <p className="text-center mb-6 text-sm text-[var(--muted-foreground)] animate-pulse">Updating live weather...</p>}

            {/* CSS Grid for Weather Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedLocations.map(loc => (
                <div key={loc.id} className="relative p-6 rounded-3xl bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 shadow-sm flex flex-col justify-between group overflow-hidden">
                  <button onClick={() => removeLocation(loc.id)} className="absolute top-4 right-4 text-red-500/0 group-hover:text-red-500/50 hover:!text-red-500 transition-colors z-10">
                    <Trash2 className="w-5 h-5" />
                  </button>
                  
                  <div className="flex items-start justify-between mb-8">
                    <div className="pr-8 min-w-0 flex-1">
                      <div className="font-bold text-xl leading-tight truncate" title={loc.name}>{loc.name.split(',')[0]}</div>
                      <div className="text-sm text-[var(--muted-foreground)] truncate" title={loc.name}>{loc.name.split(',')[1]?.trim()}</div>
                    </div>
                  </div>
                  
                  {loc.weather ? (
                    <div className="flex items-end justify-between">
                      <div className="text-5xl font-black tracking-tighter text-blue-600 dark:text-blue-400">
                        {Math.round(loc.weather.temperature)}°
                      </div>
                      <div className="flex items-center gap-1 text-sm text-[var(--muted-foreground)] bg-[var(--background)]/50 px-3 py-1 rounded-full">
                        <Wind className="w-3 h-3" /> {loc.weather.windspeed} km/h
                      </div>
                    </div>
                  ) : (
                    <div className="animate-pulse space-y-4">
                      <div className="h-12 w-20 bg-blue-500/20 rounded-xl"></div>
                    </div>
                  )}
                  
                  {/* Decorative Icon */}
                  <div className="absolute -top-4 -right-4 opacity-5 pointer-events-none">
                    <Cloud className="w-32 h-32" />
                  </div>
                </div>
              ))}
            </div>
            
            {savedLocations.length === 0 && (
              <div className="text-center p-12 glass-panel">
                <Cloud className="w-16 h-16 text-[var(--muted-foreground)] mx-auto mb-4 opacity-50" />
                <p className="text-lg text-[var(--muted-foreground)]">No locations saved. Search for a city above to build your dashboard!</p>
              </div>
            )}
          </div>
        )}

        {/* CURRENCY TAB */}
        {tab === "currency" && (
          <div className="max-w-4xl mx-auto">
            
            {/* Trending Dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="p-4 rounded-2xl bg-[var(--background)] border border-[var(--glass-border)] shadow-sm">
                <div className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider mb-2 flex items-center gap-2">
                  <TrendingUp className="w-3 h-3 text-green-500" /> USD / EUR
                </div>
                <div className="text-2xl font-bold">€{exchangeRates ? exchangeRates["EUR"].toFixed(2) : "..."}</div>
              </div>
              <div className="p-4 rounded-2xl bg-[var(--background)] border border-[var(--glass-border)] shadow-sm">
                <div className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider mb-2 flex items-center gap-2">
                  <TrendingUp className="w-3 h-3 text-green-500" /> USD / GBP
                </div>
                <div className="text-2xl font-bold">£{exchangeRates ? exchangeRates["GBP"].toFixed(2) : "..."}</div>
              </div>
              <div className="p-4 rounded-2xl bg-[var(--background)] border border-[var(--glass-border)] shadow-sm">
                <div className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider mb-2 flex items-center gap-2">
                  <TrendingUp className="w-3 h-3 text-green-500" /> USD / INR
                </div>
                <div className="text-2xl font-bold">₹{exchangeRates ? exchangeRates["INR"].toFixed(2) : "..."}</div>
              </div>
              <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 shadow-sm relative overflow-hidden">
                <div className="text-xs text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-2 flex items-center gap-2 relative z-10">
                  <Bitcoin className="w-3 h-3" /> Bitcoin Live
                </div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 relative z-10">
                  ${btcPrice ? btcPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : "..."}
                </div>
                <Bitcoin className="w-16 h-16 absolute -bottom-2 -right-2 text-orange-500/10" />
              </div>
            </div>

            <div className="glass-panel p-8 rounded-3xl relative overflow-hidden">
              <h2 className="text-2xl font-bold mb-8">Global Converter</h2>
              
              {!exchangeRates ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-[var(--muted-foreground)] uppercase tracking-wider">Amount</label>
                    <input 
                      type="number" 
                      value={amount} 
                      onChange={(e) => setAmount(parseFloat(e.target.value) || 0)} 
                      className="w-full text-4xl p-4 rounded-2xl border-none bg-[var(--background)] focus:ring-2 focus:ring-primary outline-none font-bold" 
                    />
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="flex-1 w-full">
                      <label className="block text-sm font-semibold mb-3 text-[var(--muted-foreground)] uppercase tracking-wider">From</label>
                      <select 
                        value={fromCurrency} 
                        onChange={(e) => setFromCurrency(e.target.value)} 
                        className="w-full p-4 rounded-2xl border-none bg-[var(--background)] focus:ring-2 focus:ring-primary outline-none text-lg font-bold"
                      >
                        {Object.keys(exchangeRates).filter(c => MAJOR_CURRENCIES.includes(c)).map(cur => (
                          <option key={cur} value={cur}>{cur} - {cur === "BTC" ? "Bitcoin" : "Fiat"}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="w-12 h-12 rounded-full bg-[var(--background)] border border-[var(--glass-border)] flex items-center justify-center shrink-0 mt-6 md:mt-0 shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--muted-foreground)]"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/></svg>
                    </div>
                    
                    <div className="flex-1 w-full">
                      <label className="block text-sm font-semibold mb-3 text-[var(--muted-foreground)] uppercase tracking-wider">To</label>
                      <select 
                        value={toCurrency} 
                        onChange={(e) => setToCurrency(e.target.value)} 
                        className="w-full p-4 rounded-2xl border-none bg-[var(--background)] focus:ring-2 focus:ring-primary outline-none text-lg font-bold"
                      >
                        {Object.keys(exchangeRates).filter(c => MAJOR_CURRENCIES.includes(c)).map(cur => (
                          <option key={cur} value={cur}>{cur} - {cur === "BTC" ? "Bitcoin" : "Fiat"}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-8 border-t border-[var(--glass-border)]">
                    <p className="text-sm text-[var(--muted-foreground)] uppercase tracking-wider font-semibold mb-2">Converted Amount</p>
                    <div className="flex items-baseline gap-3">
                      <p className="text-5xl md:text-6xl font-black text-primary tracking-tighter truncate">
                        {convertCurrency()}
                      </p>
                      <span className="text-2xl font-bold text-[var(--muted-foreground)]">{toCurrency}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* HISTORY TAB */}
        {tab === "history" && (
          <div className="max-w-3xl mx-auto glass-panel p-8">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
              <History className="text-primary" /> Today in History
            </h2>
            {historyLoading ? (
              <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
            ) : historyData && historyData.length > 0 ? (
              <div className="relative border-l-2 border-primary/30 pl-6 space-y-10 ml-4">
                {historyData.map((event: any, i: number) => (
                  <div key={i} className="relative">
                    <div className="absolute w-4 h-4 bg-primary rounded-full -left-[35px] top-1 border-4 border-[var(--background)]"></div>
                    <h3 className="font-bold text-primary text-xl mb-2">{event.year}</h3>
                    <p className="text-[var(--foreground)] leading-relaxed text-lg">{event.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-[var(--muted-foreground)]">No events found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

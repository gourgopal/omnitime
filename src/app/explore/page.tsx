"use client";

import { useState, useEffect } from "react";
import { Cloud, DollarSign, History } from "lucide-react";

export default function Explore() {
  const [tab, setTab] = useState<"weather" | "currency" | "history">("weather");
  
  // Weather State
  const [weatherData, setWeatherData] = useState<any>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  // Currency State
  const [exchangeRates, setExchangeRates] = useState<any>(null);
  const [amount, setAmount] = useState(1);
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("INR");

  // History State
  const [historyData, setHistoryData] = useState<any>(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    // Fetch Weather (Default: London for demo, usually we'd use Geolocation)
    const fetchWeather = async () => {
      setWeatherLoading(true);
      try {
        const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=51.5085&longitude=-0.1257&current_weather=true");
        const data = await res.json();
        setWeatherData(data.current_weather);
      } catch (e) {
        console.error(e);
      }
      setWeatherLoading(false);
    };

    // Fetch Currency with LocalStorage Caching
    const fetchCurrency = async () => {
      const cached = localStorage.getItem("omnitime_currency");
      const cachedTime = localStorage.getItem("omnitime_currency_time");
      const now = new Date().getTime();

      if (cached && cachedTime && now - parseInt(cachedTime) < 24 * 60 * 60 * 1000) {
        setExchangeRates(JSON.parse(cached));
      } else {
        try {
          const res = await fetch("https://open.er-api.com/v6/latest/USD");
          const data = await res.json();
          if (data && data.rates) {
            setExchangeRates(data.rates);
            localStorage.setItem("omnitime_currency", JSON.stringify(data.rates));
            localStorage.setItem("omnitime_currency_time", now.toString());
          }
        } catch (e) {
          console.error(e);
        }
      }
    };

    // Fetch On This Day
    const fetchHistory = async () => {
      setHistoryLoading(true);
      try {
        const today = new Date();
        const month = today.getMonth() + 1;
        const day = today.getDate();
        const res = await fetch(`https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/${month}/${day}`);
        const data = await res.json();
        if (data && data.events) {
          setHistoryData(data.events.slice(0, 5)); // Get top 5 events
        }
      } catch (e) {
        console.error(e);
      }
      setHistoryLoading(false);
    };

    fetchWeather();
    fetchCurrency();
    fetchHistory();
  }, []);

  const convertCurrency = () => {
    if (!exchangeRates) return 0;
    const usdAmount = amount / exchangeRates[fromCurrency];
    return (usdAmount * exchangeRates[toCurrency]).toFixed(2);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Explore Utilities</h1>

      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <button
          className={`px-6 py-2 rounded-full font-medium transition-colors flex items-center gap-2 ${tab === "weather" ? "bg-primary text-white shadow-lg" : "bg-[var(--glass-bg)] hover:bg-black/10 dark:hover:bg-white/10"}`}
          onClick={() => setTab("weather")}
        >
          <Cloud size={18} /> Weather
        </button>
        <button
          className={`px-6 py-2 rounded-full font-medium transition-colors flex items-center gap-2 ${tab === "currency" ? "bg-primary text-white shadow-lg" : "bg-[var(--glass-bg)] hover:bg-black/10 dark:hover:bg-white/10"}`}
          onClick={() => setTab("currency")}
        >
          <DollarSign size={18} /> Currency
        </button>
        <button
          className={`px-6 py-2 rounded-full font-medium transition-colors flex items-center gap-2 ${tab === "history" ? "bg-primary text-white shadow-lg" : "bg-[var(--glass-bg)] hover:bg-black/10 dark:hover:bg-white/10"}`}
          onClick={() => setTab("history")}
        >
          <History size={18} /> On This Day
        </button>
      </div>

      <div className="glass-panel p-8 min-h-[400px]">
        {tab === "weather" && (
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-6">Current Weather (London Demo)</h2>
            {weatherLoading ? (
              <p>Loading weather...</p>
            ) : weatherData ? (
              <div className="space-y-4">
                <div className="text-6xl font-bold text-primary">{weatherData.temperature}°C</div>
                <div className="text-xl">Wind Speed: {weatherData.windspeed} km/h</div>
              </div>
            ) : (
              <p>Failed to load weather data.</p>
            )}
          </div>
        )}

        {tab === "currency" && (
          <div className="text-center max-w-md mx-auto">
            <h2 className="text-2xl font-semibold mb-6">Currency Converter</h2>
            {!exchangeRates ? (
              <p>Loading exchange rates...</p>
            ) : (
              <div className="space-y-6 text-left">
                <div>
                  <label className="block text-sm font-medium mb-2">Amount</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="w-full p-3 rounded-lg border border-[var(--glass-border)] bg-[var(--background)]/50 focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">From</label>
                    <select
                      value={fromCurrency}
                      onChange={(e) => setFromCurrency(e.target.value)}
                      className="w-full p-3 rounded-lg border border-[var(--glass-border)] bg-[var(--background)]/50 focus:ring-2 focus:ring-primary outline-none"
                    >
                      {Object.keys(exchangeRates).map(cur => <option key={cur} value={cur}>{cur}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">To</label>
                    <select
                      value={toCurrency}
                      onChange={(e) => setToCurrency(e.target.value)}
                      className="w-full p-3 rounded-lg border border-[var(--glass-border)] bg-[var(--background)]/50 focus:ring-2 focus:ring-primary outline-none"
                    >
                      {Object.keys(exchangeRates).map(cur => <option key={cur} value={cur}>{cur}</option>)}
                    </select>
                  </div>
                </div>
                <div className="mt-8 p-6 rounded-xl bg-[var(--background)]/50 border border-[var(--glass-border)] text-center">
                  <p className="text-sm text-[var(--muted-foreground)] mb-1">Converted Amount</p>
                  <p className="text-4xl font-bold text-primary">{convertCurrency()} {toCurrency}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "history" && (
          <div>
            <h2 className="text-2xl font-semibold mb-6 text-center">On This Day</h2>
            {historyLoading ? (
              <p className="text-center">Loading historical events...</p>
            ) : historyData && historyData.length > 0 ? (
              <div className="space-y-6">
                {historyData.map((event: any, i: number) => (
                  <div key={i} className="p-4 rounded-xl bg-[var(--background)]/50 border border-[var(--glass-border)]">
                    <h3 className="font-bold text-primary mb-2 text-lg">Year: {event.year}</h3>
                    <p className="text-[var(--foreground)]">{event.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center">No events found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

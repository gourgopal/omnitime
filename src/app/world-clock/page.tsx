"use client";

import { useState, useEffect } from "react";
import { format, formatInTimeZone } from "date-fns-tz";
import { Globe, MapPin, MousePointer2, Search } from "lucide-react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { useTimeFormat } from "@/components/time-format-provider";
import { useTheme } from "next-themes";
import { useLocation } from "@/components/location-provider";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Comprehensive list of major timezones
const ALL_CITIES = [
  { name: "New York", timezone: "America/New_York", coordinates: [-74.006, 40.7128] },
  { name: "Los Angeles", timezone: "America/Los_Angeles", coordinates: [-118.2437, 34.0522] },
  { name: "Chicago", timezone: "America/Chicago", coordinates: [-87.6298, 41.8781] },
  { name: "Toronto", timezone: "America/Toronto", coordinates: [-79.3832, 43.6532] },
  { name: "Mexico City", timezone: "America/Mexico_City", coordinates: [-99.1332, 19.4326] },
  { name: "London", timezone: "Europe/London", coordinates: [-0.1276, 51.5074] },
  { name: "Paris", timezone: "Europe/Paris", coordinates: [2.3522, 48.8566] },
  { name: "Berlin", timezone: "Europe/Berlin", coordinates: [13.405, 52.52] },
  { name: "Warsaw", timezone: "Europe/Warsaw", coordinates: [21.0122, 52.2297] },
  { name: "Moscow", timezone: "Europe/Moscow", coordinates: [37.6173, 55.7558] },
  { name: "Dubai", timezone: "Asia/Dubai", coordinates: [55.2708, 25.2048] },
  { name: "Mumbai", timezone: "Asia/Kolkata", coordinates: [72.8777, 19.076] },
  { name: "Bangkok", timezone: "Asia/Bangkok", coordinates: [100.5018, 13.7563] },
  { name: "Singapore", timezone: "Asia/Singapore", coordinates: [103.8198, 1.3521] },
  { name: "Beijing", timezone: "Asia/Shanghai", coordinates: [116.4074, 39.9042] },
  { name: "Tokyo", timezone: "Asia/Tokyo", coordinates: [139.6917, 35.6895] },
  { name: "Seoul", timezone: "Asia/Seoul", coordinates: [126.978, 37.5665] },
  { name: "Sydney", timezone: "Australia/Sydney", coordinates: [151.2093, -33.8688] },
  { name: "Auckland", timezone: "Pacific/Auckland", coordinates: [174.7633, -36.8485] },
  { name: "Johannesburg", timezone: "Africa/Johannesburg", coordinates: [28.0473, -26.2041] },
  { name: "Cairo", timezone: "Africa/Cairo", coordinates: [31.2357, 30.0444] },
  { name: "São Paulo", timezone: "America/Sao_Paulo", coordinates: [-46.6333, -23.5505] },
  { name: "Buenos Aires", timezone: "America/Argentina/Buenos_Aires", coordinates: [-58.3816, -34.6037] },
  { name: "Nuuk", timezone: "America/Nuuk", coordinates: [-51.7215, 64.1814] },
  { name: "McMurdo", timezone: "Antarctica/McMurdo", coordinates: [166.6667, -77.85] }
];

// Map country names to primary timezones (expanded for global coverage)
const COUNTRY_TO_TIMEZONE: Record<string, string> = {
  // Americas
  "United States of America": "America/New_York", "Canada": "America/Toronto", "Mexico": "America/Mexico_City", 
  "Brazil": "America/Sao_Paulo", "Argentina": "America/Argentina/Buenos_Aires", "Colombia": "America/Bogota", 
  "Peru": "America/Lima", "Chile": "America/Santiago", "Venezuela": "America/Caracas", "Ecuador": "America/Guayaquil", 
  "Bolivia": "America/La_Paz", "Paraguay": "America/Asuncion", "Uruguay": "America/Montevideo", "Cuba": "America/Havana", 
  "Guatemala": "America/Guatemala", "Honduras": "America/Tegucigalpa", "El Salvador": "America/El_Salvador", 
  "Nicaragua": "America/Managua", "Costa Rica": "America/Costa_Rica", "Panama": "America/Panama",
  "Greenland": "America/Nuuk",
  
  // Europe
  "United Kingdom": "Europe/London", "France": "Europe/Paris", "Germany": "Europe/Berlin", "Italy": "Europe/Rome", 
  "Spain": "Europe/Madrid", "Russia": "Europe/Moscow", "Ukraine": "Europe/Kiev", "Poland": "Europe/Warsaw", 
  "Romania": "Europe/Bucharest", "Netherlands": "Europe/Amsterdam", "Belgium": "Europe/Brussels", 
  "Greece": "Europe/Athens", "Portugal": "Europe/Lisbon", "Czechia": "Europe/Prague", "Hungary": "Europe/Budapest", 
  "Sweden": "Europe/Stockholm", "Austria": "Europe/Vienna", "Switzerland": "Europe/Zurich", "Bulgaria": "Europe/Sofia", 
  "Serbia": "Europe/Belgrade", "Denmark": "Europe/Copenhagen", "Finland": "Europe/Helsinki", "Norway": "Europe/Oslo", 
  "Ireland": "Europe/Dublin", "Croatia": "Europe/Zagreb", "Slovakia": "Europe/Bratislava", "Lithuania": "Europe/Vilnius",
  "Belarus": "Europe/Minsk",
  
  // Africa
  "Nigeria": "Africa/Lagos", "Ethiopia": "Africa/Addis_Ababa", "Egypt": "Africa/Cairo", "Dem. Rep. Congo": "Africa/Kinshasa", 
  "Tanzania": "Africa/Dar_es_Salaam", "South Africa": "Africa/Johannesburg", "Kenya": "Africa/Nairobi", 
  "Uganda": "Africa/Kampala", "Algeria": "Africa/Algiers", "Sudan": "Africa/Khartoum", "Morocco": "Africa/Casablanca", 
  "Angola": "Africa/Luanda", "Mozambique": "Africa/Maputo", "Ghana": "Africa/Accra", "Madagascar": "Indian/Antananarivo", 
  "Cameroon": "Africa/Douala", "Côte d'Ivoire": "Africa/Abidjan", "Niger": "Africa/Niamey", "Mali": "Africa/Bamako", 
  "Burkina Faso": "Africa/Ouagadougou", "Malawi": "Africa/Blantyre", "Zambia": "Africa/Lusaka", "Senegal": "Africa/Dakar", 
  "Chad": "Africa/Ndjamena", "Somalia": "Africa/Mogadishu", "Zimbabwe": "Africa/Harare", "Guinea": "Africa/Conakry", 
  "Rwanda": "Africa/Kigali", "Tunisia": "Africa/Tunis", "Libya": "Africa/Tripoli",
  
  // Asia
  "India": "Asia/Kolkata", "China": "Asia/Shanghai", "Japan": "Asia/Tokyo", "South Korea": "Asia/Seoul", 
  "Indonesia": "Asia/Jakarta", "Pakistan": "Asia/Karachi", "Bangladesh": "Asia/Dhaka", "Philippines": "Asia/Manila", 
  "Vietnam": "Asia/Ho_Chi_Minh", "Turkey": "Europe/Istanbul", "Iran": "Asia/Tehran", "Thailand": "Asia/Bangkok", 
  "Myanmar": "Asia/Yangon", "Iraq": "Asia/Baghdad", "Afghanistan": "Asia/Kabul", "Saudi Arabia": "Asia/Riyadh", 
  "Uzbekistan": "Asia/Tashkent", "Malaysia": "Asia/Kuala_Lumpur", "Yemen": "Asia/Aden", "Nepal": "Asia/Kathmandu", 
  "North Korea": "Asia/Pyongyang", "Sri Lanka": "Asia/Colombo", "Kazakhstan": "Asia/Almaty", "Syria": "Asia/Damascus", 
  "Cambodia": "Asia/Phnom_Penh", "Jordan": "Asia/Amman", "United Arab Emirates": "Asia/Dubai", "Tajikistan": "Asia/Dushanbe", 
  "Israel": "Asia/Jerusalem", "Laos": "Asia/Vientiane", "Lebanon": "Asia/Beirut", "Kyrgyzstan": "Asia/Bishkek",
  "Oman": "Asia/Muscat", "Qatar": "Asia/Qatar", "Kuwait": "Asia/Kuwait",
  
  // Oceania & Antarctica
  "Australia": "Australia/Sydney", "New Zealand": "Pacific/Auckland", "Papua New Guinea": "Pacific/Port_Moresby", 
  "Fiji": "Pacific/Fiji", "Solomon Islands": "Pacific/Guadalcanal", "Vanuatu": "Pacific/Efate", "New Caledonia": "Pacific/Noumea",
  "Antarctica": "Antarctica/McMurdo"
};

export default function WorldClock() {
  const { location } = useLocation();
  const [time, setTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const [customZone, setCustomZone] = useState("UTC");
  
  const { formatString, toggleFormat, format: currentFormat } = useTimeFormat();
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
    if (location?.timezone && customZone === "UTC") {
      setCustomZone(location.timezone);
    }
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  const shortFormatString = currentFormat === "12h" ? "hh:mm a" : "HH:mm";
  const mapColor = theme === "dark" ? "#334155" : "#e2e8f0";
  const mapStroke = theme === "dark" ? "#1e293b" : "#cbd5e1";

  // Group cities by continent roughly for the dropdown
  const groupedCities = ALL_CITIES.reduce((acc, city) => {
    const region = city.timezone.split("/")[0];
    if (!acc[region]) acc[region] = [];
    acc[region].push(city);
    return acc;
  }, {} as Record<string, typeof ALL_CITIES>);

  const handleCountryClick = (countryName: string) => {
    const tz = COUNTRY_TO_TIMEZONE[countryName];
    if (tz) setCustomZone(tz);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-end mb-4">
        <button 
          onClick={toggleFormat}
          className="px-4 py-2 text-sm font-medium rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        >
          {currentFormat === "12h" ? "Switch to 24h" : "Switch to 12h"}
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-8 text-center flex items-center justify-center gap-2">
        <Globe className="text-primary" /> Global Timezones
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Selected Zone / Local */}
        <div className="glass-panel p-8 text-center flex flex-col justify-center items-center lg:col-span-1">
          <div className="w-full mb-6 text-left">
            <label className="block text-sm font-medium mb-2">Select Timezone</label>
            <select 
              value={customZone} 
              onChange={(e) => setCustomZone(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-[var(--glass-border)] bg-[var(--background)]/50 focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="UTC">UTC (Coordinated Universal Time)</option>
              {Object.entries(groupedCities).map(([region, cities]) => (
                <optgroup key={region} label={region}>
                  {cities.map(c => <option key={c.timezone} value={c.timezone}>{c.name} ({c.timezone})</option>)}
                </optgroup>
              ))}
            </select>
          </div>
          
          <h2 className="text-2xl font-medium mb-2">{customZone === "UTC" ? "UTC" : ALL_CITIES.find(c => c.timezone === customZone)?.name || customZone.split("/").pop()?.replace("_", " ")}</h2>
          <div className="text-4xl lg:text-5xl font-bold font-mono tracking-tighter text-primary whitespace-nowrap">
            {formatInTimeZone(time, customZone, formatString)}
          </div>
          <div className="text-lg mt-4 text-[var(--muted-foreground)]">
            {formatInTimeZone(time, customZone, "EEEE, MMMM do")}
          </div>
          <div className="mt-2 text-sm text-[var(--muted-foreground)]">
            {formatInTimeZone(time, customZone, "O")} (Offset)
          </div>
        </div>

        {/* World Map */}
        <div className="glass-panel p-4 flex items-center justify-center lg:col-span-2 overflow-hidden relative">
          <ComposableMap projection="geoMercator" projectionConfig={{ scale: 120 }}>
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const countryName = geo.properties.name;
                  const mappedTz = COUNTRY_TO_TIMEZONE[countryName];
                  const isClickable = !!mappedTz;
                  const currentTime = isClickable ? formatInTimeZone(time, mappedTz, shortFormatString) : "";
                  
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={mapColor}
                      stroke={mapStroke}
                      strokeWidth={0.5}
                      onClick={() => handleCountryClick(countryName)}
                      className={isClickable ? "cursor-pointer" : ""}
                      {...({ title: isClickable ? `${countryName} - ${currentTime} (${mappedTz})` : countryName } as any)}
                      style={{
                        default: { outline: "none" },
                        hover: { fill: isClickable ? (theme === "dark" ? "#3b82f6" : "#60a5fa") : (theme === "dark" ? "#475569" : "#cbd5e1"), outline: "none" },
                        pressed: { outline: "none" },
                      }}
                    />
                  );
                })
              }
            </Geographies>
            {ALL_CITIES.map((city) => {
              const isSelected = customZone === city.timezone;
              return (
                <Marker 
                  key={city.name} 
                  coordinates={city.coordinates as [number, number]}
                  onClick={() => setCustomZone(city.timezone)}
                >
                  <circle 
                    r={isSelected ? 6 : 4} 
                    fill={isSelected ? "#3b82f6" : (theme === "dark" ? "#94a3b8" : "#64748b")} 
                    className="cursor-pointer transition-all hover:scale-125"
                    {...({ title: `${city.name} (${city.timezone})` } as any)}
                  />
                  <text
                    textAnchor="middle"
                    y={-10}
                    style={{ 
                      fontFamily: "system-ui", 
                      fill: isSelected ? "#3b82f6" : (theme === "dark" ? "#cbd5e1" : "#475569"), 
                      fontSize: isSelected ? "12px" : "10px",
                      fontWeight: isSelected ? "bold" : "normal",
                      pointerEvents: "none"
                    }}
                  >
                    {city.name}
                  </text>
                </Marker>
              );
            })}
          </ComposableMap>
          <div className="absolute bottom-4 right-4 text-xs text-[var(--muted-foreground)] flex items-center gap-1 bg-[var(--background)]/80 px-2 py-1 rounded">
            <MousePointer2 size={12} /> Click a country or city dot to view timezone
          </div>
        </div>
      </div>

      {/* Grid of All Cities */}
      <h2 className="text-2xl font-bold mb-6">World Directory</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {ALL_CITIES.map((city) => (
          <button 
            key={city.name} 
            onClick={() => setCustomZone(city.timezone)}
            className={`glass-panel p-4 flex flex-col text-left transition-all ${customZone === city.timezone ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
          >
            <h3 className="font-semibold text-sm truncate">{city.name}</h3>
            <div className="text-base sm:text-sm md:text-base font-bold font-mono text-primary my-1 tracking-tighter truncate">
              {formatInTimeZone(time, city.timezone, shortFormatString)}
            </div>
            <div className="text-xs text-[var(--muted-foreground)] truncate">
              {city.timezone.split("/")[1]?.replace("_", " ")}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

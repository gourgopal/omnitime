import { MoonPhase, EclipticLongitude, Body, MakeTime, SearchRiseSet, Observer } from 'astronomy-engine';

const NAKSHATRAS = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashirsha", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
  "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
  "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

const PLANETS = [
  { name: "Saturn", icon: "♄", color: "text-gray-400" },
  { name: "Jupiter", icon: "♃", color: "text-amber-500" },
  { name: "Mars", icon: "♂", color: "text-red-500" },
  { name: "Sun", icon: "☉", color: "text-yellow-500" },
  { name: "Venus", icon: "♀", color: "text-pink-400" },
  { name: "Mercury", icon: "☿", color: "text-green-500" },
  { name: "Moon", icon: "☽", color: "text-blue-300" }
];

// Chaldean sequence maps weekday index (0=Sunday) to the Lord of the Day index in the PLANETS array above
// Sunday(Sun=3), Monday(Moon=6), Tuesday(Mars=2), Wednesday(Mercury=5), Thursday(Jupiter=1), Friday(Venus=4), Saturday(Saturn=0)
const LORD_OF_DAY_MAP = [3, 6, 2, 5, 1, 4, 0];

export function getVedicPanchang(date: Date) {
  const time = MakeTime(date);
  
  // 1. Calculate Tithi
  const phase = MoonPhase(time); // 0 to 360
  const tithiIndex = Math.floor(phase / 12) + 1;
  const isShukla = tithiIndex <= 15;
  const paksha = isShukla ? "Shukla" : "Krishna";
  const tithiNum = isShukla ? tithiIndex : tithiIndex - 15;
  
  const tithiNames = [
    "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
    "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
    "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", 
    isShukla ? "Purnima (Full Moon)" : "Amavasya (New Moon)"
  ];
  const tithiName = tithiNames[tithiNum - 1];

  // 2. Calculate Nakshatra
  const tropicalMoon = EclipticLongitude(Body.Moon, time);
  
  // Approximate Lahiri Ayanamsha for 2026 is ~24.21 degrees
  // Formula approx: 23.85 + (Year - 2000) * 0.01396
  const year = date.getFullYear();
  const ayanamsha = 23.85 + (year - 2000) * 0.01396;
  
  let siderealMoon = tropicalMoon - ayanamsha;
  if (siderealMoon < 0) siderealMoon += 360;
  
  const nakshatraIndex = Math.floor(siderealMoon / (360 / 27));
  const nakshatraName = NAKSHATRAS[nakshatraIndex];

  return {
    paksha,
    tithiName,
    nakshatraName,
    phasePercent: (phase / 360) * 100
  };
}

export function getPlanetaryHour(date: Date, lat: number, lng: number) {
  const obs = new Observer(lat, lng, 0);
  const time = MakeTime(date);
  
  // Find Sunrise for today
  // We search for sunrise starting from midnight of the given date
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  let sunriseTime = SearchRiseSet(Body.Sun, obs, 1, MakeTime(startOfDay), 1);
  let sunsetTime = SearchRiseSet(Body.Sun, obs, -1, MakeTime(startOfDay), 1);
  
  if (!sunriseTime || !sunsetTime) {
    throw new Error("Could not calculate sunrise or sunset for this location (e.g. polar regions).");
  }
  
  // If the given time is BEFORE today's sunrise, we are technically still in "Yesterday's" planetary day.
  // We need to fetch yesterday's sunrise and sunset.
  let isNight = false;
  let activeSunriseDate = sunriseTime.date;
  let activeSunsetDate = sunsetTime.date;
  
  let dayOfWeek = date.getDay(); // 0 = Sunday
  
  if (date < activeSunriseDate) {
    // It's before today's sunrise, so use yesterday's data
    const yesterday = new Date(startOfDay);
    yesterday.setDate(yesterday.getDate() - 1);
    sunriseTime = SearchRiseSet(Body.Sun, obs, 1, MakeTime(yesterday), 1);
    sunsetTime = SearchRiseSet(Body.Sun, obs, -1, MakeTime(yesterday), 1);
    if (!sunriseTime || !sunsetTime) {
       throw new Error("Could not calculate yesterday's sunrise or sunset.");
    }
    activeSunriseDate = sunriseTime.date;
    activeSunsetDate = sunsetTime.date;
    
    // Adjust day of week backwards
    dayOfWeek = (dayOfWeek - 1 + 7) % 7;
  }
  
  const lordOfDayIndex = LORD_OF_DAY_MAP[dayOfWeek];
  const dayLord = PLANETS[lordOfDayIndex];

  // Are we in daytime or nighttime of the active planetary day?
  let hourLengthMs = 0;
  let hoursElapsed = 0;
  let isDaytime = true;
  let hourIndex = 0;
  let timeRemainingMs = 0;
  
  if (date >= activeSunriseDate && date < activeSunsetDate) {
    // Daytime
    const dayDurationMs = activeSunsetDate.getTime() - activeSunriseDate.getTime();
    hourLengthMs = dayDurationMs / 12;
    const msElapsed = date.getTime() - activeSunriseDate.getTime();
    hourIndex = Math.floor(msElapsed / hourLengthMs);
    timeRemainingMs = hourLengthMs - (msElapsed % hourLengthMs);
  } else {
    // Nighttime
    isDaytime = false;
    isNight = true;
    
    // We need tomorrow's sunrise to calculate the length of the night
    const tomorrow = new Date(activeSunriseDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextSunrise = SearchRiseSet(Body.Sun, obs, 1, MakeTime(tomorrow), 1);
    if (!nextSunrise) {
       throw new Error("Could not calculate tomorrow's sunrise.");
    }
    
    const nightDurationMs = nextSunrise.date.getTime() - activeSunsetDate.getTime();
    hourLengthMs = nightDurationMs / 12;
    
    const msElapsed = date.getTime() - activeSunsetDate.getTime();
    hourIndex = Math.floor(msElapsed / hourLengthMs) + 12; // Night hours are 12 to 23
    timeRemainingMs = hourLengthMs - (msElapsed % hourLengthMs);
  }
  
  // Calculate the current ruler
  // Cycles continuously through the Chaldean sequence (length 7)
  const currentRulerIndex = (lordOfDayIndex + hourIndex) % 7;
  const currentRuler = PLANETS[currentRulerIndex];

  return {
    dayLord,
    currentRuler,
    isDaytime,
    timeRemainingMs,
    hourIndex: isDaytime ? hourIndex + 1 : hourIndex - 11 // 1-12 day, 1-12 night
  };
}

import { MoonPhase, SearchMoonPhase, Body, Observer, SearchRiseSet, EclipticLongitude, SearchSunLongitude } from "astronomy-engine";

export type MoonPhaseName = 
  | "New Moon"
  | "Waxing Crescent"
  | "First Quarter"
  | "Waxing Gibbous"
  | "Full Moon"
  | "Waning Gibbous"
  | "Third Quarter"
  | "Waning Crescent";

export interface MoonStatus {
  angle: number;
  phaseName: MoonPhaseName;
  illumination: number; // 0 to 1
  tithi: number;
  paksha: "Shukla" | "Krishna";
}

const LUNAR_MONTHS = ["Vaishakha", "Jyeshtha", "Ashadha", "Shravana", "Bhadrapada", "Ashvina", "Kartika", "Margashirsha", "Pausha", "Magha", "Phalguna", "Chaitra"];

const EKADASHI_NAMES: Record<string, { Shukla: string, Krishna: string }> = {
  "Chaitra": { Shukla: "Kamada", Krishna: "Papamochani" },
  "Vaishakha": { Shukla: "Mohini", Krishna: "Varuthini" },
  "Jyeshtha": { Shukla: "Nirjala", Krishna: "Apara" },
  "Ashadha": { Shukla: "Devashayani", Krishna: "Yogini" },
  "Shravana": { Shukla: "Shravana Putrada", Krishna: "Kamika" },
  "Bhadrapada": { Shukla: "Parsva", Krishna: "Aja" },
  "Ashvina": { Shukla: "Papankusha", Krishna: "Indira" },
  "Kartika": { Shukla: "Prabodhini", Krishna: "Rama" },
  "Margashirsha": { Shukla: "Mokshada", Krishna: "Utpanna" },
  "Pausha": { Shukla: "Pausha Putrada", Krishna: "Saphala" },
  "Magha": { Shukla: "Jaya", Krishna: "Shattila" },
  "Phalguna": { Shukla: "Amalaki", Krishna: "Vijaya" },
  "Adhik": { Shukla: "Padmini", Krishna: "Parama" }
};

// Default location for Panchang calculations (New Delhi)
const DEFAULT_OBSERVER = new Observer(28.6139, 77.2090, 0);

function getAyanamsa(date: Date): number {
  return 24.1333 + (date.getFullYear() - 2026 + (date.getMonth() / 12)) * (50.29 / 3600);
}

function getLunarMonth(date: Date): string {
  // Find previous New Moon (Amavasya)
  // Since SearchMoonPhase goes forward, we search backward by moving the date back 30 days and finding the next New Moon
  const prevMonthDate = new Date(date.getTime() - 30 * 24 * 60 * 60 * 1000);
  const amavasya = SearchMoonPhase(0, prevMonthDate, 35)?.date || date;
  
  // astronomy-engine EclipticLongitude computes heliocentric longitude.
  // The Sun's geocentric longitude is exactly (Earth's heliocentric longitude + 180) % 360
  const earthLon = EclipticLongitude(Body.Earth, amavasya);
  const tropicalSun = (earthLon + 180) % 360;
  
  let siderealSun = tropicalSun - getAyanamsa(amavasya);
  if (siderealSun < 0) siderealSun += 360;
  
  const rasi = Math.floor(siderealSun / 30);
  return LUNAR_MONTHS[rasi] || "Adhik";
}

export function getMoonStatus(date: Date = new Date()): MoonStatus {
// ... existing getMoonStatus logic
  const angle = MoonPhase(date);
  const rad = angle * (Math.PI / 180);
  const illumination = (1 - Math.cos(rad)) / 2;
  const tithi = Math.floor(angle / 12) + 1;
  const paksha = tithi <= 15 ? "Shukla" : "Krishna";

  let phaseName: MoonPhaseName;
  if (angle < 1 || angle > 359) phaseName = "New Moon";
  else if (angle < 89) phaseName = "Waxing Crescent";
  else if (angle < 91) phaseName = "First Quarter";
  else if (angle < 179) phaseName = "Waxing Gibbous";
  else if (angle < 181) phaseName = "Full Moon";
  else if (angle < 269) phaseName = "Waning Gibbous";
  else if (angle < 271) phaseName = "Third Quarter";
  else phaseName = "Waning Crescent";

  return { angle, phaseName, illumination, tithi, paksha };
}

export function getNextPhase(targetAngle: number, fromDate: Date = new Date()): Date {
  const result = SearchMoonPhase(targetAngle, fromDate, 35);
  return result?.date || new Date();
}

export function getNextMajorMoons(fromDate: Date = new Date()) {
  return {
    nextFullMoon: getNextPhase(180, fromDate),
    nextNewMoon: getNextPhase(0, fromDate),
  };
}

function applyVaishnavaShift(tithiStartDate: Date): Date {
  try {
    const sunriseObj = SearchRiseSet(Body.Sun, DEFAULT_OBSERVER, +1, tithiStartDate, 1);
    const sunriseTime = sunriseObj?.date;
    if (!sunriseTime) return tithiStartDate;

    const arunodayaTime = new Date(sunriseTime.getTime() - (96 * 60 * 1000));
    if (tithiStartDate.getTime() > arunodayaTime.getTime()) {
      return new Date(tithiStartDate.getTime() + (24 * 60 * 60 * 1000));
    }
  } catch (e) {
    console.warn("Could not apply Vaishnava shift, using default Tithi start.", e);
  }
  return tithiStartDate;
}

export function getNextEkadashis(fromDate: Date = new Date()) {
  const shuklaStart = getNextPhase(120, fromDate);
  const shuklaFast = applyVaishnavaShift(shuklaStart);
  
  const krishnaStart = getNextPhase(300, fromDate);
  const krishnaFast = applyVaishnavaShift(krishnaStart);
  
  const nextList = [
    { type: "Shukla", date: shuklaFast, astronomicalStart: shuklaStart },
    { type: "Krishna", date: krishnaFast, astronomicalStart: krishnaStart }
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

  const month0 = getLunarMonth(nextList[0].astronomicalStart);
  const name0 = EKADASHI_NAMES[month0]?.[nextList[0].type as "Shukla" | "Krishna"] || "Ekadashi";

  const month1 = getLunarMonth(nextList[1].astronomicalStart);
  const name1 = EKADASHI_NAMES[month1]?.[nextList[1].type as "Shukla" | "Krishna"] || "Ekadashi";

  return {
    nextEkadashi: {
      type: `${name0} (${nextList[0].type})`,
      date: nextList[0].date,
      astronomicalStart: nextList[0].astronomicalStart,
    },
    followingEkadashi: {
      type: `${name1} (${nextList[1].type})`,
      date: nextList[1].date,
      astronomicalStart: nextList[1].astronomicalStart,
    }
  };
}

export function getFunDistancePhrase(targetDate: Date, fromDate: Date = new Date()): string {
  const diffTime = targetDate.getTime() - fromDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 0) return "It's today! 🎉";
  if (diffDays === 1) return "Just 1 sleep away! 🌙";
  if (diffDays === 2) return "Only 2 days away! ✨";
  if (diffDays < 7) return `Coming up in ${diffDays} days! 🚀`;
  if (diffDays < 14) return `About a week away (${diffDays} days). ⏳`;
  return `Upcoming in ${diffDays} days. 📅`;
}

export function getMonthEvents(year: number, month: number) {
  const events = [];
  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59);
  
  let current = startOfMonth;
  
  // Find Full Moons
  let nextFull = getNextPhase(180, new Date(current.getTime() - 86400000));
  while (nextFull <= endOfMonth) {
    if (nextFull >= startOfMonth) events.push({ name: "Full Moon (Purnima)", type: "moon", date: nextFull });
    nextFull = getNextPhase(180, new Date(nextFull.getTime() + 86400000 * 10));
  }

  // Find New Moons
  let nextNew = getNextPhase(0, new Date(current.getTime() - 86400000));
  while (nextNew <= endOfMonth) {
    if (nextNew >= startOfMonth) events.push({ name: "New Moon (Amavasya)", type: "moon", date: nextNew });
    nextNew = getNextPhase(0, new Date(nextNew.getTime() + 86400000 * 10));
  }

  // Find Ekadashis
  let shukla = getNextPhase(120, new Date(current.getTime() - 86400000));
  while (shukla <= endOfMonth) {
    if (shukla >= startOfMonth) {
      const fastDate = applyVaishnavaShift(shukla);
      const month = getLunarMonth(shukla);
      const name = EKADASHI_NAMES[month]?.Shukla || "Ekadashi";
      events.push({ name: `${name} (Shukla)`, type: "ekadashi", date: fastDate, astronomicalStart: shukla });
    }
    shukla = getNextPhase(120, new Date(shukla.getTime() + 86400000 * 10));
  }

  let krishna = getNextPhase(300, new Date(current.getTime() - 86400000));
  while (krishna <= endOfMonth) {
    if (krishna >= startOfMonth) {
      const fastDate = applyVaishnavaShift(krishna);
      const month = getLunarMonth(krishna);
      const name = EKADASHI_NAMES[month]?.Krishna || "Ekadashi";
      events.push({ name: `${name} (Krishna)`, type: "ekadashi", date: fastDate, astronomicalStart: krishna });
    }
    krishna = getNextPhase(300, new Date(krishna.getTime() + 86400000 * 10));
  }

  // Find Sankrantis (Sun entering new Sidereal Zodiac sign)
  // Each Rasi is 30 degrees sidereal.
  const ayanamsa = getAyanamsa(new Date(year, month, 15)); // Mid-month ayanamsa
  
  // We can search for the 30-degree crossings in tropical by adding Ayanamsa
  // For a month, the Sun moves about 30 degrees. There will usually be one Sankranti.
  // Let's check from 0 to 11 (the 12 signs)
  const SANKRANTI_NAMES = ["Mesha (Aries)", "Vrishabha (Taurus)", "Mithuna (Gemini)", "Karka (Cancer)", "Simha (Leo)", "Kanya (Virgo)", "Tula (Libra)", "Vrischika (Scorpio)", "Dhanu (Sagittarius)", "Makara (Capricorn)", "Kumbha (Aquarius)", "Meena (Pisces)"];
  
  for (let i = 0; i < 12; i++) {
    const siderealTarget = i * 30;
    const tropicalTarget = (siderealTarget + ayanamsa) % 360;
    
    // SearchSunLongitude finds the next time Sun reaches this tropical longitude
    const sankrantiObj = SearchSunLongitude(tropicalTarget, startOfMonth, 35);
    if (sankrantiObj && sankrantiObj.date <= endOfMonth) {
      events.push({
        name: `${SANKRANTI_NAMES[i]} Sankranti`,
        type: "sankranti",
        date: sankrantiObj.date
      });
    }
  }

  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
}

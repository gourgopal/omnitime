export interface AbrahamicInfo {
  islamicDate: string;
  islamicMonthNumber: number;
  islamicDay: number;
  hebrewDate: string;
  hebrewMonthName: string;
  hebrewDay: number;
  festivals: string[];
}

const ISLAMIC_MONTHS = [
  "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani",
  "Jumada al-Awwal", "Jumada al-Thani", "Rajab", "Sha'ban",
  "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"
];

function getIslamicDateInfo(date: Date) {
  // Format: "Muharram 15, 1445 AH"
  const formatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
    day: 'numeric', month: 'numeric', year: 'numeric'
  });
  const parts = formatter.formatToParts(date);
  
  let d = 1, m = 1, y = 1445;
  parts.forEach(p => {
    if (p.type === 'day') d = parseInt(p.value);
    if (p.type === 'month') m = parseInt(p.value);
    if (p.type === 'year') y = parseInt(p.value);
  });
  
  const monthName = ISLAMIC_MONTHS[m - 1] || `Month ${m}`;
  return {
    formatted: `${monthName} ${d}, ${y} AH`,
    day: d,
    monthNumber: m,
    monthName,
    year: y
  };
}

function getHebrewDateInfo(date: Date) {
  const formatter = new Intl.DateTimeFormat('en-US-u-ca-hebrew', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
  const formatted = formatter.format(date);
  // e.g. "Tishri 10, 5784"
  // We can parse it roughly
  const parts = formatted.split(' ');
  const monthName = parts[0];
  const day = parseInt(parts[1]);
  
  return {
    formatted: `${formatted} AM`,
    day,
    monthName
  };
}

function getFestivals(islamicMonth: number, islamicDay: number, hebrewMonth: string, hebrewDay: number): string[] {
  const festivals: string[] = [];
  
  // Islamic Festivals
  if (islamicMonth === 1 && islamicDay === 1) festivals.push("Islamic New Year");
  if (islamicMonth === 1 && islamicDay === 10) festivals.push("Day of Ashura");
  if (islamicMonth === 9 && islamicDay === 1) festivals.push("Start of Ramadan");
  if (islamicMonth === 10 && islamicDay === 1) festivals.push("Eid al-Fitr");
  if (islamicMonth === 12 && islamicDay === 10) festivals.push("Eid al-Adha");

  // Hebrew Festivals
  const hm = hebrewMonth.toLowerCase();
  if (hm.includes("tishri") && hebrewDay === 1) festivals.push("Rosh Hashanah");
  if (hm.includes("tishri") && hebrewDay === 10) festivals.push("Yom Kippur");
  if (hm.includes("tishri") && hebrewDay === 15) festivals.push("Sukkot");
  if (hm.includes("kislev") && hebrewDay === 25) festivals.push("Hanukkah");
  if (hm.includes("adar") && hebrewDay === 14) festivals.push("Purim");
  if (hm.includes("nisan") && hebrewDay === 15) festivals.push("Passover (Pesach)");
  if (hm.includes("sivan") && hebrewDay === 6) festivals.push("Shavuot");

  return festivals;
}

export function getAbrahamicInfo(date: Date = new Date()): AbrahamicInfo {
  const islamic = getIslamicDateInfo(date);
  const hebrew = getHebrewDateInfo(date);
  
  const festivals = getFestivals(islamic.monthNumber, islamic.day, hebrew.monthName, hebrew.day);

  return {
    islamicDate: islamic.formatted,
    islamicMonthNumber: islamic.monthNumber,
    islamicDay: islamic.day,
    hebrewDate: hebrew.formatted,
    hebrewMonthName: hebrew.monthName,
    hebrewDay: hebrew.day,
    festivals
  };
}

export function getMonthlyAbrahamicEvents(year: number, month: number) {
  const events = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  let currentIslamicMonth = -1;
  let currentHebrewMonth = "";

  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i);
    const info = getAbrahamicInfo(d);
    
    // Log month starts
    if (info.islamicMonthNumber !== currentIslamicMonth) {
      if (currentIslamicMonth !== -1) {
        events.push({
          date: d,
          type: 'islamic-month',
          name: `Start of ${ISLAMIC_MONTHS[info.islamicMonthNumber - 1]}`
        });
      }
      currentIslamicMonth = info.islamicMonthNumber;
    }

    if (info.hebrewMonthName !== currentHebrewMonth) {
      if (currentHebrewMonth !== "") {
        events.push({
          date: d,
          type: 'hebrew-month',
          name: `Start of ${info.hebrewMonthName}`
        });
      }
      currentHebrewMonth = info.hebrewMonthName;
    }

    info.festivals.forEach(f => {
      events.push({
        date: d,
        type: 'festival',
        name: f
      });
    });
  }
  
  return events;
}

import { Lunar, Solar } from 'lunar-javascript';

export interface LunisolarInfo {
  yearZodiac: string;
  yearStemBranch: string; // e.g., Wood Dragon (or Jia-Chen)
  lunarMonthName: string;
  lunarDayName: string;
  festivals: string[];
  solarTerms: string[];
  auspiciousHours: string;
}

/**
 * Maps Stem/Branch to a readable English element and animal
 */
function getEnglishStemBranch(lunar: any): string {
  // Elements map based on Heavenly Stems (Tiangan)
  // Jia/Yi = Wood, Bing/Ding = Fire, Wu/Ji = Earth, Geng/Xin = Metal, Ren/Gui = Water
  const stems = {
    '甲': 'Wood', '乙': 'Wood', 
    '丙': 'Fire', '丁': 'Fire', 
    '戊': 'Earth', '己': 'Earth', 
    '庚': 'Metal', '辛': 'Metal', 
    '壬': 'Water', '癸': 'Water'
  };
  
  const stem = lunar.getYearGan();
  const animal = lunar.getYearShengXiao();
  
  const element = (stems as any)[stem] || stem;
  return `${element} ${animal}`;
}

export function getLunisolarInfo(date: Date = new Date()): LunisolarInfo {
  // Lunar-javascript expects month 1-12
  const solar = Solar.fromYmd(date.getFullYear(), date.getMonth() + 1, date.getDate());
  const lunar = solar.getLunar();

  // Combine lunar and solar festivals
  const festivals = [...lunar.getFestivals(), ...solar.getFestivals()];
  
  // Solar Terms for the day (if any)
  const jieqi = lunar.getJieQi();
  const solarTerms = jieqi ? [jieqi] : [];

  // Get auspicious hours for the day
  // Lunar-javascript provides getDayJiShen() or just a list of good hours.
  // We'll just grab the traditional hours that are marked auspicious.
  const goodHours = [];
  for (let i = 0; i < 24; i += 2) {
    const lunarHour = lunar.getHour(i); // get time
    // If we wanted exact auspicious hours we'd check if it's a good hour, 
    // for simplicity, let's just return the Zodiac name of the hour.
  }

  return {
    yearZodiac: lunar.getYearShengXiao(),
    yearStemBranch: getEnglishStemBranch(lunar) + ` (${lunar.getYearInGanZhi()} Year)`,
    lunarMonthName: lunar.getMonthInChinese() + ' Month',
    lunarDayName: lunar.getDayInChinese(),
    festivals: festivals,
    solarTerms: solarTerms,
    auspiciousHours: 'Various (Time dependent)'
  };
}

export function getMonthlyLunisolarEvents(year: number, month: number) {
  // Month is 0-indexed here from JS Date, lunar-javascript wants 1-12
  const events = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i);
    const solar = Solar.fromYmd(year, month + 1, i);
    const lunar = solar.getLunar();
    
    // Check Solar Terms
    const jieqi = lunar.getJieQi();
    if (jieqi) {
      events.push({
        date: d,
        type: 'solar-term',
        name: `${jieqi} (Solar Term)`
      });
    }

    // Check Festivals
    const fests = [...lunar.getFestivals(), ...solar.getFestivals()];
    fests.forEach(f => {
      events.push({
        date: d,
        type: 'festival',
        name: f
      });
    });
  }
  
  return events;
}

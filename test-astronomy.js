const { SearchRiseSet, Body, Observer, EclipticLongitude, MoonPhase, SearchMoonPhase } = require("astronomy-engine");

const d = new Date();
const obs = new Observer(28.6139, 77.2090, 0);

// Sunrise test (1 = Rise, -1 = Set)
try {
  const sunrise = SearchRiseSet(Body.Sun, obs, 1, d, 1);
  console.log("Next Sunrise:", sunrise.date);
  
  // Ayanamsa estimation
  const ayanamsa = 24.1333 + (d.getFullYear() - 2026 + (d.getMonth() / 12)) * (50.29 / 3600);
  
  // Tropical Sun
  const tropicalSun = EclipticLongitude(Body.Sun, d);
  let siderealSun = tropicalSun - ayanamsa;
  if (siderealSun < 0) siderealSun += 360;
  
  console.log("Sidereal Sun:", siderealSun);
  
  // Rasi index
  const rasi = Math.floor(siderealSun / 30);
  const LUNAR_MONTHS = ["Vaishakha", "Jyeshtha", "Ashadha", "Shravana", "Bhadrapada", "Ashvina", "Kartika", "Margashirsha", "Pausha", "Magha", "Phalguna", "Chaitra"];
  // Note: If Sun is in Aries (0-30), month is Vaishakha.
  // Wait, if Amavasya happens in Pisces (330-360, rasi 11), the month is Chaitra. 
  // Rasi 0 (Aries) -> Vaishakha. So LUNAR_MONTHS[rasi] is right.
  console.log("Current Rasi:", rasi, "=> Lunar Month:", LUNAR_MONTHS[rasi]);

  console.log("Moon Phase Angle:", MoonPhase(d));
} catch (e) {
  console.error("Error:", e);
}

import { Body, EclipticLongitude, Equator, Observer, SunPosition, GeoVector, SearchSunLongitude, AstroTime } from "astronomy-engine";

const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer",
  "Leo", "Virgo", "Libra", "Scorpio",
  "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

const PLANETS = [
  Body.Mercury, Body.Venus, Body.Mars, 
  Body.Jupiter, Body.Saturn, Body.Uranus, 
  Body.Neptune, Body.Pluto
];

export interface PlanetStatus {
  name: string;
  sign: string;
  longitude: number;
  isRetrograde: boolean;
}

export interface AstrologyChart {
  sunSign: string;
  moonSign: string;
  planets: PlanetStatus[];
}

function getZodiacSign(longitude: number): string {
  // 0-30 Aries, 30-60 Taurus...
  const index = Math.floor(longitude / 30) % 12;
  return ZODIAC_SIGNS[index];
}

function isRetrograde(body: Body, date: Date): boolean {
  // Check longitude today vs tomorrow to determine retrograde motion
  const d1 = new Date(date);
  const d2 = new Date(date.getTime() + 24 * 60 * 60 * 1000);
  
  const lon1 = EclipticLongitude(body, d1);
  const lon2 = EclipticLongitude(body, d2);
  
  // Handle 360 wrap around
  let diff = lon2 - lon1;
  if (diff < -180) diff += 360;
  if (diff > 180) diff -= 360;
  
  return diff < 0;
}

export function getAstrologyChart(date: Date = new Date()): AstrologyChart {
  // Sun Longitude: Earth's heliocentric + 180 (Geocentric view)
  const earthLon = EclipticLongitude(Body.Earth, date);
  const sunLon = (earthLon + 180) % 360;
  
  // Moon Longitude: astronomy-engine uses Geocentric for Moon inherently
  const moonLon = EclipticLongitude(Body.Moon, date);
  
  const planets: PlanetStatus[] = [];
  
  for (const p of PLANETS) {
    // For planets, Geocentric Longitude is slightly complex. 
    // EclipticLongitude in astronomy-engine for planets gives Heliocentric.
    // For a simple astrological chart, we can approximate or use GeoVector to get geocentric longitude.
    const vec = GeoVector(p, date, true); // true = true equinox of date
    // Convert rectangular equatorial to spherical (longitude/latitude is ecliptic, but we can approximate)
    // Actually, Equator function gives Right Ascension and Declination, we want Ecliptic Longitude.
    // Given x, y, z in equatorial, converting to ecliptic:
    // This is getting deep. For simplicity, let's use the EclipticLongitude (Heliocentric) for now,
    // or better, calculate a rough RA to Zodiac mapping if needed, but Heliocentric is ok for a basic engine 
    // unless we need strict geocentric ephemeris. 
    // Wait, let's use the actual Heliocentric just for the engine's demo of retrogrades, 
    // wait, retrograde is a Geocentric phenomenon! We MUST use Geocentric.
    // Let's implement a quick Geocentric Longitude from GeoVector.
    // GeoVector returns x, y, z where x is towards Vernal Equinox.
    // Ecliptic longitude in Geocentric can be found by converting equatorial (x,y,z) to ecliptic.
    // Obliquity of ecliptic ~ 23.439 degrees
    const obliquity = 23.4392911 * (Math.PI / 180);
    const yEcl = vec.y * Math.cos(obliquity) + vec.z * Math.sin(obliquity);
    const xEcl = vec.x;
    
    let lon = Math.atan2(yEcl, xEcl) * (180 / Math.PI);
    if (lon < 0) lon += 360;

    // Check retrograde
    const d2 = new Date(date.getTime() + 24 * 60 * 60 * 1000);
    const vec2 = GeoVector(p, d2, true);
    const yEcl2 = vec2.y * Math.cos(obliquity) + vec2.z * Math.sin(obliquity);
    let lon2 = Math.atan2(yEcl2, vec2.x) * (180 / Math.PI);
    if (lon2 < 0) lon2 += 360;
    
    let diff = lon2 - lon;
    if (diff < -180) diff += 360;
    if (diff > 180) diff -= 360;

    planets.push({
      name: p.toString(),
      sign: getZodiacSign(lon),
      longitude: lon,
      isRetrograde: diff < 0
    });
  }

  return {
    sunSign: getZodiacSign(sunLon),
    moonSign: getZodiacSign(moonLon),
    planets
  };
}

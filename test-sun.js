const { Body, EclipticLongitude, SunPosition, Ecliptic, GeoVector, GeoMoon, SearchSunLongitude, Equator } = require("astronomy-engine");

const d = new Date();

try {
  // Method 1: GeoVector
  const vec = GeoVector(Body.Sun, d, true);
  console.log("GeoVector length:", Math.sqrt(vec.x*vec.x + vec.y*vec.y + vec.z*vec.z));
  
  // Actually, there's a simpler way to get the ecliptic longitude of the Sun.
  // The Sun's ecliptic longitude is precisely the angle of the Earth from the Sun + 180 degrees.
  const earthLon = EclipticLongitude(Body.Earth, d);
  let sunLon = (earthLon + 180) % 360;
  console.log("Sun Ecliptic Longitude via Earth:", sunLon);
  
  // Let's verify this!
  console.log("Earth helio lon:", earthLon);

} catch (e) {
  console.error("Error:", e);
}

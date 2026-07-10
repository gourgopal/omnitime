import { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://omnitime.co";

  const routes = [
    '',
    '/world-clock',
    '/calculators',
    '/calculators/date',
    '/calculators/ev-charging',
    '/calculators/astronomy',
    '/calculators/lunisolar',
    '/calculators/abrahamic',
    '/calculators/astrology',
    '/fun',
    '/astronomy',
    '/explore',
    '/utilities',
    '/sitemap',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: route === "" ? 1 : 0.8,
  }));
}

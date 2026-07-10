import Link from "next/link";
import { Map } from "lucide-react";

export default function SitemapPage() {
  const routes = [
    { name: "Home Dashboard", path: "/" },
    { name: "Date Calculators", path: "/calculators/date" },
    { name: "Fun & Astrology", path: "/fun" },
    { name: "Utilities (Timers)", path: "/utilities" },
    { name: "Explore (Weather, Currency, History)", path: "/explore" },
    { name: "Astronomy (Ekadashi, Moon)", path: "/astronomy" },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center flex items-center justify-center gap-2">
        <Map className="text-primary" /> HTML Sitemap
      </h1>

      <div className="glass-panel p-8">
        <ul className="space-y-4 text-lg">
          {routes.map((route) => (
            <li key={route.path}>
              <Link href={route.path} className="text-primary hover:underline hover:text-blue-600 transition-colors">
                {route.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

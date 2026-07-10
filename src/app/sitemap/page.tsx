import Link from "next/link";
import { Map, Globe } from "lucide-react";

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
        <ul className="space-y-4">
          <li><Link href="/" className="text-primary hover:underline flex items-center gap-2"><Globe className="w-4 h-4"/> Dashboard</Link></li>
          <li><Link href="/world-clock" className="text-primary hover:underline flex items-center gap-2"><Globe className="w-4 h-4"/> World Clock</Link></li>
          <li><Link href="/calculators" className="text-primary hover:underline flex items-center gap-2"><Globe className="w-4 h-4"/> Calculators Hub</Link></li>
          <li><Link href="/calculators/date" className="text-primary hover:underline flex items-center gap-2"><Globe className="w-4 h-4"/> Date Calculators</Link></li>
          <li><Link href="/calculators/ev-charging" className="text-primary hover:underline flex items-center gap-2"><Globe className="w-4 h-4"/> EV Charging Calculator</Link></li>
          <li><Link href="/calculators/astronomy" className="text-primary hover:underline flex items-center gap-2"><Globe className="w-4 h-4"/> Lunar & Ekadashi Calculator</Link></li>
          <li><Link href="/calculators/lunisolar" className="text-primary hover:underline flex items-center gap-2"><Globe className="w-4 h-4"/> East-Asian Lunisolar Engine</Link></li>
          <li><Link href="/calculators/abrahamic" className="text-primary hover:underline flex items-center gap-2"><Globe className="w-4 h-4"/> Abrahamic Engine</Link></li>
          <li><Link href="/calculators/astrology" className="text-primary hover:underline flex items-center gap-2"><Globe className="w-4 h-4"/> Astrology Engine</Link></li>
          <li><Link href="/fun" className="text-primary hover:underline flex items-center gap-2"><Globe className="w-4 h-4"/> Fun & Age</Link></li>
          <li><Link href="/utilities" className="text-primary hover:underline flex items-center gap-2"><Globe className="w-4 h-4"/> Utilities</Link></li>
          <li><Link href="/explore" className="text-primary hover:underline flex items-center gap-2"><Globe className="w-4 h-4"/> Explore (Weather, Currency, History)</Link></li>
          <li><Link href="/astronomy" className="text-primary hover:underline flex items-center gap-2"><Globe className="w-4 h-4"/> Astronomy</Link></li>
        </ul>
      </div>
    </div>
  );
}

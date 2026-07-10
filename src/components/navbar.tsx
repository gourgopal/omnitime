"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { Clock, Moon, Sun, Menu, X, Monitor, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "@/components/location-provider";
import { usePreferences } from "@/components/preferences-provider";
import { PwaInstallPrompt } from "./pwa-install-prompt";

function getFlagEmoji(countryCode: string) {
  if (!countryCode) return "🌍";
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char =>  127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { location, isLoading } = useLocation();
  const { locale, setLocale } = usePreferences();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-[100] w-full border-b border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Clock className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold tracking-tight">OmniTime</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <div className="relative group py-4">
            <Link href="/calculators" className="text-sm font-medium hover:text-primary transition-colors cursor-pointer">Calculators</Link>
            <div className="absolute top-full left-0 mt-0 w-48 bg-[var(--background)] border border-[var(--glass-border)] shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all rounded-lg overflow-hidden flex flex-col">
              <Link href="/calculators/date" className="px-4 py-3 hover:bg-[var(--glass-bg)] text-sm font-medium transition-colors">Date Add/Sub/Diff</Link>
              <Link href="/calculators/ev-charging" className="px-4 py-3 hover:bg-[var(--glass-bg)] text-sm font-medium transition-colors">EV Charging Time</Link>
              <Link href="/calculators/astronomy" className="px-4 py-3 hover:bg-[var(--glass-bg)] text-sm font-medium transition-colors">Lunar Calculator</Link>
              <Link href="/calculators/lunisolar" className="px-4 py-3 hover:bg-[var(--glass-bg)] text-sm font-medium transition-colors">East-Asian Lunisolar</Link>
              <Link href="/calculators/abrahamic" className="px-4 py-3 hover:bg-[var(--glass-bg)] text-sm font-medium transition-colors">Abrahamic Engine</Link>
              <Link href="/calculators/astrology" className="px-4 py-3 hover:bg-[var(--glass-bg)] text-sm font-medium transition-colors">Astrology Engine</Link>
            </div>
          </div>
          <Link href="/world-clock" className="text-sm font-medium hover:text-primary transition-colors">World Clock</Link>
          <Link href="/fun" className="text-sm font-medium hover:text-primary transition-colors">Fun & Age</Link>
          <Link href="/astronomy" className="text-sm font-medium hover:text-primary transition-colors">Astronomy</Link>
          <Link href="/explore" className="text-sm font-medium hover:text-primary transition-colors">Explore</Link>
          <Link href="/utilities" className="text-sm font-medium hover:text-primary transition-colors">Utilities</Link>
        </nav>

        <div className="flex items-center space-x-4">
          
          <PwaInstallPrompt />

          {/* Locale Dropdown */}
          {mounted && (
            <div className="relative group hidden sm:block">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)] cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <span className="text-lg leading-none">{getFlagEmoji(locale === "GLB" ? "" : locale.substring(0, 2))}</span>
                <span className="text-xs font-bold text-[var(--muted-foreground)]">{locale}</span>
              </div>
              
              <div className="absolute top-full right-0 mt-2 w-48 bg-[var(--background)] border border-[var(--glass-border)] shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all rounded-lg overflow-hidden flex flex-col z-[100]">
                <div className="px-4 py-2 text-xs font-semibold text-[var(--muted-foreground)] bg-[var(--glass-bg)]">Region / Locale</div>
                <button onClick={() => setLocale("GLB")} className={`px-4 py-3 text-left hover:bg-[var(--glass-bg)] text-sm font-medium transition-colors ${locale === "GLB" ? "text-primary" : ""}`}>🌍 Global</button>
                <button onClick={() => setLocale("IN (Hindi)")} className={`px-4 py-3 text-left hover:bg-[var(--glass-bg)] text-sm font-medium transition-colors ${locale === "IN (Hindi)" ? "text-primary" : ""}`}>🇮🇳 India (Hindi)</button>
                <button onClick={() => setLocale("IN (English)")} className={`px-4 py-3 text-left hover:bg-[var(--glass-bg)] text-sm font-medium transition-colors ${locale === "IN (English)" ? "text-primary" : ""}`}>🇮🇳 India (English)</button>
                <button onClick={() => setLocale("US")} className={`px-4 py-3 text-left hover:bg-[var(--glass-bg)] text-sm font-medium transition-colors ${locale === "US" ? "text-primary" : ""}`}>🇺🇸 United States</button>
                <button onClick={() => setLocale("UK")} className={`px-4 py-3 text-left hover:bg-[var(--glass-bg)] text-sm font-medium transition-colors ${locale === "UK" ? "text-primary" : ""}`}>🇬🇧 United Kingdom</button>
              </div>
            </div>
          )}

          {mounted && (
            <div className="flex items-center bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-full p-1">
              <button
                onClick={() => setTheme("light")}
                className={`p-2 rounded-full transition-all ${theme === "light" ? "bg-white text-black shadow-sm" : "text-foreground hover:bg-black/5 dark:hover:bg-white/10"}`}
                title="Light Mode"
              >
                <Sun className="h-4 w-4" />
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`p-2 rounded-full transition-all ${theme === "dark" ? "bg-slate-800 text-white shadow-sm" : "text-foreground hover:bg-black/5 dark:hover:bg-white/10"}`}
                title="Dark Mode"
              >
                <Moon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setTheme("system")}
                className={`p-2 rounded-full transition-all ${theme === "system" ? "bg-slate-200 dark:bg-slate-700 shadow-sm" : "text-foreground hover:bg-black/5 dark:hover:bg-white/10"}`}
                title="System Theme"
              >
                <Monitor className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-[var(--glass-border)] bg-[var(--background)] p-4 space-y-4 shadow-lg absolute w-full left-0 z-[100]">
          <Link href="/calculators" className="block text-sm font-bold hover:text-primary" onClick={() => setIsMenuOpen(false)}>Calculators Hub</Link>
          <div className="pl-4 space-y-3 border-l-2 border-[var(--glass-border)]">
            <Link href="/calculators/date" className="block text-sm font-medium hover:text-primary" onClick={() => setIsMenuOpen(false)}>Date Add/Sub/Diff</Link>
            <Link href="/calculators/ev-charging" className="block text-sm font-medium hover:text-primary" onClick={() => setIsMenuOpen(false)}>EV Charging Time</Link>
            <Link href="/calculators/astronomy" className="block text-sm font-medium hover:text-primary" onClick={() => setIsMenuOpen(false)}>Lunar Calculator</Link>
            <Link href="/calculators/lunisolar" className="block text-sm font-medium hover:text-primary" onClick={() => setIsMenuOpen(false)}>East-Asian Lunisolar</Link>
            <Link href="/calculators/abrahamic" className="block text-sm font-medium hover:text-primary" onClick={() => setIsMenuOpen(false)}>Abrahamic Engine</Link>
            <Link href="/calculators/astrology" className="block text-sm font-medium hover:text-primary" onClick={() => setIsMenuOpen(false)}>Astrology Engine</Link>
          </div>
          <Link href="/world-clock" className="block text-sm font-medium hover:text-primary" onClick={() => setIsMenuOpen(false)}>World Clock</Link>
          <Link href="/fun" className="block text-sm font-medium hover:text-primary" onClick={() => setIsMenuOpen(false)}>Fun & Age</Link>
          <Link href="/astronomy" className="block text-sm font-medium hover:text-primary" onClick={() => setIsMenuOpen(false)}>Astronomy</Link>
          <Link href="/explore" className="block text-sm font-medium hover:text-primary" onClick={() => setIsMenuOpen(false)}>Explore</Link>
          <Link href="/utilities" className="block text-sm font-medium hover:text-primary" onClick={() => setIsMenuOpen(false)}>Utilities</Link>
        </div>
      )}
    </header>
  );
}

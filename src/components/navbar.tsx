"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { Clock, Moon, Sun, Menu } from "lucide-react";
import { useState, useEffect } from "react";

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Clock className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold tracking-tight">OmniTime</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/calculators/date" className="text-sm font-medium hover:text-primary transition-colors">Calculators</Link>
          <Link href="/world-clock" className="text-sm font-medium hover:text-primary transition-colors">World Clock</Link>
          <Link href="/fun" className="text-sm font-medium hover:text-primary transition-colors">Fun & Astrology</Link>
          <Link href="/utilities" className="text-sm font-medium hover:text-primary transition-colors">Utilities</Link>
        </nav>

        <div className="flex items-center space-x-4">
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-[var(--glass-border)] bg-[var(--background)] p-4 space-y-4">
          <Link href="/calculators/date" className="block text-sm font-medium hover:text-primary" onClick={() => setIsMenuOpen(false)}>Calculators</Link>
          <Link href="/world-clock" className="block text-sm font-medium hover:text-primary" onClick={() => setIsMenuOpen(false)}>World Clock</Link>
          <Link href="/fun" className="block text-sm font-medium hover:text-primary" onClick={() => setIsMenuOpen(false)}>Fun & Astrology</Link>
          <Link href="/utilities" className="block text-sm font-medium hover:text-primary" onClick={() => setIsMenuOpen(false)}>Utilities</Link>
        </div>
      )}
    </header>
  );
}

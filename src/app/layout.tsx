import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { TimeFormatProvider } from "@/components/time-format-provider";
import { LocationProvider } from "@/components/location-provider";
import { NotificationProvider } from "@/components/notification-provider";
import { PreferencesProvider } from "@/components/preferences-provider";
import { Navbar } from "@/components/navbar";
import { ShareButton } from "@/components/ShareButton";
import AudioWidget from "@/components/AudioWidget";
import { EVProvider } from "@/components/ev-provider";
import EVWidget from "@/components/EVWidget";
import EVSummaryModal from "@/components/EVSummaryModal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "OmniTime | The Ultimate Time Utility",
    template: "%s | OmniTime",
  },
  description: "A super time utility for calculators, timezone conversions, astronomy, fun holidays, and more.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <PreferencesProvider>
            <LocationProvider>
              <TimeFormatProvider>
                <NotificationProvider>
                  <EVProvider>
                    <Navbar />
                    <main className="flex-1 flex flex-col">
                      {children}
                    </main>
                    <footer className="py-6 border-t border-[var(--glass-border)] bg-[var(--background)]/80 text-center text-sm text-[var(--muted-foreground)] mb-32 md:mb-0">
                      <p>&copy; {new Date().getFullYear()} OmniTime. All rights reserved.</p>
                      <p className="mt-2">
                        <a href="/sitemap" className="hover:text-primary transition-colors underline decoration-dotted">HTML Sitemap</a>
                      </p>
                    </footer>
                    <ShareButton />
                    
                    <div className="fixed bottom-4 left-4 z-[999] flex flex-col gap-3 items-start pointer-events-none *:pointer-events-auto">
                      <EVWidget />
                      <AudioWidget />
                    </div>
                    
                    <EVSummaryModal />
                  </EVProvider>
                </NotificationProvider>
              </TimeFormatProvider>
            </LocationProvider>
          </PreferencesProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

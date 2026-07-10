"use client";

import { X, Bell, Calendar, Sparkles, Moon } from "lucide-react";
import { NotificationPrefs } from "./notification-provider";
import { useEffect, useState } from "react";

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefs: NotificationPrefs;
  updatePrefs: (newPrefs: Partial<NotificationPrefs>) => void;
  onRequestPermission: () => void;
}

export function NotificationModal({ isOpen, onClose, prefs, updatePrefs, onRequestPermission }: NotificationModalProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[var(--background)] border border-[var(--glass-border)] rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Bell className="w-8 h-8 text-primary animate-bounce" />
          </div>
        </div>

        <h2 className="text-2xl font-black tracking-tighter text-center mb-2">Enable Smart Alerts</h2>
        <p className="text-center text-[var(--muted-foreground)] text-sm mb-6">Never miss an important date. Select which notifications you'd like to receive on this device.</p>

        <div className="space-y-3 mb-8">
          <label className="flex items-center gap-4 p-4 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] hover:bg-[var(--glass-border)]/50 transition-colors cursor-pointer">
            <input 
              type="checkbox" 
              checked={prefs.birthdays} 
              onChange={(e) => updatePrefs({ birthdays: e.target.checked })}
              className="w-5 h-5 accent-primary"
            />
            <div className="flex-1">
              <div className="font-bold flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-500"/> Birthdays & Events</div>
              <div className="text-xs text-[var(--muted-foreground)]">Reminders at 15, 7, 3, and 1 day to go</div>
            </div>
          </label>

          <label className="flex items-center gap-4 p-4 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] hover:bg-[var(--glass-border)]/50 transition-colors cursor-pointer">
            <input 
              type="checkbox" 
              checked={prefs.daily} 
              onChange={(e) => updatePrefs({ daily: e.target.checked })}
              className="w-5 h-5 accent-primary"
            />
            <div className="flex-1">
              <div className="font-bold flex items-center gap-2"><Sparkles className="w-4 h-4 text-yellow-500"/> Daily Morning Briefing</div>
              <div className="text-xs text-[var(--muted-foreground)]">Start your day with the date and a fresh joke/quote</div>
            </div>
          </label>

          <label className="flex items-center gap-4 p-4 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] hover:bg-[var(--glass-border)]/50 transition-colors cursor-pointer">
            <input 
              type="checkbox" 
              checked={prefs.spiritual} 
              onChange={(e) => updatePrefs({ spiritual: e.target.checked })}
              className="w-5 h-5 accent-primary"
            />
            <div className="flex-1">
              <div className="font-bold flex items-center gap-2"><Moon className="w-4 h-4 text-purple-500"/> Spiritual & Moon Phases</div>
              <div className="text-xs text-[var(--muted-foreground)]">Ekadashi alerts and full/new moon reminders</div>
            </div>
          </label>
        </div>

        <button 
          onClick={onRequestPermission}
          className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          <Bell className="w-5 h-5" /> Enable Notifications
        </button>
      </div>
    </div>
  );
}

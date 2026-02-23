"use client";

import { User } from "@supabase/supabase-js";
import { Bell, Menu } from "lucide-react";

interface TopbarProps {
  user: User;
  profile: any;
}

export function Topbar({ user, profile }: TopbarProps) {
  return (
    <header className="h-20 border-b border-white/5 bg-obsidian/80 backdrop-blur-xl flex items-center justify-between px-6 md:px-10 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button className="md:hidden p-2 text-ivory/60 hover:text-ivory">
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-serif italic hidden md:block">
          Command Center
        </h1>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full border border-champagne/30 bg-champagne/5 text-champagne text-xs font-mono uppercase tracking-widest">
          <span className="w-2 h-2 rounded-full bg-champagne animate-pulse" />
          {profile?.plan || "Free"} Plan
        </div>

        <button className="relative p-2 text-ivory/60 hover:text-ivory transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-obsidian" />
        </button>

        <div className="flex items-center gap-3 pl-6 border-l border-white/10">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium">
              {profile?.full_name || user.email?.split("@")[0]}
            </p>
            <p className="text-xs text-ivory/50 font-mono">{user.email}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate to-obsidian border border-white/10 flex items-center justify-center text-champagne font-serif italic text-lg">
            {(profile?.full_name || user.email || "U")[0].toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}

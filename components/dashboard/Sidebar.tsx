"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Users,
  Settings,
  CreditCard,
  LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/browser";
import { useRouter } from "next/navigation";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Posts", href: "/dashboard/posts", icon: FileText },
  { name: "Calendar", href: "/dashboard/calendar", icon: Calendar },
  { name: "Accounts", href: "/dashboard/accounts", icon: Users },
  { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="w-64 hidden md:flex flex-col border-r border-white/5 bg-slate/20 backdrop-blur-xl h-screen sticky top-0">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-champagne to-yellow-600 flex items-center justify-center">
            <span className="font-serif italic font-bold text-obsidian text-lg">
              P
            </span>
          </div>
          <span className="font-bold text-xl tracking-tight">PostPilot</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-8">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative group ${
                isActive
                  ? "text-champagne bg-white/5"
                  : "text-ivory/60 hover:text-ivory hover:bg-white/5"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 w-1 h-6 bg-champagne rounded-r-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
              <item.icon
                className={`w-5 h-5 ${isActive ? "text-champagne" : "group-hover:text-ivory"}`}
              />
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left text-ivory/60 hover:text-red-400 hover:bg-red-400/10 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

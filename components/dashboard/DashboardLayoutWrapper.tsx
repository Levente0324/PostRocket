"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

type Props = {
  children: React.ReactNode;
  planLabel: string;
  isPro: boolean;
  isElite?: boolean;
  userEmail: string;
};

export function DashboardLayoutWrapper({
  children,
  planLabel,
  isPro,
  isElite,
  userEmail,
}: Props) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setIsMobileMenuOpen(false);
  }

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <div className="bg-light-background flex h-screen overflow-hidden font-sans antialiased text-gray-900 selection:bg-light-primary/30">
      {/* Mobile Header (only visible on lg and below) */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-light-surface-dark border-b border-white/5 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-light-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-[18px]">
              rocket_launch
            </span>
          </div>
          <span className="font-display italic text-2xl font-bold tracking-tight text-white/90">
            PostRocket
          </span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-white/70 hover:text-white p-2"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop fixed height, Mobile drawer */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex-shrink-0 lg:h-screen
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <Sidebar
          planLabel={planLabel}
          isPro={isPro}
          isElite={isElite}
          userEmail={userEmail}
        />
      </div>

      {/* Main Content Area - Independently scrollable */}
      <main className="flex-1 flex flex-col min-w-0 pt-16 lg:pt-0 relative z-10 w-full h-full lg:h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

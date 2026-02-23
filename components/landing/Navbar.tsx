"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 backdrop-blur-md bg-obsidian/80 border-b border-white/5"
    >
      <Link href="/" className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-champagne to-yellow-600 flex items-center justify-center">
          <span className="font-serif italic font-bold text-obsidian text-lg">
            P
          </span>
        </div>
        <span className="font-bold text-xl tracking-tight">PostPilot</span>
      </Link>

      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-ivory/70">
        <Link
          href="#features"
          className="hover:text-champagne transition-colors"
        >
          Features
        </Link>
        <Link
          href="#how-it-works"
          className="hover:text-champagne transition-colors"
        >
          How it Works
        </Link>
        <Link
          href="#pricing"
          className="hover:text-champagne transition-colors"
        >
          Pricing
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/login"
          className="text-sm font-medium hover:text-champagne transition-colors"
        >
          Login
        </Link>
        <Button
          asChild
          className="bg-champagne text-obsidian hover:bg-champagne/90 rounded-full px-6"
        >
          <Link href="/login">Start Free</Link>
        </Button>
      </div>
    </motion.nav>
  );
}

"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-32 pb-20 px-6 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-champagne/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-champagne/30 bg-champagne/5 text-champagne text-xs font-mono mb-8 uppercase tracking-widest"
        >
          <span className="w-2 h-2 rounded-full bg-champagne animate-pulse" />
          AI-Native Scheduling
        </motion.div>

        <motion.h1
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-[0.9]"
        >
          Marketing meets <br />
          <span className="font-serif italic font-normal text-champagne">
            Automation.
          </span>
        </motion.h1>

        <motion.p
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-lg md:text-xl text-ivory/60 max-w-2xl mx-auto mb-12 font-light"
        >
          Orchestrate your entire social presence from a single, intelligent
          command center. Stop managing. Start directing.
        </motion.p>

        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button
            asChild
            size="lg"
            className="rounded-full px-8 h-14 text-base w-full sm:w-auto"
          >
            <Link href="/login">Start Free Trial →</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-full px-8 h-14 text-base w-full sm:w-auto border-white/10 hover:bg-white/5"
          >
            <Link href="#demo">
              <Play className="w-4 h-4 mr-2" /> Watch Demo
            </Link>
          </Button>
        </motion.div>

        {/* Mockup */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-20 relative mx-auto max-w-5xl"
        >
          <div className="glass-panel rounded-2xl p-2 border border-white/10 shadow-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
            <div className="bg-obsidian/90 rounded-xl overflow-hidden border border-white/5 aspect-video relative flex items-center justify-center">
              <div className="absolute inset-0 bg-[url('https://picsum.photos/1920/1080')] bg-cover bg-center opacity-30" />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/50 to-transparent" />
              <div className="z-10 text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate/50 backdrop-blur-md border border-white/10 flex items-center justify-center mx-auto mb-4">
                  <span className="font-serif italic text-3xl text-champagne">
                    P
                  </span>
                </div>
                <p className="font-mono text-sm text-ivory/50 uppercase tracking-widest">
                  Dashboard Preview
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

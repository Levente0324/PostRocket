"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function CTA() {
  return (
    <section className="py-32 px-6 relative bg-obsidian border-t border-white/5 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-champagne/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.h2
          initial={{ y: 40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl md:text-7xl font-black tracking-tighter mb-6"
        >
          Master the{" "}
          <span className="font-serif italic font-normal text-champagne">
            Algorithm
          </span>
        </motion.h2>

        <motion.p
          initial={{ y: 40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-lg md:text-xl text-ivory/60 max-w-2xl mx-auto mb-12 font-light"
        >
          Join the exclusive circle of brands leveraging PostPilot to dominate
          the digital landscape.
        </motion.p>

        <motion.div
          initial={{ y: 40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <Button
            asChild
            size="lg"
            className="rounded-full px-12 h-16 text-lg w-full sm:w-auto shadow-[0_0_40px_rgba(201,168,76,0.3)] hover:shadow-[0_0_60px_rgba(201,168,76,0.5)] transition-shadow"
          >
            <Link href="/login">Start Automating</Link>
          </Button>
          <p className="mt-6 text-xs font-mono text-ivory/40 uppercase tracking-widest">
            No credit card required • 14-day free trial
          </p>
        </motion.div>
      </div>
    </section>
  );
}

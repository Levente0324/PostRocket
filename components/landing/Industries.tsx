"use client";

import { motion } from "motion/react";
import {
  Dumbbell,
  Scissors,
  Utensils,
  Home,
  Shirt,
  Palette,
  Wine,
  Diamond,
} from "lucide-react";

const industries = [
  { icon: Dumbbell, name: "Gyms & Wellness" },
  { icon: Scissors, name: "Salons & Spas" },
  { icon: Utensils, name: "Fine Dining" },
  { icon: Home, name: "Real Estate" },
  { icon: Shirt, name: "Fashion Retail" },
  { icon: Palette, name: "Design Agencies" },
  { icon: Wine, name: "Nightlife" },
  { icon: Diamond, name: "Luxury Goods" },
];

export function Industries() {
  return (
    <section className="py-32 px-6 relative bg-obsidian border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16">
          <div>
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-black tracking-tighter"
            >
              Tailored for{" "}
              <span className="font-serif italic font-normal text-champagne">
                Visionaries
              </span>
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-ivory/50 font-mono text-xs uppercase tracking-widest mt-4"
            >
              Industry-Specific Models Pre-Trained For Impact
            </motion.p>
          </div>
          <motion.a
            href="#pricing"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-champagne font-bold text-sm uppercase tracking-widest hover:text-white transition-colors mt-8 md:mt-0"
          >
            View All Sectors →
          </motion.a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {industries.map((industry, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="glass-panel rounded-2xl p-8 border border-white/5 flex flex-col items-center justify-center text-center group hover:border-champagne/30 hover:bg-white/5 transition-all cursor-pointer"
            >
              <industry.icon className="w-8 h-8 text-ivory/40 mb-4 group-hover:text-champagne transition-colors" />
              <span className="font-medium text-sm text-ivory/80 group-hover:text-white transition-colors">
                {industry.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

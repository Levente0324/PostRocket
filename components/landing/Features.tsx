"use client";

import { motion } from "motion/react";
import {
  Calendar,
  Sparkles,
  Zap,
  LayoutGrid,
  CheckCircle2,
} from "lucide-react";

const features = [
  {
    title: "Seamless Scheduling",
    description:
      "Visualize your entire month at a glance. Drag, drop, and deploy content across multiple channels with pixel-perfect precision.",
    icon: Calendar,
    tags: [
      "Multi-channel cross-posting",
      "Best-time-to-post AI suggestions",
      "Visual grid planner",
    ],
    color: "from-purple-500/20 to-pink-500/20",
  },
  {
    title: "AI Content Assistant",
    description:
      "Writer's block is obsolete. Generate high-converting captions, relevant hashtags, and even image variations in seconds.",
    icon: Sparkles,
    tags: ["Tone-matched caption generation", "SEO-optimized hashtags"],
    color: "from-blue-500/20 to-cyan-500/20",
  },
  {
    title: "Auto Actions",
    description:
      "Set triggers and let the system work. Auto-reply to comments, DM new followers, or repost user-generated content without lifting a finger.",
    icon: Zap,
    tags: ["Comment auto-replies", "DM automation"],
    color: "from-champagne/20 to-orange-500/20",
  },
];

export function Features() {
  return (
    <section id="features" className="py-32 px-6 relative bg-obsidian">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-24">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-champagne font-mono text-xs uppercase tracking-widest mb-4"
          >
            Command Center
          </motion.div>
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black tracking-tighter"
          >
            All the tools required for <br />
            <span className="font-serif italic font-normal text-champagne">
              social domination
            </span>
          </motion.h2>
        </div>

        <div className="space-y-12">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ y: 40, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="glass-panel rounded-[2rem] p-8 md:p-12 border border-white/5 relative overflow-hidden group"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`}
              />

              <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                    <feature.icon className="w-6 h-6 text-champagne" />
                  </div>
                  <h3 className="text-3xl font-bold mb-4 font-serif italic">
                    {feature.title}
                  </h3>
                  <p className="text-ivory/60 text-lg leading-relaxed mb-8">
                    {feature.description}
                  </p>
                  <ul className="space-y-3">
                    {feature.tags.map((tag, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-3 text-sm font-medium text-ivory/80"
                      >
                        <CheckCircle2 className="w-4 h-4 text-champagne" />
                        {tag}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="relative h-[300px] rounded-2xl bg-slate/50 border border-white/10 overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-[url('https://picsum.photos/800/600')] bg-cover bg-center opacity-20 mix-blend-overlay" />
                  <div className="w-16 h-16 rounded-full bg-obsidian/80 backdrop-blur-md border border-white/10 flex items-center justify-center">
                    <LayoutGrid className="w-6 h-6 text-champagne" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

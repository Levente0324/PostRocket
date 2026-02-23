"use client";

import { motion } from "motion/react";
import { Bot, Link2, Send } from "lucide-react";

const steps = [
  {
    icon: Link2,
    title: "Connect",
    description:
      "Link your Instagram and Facebook accounts securely with one click.",
  },
  {
    icon: Bot,
    title: "Generate",
    description:
      "Tell our AI your brand voice and goals. Watch it craft the perfect posts.",
  },
  {
    icon: Send,
    title: "Automate",
    description:
      "Approve the schedule. We handle the publishing, you handle the growth.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-32 px-6 relative bg-obsidian border-t border-white/5"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-24">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-champagne font-mono text-xs uppercase tracking-widest mb-4"
          >
            System Online
          </motion.div>
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black tracking-tighter"
          >
            Social Autonomy <br />
            <span className="font-serif italic font-normal text-champagne">
              Redefined.
            </span>
          </motion.h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ y: 40, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="glass-panel rounded-3xl p-8 border border-white/5 text-center group hover:border-champagne/30 transition-colors"
            >
              <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                <step.icon className="w-8 h-8 text-champagne" />
              </div>
              <h3 className="text-2xl font-bold mb-4 font-serif italic">
                {step.title}
              </h3>
              <p className="text-ivory/60 leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

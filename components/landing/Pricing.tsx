"use client";

import { motion } from "motion/react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const plans = [
  {
    name: "Starter",
    price: "€9",
    description: "For individuals starting their automation journey.",
    features: [
      "10 posts/month",
      "1 account",
      "Basic AI generation",
      "Standard support",
    ],
    buttonText: "Start Free Trial",
    popular: false,
  },
  {
    name: "Pro",
    price: "€19",
    description: "For growing brands needing cross-platform reach.",
    features: [
      "40 posts/month",
      "Instagram + Facebook",
      "AI image generation",
      "Priority support",
    ],
    buttonText: "Get Pro",
    popular: true,
  },
  {
    name: "Business",
    price: "€39",
    description: "For agencies and enterprises dominating social.",
    features: [
      "Unlimited posts",
      "Multiple accounts",
      "Advanced AI models",
      "Dedicated account manager",
    ],
    buttonText: "Contact Sales",
    popular: false,
  },
];

export function Pricing() {
  return (
    <section
      id="pricing"
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
            Membership
          </motion.div>
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black tracking-tighter"
          >
            Invest in <br />
            <span className="font-serif italic font-normal text-champagne">
              Autonomy.
            </span>
          </motion.h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ y: 40, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className={`glass-panel rounded-3xl p-8 border ${plan.popular ? "border-champagne/50 shadow-[0_0_30px_rgba(201,168,76,0.1)] relative" : "border-white/5"} flex flex-col`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-champagne text-obsidian px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                  Most Popular
                </div>
              )}
              <h3 className="text-2xl font-serif italic mb-2">{plan.name}</h3>
              <p className="text-ivory/60 text-sm mb-6 h-10">
                {plan.description}
              </p>
              <div className="mb-8">
                <span className="text-5xl font-black tracking-tighter">
                  {plan.price}
                </span>
                <span className="text-ivory/40 font-mono text-sm">/mo</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-sm text-ivory/80"
                  >
                    <Check className="w-4 h-4 text-champagne shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                asChild
                variant={plan.popular ? "default" : "outline"}
                className={`w-full h-12 rounded-xl ${!plan.popular && "border-white/10 hover:bg-white/5"}`}
              >
                <Link href="/login">{plan.buttonText}</Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

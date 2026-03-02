"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { createStripeCheckoutSession } from "@/app/actions/stripe";
import { CheckCircle2, ExternalLink, Sparkles, X } from "lucide-react";

function EliteUpgradeModal({ onClose }: { onClose: () => void }) {
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-black/10 overflow-hidden">
        {/* Accent top bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#CC5833] via-[#e06b45] to-[#CC5833]" />

        <div className="p-7">
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-5 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="Bezárás"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Icon + title */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-light-primary/10 border border-light-primary/20">
              <Sparkles className="h-5 w-5 text-light-primary" />
            </div>
            <div>
              <p className="text-xs font-mono font-bold uppercase tracking-widest text-light-primary">
                Elite
              </p>
              <h2 className="text-xl font-bold text-gray-900 leading-tight">
                Váltás Elite csomagra
              </h2>
            </div>
          </div>

          {/* Feature list */}
          <ul className="mb-5 space-y-2.5">
            {[
              "50 aktív időzített poszt",
              "KORLÁTLAN AI szövegírás",
              "AI képgenerálás (hamarosan)",
              "Elsőbbségi támogatás",
            ].map((f) => (
              <li
                key={f}
                className="flex items-center gap-2.5 text-sm text-gray-700"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-light-primary" />
                {f}
              </li>
            ))}
          </ul>

          {/* Pricing callout */}
          <div className="rounded-xl border border-light-primary/15 bg-light-primary/5 px-4 py-3 mb-6">
            <p className="text-sm text-gray-600 leading-relaxed">
              Az előfizetésed azonnal frissül.{" "}
              <span className="font-bold text-gray-900">4 000 Ft</span>{" "}
              különbözeti díj kerül azonnal felszámításra. A következő
              számlázási ciklustól az előfizetés díja{" "}
              <span className="line-through text-gray-400 text-xs font-medium">
                9 999 Ft/hó
              </span>{" "}
              <span className="font-bold text-gray-900">7 999 Ft/hó </span> lesz
              (korai hozzáférési ár). Bármikor lemondható.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <form action={createStripeCheckoutSession} className="flex-1">
              <input type="hidden" name="plan" value="elite" />
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-light-primary text-white px-5 py-3 font-bold text-sm shadow-lg shadow-light-primary/20 hover:bg-light-primary-hover transition-all hover:-translate-y-px active:translate-y-0"
              >
                <Sparkles className="h-4 w-4" />
                Igen, váltok Elite-re
              </button>
            </form>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none rounded-xl border border-gray-200 bg-white text-gray-600 px-5 py-3 text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              Mégsem
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function UpgradeEliteButton() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-light-primary text-white px-4 py-3 transition hover:bg-light-primary-hover font-semibold text-sm shadow-sm"
      >
        Elite előfizetés <ExternalLink className="h-4 w-4" />
      </button>

      {showModal && <EliteUpgradeModal onClose={() => setShowModal(false)} />}
    </>
  );
}

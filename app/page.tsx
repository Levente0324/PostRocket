import { LandingExperience } from "@/components/landing/LandingExperience";
import { createClient } from "@/lib/supabase/server";
import Stripe from "stripe";

async function getProPriceLabel() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_PRO_PRICE_ID;

  if (!secretKey || !priceId) {
    return "Stripe előfizetés";
  }

  try {
    const stripe = new Stripe(secretKey, {
      apiVersion: "2026-01-28.clover",
    });

    const price = await stripe.prices.retrieve(priceId);
    const unitAmount = price.unit_amount;
    if (!unitAmount) {
      return "Stripe előfizetés";
    }
    const currency = (price.currency || "usd").toLowerCase();
    const recurring = price.recurring?.interval;
    const intervalMap: Record<string, string> = {
      day: "nap",
      week: "hét",
      month: "hó",
      year: "év",
    };
    const intervalLabel = recurring
      ? `/${intervalMap[recurring] ?? recurring}`
      : "";
    // HUF and similar zero-decimal currencies use unit_amount directly; others divide by 100
    const zeroDecimalCurrencies = new Set([
      "huf",
      "bif",
      "clp",
      "gnf",
      "jpy",
      "kmf",
      "mga",
      "pyg",
      "rwf",
      "ugx",
      "vnd",
      "vuv",
      "xaf",
      "xof",
      "xpf",
    ]);
    const amount = zeroDecimalCurrencies.has(currency)
      ? unitAmount
      : unitAmount / 100;
    const formatted = new Intl.NumberFormat("hu-HU", {
      style: "currency",
      currency: currency.toUpperCase(),
      maximumFractionDigits: zeroDecimalCurrencies.has(currency) ? 0 : 2,
    }).format(amount);
    return `${formatted}${intervalLabel}`;
  } catch {
    return "Stripe előfizetés";
  }
}

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const proPriceLabel = await getProPriceLabel();

  return (
    <LandingExperience
      ctaHref={user ? "/dashboard/posts" : "/login"}
      isAuthenticated={Boolean(user)}
      proPriceLabel={proPriceLabel}
    />
  );
}

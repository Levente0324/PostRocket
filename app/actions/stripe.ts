"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasPaidAccess, resolvePlanFromPriceId } from "@/lib/subscription";
import { redirect } from "next/navigation";
import Stripe from "stripe";

let stripeClient: Stripe | null = null;

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} environment variable is required.`);
  }
  return value;
}

function getStripe(): Stripe {
  if (!stripeClient) {
    stripeClient = new Stripe(getRequiredEnv("STRIPE_SECRET_KEY"), {
      apiVersion: "2026-01-28.clover",
    });
  }
  return stripeClient;
}

/** Returns true if this is a Stripe "resource not found" error (e.g. stale test/live customer ID). */
function isStripeNotFoundError(err: unknown): boolean {
  return (
    err instanceof Stripe.errors.StripeInvalidRequestError &&
    err.code === "resource_missing"
  );
}

async function getCurrentUserAndProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, stripe_customer_id, plan, subscription_status")
    .eq("id", user.id)
    .single();

  return { supabase, user, profile };
}

/**
 * Returns the Stripe customer ID for the current user.
 * If the stored ID is stale (wrong mode / deleted in Stripe), clears it and creates a fresh customer.
 */
async function getOrCreateCustomerId() {
  const { supabase, user, profile } = await getCurrentUserAndProfile();
  const stripe = getStripe();

  if (profile?.stripe_customer_id) {
    // Validate the stored customer actually exists in Stripe before using it.
    try {
      const existing = await stripe.customers.retrieve(
        profile.stripe_customer_id,
      );
      if (!("deleted" in existing)) {
        // Customer is valid — use it.
        return { customerId: profile.stripe_customer_id, user, profile };
      }
      // Customer was deleted in Stripe — fall through to create a new one.
    } catch (err) {
      if (!isStripeNotFoundError(err)) throw err;
      // Stale / wrong-mode customer ID — fall through to create a new one.
    }

    // Clear the stale ID from the DB before creating a fresh customer.
    // Use admin client — column-level REVOKE blocks authenticated role from writing billing columns.
    const adminForClear = createAdminClient();
    await adminForClear
      .from("profiles")
      .update({ stripe_customer_id: null })
      .eq("id", user.id);
  }

  // Create a new Stripe customer.
  const customer = await stripe.customers.create({
    email: user.email,
    metadata: { supabaseUUID: user.id },
  });

  // Use admin client — column-level REVOKE blocks authenticated role from writing billing columns.
  const adminForLink = createAdminClient();
  await adminForLink
    .from("profiles")
    .update({ stripe_customer_id: customer.id })
    .eq("id", user.id);

  return { customerId: customer.id, user, profile };
}

function isActiveSubscriptionStatus(status: string | null | undefined) {
  return status === "active" || status === "trialing";
}

/**
 * Creates a Stripe checkout session for the given plan.
 * Accepts plan as form data: "pro" or "elite".
 * If the user already has a paid plan, redirects them to the Stripe portal instead.
 */
export async function createStripeCheckoutSession(formData?: FormData) {
  const stripe = getStripe();
  const appUrl = getRequiredEnv("APP_URL");
  const { customerId, user, profile } = await getOrCreateCustomerId();

  // If already on a paid plan, redirect to portal to manage.
  if (hasPaidAccess(profile ?? null)) {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${appUrl}/dashboard/account-billing`,
    });

    if (!session.url) {
      throw new Error("Stripe portal session did not return a URL.");
    }

    redirect(session.url);
  }

  // Determine which price to use.
  const requestedPlan = formData?.get("plan") as string | null;
  let priceId: string;

  if (requestedPlan === "elite") {
    priceId = process.env.STRIPE_ELITE_PRICE_ID || "";
    if (!priceId) {
      throw new Error(
        "STRIPE_ELITE_PRICE_ID is not configured. Please add it to your .env.local after creating the Elite product in Stripe.",
      );
    }
  } else {
    // Default to pro.
    priceId = getRequiredEnv("STRIPE_PRO_PRICE_ID");
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: user.id,
    metadata: {
      supabaseUUID: user.id,
    },
    subscription_data: {
      metadata: {
        supabaseUUID: user.id,
      },
    },
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard/account-billing?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/dashboard/account-billing?checkout=cancelled`,
    allow_promotion_codes: true,
  });

  if (!session.url) {
    throw new Error("Stripe checkout session did not return a URL.");
  }

  redirect(session.url);
}

export async function syncStripeCheckoutSession(sessionId: string) {
  const stripe = getStripe();
  const { supabase, user } = await getCurrentUserAndProfile();

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["subscription"],
  });

  if (session.mode !== "subscription" || session.status !== "complete") {
    return { ok: false, reason: "session_not_complete" as const };
  }

  if (
    session.payment_status !== "paid" &&
    session.payment_status !== "no_payment_required"
  ) {
    return { ok: false, reason: "payment_not_captured" as const };
  }

  const customerId =
    typeof session.customer === "string" ? session.customer : null;
  if (!customerId) {
    return { ok: false, reason: "missing_customer" as const };
  }

  const subscription =
    typeof session.subscription === "string"
      ? await stripe.subscriptions.retrieve(session.subscription)
      : (session.subscription as Stripe.Subscription | null);

  const subscriptionStatus = subscription?.status ?? "incomplete";

  const sessionOwnerId =
    session.metadata?.supabaseUUID ??
    session.client_reference_id ??
    (subscription && "metadata" in subscription
      ? (subscription.metadata?.supabaseUUID ?? null)
      : null);

  let customerOwnerId: string | null = null;
  try {
    const customer = await stripe.customers.retrieve(customerId);
    if (customer && !("deleted" in customer)) {
      customerOwnerId = customer.metadata?.supabaseUUID ?? null;
    }
  } catch (err) {
    if (!isStripeNotFoundError(err)) throw err;
    // Stale customer — ownership falls back to sessionOwnerId check below.
  }

  const ownerMatches =
    sessionOwnerId === user.id ||
    customerOwnerId === user.id ||
    (!!profile?.stripe_customer_id &&
      profile.stripe_customer_id === customerId);

  if (!ownerMatches) {
    return { ok: false, reason: "session_not_owned_by_user" as const };
  }

  // Use admin client for billing column writes — column-level REVOKE blocks
  // the authenticated role from writing plan/subscription_status/monthly_post_limit/stripe_customer_id.
  const adminForSync = createAdminClient();

  if (!isActiveSubscriptionStatus(subscriptionStatus)) {
    await adminForSync
      .from("profiles")
      .update({
        stripe_customer_id: customerId,
        subscription_status: subscriptionStatus,
        plan: "free",
        monthly_post_limit: 3,
      })
      .eq("id", user.id);

    return { ok: false, reason: "subscription_not_active" as const };
  }

  // Resolve plan from the subscription's price ID.
  const priceId = subscription?.items?.data?.[0]?.price?.id ?? "";
  const resolved = resolvePlanFromPriceId(priceId);

  await adminForSync
    .from("profiles")
    .update({
      stripe_customer_id: customerId,
      subscription_status: subscriptionStatus,
      plan: resolved.plan,
      monthly_post_limit: resolved.limit,
    })
    .eq("id", user.id);

  return { ok: true as const };
}

/**
 * Opens the Stripe billing portal for the current user.
 * Only available to users with an active paid subscription.
 * Gracefully handles stale customer IDs (test/live mode mismatch).
 */
export async function createStripePortalSession() {
  const stripe = getStripe();
  const appUrl = getRequiredEnv("APP_URL");
  const { supabase, user, profile } = await getCurrentUserAndProfile();

  // Guard: only paid users should access the portal.
  if (!hasPaidAccess(profile ?? null)) {
    redirect("/dashboard/account-billing");
  }

  const { customerId } = await getOrCreateCustomerId();

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${appUrl}/dashboard/account-billing`,
    });

    if (!session.url) {
      throw new Error("Stripe portal session did not return a URL.");
    }

    redirect(session.url);
  } catch (err) {
    if (!isStripeNotFoundError(err)) throw err;

    // The stored customer no longer exists in Stripe (mode mismatch or deleted).
    // Clear the stale ID, create a new customer, and re-open the portal.
    // Use admin client — column-level REVOKE blocks authenticated role from writing billing columns.
    const adminForPortalReset = createAdminClient();
    await adminForPortalReset
      .from("profiles")
      .update({
        stripe_customer_id: null,
        plan: "free",
        monthly_post_limit: 3,
        subscription_status: "inactive",
      })
      .eq("id", user.id);

    redirect("/dashboard/account-billing?billing_error=customer_missing");
  }
}

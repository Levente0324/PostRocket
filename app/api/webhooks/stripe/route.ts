import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { resolvePlanFromPriceId } from "@/lib/subscription";

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} environment variable is required.`);
  }
  return value;
}

function getSupabaseAdmin() {
  return createClient(
    getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
  );
}

function isActiveStatus(status: string | null | undefined) {
  return status === "active" || status === "trialing";
}

function shouldForceFree(status: string | null | undefined) {
  return (
    status === "canceled" ||
    status === "unpaid" ||
    status === "incomplete_expired"
  );
}

async function registerWebhookEvent(event: Stripe.Event) {
  const supabaseAdmin = getSupabaseAdmin();

  const { error } = await supabaseAdmin.from("stripe_webhook_events").insert({
    event_id: event.id,
    event_type: event.type,
  });

  if (!error) return { shouldProcess: true };

  if (error.code === "23505") {
    return { shouldProcess: false };
  }

  // If table does not exist yet, continue without idempotency table.
  if (error.code === "42P01") {
    return { shouldProcess: true };
  }

  throw error;
}

async function findProfileIdByCustomerId(customerId: string) {
  const supabaseAdmin = getSupabaseAdmin();

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  return profile?.id ?? null;
}

async function linkCustomerToProfile(customerId: string, profileId: string) {
  const supabaseAdmin = getSupabaseAdmin();

  await supabaseAdmin
    .from("profiles")
    .update({ stripe_customer_id: customerId })
    .eq("id", profileId);
}

async function findProfileIdByEmail(email: string | null | undefined) {
  if (!email) return null;

  const supabaseAdmin = getSupabaseAdmin();

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  return profile?.id ?? null;
}

async function resolveProfileId(params: {
  stripe: Stripe;
  customerId?: string | null;
  supabaseUUID?: string | null;
  email?: string | null;
}) {
  const { stripe, customerId, supabaseUUID, email } = params;

  if (supabaseUUID) {
    if (customerId) {
      await linkCustomerToProfile(customerId, supabaseUUID);
    }
    return supabaseUUID;
  }

  if (customerId) {
    const found = await findProfileIdByCustomerId(customerId);
    if (found) return found;

    const customer = await stripe.customers.retrieve(customerId);
    if (customer && !("deleted" in customer)) {
      const metadataUUID = customer.metadata?.supabaseUUID;
      if (metadataUUID) {
        await linkCustomerToProfile(customerId, metadataUUID);
        return metadataUUID;
      }

      const profileByEmail = await findProfileIdByEmail(customer.email);
      if (profileByEmail) {
        await linkCustomerToProfile(customerId, profileByEmail);
        return profileByEmail;
      }
    }
  }

  const profileByEmail = await findProfileIdByEmail(email);
  if (profileByEmail) return profileByEmail;

  return null;
}

/**
 * Marks a profile as paid (basic or pro) based on the subscription's price ID.
 */
async function markPaidByProfileId(
  profileId: string,
  subscriptionStatus: string,
  priceId: string,
) {
  const supabaseAdmin = getSupabaseAdmin();
  const resolved = resolvePlanFromPriceId(priceId);

  await supabaseAdmin
    .from("profiles")
    .update({
      subscription_status: subscriptionStatus,
      plan: resolved.plan,
      monthly_post_limit: resolved.limit,
    })
    .eq("id", profileId);
}

async function updateSubscriptionStatusOnly(
  profileId: string,
  subscriptionStatus: string,
) {
  const supabaseAdmin = getSupabaseAdmin();
  await supabaseAdmin
    .from("profiles")
    .update({ subscription_status: subscriptionStatus })
    .eq("id", profileId);
}

async function markFreeAndClearPostsByProfileId(
  profileId: string,
  subscriptionStatus: string = "inactive",
) {
  const supabaseAdmin = getSupabaseAdmin();

  const { data: scheduledRows } = await supabaseAdmin
    .from("scheduled_posts")
    .select("post_id, posts!inner(user_id)")
    .eq("posts.user_id", profileId)
    .eq("status", "scheduled");

  const postIds = (scheduledRows ?? []).map((row: any) => row.post_id);
  if (postIds.length) {
    await supabaseAdmin.from("posts").delete().in("id", postIds);
  }

  await supabaseAdmin
    .from("profiles")
    .update({
      subscription_status: subscriptionStatus,
      plan: "free",
      monthly_post_limit: 3,
    })
    .eq("id", profileId);
}

/**
 * Extracts the first price ID from a Stripe subscription object.
 */
function extractPriceId(subscription: Stripe.Subscription): string {
  return subscription.items?.data?.[0]?.price?.id ?? "";
}

async function getSubscriptionStatusFromSession(
  stripe: Stripe,
  session: Stripe.Checkout.Session,
) {
  if (typeof session.subscription !== "string") {
    return { status: "incomplete", priceId: "" };
  }

  const subscription = await stripe.subscriptions.retrieve(
    session.subscription,
  );
  return { status: subscription.status, priceId: extractPriceId(subscription) };
}

export async function POST(req: Request) {
  try {
    const stripe = new Stripe(getRequiredEnv("STRIPE_SECRET_KEY"), {
      apiVersion: "2026-01-28.clover",
    });

    const body = await req.text();
    const signature = (await headers()).get("stripe-signature");
    const webhookSecret = getRequiredEnv("STRIPE_WEBHOOK_SECRET");

    if (!signature) {
      return new NextResponse("Missing stripe-signature header", {
        status: 400,
      });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (error: any) {
      console.error("Stripe webhook signature error:", error.message);
      return new NextResponse("Invalid signature", {
        status: 400,
      });
    }

    const dedupe = await registerWebhookEvent(event);
    if (!dedupe.shouldProcess) {
      return new NextResponse(null, { status: 200 });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const profileId = await resolveProfileId({
          stripe,
          customerId:
            typeof session.customer === "string" ? session.customer : null,
          supabaseUUID:
            session.metadata?.supabaseUUID ?? session.client_reference_id,
          email: session.customer_details?.email,
        });

        if (!profileId) {
          console.error(
            "checkout.session.completed: could not resolve profile",
            {
              customer: session.customer,
              clientReferenceId: session.client_reference_id,
            },
          );
          break;
        }

        const { status, priceId } = await getSubscriptionStatusFromSession(
          stripe,
          session,
        );
        if (isActiveStatus(status)) {
          await markPaidByProfileId(profileId, status, priceId);
        } else if (shouldForceFree(status)) {
          await markFreeAndClearPostsByProfileId(profileId, status);
        } else {
          await updateSubscriptionStatusOnly(profileId, status);
        }

        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const priceId = extractPriceId(subscription);

        const profileId = await resolveProfileId({
          stripe,
          customerId,
          supabaseUUID: subscription.metadata?.supabaseUUID,
        });

        if (!profileId) {
          console.error(`${event.type}: could not resolve profile`, {
            customerId,
          });
          break;
        }

        if (isActiveStatus(subscription.status)) {
          await markPaidByProfileId(profileId, subscription.status, priceId);
        } else if (shouldForceFree(subscription.status)) {
          await markFreeAndClearPostsByProfileId(
            profileId,
            subscription.status,
          );
        } else {
          await updateSubscriptionStatusOnly(profileId, subscription.status);
        }

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const profileId = await resolveProfileId({
          stripe,
          customerId,
          supabaseUUID: subscription.metadata?.supabaseUUID,
        });

        if (!profileId) {
          console.error(
            "customer.subscription.deleted: could not resolve profile",
            {
              customerId,
            },
          );
          break;
        }

        await markFreeAndClearPostsByProfileId(profileId, "inactive");
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId =
          typeof invoice.customer === "string" ? invoice.customer : null;

        const profileId = await resolveProfileId({
          stripe,
          customerId,
          email: invoice.customer_email,
        });

        if (profileId) {
          // Resolve plan from the invoice's subscription
          let priceId = "";
          const invoiceSubscription = (invoice as any).subscription;
          if (typeof invoiceSubscription === "string") {
            const subscription =
              await stripe.subscriptions.retrieve(invoiceSubscription);
            priceId = extractPriceId(subscription);
          }
          await markPaidByProfileId(profileId, "active", priceId);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId =
          typeof invoice.customer === "string" ? invoice.customer : null;

        const profileId = await resolveProfileId({
          stripe,
          customerId,
          email: invoice.customer_email,
        });

        if (profileId) {
          await updateSubscriptionStatusOnly(profileId, "past_due");
        }

        break;
      }

      default:
        break;
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("Stripe webhook failed:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

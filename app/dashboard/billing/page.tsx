import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CreditCard, CheckCircle2, AlertCircle } from "lucide-react";
import { createStripePortalSession } from "@/app/actions/stripe";

export default async function BillingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const isSubscribed = profile?.subscription_status === "active";
  const planName =
    profile?.plan === "free" ? "Free Plan" : `${profile?.plan} Plan`;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-2">
          Subscription{" "}
          <span className="font-serif italic font-normal text-champagne">
            Billing
          </span>
        </h2>
        <p className="text-ivory/60 font-mono text-xs uppercase tracking-widest">
          Manage your plan and payment methods.
        </p>
      </div>

      <div className="glass-panel rounded-[2rem] p-8 md:p-12 border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-champagne/10 blur-[80px] rounded-full pointer-events-none" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${isSubscribed ? "bg-champagne/10 border-champagne/30 text-champagne" : "bg-white/5 border-white/10 text-ivory/40"}`}
              >
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-serif italic">{planName}</h3>
                <p className="text-ivory/60 text-sm flex items-center gap-2">
                  Status:
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-mono uppercase tracking-widest ${isSubscribed ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}
                  >
                    {profile?.subscription_status || "Inactive"}
                  </span>
                </p>
              </div>
            </div>

            <ul className="space-y-3 mt-8">
              <li className="flex items-center gap-3 text-sm text-ivory/80">
                <CheckCircle2 className="w-4 h-4 text-champagne shrink-0" />
                {profile?.monthly_post_limit
                  ? `${profile.monthly_post_limit} posts per month`
                  : "Unlimited posts"}
              </li>
              <li className="flex items-center gap-3 text-sm text-ivory/80">
                <CheckCircle2 className="w-4 h-4 text-champagne shrink-0" />
                {profile?.plan === "free"
                  ? "1 social account"
                  : "Multiple social accounts"}
              </li>
              <li className="flex items-center gap-3 text-sm text-ivory/80">
                <CheckCircle2 className="w-4 h-4 text-champagne shrink-0" />
                {profile?.plan === "free"
                  ? "Basic AI generation"
                  : "Advanced AI models"}
              </li>
            </ul>
          </div>

          <div className="w-full md:w-auto flex flex-col gap-4">
            <form action={createStripePortalSession}>
              <Button
                type="submit"
                className="w-full md:w-auto h-14 px-8 rounded-2xl text-lg shadow-[0_0_30px_rgba(201,168,76,0.2)] hover:shadow-[0_0_50px_rgba(201,168,76,0.4)] transition-shadow"
              >
                {isSubscribed ? "Manage Subscription" : "Upgrade Plan"}
              </Button>
            </form>
            {!isSubscribed && (
              <p className="text-xs text-ivory/40 font-mono text-center uppercase tracking-widest flex items-center justify-center gap-1">
                <AlertCircle className="w-3 h-3" /> Upgrade to unlock all
                features
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-12">
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h4 className="font-medium text-ivory mb-2">Payment Methods</h4>
          <p className="text-sm text-ivory/60 mb-4">
            Update your credit card or billing information securely via Stripe.
          </p>
          <form action={createStripePortalSession}>
            <Button
              type="submit"
              variant="outline"
              className="w-full rounded-xl border-white/10 hover:bg-white/5"
            >
              Update Payment Method
            </Button>
          </form>
        </div>

        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h4 className="font-medium text-ivory mb-2">Billing History</h4>
          <p className="text-sm text-ivory/60 mb-4">
            View past invoices and download receipts for your records.
          </p>
          <form action={createStripePortalSession}>
            <Button
              type="submit"
              variant="outline"
              className="w-full rounded-xl border-white/10 hover:bg-white/5"
            >
              View Invoices
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

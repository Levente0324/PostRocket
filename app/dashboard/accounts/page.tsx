import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Facebook, Instagram, Link2, Unlink } from "lucide-react";
import { format } from "date-fns";

export default async function AccountsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: accounts } = await supabase
    .from("social_accounts")
    .select("*")
    .eq("user_id", user.id);

  const hasInstagram = accounts?.some((a) => a.provider === "instagram");
  const hasFacebook = accounts?.some((a) => a.provider === "facebook");

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-2">
          Connected{" "}
          <span className="font-serif italic font-normal text-champagne">
            Channels
          </span>
        </h2>
        <p className="text-ivory/60 font-mono text-xs uppercase tracking-widest">
          Manage your social media integrations.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Instagram Card */}
        <div className="glass-panel rounded-[2rem] p-8 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-champagne/30 transition-colors">
          <div className="flex items-center gap-6">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center border ${hasInstagram ? "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 border-transparent" : "bg-white/5 border-white/10"}`}
            >
              <Instagram
                className={`w-8 h-8 ${hasInstagram ? "text-white" : "text-ivory/40"}`}
              />
            </div>
            <div>
              <h3 className="text-2xl font-serif italic mb-1">Instagram</h3>
              <p className="text-ivory/60 text-sm">
                {hasInstagram
                  ? "Connected and ready for publishing."
                  : "Connect your Instagram Business account."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            {hasInstagram ? (
              <Button
                variant="outline"
                className="w-full md:w-auto rounded-xl border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300"
              >
                <Unlink className="w-4 h-4 mr-2" /> Disconnect
              </Button>
            ) : (
              <Button className="w-full md:w-auto rounded-xl shadow-[0_0_20px_rgba(201,168,76,0.2)]">
                <Link2 className="w-4 h-4 mr-2" /> Connect Account
              </Button>
            )}
          </div>
        </div>

        {/* Facebook Card */}
        <div className="glass-panel rounded-[2rem] p-8 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-blue-500/30 transition-colors">
          <div className="flex items-center gap-6">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center border ${hasFacebook ? "bg-[#1877F2] border-transparent" : "bg-white/5 border-white/10"}`}
            >
              <Facebook
                className={`w-8 h-8 ${hasFacebook ? "text-white" : "text-ivory/40"}`}
              />
            </div>
            <div>
              <h3 className="text-2xl font-serif italic mb-1">Facebook</h3>
              <p className="text-ivory/60 text-sm">
                {hasFacebook
                  ? "Connected and ready for publishing."
                  : "Connect your Facebook Page."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            {hasFacebook ? (
              <Button
                variant="outline"
                className="w-full md:w-auto rounded-xl border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300"
              >
                <Unlink className="w-4 h-4 mr-2" /> Disconnect
              </Button>
            ) : (
              <Button className="w-full md:w-auto rounded-xl shadow-[0_0_20px_rgba(24,119,242,0.2)] bg-[#1877F2] text-white hover:bg-[#1877F2]/90">
                <Link2 className="w-4 h-4 mr-2" /> Connect Page
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-12 p-6 rounded-2xl bg-white/5 border border-white/10 text-sm text-ivory/60">
        <h4 className="font-medium text-ivory mb-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-champagne" />
          Connection Requirements
        </h4>
        <ul className="list-disc list-inside space-y-1 ml-4">
          <li>Instagram accounts must be Professional/Business accounts.</li>
          <li>Your Instagram account must be linked to a Facebook Page.</li>
          <li>You must have admin access to the connected Facebook Page.</li>
        </ul>
      </div>
    </div>
  );
}

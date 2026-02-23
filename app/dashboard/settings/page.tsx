import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { User, Mail, Lock, BellRing, Shield } from "lucide-react";

export default async function SettingsPage() {
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

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-2">
          Account{" "}
          <span className="font-serif italic font-normal text-champagne">
            Settings
          </span>
        </h2>
        <p className="text-ivory/60 font-mono text-xs uppercase tracking-widest">
          Manage your profile and preferences.
        </p>
      </div>

      <div className="grid gap-8">
        {/* Profile Section */}
        <div className="glass-panel rounded-[2rem] p-8 border border-white/5">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <User className="w-6 h-6 text-champagne" />
            </div>
            <h3 className="text-2xl font-serif italic">Profile Information</h3>
          </div>

          <form className="space-y-6 max-w-2xl">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-widest text-ivory/60">
                  Full Name
                </label>
                <input
                  type="text"
                  defaultValue={profile?.full_name || ""}
                  className="w-full bg-obsidian/50 border border-white/10 rounded-xl px-4 py-3 text-ivory placeholder:text-ivory/30 focus:outline-none focus:border-champagne/50 focus:ring-1 focus:ring-champagne/50 transition-all"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-widest text-ivory/60">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ivory/40" />
                  <input
                    type="email"
                    defaultValue={user.email || ""}
                    disabled
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-ivory/60 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
            <Button
              type="button"
              className="rounded-xl px-8 shadow-[0_0_20px_rgba(201,168,76,0.2)] hover:shadow-[0_0_30px_rgba(201,168,76,0.4)] transition-shadow"
            >
              Save Changes
            </Button>
          </form>
        </div>

        {/* Security Section */}
        <div className="glass-panel rounded-[2rem] p-8 border border-white/5">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-champagne" />
            </div>
            <h3 className="text-2xl font-serif italic">Security</h3>
          </div>

          <div className="space-y-6 max-w-2xl">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-4">
                <Lock className="w-5 h-5 text-ivory/60" />
                <div>
                  <h4 className="font-medium text-ivory">Password</h4>
                  <p className="text-sm text-ivory/60">
                    Change your account password.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="rounded-xl border-white/10 hover:bg-white/5"
              >
                Update
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-4">
                <BellRing className="w-5 h-5 text-ivory/60" />
                <div>
                  <h4 className="font-medium text-ivory">
                    Two-Factor Authentication
                  </h4>
                  <p className="text-sm text-ivory/60">
                    Add an extra layer of security.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="rounded-xl border-white/10 hover:bg-white/5"
              >
                Enable
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

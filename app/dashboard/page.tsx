import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { motion } from "motion/react";
import {
  Plus,
  Calendar as CalendarIcon,
  FileText,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function DashboardPage() {
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

  const { count: postsCount } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { count: scheduledCount } = await supabase
    .from("scheduled_posts")
    .select("*, posts!inner(*)")
    .eq("posts.user_id", user.id)
    .eq("status", "scheduled");

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-2">
            Welcome back,{" "}
            <span className="font-serif italic font-normal text-champagne">
              {profile?.full_name?.split(" ")[0] || "Commander"}
            </span>
          </h2>
          <p className="text-ivory/60 font-mono text-xs uppercase tracking-widest">
            Here is your social media overview for today.
          </p>
        </div>
        <Button
          asChild
          className="rounded-full px-6 h-12 shadow-[0_0_20px_rgba(201,168,76,0.2)] hover:shadow-[0_0_30px_rgba(201,168,76,0.4)] transition-shadow"
        >
          <Link href="/dashboard/posts/new">
            <Plus className="w-5 h-5 mr-2" /> Generate Post
          </Link>
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="glass-panel rounded-3xl p-6 border border-white/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-champagne/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-champagne" />
            </div>
            <span className="text-xs font-mono text-green-400 bg-green-400/10 px-2 py-1 rounded-full flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +12%
            </span>
          </div>
          <h3 className="text-4xl font-black tracking-tighter mb-1">
            {postsCount || 0}
          </h3>
          <p className="text-sm text-ivory/60 font-medium">
            Total Posts Generated
          </p>
        </div>

        <div className="glass-panel rounded-3xl p-6 border border-white/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <h3 className="text-4xl font-black tracking-tighter mb-1">
            {scheduledCount || 0}
          </h3>
          <p className="text-sm text-ivory/60 font-medium">
            Scheduled for Publishing
          </p>
        </div>

        <div className="glass-panel rounded-3xl p-6 border border-white/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <h3 className="text-4xl font-black tracking-tighter mb-1">
            {profile?.monthly_post_limit
              ? `${postsCount || 0}/${profile.monthly_post_limit}`
              : "∞"}
          </h3>
          <p className="text-sm text-ivory/60 font-medium">
            Monthly Limit Usage
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mt-12">
        <div className="glass-panel rounded-[2rem] p-8 border border-white/5">
          <h3 className="text-2xl font-serif italic mb-6">Upcoming Schedule</h3>
          {scheduledCount === 0 ? (
            <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl bg-white/5">
              <CalendarIcon className="w-12 h-12 text-ivory/20 mx-auto mb-4" />
              <p className="text-ivory/60 mb-4">No posts scheduled yet.</p>
              <Button
                asChild
                variant="outline"
                className="rounded-full border-white/10 hover:bg-white/5"
              >
                <Link href="/dashboard/calendar">Open Calendar</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* List scheduled posts here */}
              <p className="text-ivory/60 text-sm">Loading schedule...</p>
            </div>
          )}
        </div>

        <div className="glass-panel rounded-[2rem] p-8 border border-white/5">
          <h3 className="text-2xl font-serif italic mb-6">
            Connected Channels
          </h3>
          <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl bg-white/5">
            <p className="text-ivory/60 mb-4">
              Connect your social accounts to start automating.
            </p>
            <Button
              asChild
              variant="outline"
              className="rounded-full border-white/10 hover:bg-white/5"
            >
              <Link href="/dashboard/accounts">Manage Accounts</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

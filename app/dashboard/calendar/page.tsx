import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CalendarView } from "@/components/dashboard/CalendarView";

export default async function CalendarPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: scheduledPosts } = await supabase
    .from("scheduled_posts")
    .select("*, posts(*)")
    .eq("posts.user_id", user.id);

  return (
    <div className="space-y-8 max-w-6xl mx-auto h-full flex flex-col">
      <div>
        <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-2">
          Content{" "}
          <span className="font-serif italic font-normal text-champagne">
            Calendar
          </span>
        </h2>
        <p className="text-ivory/60 font-mono text-xs uppercase tracking-widest">
          Visualize and manage your upcoming schedule.
        </p>
      </div>

      <div className="glass-panel rounded-[2rem] p-6 md:p-8 border border-white/5 flex-1 min-h-[600px]">
        <CalendarView scheduledPosts={scheduledPosts || []} />
      </div>
    </div>
  );
}

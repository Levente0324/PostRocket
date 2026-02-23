import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Image as ImageIcon,
  Calendar,
  MoreVertical,
  Edit2,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";

export default async function PostsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: posts } = await supabase
    .from("posts")
    .select("*, scheduled_posts(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-2">
            Content{" "}
            <span className="font-serif italic font-normal text-champagne">
              Library
            </span>
          </h2>
          <p className="text-ivory/60 font-mono text-xs uppercase tracking-widest">
            Manage your generated posts and drafts.
          </p>
        </div>
        <Button
          asChild
          className="rounded-full px-6 h-12 shadow-[0_0_20px_rgba(201,168,76,0.2)] hover:shadow-[0_0_30px_rgba(201,168,76,0.4)] transition-shadow"
        >
          <Link href="/dashboard/posts/new">
            <Plus className="w-5 h-5 mr-2" /> New Post
          </Link>
        </Button>
      </div>

      {!posts || posts.length === 0 ? (
        <div className="glass-panel rounded-[2rem] p-12 border border-white/5 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
            <ImageIcon className="w-8 h-8 text-ivory/40" />
          </div>
          <h3 className="text-2xl font-serif italic mb-2">No posts yet</h3>
          <p className="text-ivory/60 mb-8 max-w-md mx-auto">
            Your content library is empty. Generate your first AI-powered post
            to get started.
          </p>
          <Button asChild className="rounded-full px-8">
            <Link href="/dashboard/posts/new">Generate Post</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className="glass-panel rounded-3xl overflow-hidden border border-white/5 group hover:border-champagne/30 transition-colors flex flex-col"
            >
              <div className="aspect-square relative bg-obsidian/80 border-b border-white/5 flex items-center justify-center overflow-hidden">
                {post.image_url ? (
                  <img
                    src={post.image_url}
                    alt="Post image"
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <ImageIcon className="w-12 h-12 text-ivory/20" />
                )}
                <div className="absolute top-4 right-4 flex gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-mono uppercase tracking-widest backdrop-blur-md border ${
                      post.status === "published"
                        ? "bg-green-500/20 text-green-300 border-green-500/30"
                        : post.status === "scheduled"
                          ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                          : "bg-slate/80 text-ivory/80 border-white/10"
                    }`}
                  >
                    {post.status}
                  </span>
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <p className="text-sm text-ivory/80 line-clamp-3 mb-4 flex-1">
                  {post.caption}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="text-xs text-ivory/40 font-mono flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(post.created_at), "MMM d, yyyy")}
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 text-ivory/40 hover:text-champagne transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-ivory/40 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

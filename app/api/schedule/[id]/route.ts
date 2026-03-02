import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/** Simple UUID v4 format validator */
function isValidUUID(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // Validate UUID format before hitting the DB — prevents malformed-UUID errors
  // from leaking as 500s and stops trivial enumeration attempts.
  if (!isValidUUID(id)) {
    return NextResponse.json(
      { error: "Scheduled post not found." },
      { status: 404 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: scheduledPost, error: lookupError } = await supabase
    .from("scheduled_posts")
    .select("id, post_id, posts!inner(user_id, image_url)")
    .eq("id", id)
    .eq("posts.user_id", user.id)
    .single();

  if (lookupError || !scheduledPost) {
    return NextResponse.json(
      { error: "Scheduled post not found." },
      { status: 404 },
    );
  }

  const { error: deleteError } = await supabase
    .from("posts")
    .delete()
    .eq("id", scheduledPost.post_id)
    .eq("user_id", user.id);

  if (deleteError) {
    return NextResponse.json(
      { error: "Failed to delete scheduled post." },
      { status: 500 },
    );
  }

  // Clean up uploaded images from storage (non-fatal — post is already deleted).
  // Reference-count guard: only delete a storage file if no other post owned by
  // this user still references it. This protects the sibling post in IG+FB pairs
  // (both posts share the same image URLs; deleting one should never orphan the other).
  const imageUrl = (scheduledPost.posts as any)?.image_url;
  if (imageUrl) {
    try {
      const { parseStoredImages } = await import("@/lib/social-account");
      const urls = parseStoredImages(imageUrl);

      const pathsToDelete: string[] = [];

      for (const url of urls) {
        // Check if any other post by this user still references this URL.
        // The post we just deleted is already gone from the DB at this point.
        // Escape SQL LIKE wildcards in the URL so underscores/percents are literals.
        const escapedUrl = url.replace(/%/g, "\\%").replace(/_/g, "\\_");
        const { count: refCount } = await supabase
          .from("posts")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .like("image_url", `%${escapedUrl}%`);

        if ((refCount ?? 0) > 0) {
          // Still referenced by another post (e.g. the IG/FB sibling) — skip.
          continue;
        }

        try {
          const urlObj = new URL(url);
          const parts = urlObj.pathname.split("/post-media/");
          if (parts.length === 2) pathsToDelete.push(parts[1]);
        } catch {
          // ignore malformed URL
        }
      }

      if (pathsToDelete.length > 0) {
        await supabase.storage.from("post-media").remove(pathsToDelete);
      }
    } catch {
      // Non-fatal: post is already deleted, image cleanup is best-effort
    }
  }

  return NextResponse.json({ success: true });
}

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
    .select("id, post_id, posts!inner(user_id)")
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

  return NextResponse.json({ success: true });
}

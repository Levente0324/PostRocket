import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  provider: z.enum(["facebook", "instagram"]),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString();
  const { count: recentDisconnectAttempts } = await supabase
    .from("usage_logs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("action", "meta_disconnect_attempt")
    .gte("created_at", oneMinuteAgo);

  if ((recentDisconnectAttempts ?? 0) > 15) {
    return NextResponse.json(
      { error: "Too many disconnect attempts. Please wait a minute and try again." },
      { status: 429 },
    );
  }

  await supabase.from("usage_logs").insert({
    user_id: user.id,
    action: "meta_disconnect_attempt",
  });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const payload = bodySchema.safeParse(body);
  if (!payload.success) {
    return NextResponse.json({ error: "Invalid provider." }, { status: 400 });
  }

  const { error } = await supabase
    .from("social_accounts")
    .delete()
    .eq("user_id", user.id)
    .eq("provider", payload.data.provider);

  if (error) {
    return NextResponse.json({ error: "Could not disconnect account." }, { status: 500 });
  }

  await supabase.from("usage_logs").insert({
    user_id: user.id,
    action: "meta_disconnect_success",
  });

  return NextResponse.json({ success: true });
}

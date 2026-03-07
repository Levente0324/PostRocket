/**
 * /api/jobs/publish-scheduled — RETIRED
 *
 * This endpoint has been retired as part of the Meta API pivot.
 * All notification logic has been moved to the Supabase Edge Function
 * at supabase/functions/publish-scheduled/index.ts.
 *
 * Returns 410 Gone so any lingering cron-job.org triggers stop retrying.
 */
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "This endpoint has been retired. Notifications are sent by the Supabase Edge Function.",
    },
    { status: 410 },
  );
}

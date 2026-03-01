"use client";

import { PostScheduler } from "./PostScheduler";
import { usePostDashboard } from "./PostDashboardContext";

export function PostsDashboardClient({
  scheduledPosts,
  profile,
  connectedPlatforms,
}: any) {
  const { schedulerRef } = usePostDashboard();

  return (
    <div className="p-4 md:p-8 relative z-0 bg-light-background">
      <div className="max-w-[1400px] mx-auto bg-light-background">
        <PostScheduler
          ref={schedulerRef}
          scheduledPosts={scheduledPosts}
          profile={profile}
          connectedPlatforms={connectedPlatforms}
        />
      </div>
    </div>
  );
}

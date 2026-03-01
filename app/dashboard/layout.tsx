import { DashboardLayoutWrapper } from "@/components/dashboard/DashboardLayoutWrapper";
import { createClient } from "@/lib/supabase/server";
import { hasProAccess, hasEliteAccess, getPlanLabel } from "@/lib/subscription";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, subscription_status")
    .eq("id", user.id)
    .single();

  const isPro = hasProAccess(profile);
  const isElite = hasEliteAccess(profile);
  const planLabel = getPlanLabel(profile);

  return (
    <DashboardLayoutWrapper
      planLabel={planLabel}
      isPro={isPro}
      isElite={isElite}
      userEmail={user.email ?? ""}
    >
      {children}
    </DashboardLayoutWrapper>
  );
}

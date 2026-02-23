import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { createClient } from "@/lib/supabase/server";
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
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-obsidian flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar user={user} profile={profile} />
        <main className="flex-1 p-6 md:p-10 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

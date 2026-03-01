"use client";

import { createClient } from "@/lib/supabase/browser";
import { useRouter } from "next/navigation";

type Props = {
  label?: string;
  className?: string;
};

export function LogoutButton({ label = "Kijelentkezés", className }: Props) {
  const router = useRouter();

  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/");
        router.refresh();
      }}
    >
      {label}
    </button>
  );
}

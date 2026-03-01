import { redirect } from "next/navigation";

export default function CalendarLegacyRedirect() {
  redirect("/dashboard/posts");
}

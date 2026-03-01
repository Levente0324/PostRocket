import { redirect } from "next/navigation";

export default function NewPostLegacyRedirect() {
  redirect("/dashboard/posts");
}

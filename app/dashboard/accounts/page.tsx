import { redirect } from "next/navigation";

export default function AccountsLegacyRedirect() {
  redirect("/dashboard/account-billing");
}

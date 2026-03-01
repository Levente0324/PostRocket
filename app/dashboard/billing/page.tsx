import { redirect } from "next/navigation";

export default function BillingLegacyRedirect() {
  redirect("/dashboard/account-billing");
}

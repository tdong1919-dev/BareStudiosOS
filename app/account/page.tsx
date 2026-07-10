import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getBusinessProfile } from "@/lib/account-data";

export const metadata: Metadata = {
  title: "Dashboard — Bare Studios OS",
};

export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const profile = await getBusinessProfile(session.email, session.salon);
  if (!profile) redirect("/onboarding");
  redirect("/dashboard");
}

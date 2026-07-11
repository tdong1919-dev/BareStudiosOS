import type { Metadata } from "next";
import PageShell from "@/components/marketing/PageShell";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign in to Bare Studios",
  description: "Secure account access for Bare Studios.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const expired = sp.error === "expired";
  return (
    <PageShell
      eyebrow="Account"
      title="Sign in to Bare Studios."
      intro="Run booking, payments, clients, team members, inventory, and assistants from one place. Create a password once, then use it each time you come back."
      note="First time? Create your account, then complete business setup before dashboard access."
    >
      {expired && <p className="mb-5 rounded-md border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-warning">That link expired — request a fresh one below.</p>}
      <LoginForm />
    </PageShell>
  );
}

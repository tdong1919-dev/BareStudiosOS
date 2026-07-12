import type { Metadata } from "next";
import PageShell from "@/components/marketing/PageShell";
import { readSheetTab } from "@/lib/gviz";
import { connectConfigured } from "@/lib/stripe";
import { requireSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Connect Stripe — Bare Studios OS",
  description: "Connect your own Stripe account so payments (and the client wallet) settle directly to you.",
};

export const revalidate = 30;

const inputClass = "w-full rounded-md border border-border bg-white px-3 py-2.5 text-sm text-text-primary outline-none focus:border-text-primary placeholder:text-text-muted";

export default async function StripeSettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireSession();
  const sp = await searchParams;
  const status = typeof sp.status === "string" ? sp.status : "";
  const configured = connectConfigured();

  const rows = await readSheetTab("Stripe");
  const connected = rows.filter(
    (r) => (r["Account ID"] || "").startsWith("acct_") && (r.Salon || "").trim().toLowerCase() === session.salon.trim().toLowerCase(),
  );

  return (
    <PageShell
      eyebrow="Settings · Payments"
      title="Connect your Stripe."
      intro="Link your own Stripe account and payments — including client wallet loads — settle directly to you, minus an optional platform fee. We never see or store your salon Stripe secret keys; Stripe hosts onboarding and we keep only your account id."
      note="Uses Stripe Connect account onboarding. You'll complete the Stripe-hosted setup during the connect step."
    >
      {status === "connected" && (
        <p className="mb-5 rounded-md border border-success/40 bg-success/10 px-4 py-3 text-sm text-success">
          Stripe connected — you&apos;re ready to take payments.
        </p>
      )}
      {status === "error" && (
        <p className="mb-5 rounded-md border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
          Couldn&apos;t complete the connection. Please try again.
        </p>
      )}

      {!configured ? (
        <div className="rounded-xl border border-border bg-surface-elevated p-6 text-sm text-text-secondary">
          <p className="font-medium text-text-primary">Stripe isn&apos;t configured yet.</p>
          <p className="mt-2">
            Set <code className="rounded bg-black/[0.05] px-1">STRIPE_SECRET_KEY</code> in Netlify. The app creates a
            Stripe Connect account link and sends the owner through Stripe-hosted onboarding.
          </p>
        </div>
      ) : (
        <form action="/api/stripe/connect" method="GET" className="rounded-xl border border-border bg-surface p-6 space-y-3">
          <input type="hidden" name="salon" value={session.salon} />
          <input className={inputClass} name="email" type="email" defaultValue={session.email} placeholder="Billing email" aria-label="Email" />
          <button type="submit" className="rounded-sm bg-gradient-brand px-7 py-3.5 text-[12px] uppercase tracking-[0.14em] text-white">
            Connect {session.salon || "your salon"} with Stripe
          </button>
          <p className="text-xs text-text-muted">You&apos;ll be sent to Stripe-hosted onboarding — then back here.</p>
        </form>
      )}

      {connected.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 font-serif text-2xl font-medium">Connected accounts</h2>
          <div className="overflow-hidden rounded-lg border border-border">
            {connected.map((r, i) => (
              <div key={i} className={`flex items-center justify-between gap-3 bg-surface px-5 py-3 ${i > 0 ? "border-t border-border" : ""}`}>
                <div>
                  <p className="text-sm font-medium">{r.Salon || "Salon"}</p>
                  <p className="text-xs text-text-secondary">{r.Email || "—"} · {r["Account ID"]}</p>
                </div>
                <span className="rounded-full bg-success/15 px-3 py-1 text-[11px] text-success">connected</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </PageShell>
  );
}

import type { Metadata } from "next";
import PageShell from "@/components/marketing/PageShell";
import WalletPanel from "@/components/wallet/WalletPanel";

export const metadata: Metadata = {
  title: "Client wallet — Bare Studios OS",
  description: "Load funds once and pay for visits from your balance — lower fees for the salon, faster checkout for you.",
};

export default async function WalletPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const salon = typeof sp.salon === "string" ? sp.salon : "";
  const client = typeof sp.client === "string" ? sp.client : "";
  const loaded = sp.loaded === "1";
  const demo = sp.demo === "1";

  return (
    <PageShell
      eyebrow="Payments · Client wallet"
      title="Load once. Pay from balance."
      intro="Top up your wallet by bank transfer (ACH) or card and pay for visits straight from your balance — no card fee on each visit, and faster checkout. Funds settle directly to your salon's own Stripe."
      note={demo ? "Sample mode: actions are simulated so salons can explore the client wallet without Stripe setup." : "MVP: balances are an append-only ledger in a Wallet tab. ACH loads credit once the bank debit clears. Needs Stripe configured + the salon connected at /settings/stripe."}
      showBottomBack
    >
      <WalletPanel initialSalon={salon} initialClient={client} loaded={loaded} demo={demo} />
    </PageShell>
  );
}

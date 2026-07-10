/**
 * Wallet ledger helpers. The wallet is an append-only ledger in a "Wallet" tab:
 * each row is a load (credit) or spend (debit); balance = sum. Reads use gviz.
 *
 * NOTE: this is an MVP ledger. The sheet has no transactions, and gviz reads are
 * eventually-consistent, so concurrent spends can race. Fine for a demo / low
 * volume — move the money side to a real database before high traffic.
 */
import { readSheetTab } from "@/lib/gviz";

export const WALLET_HEADERS = ["Date", "Salon", "Client", "Type", "Amount", "Reference"];

const eq = (a: string, b: string) => (a || "").trim().toLowerCase() === (b || "").trim().toLowerCase();
const round2 = (n: number) => Math.round(n * 100) / 100;

/** Find a salon's connected Stripe account id from the Stripe tab (latest wins). */
export async function findAccountId(salon: string): Promise<string | null> {
  const rows = await readSheetTab("Stripe");
  for (let i = rows.length - 1; i >= 0; i--) {
    const r = rows[i];
    if (eq(r.Salon, salon) && (r["Account ID"] || "").startsWith("acct_")) return r["Account ID"];
  }
  return null;
}

/** Compute a client's wallet balance for a salon. */
export async function walletBalance(salon: string, client: string): Promise<number> {
  const rows = await readSheetTab("Wallet");
  let bal = 0;
  for (const r of rows) {
    if (!eq(r.Salon, salon) || !eq(r.Client, client)) continue;
    const amt = Number(r.Amount) || 0;
    if ((r.Type || "") === "load") bal += amt;
    else if ((r.Type || "") === "spend") bal -= amt;
  }
  return round2(bal);
}

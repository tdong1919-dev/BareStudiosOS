/**
 * POST /api/wallet/charge — pay for a service from the client's wallet balance.
 * This is an internal debit (no card/ACH fee — the whole point of the wallet):
 * it checks the balance and appends a "spend" row to the Wallet tab.
 */
import { NextRequest, NextResponse } from "next/server";
import { appendSheetRow } from "@/lib/sheets";
import { walletBalance, WALLET_HEADERS } from "@/lib/wallet";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const salon = (body.salon ?? "").trim();
  const client = (body.client ?? "").trim();
  const amount = Number(body.amount) || 0;
  const note = (body.note ?? "").trim();

  if (!salon || !client) {
    return NextResponse.json({ error: "Salon and client are required." }, { status: 400 });
  }
  if (amount <= 0) {
    return NextResponse.json({ error: "Enter an amount." }, { status: 400 });
  }

  const balance = await walletBalance(salon, client);
  if (amount > balance) {
    return NextResponse.json({ error: `Insufficient balance ($${balance.toFixed(2)}).`, balance }, { status: 400 });
  }

  const sheet = await appendSheetRow("Wallet", WALLET_HEADERS, [
    new Date().toISOString(), salon, client, "spend", amount.toFixed(2), note || "service",
  ]);
  if (!sheet.ok) {
    return NextResponse.json({ error: "Couldn't record the charge — try again." }, { status: 502 });
  }

  return NextResponse.json({ ok: true, balance: Math.round((balance - amount) * 100) / 100 });
}

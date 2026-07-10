/**
 * POST /api/stripe/webhook — Stripe events. Credits the Wallet tab when a
 * wallet-load checkout succeeds. Handles both paths:
 *   - checkout.session.completed with payment_status "paid"  (card — instant)
 *   - checkout.session.async_payment_succeeded               (ACH — after it clears)
 * so ACH isn't credited until the bank debit actually settles.
 *
 * Register this URL in Stripe (Connect webhook) and set STRIPE_WEBHOOK_SECRET.
 */
import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { appendSheetRow } from "@/lib/sheets";
import { WALLET_HEADERS } from "@/lib/wallet";
import { appendBillingRecord } from "@/lib/account-data";

export const runtime = "nodejs";

async function creditFromSession(session: Stripe.Checkout.Session) {
  const md = session.metadata || {};
  const amount = (Number(md.amount) || 0) / 100;

  if (md.kind === "wallet_load") {
    if (amount <= 0) return;
    await appendSheetRow("Wallet", WALLET_HEADERS, [
      new Date().toISOString(), md.salon || "", md.client || "", "load", amount.toFixed(2), session.id,
    ]);
  } else if (md.kind === "store_order") {
    if (amount <= 0) return;
    await appendSheetRow(
      "Orders",
      ["Date", "Salon", "Item", "Amount", "Email", "Reference"],
      [new Date().toISOString(), md.salon || "", md.item || "", amount.toFixed(2), session.customer_details?.email || "", session.id],
    );
  } else if (md.kind === "team_member_subscription" || md.kind === "location_subscription") {
    await appendBillingRecord({
      ownerEmail: md.ownerEmail || session.customer_details?.email || "",
      salon: md.salon || "",
      type: md.kind === "team_member_subscription" ? "team_member" : "location",
      location: md.location || "",
      stripeSession: session.id,
      stripeSubscription: typeof session.subscription === "string" ? session.subscription : "",
      status: session.status || "complete",
      quantity: Math.max(1, Number(md.quantity) || 1),
    });
  }
}

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
  }

  const sig = request.headers.get("stripe-signature") || "";
  const raw = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.payment_status === "paid") await creditFromSession(session);
    } else if (event.type === "checkout.session.async_payment_succeeded") {
      await creditFromSession(event.data.object as Stripe.Checkout.Session);
    }
  } catch {
    // Never 500 back to Stripe for a sheet hiccup — it would retry forever.
    return NextResponse.json({ received: true, recorded: false });
  }

  return NextResponse.json({ received: true });
}

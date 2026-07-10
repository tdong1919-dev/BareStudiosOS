/**
 * POST /api/wallet/load — start a wallet top-up. Creates a Stripe Checkout
 * Session ON THE SALON'S CONNECTED ACCOUNT (so funds settle to the salon),
 * accepting ACH (us_bank_account) and card. Returns the hosted Checkout URL.
 * The Wallet tab is credited from the webhook once payment succeeds.
 */
import { NextRequest, NextResponse } from "next/server";
import { getStripe, appBaseUrl } from "@/lib/stripe";
import { findAccountId } from "@/lib/wallet";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe isn't configured (STRIPE_SECRET_KEY)." }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  const salon = (body.salon ?? "").trim();
  const client = (body.client ?? "").trim();
  const amount = Number(body.amount) || 0;

  if (!salon || !client) {
    return NextResponse.json({ error: "Salon and client are required." }, { status: 400 });
  }
  if (amount < 1) {
    return NextResponse.json({ error: "Minimum load is $1." }, { status: 400 });
  }

  const account = await findAccountId(salon);
  if (!account) {
    return NextResponse.json({ error: `"${salon}" hasn't connected Stripe yet.` }, { status: 400 });
  }

  const amountCents = Math.round(amount * 100);
  const feeBps = Number(process.env.STRIPE_PLATFORM_FEE_BPS) || 0;
  const base = appBaseUrl(request.nextUrl.origin);

  try {
    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        payment_method_types: ["card", "us_bank_account"],
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "usd",
              unit_amount: amountCents,
              product_data: { name: `Wallet load — ${salon}` },
            },
          },
        ],
        payment_intent_data: feeBps > 0 ? { application_fee_amount: Math.round((amountCents * feeBps) / 10000) } : undefined,
        metadata: { kind: "wallet_load", salon, client, amount: amountCents.toString() },
        success_url: `${base}/wallet?loaded=1&salon=${encodeURIComponent(salon)}&client=${encodeURIComponent(client)}`,
        cancel_url: `${base}/wallet?canceled=1`,
      },
      { stripeAccount: account },
    );
    return NextResponse.json({ ok: true, url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "stripe error";
    return NextResponse.json({ error: `Couldn't start checkout (${message}).` }, { status: 502 });
  }
}

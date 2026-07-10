/**
 * POST /api/store/checkout — buy a retail product. Stripe Checkout on the
 * salon's connected account; the order is recorded by the webhook. Works for
 * at-home online purchases and in-salon checkout alike.
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
  const name = (body.name ?? "").trim();
  const price = Number(body.price) || 0;
  const qty = Math.max(1, Math.round(Number(body.qty) || 1));

  if (!salon || !name || price <= 0) {
    return NextResponse.json({ error: "Missing product details." }, { status: 400 });
  }

  const account = await findAccountId(salon);
  if (!account) {
    return NextResponse.json({ error: `"${salon}" hasn't connected Stripe yet.` }, { status: 400 });
  }

  const unit = Math.round(price * 100);
  const feeBps = Number(process.env.STRIPE_PLATFORM_FEE_BPS) || 0;
  const base = appBaseUrl(request.nextUrl.origin);

  try {
    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        payment_method_types: ["card", "us_bank_account"],
        line_items: [{ quantity: qty, price_data: { currency: "usd", unit_amount: unit, product_data: { name } } }],
        payment_intent_data: feeBps > 0 ? { application_fee_amount: Math.round((unit * qty * feeBps) / 10000) } : undefined,
        metadata: { kind: "store_order", salon, item: name, amount: (unit * qty).toString() },
        success_url: `${base}/store?purchased=1&salon=${encodeURIComponent(salon)}`,
        cancel_url: `${base}/store?salon=${encodeURIComponent(salon)}`,
      },
      { stripeAccount: account },
    );
    return NextResponse.json({ ok: true, url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "stripe error";
    return NextResponse.json({ error: `Couldn't start checkout (${message}).` }, { status: 502 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { appBaseUrl, getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const session = await getSession();
  const base = appBaseUrl(request.nextUrl.origin);
  if (!session) return NextResponse.redirect(`${base}/login`, { status: 303 });

  const stripe = getStripe();
  if (!stripe) return NextResponse.redirect(`${base}/settings/team?status=stripe-missing`, { status: 303 });

  const form = await request.formData();
  const checkoutType = String(form.get("type") || "").trim();
  const location = String(form.get("location") || "Primary").trim();
  const quantity = Math.max(1, Number(form.get("quantity")) || 1);
  const price =
    checkoutType === "location"
      ? process.env.STRIPE_BASE_LOCATION_PRICE_ID
      : checkoutType === "team_member"
        ? process.env.STRIPE_EXTRA_TEAM_MEMBER_PRICE_ID
        : "";

  if (!price) return NextResponse.redirect(`${base}/settings/team?status=price-missing`, { status: 303 });

  const stripeSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: session.email,
    line_items: [{ price, quantity }],
    success_url: `${base}/settings/team?status=billing-success`,
    cancel_url: `${base}/settings/team?status=billing-cancelled`,
    metadata: {
      kind: checkoutType === "location" ? "location_subscription" : "team_member_subscription",
      ownerEmail: session.email,
      salon: session.salon,
      location,
      quantity: String(quantity),
    },
  });

  return NextResponse.redirect(stripeSession.url || `${base}/settings/team?status=checkout-error`, { status: 303 });
}

/**
 * GET /api/stripe/connect?salon=<name>&email=<email>
 * Kicks off Stripe Connect (Standard OAuth) so a salon links their OWN Stripe
 * account. Redirects to Stripe; the callback stores the returned acct_ id.
 */
import { NextRequest, NextResponse } from "next/server";
import { connectConfigured, appBaseUrl } from "@/lib/stripe";

export async function GET(request: NextRequest) {
  const clientId = process.env.STRIPE_CONNECT_CLIENT_ID;
  if (!connectConfigured() || !clientId) {
    return NextResponse.json(
      { error: "Stripe Connect isn't configured (STRIPE_SECRET_KEY + STRIPE_CONNECT_CLIENT_ID)." },
      { status: 503 },
    );
  }

  const salon = (request.nextUrl.searchParams.get("salon") || "").trim();
  const email = (request.nextUrl.searchParams.get("email") || "").trim();
  const base = appBaseUrl(request.nextUrl.origin);
  const state = encodeURIComponent(JSON.stringify({ salon, email }));

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope: "read_write",
    redirect_uri: `${base}/api/stripe/callback`,
    state,
  });
  if (email) params.set("stripe_user[email]", email);

  return NextResponse.redirect(`https://connect.stripe.com/oauth/authorize?${params.toString()}`);
}

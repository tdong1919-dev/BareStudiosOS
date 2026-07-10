/**
 * GET /api/stripe/callback — Stripe OAuth return. Exchanges the code for the
 * salon's connected-account id (acct_…) and stores salon → acct_id in the
 * "Stripe" tab. No secret keys are stored — only the account id.
 */
import { NextRequest, NextResponse } from "next/server";
import { getStripe, appBaseUrl } from "@/lib/stripe";
import { appendSheetRow } from "@/lib/sheets";

const HEADERS = ["Connected", "Salon", "Email", "Account ID", "Status"];

export async function GET(request: NextRequest) {
  const base = appBaseUrl(request.nextUrl.origin);
  const settings = `${base}/settings/stripe`;
  const stripe = getStripe();
  const code = request.nextUrl.searchParams.get("code");
  const oauthError = request.nextUrl.searchParams.get("error");

  if (oauthError || !code || !stripe) {
    return NextResponse.redirect(`${settings}?status=error`);
  }

  let salon = "";
  let email = "";
  try {
    const parsed = JSON.parse(decodeURIComponent(request.nextUrl.searchParams.get("state") || "{}"));
    salon = (parsed.salon || "").trim();
    email = (parsed.email || "").trim();
  } catch {
    /* no state — fine */
  }

  try {
    const token = await stripe.oauth.token({ grant_type: "authorization_code", code });
    const accountId = token.stripe_user_id || "";
    await appendSheetRow("Stripe", HEADERS, [new Date().toISOString(), salon, email, accountId, "connected"]);
    return NextResponse.redirect(`${settings}?status=connected&salon=${encodeURIComponent(salon)}`);
  } catch {
    return NextResponse.redirect(`${settings}?status=error`);
  }
}
